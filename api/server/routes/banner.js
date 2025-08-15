const express = require('express');
const { logger } = require('@librechat/data-schemas');

const { getBanner } = require('~/models/Banner');
const optionalJwtAuth = require('~/server/middleware/optionalJwtAuth');
const router = express.Router();

router.get('/', optionalJwtAuth, async (req, res) => {
  try {
    const banner = await getBanner(req.user);
    // Always return 200 with either a banner object or null
    res.status(200).send(banner ?? null);
  } catch (error) {
    logger.error('Error getting banner', error);
    // Do not block app startup for banner issues; return null gracefully
    res.status(200).send(null);
  }
});

module.exports = router;
