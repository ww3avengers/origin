const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('@librechat/data-schemas');
const Referral = require('./Referral');
const Transaction = require('./Transaction');

/**
 * @module referralMethods
 * @description Methoden für das Referral-System
 */

/**
 * @function generateReferralCode
 * @description Generiert einen eindeutigen Referral-Code für einen Benutzer
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<string>} Der generierte Referral-Code
 */
const generateReferralCode = async (userId) => {
  try {
    // Benutze die ersten 8 Zeichen einer UUID für einen kurzen, eindeutigen Code
    const shortCode = uuidv4().substring(0, 8);
    
    // Prüfe, ob der Code bereits existiert
    const existingCode = await Referral.findOne({ code: shortCode });
    if (existingCode) {
      // Bei Kollision rekursiv einen neuen Code generieren
      return generateReferralCode(userId);
    }
    
    // Neuen Referral-Code erstellen
    const referral = new Referral({
      referrer: userId,
      referred: null, // Wird später gefüllt, wenn jemand den Link benutzt
      code: shortCode,
      status: 'pending',
    });
    
    await referral.save();
    return shortCode;
  } catch (error) {
    logger.error('[generateReferralCode] Error:', error);
    throw new Error('Fehler bei der Generierung des Referral-Codes');
  }
};

/**
 * @function trackReferralClick
 * @description Erhöht den Klickzähler für einen Referral-Link
 * @param {string} code - Der Referral-Code
 * @returns {Promise<boolean>} True wenn erfolgreich, false bei Fehler
 */
const trackReferralClick = async (code) => {
  try {
    const referral = await Referral.findOne({ code });
    if (!referral) {
      return false;
    }
    
    referral.clickCount += 1;
    await referral.save();
    return true;
  } catch (error) {
    logger.error('[trackReferralClick] Error:', error);
    return false;
  }
};

/**
 * @function completeReferral
 * @description Schließt eine Referral ab, wenn ein neuer Benutzer sich anmeldet
 * @param {string} code - Der Referral-Code
 * @param {string} newUserId - Die ID des neuen Benutzers
 * @returns {Promise<boolean>} True wenn erfolgreich, false bei Fehler
 */
const completeReferral = async (code, newUserId) => {
  try {
    const referral = await Referral.findOne({ code });
    if (!referral) {
      return false;
    }
    
    // Prüfe, ob der Nutzer nicht sich selbst einlädt
    if (referral.referrer.toString() === newUserId.toString()) {
      return false;
    }
    
    referral.referred = newUserId;
    referral.status = 'active';
    referral.conversionDate = new Date();
    
    await referral.save();
    return true;
  } catch (error) {
    logger.error('[completeReferral] Error:', error);
    return false;
  }
};

/**
 * @function calculateAndPayCommission
 * @description Berechnet und zahlt Provision für ein aktives Referral
 * @param {string} userId - Die ID des verwiesenen Benutzers
 * @param {number} amount - Der gezahlte Betrag
 * @returns {Promise<boolean>} True wenn erfolgreich, false bei Fehler
 */
const calculateAndPayCommission = async (userId, amount) => {
  try {
    const referral = await Referral.findOne({ referred: userId, status: 'active' });
    if (!referral) {
      return false;
    }
    
    // 20% Provision berechnen
    const commissionRate = referral.commissionRate / 100;
    const commission = Math.round(amount * commissionRate);
    
    if (commission <= 0) {
      return false;
    }
    
    // Füge die Provision zum Guthaben des Empfehlenden hinzu
    await Transaction.create({
      user: referral.referrer,
      amount: commission,
      description: `Referral-Provision von Nutzer ${userId}`,
      type: 'referral_commission',
      status: 'completed',
    });
    
    // Aktualisiere die Statistiken
    referral.commissionsEarned += commission;
    referral.lastCommissionDate = new Date();
    
    await referral.save();
    return true;
  } catch (error) {
    logger.error('[calculateAndPayCommission] Error:', error);
    return false;
  }
};

/**
 * @function getUserReferrals
 * @description Holt alle Referrals eines Benutzers
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<Array>} Liste der Referrals
 */
const getUserReferrals = async (userId) => {
  try {
    return await Referral.find({ referrer: userId })
      .populate('referred', 'name email')
      .sort({ createdAt: -1 });
  } catch (error) {
    logger.error('[getUserReferrals] Error:', error);
    return [];
  }
};

/**
 * @function getReferralStats
 * @description Holt Statistiken zu den Referrals eines Benutzers
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<Object>} Statistiken zu den Referrals
 */
const getReferralStats = async (userId) => {
  try {
    const referrals = await Referral.find({ referrer: userId });
    
    const totalClicks = referrals.reduce((sum, ref) => sum + ref.clickCount, 0);
    const totalReferrals = referrals.filter(ref => ref.status === 'active').length;
    const totalCommission = referrals.reduce((sum, ref) => sum + ref.commissionsEarned, 0);
    
    return {
      totalClicks,
      totalReferrals,
      totalCommission,
      conversionRate: totalClicks > 0 ? (totalReferrals / totalClicks) * 100 : 0,
    };
  } catch (error) {
    logger.error('[getReferralStats] Error:', error);
    return {
      totalClicks: 0,
      totalReferrals: 0,
      totalCommission: 0,
      conversionRate: 0,
    };
  }
};

module.exports = {
  generateReferralCode,
  trackReferralClick,
  completeReferral,
  calculateAndPayCommission,
  getUserReferrals,
  getReferralStats,
};
