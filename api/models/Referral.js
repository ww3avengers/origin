const mongoose = require('mongoose');

/**
 * @module Referral
 * @description Referral-System für SaaS-Plattform
 */

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'expired'],
      default: 'pending',
    },
    commissionRate: {
      type: Number,
      default: 20, // 20% Provision
    },
    commissionsEarned: {
      type: Number,
      default: 0,
    },
    commissionsWithdrawn: {
      type: Number,
      default: 0,
    },
    subscriptionId: {
      type: String,
      sparse: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    conversionDate: {
      type: Date,
    },
    lastCommissionDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indizes für effiziente Abfragen
referralSchema.index({ referrer: 1, code: 1 });
referralSchema.index({ code: 1 }, { unique: true });

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);

module.exports = Referral;
