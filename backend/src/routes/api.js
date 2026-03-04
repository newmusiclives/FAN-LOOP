const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const Analytics = require('../models/Analytics');
const Campaign = require('../models/Campaign');
const Leaderboard = require('../models/Leaderboard');
const aiService = require('../services/aiService');
const Artist = require('../models/Artist');
const router = express.Router();

router.use(apiLimiter);

// ──────────── Analytics API (admin) ────────────
router.get('/admin/analytics/growth', adminAuth, (req, res) => {
  const { campaign_id, days = 30 } = req.query;
  const data = Analytics.getGrowthData(campaign_id || null, parseInt(days));
  res.json(data);
});

router.get('/admin/analytics/channels', adminAuth, (req, res) => {
  const data = Analytics.getChannelBreakdown(req.query.campaign_id || null);
  res.json(data);
});

router.get('/admin/analytics/geo', adminAuth, (req, res) => {
  const data = Analytics.getGeographicData(req.query.campaign_id || null);
  res.json(data);
});

router.get('/admin/analytics/conversion', adminAuth, (req, res) => {
  if (!req.query.campaign_id) return res.json({ views: 0, signups: 0, rate: 0 });
  const data = Analytics.getConversionRate(req.query.campaign_id);
  res.json(data);
});

router.get('/admin/analytics/kfactor', adminAuth, (req, res) => {
  const kFactor = req.query.campaign_id
    ? Analytics.getKFactor(req.query.campaign_id)
    : Analytics.getGlobalKFactor();
  res.json({ kFactor });
});

// ──────────── AI Copy Generator ────────────
router.post('/admin/ai/generate-copy', adminAuth, async (req, res) => {
  try {
    const { type, artist_id, campaign_title, campaign_type, tone } = req.body;
    let artist_name = 'the artist';
    if (artist_id) {
      const artist = Artist.findById(artist_id);
      if (artist) artist_name = artist.name;
    }
    const results = await aiService.generateCopy({ type, artist_name, campaign_title, campaign_type, tone });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────── Leaderboard API ────────────
router.get('/leaderboard/:campaignId', (req, res) => {
  const period = req.query.period || 'alltime';
  const leaderboard = Leaderboard.get(req.params.campaignId, period, 50);
  res.json(leaderboard);
});

router.post('/admin/leaderboard/:campaignId/refresh', adminAuth, (req, res) => {
  const id = req.params.campaignId;
  Leaderboard.refresh(id, 'alltime');
  Leaderboard.refresh(id, 'weekly');
  Leaderboard.refresh(id, 'monthly');
  res.json({ success: true });
});

module.exports = router;
