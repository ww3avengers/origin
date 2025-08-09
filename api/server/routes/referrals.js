const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { logger } = require('@librechat/data-schemas');
const {
  generateReferralCode,
  trackReferralClick,
  completeReferral,
  getUserReferrals,
  getReferralStats,
} = require('~/models/referralMethods');
const Referral = require('~/models/Referral');

/**
 * @route GET /api/referrals
 * @description Holt alle Referrals des aktuellen Benutzers
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const referrals = await getUserReferrals(userId);
    
    return res.status(200).json(referrals);
  } catch (error) {
    logger.error('[GET /api/referrals] Error:', error);
    return res.status(500).json({ message: 'Serverfehler beim Abrufen der Referrals' });
  }
});

/**
 * @route GET /api/referrals/stats
 * @description Holt Statistiken zu den Referrals des aktuellen Benutzers
 * @access Private
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getReferralStats(userId);
    
    return res.status(200).json(stats);
  } catch (error) {
    logger.error('[GET /api/referrals/stats] Error:', error);
    return res.status(500).json({ message: 'Serverfehler beim Abrufen der Referral-Statistiken' });
  }
});

/**
 * @route POST /api/referrals/code
 * @description Generiert oder holt einen Referral-Code für den aktuellen Benutzer
 * @access Private
 */
router.post('/code', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Prüfe, ob der Benutzer bereits einen aktiven Code hat
    const existingReferral = await Referral.findOne({ referrer: userId, referred: null });
    
    if (existingReferral) {
      return res.status(200).json({ code: existingReferral.code });
    }
    
    // Generiere einen neuen Code
    const code = await generateReferralCode(userId);
    
    return res.status(201).json({ code });
  } catch (error) {
    logger.error('[POST /api/referrals/code] Error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Generierung des Referral-Codes' });
  }
});

/**
 * @route GET /api/referrals/track/:code
 * @description Verfolgt einen Klick auf einen Referral-Link
 * @access Public
 */
router.get('/track/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const success = await trackReferralClick(code);
    
    if (!success) {
      return res.status(404).json({ message: 'Ungültiger Referral-Code' });
    }
    
    // Weiterleitung zur Registrierungsseite mit dem Code
    return res.redirect(`/signup?ref=${code}`);
  } catch (error) {
    logger.error('[GET /api/referrals/track/:code] Error:', error);
    return res.status(500).json({ message: 'Serverfehler beim Tracking des Referrals' });
  }
});

/**
 * @route POST /api/referrals/complete
 * @description Schließt ein Referral ab, wenn ein neuer Benutzer sich registriert
 * @access Private
 */
router.post('/complete', async (req, res) => {
  try {
    const { code } = req.body;
    const newUserId = req.user.id;
    
    if (!code) {
      return res.status(400).json({ message: 'Kein Referral-Code angegeben' });
    }
    
    const success = await completeReferral(code, newUserId);
    
    if (!success) {
      return res.status(400).json({ message: 'Ungültiger Referral-Code oder Fehler beim Abschließen' });
    }
    
    return res.status(200).json({ message: 'Referral erfolgreich abgeschlossen' });
  } catch (error) {
    logger.error('[POST /api/referrals/complete] Error:', error);
    return res.status(500).json({ message: 'Serverfehler beim Abschließen des Referrals' });
  }
});

module.exports = router;
