const express = require('express');
const jwt = require('jsonwebtoken');
const Campaign = require('../models/Campaign');
const Fan = require('../models/Fan');
const Reward = require('../models/Reward');
const RewardClaim = require('../models/RewardClaim');
const Leaderboard = require('../models/Leaderboard');
const Analytics = require('../models/Analytics');
const { fanSession } = require('../middleware/auth');
const { signupLimiter } = require('../middleware/rateLimiter');
const referralService = require('../services/referralService');
const router = express.Router();

// Campaign landing page
router.get('/c/:slug', fanSession, (req, res) => {
  const campaign = Campaign.findBySlug(req.params.slug);
  if (!campaign || campaign.status !== 'active') {
    return res.status(404).render('error', { title: 'Not Found', statusCode: 404, message: 'Campaign not found or inactive.', layout: false });
  }

  const Artist = require('../models/Artist');
  const artist = Artist.findById(campaign.artist_id);
  const referralCode = req.cookies?.ref_code || req.query.ref;

  // Log page view
  Analytics.log({
    campaign_id: campaign.id,
    event_type: 'page_view',
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  // If fan already signed up, redirect to dashboard
  if (req.fan && req.fan.campaign_id === campaign.id) {
    return res.redirect(`/c/${campaign.slug}/dashboard`);
  }

  const brandConfig = JSON.parse(campaign.brand_config || '{}');
  const rewardTiers = JSON.parse(campaign.reward_tiers || '[]');

  res.render('fan/campaign', {
    title: campaign.headline || campaign.title,
    campaign, artist, brandConfig, rewardTiers, referralCode,
    error: null, layout: false
  });
});

// Fan signup
router.post('/c/:slug/signup', signupLimiter, async (req, res) => {
  const campaign = Campaign.findBySlug(req.params.slug);
  if (!campaign || campaign.status !== 'active') {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  try {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const referral_code_from = req.body.ref || req.cookies?.ref_code;

    const { fan, isNew } = await referralService.processSignup({
      campaign_id: campaign.id,
      email,
      name,
      referral_code_from,
      ip_address: req.ip,
      device_fingerprint: req.body.device_fingerprint,
      source: referral_code_from ? 'referral' : (req.body.source || 'direct'),
      user_agent: req.headers['user-agent']
    });

    // Set fan session cookie
    const token = jwt.sign({ fanId: fan.id, campaignId: campaign.id }, process.env.COOKIE_SECRET, { expiresIn: '30d' });
    res.cookie('fan_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.clearCookie('ref_code');

    res.json({
      success: true,
      isNew,
      fan: {
        referral_code: fan.referral_code,
        referral_count: fan.referral_count,
        name: fan.name
      },
      dashboard_url: `/c/${campaign.slug}/dashboard`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Referral redirect
router.get('/ref/:code', (req, res) => {
  const fan = Fan.findByCode(req.params.code);
  if (!fan) return res.redirect('/');

  const campaign = Campaign.findById(fan.campaign_id);
  if (!campaign) return res.redirect('/');

  // Set referral cookie
  res.cookie('ref_code', req.params.code, { maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

  // Log referral click
  Analytics.log({
    campaign_id: campaign.id,
    fan_id: fan.id,
    event_type: 'referral_click',
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.redirect(`/c/${campaign.slug}?ref=${req.params.code}`);
});

// Fan dashboard
router.get('/c/:slug/dashboard', fanSession, (req, res) => {
  const campaign = Campaign.findBySlug(req.params.slug);
  if (!campaign) return res.redirect('/');

  const fan = req.fan;
  if (!fan || fan.campaign_id !== campaign.id) {
    return res.redirect(`/c/${req.params.slug}`);
  }

  const Artist = require('../models/Artist');
  const artist = Artist.findById(campaign.artist_id);
  const rewards = Reward.listByCampaign(campaign.id);
  const claims = RewardClaim.listByFan(fan.id);
  const referrals = Fan.getReferralTree(fan.id);
  const rank = Leaderboard.getRank(campaign.id, fan.id);
  const rewardTiers = JSON.parse(campaign.reward_tiers || '[]');
  const shareMessages = JSON.parse(campaign.share_messages || '{}');
  const brandConfig = JSON.parse(campaign.brand_config || '{}');
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const referralLink = `${baseUrl}/ref/${fan.referral_code}`;

  // Find next tier
  let nextTier = null;
  for (const tier of rewardTiers) {
    if (fan.referral_count < tier.referrals) {
      nextTier = tier;
      break;
    }
  }

  res.render('fan/dashboard', {
    title: 'Your Referral Dashboard',
    campaign, artist, fan, rewards, claims, referrals,
    rank, rewardTiers, shareMessages, brandConfig,
    referralLink, nextTier, baseUrl,
    layout: false
  });
});

// Public leaderboard
router.get('/c/:slug/leaderboard', (req, res) => {
  const campaign = Campaign.findBySlug(req.params.slug);
  if (!campaign) return res.redirect('/');

  const period = req.query.period || 'alltime';
  const leaderboard = Leaderboard.get(campaign.id, period, 50);
  const Artist = require('../models/Artist');
  const artist = Artist.findById(campaign.artist_id);
  const brandConfig = JSON.parse(campaign.brand_config || '{}');

  res.render('fan/leaderboard', {
    title: `${campaign.title} — Leaderboard`,
    campaign, artist, leaderboard, period, brandConfig,
    layout: false
  });
});

// Email verification
router.get('/verify/:token', (req, res) => {
  const fan = Fan.findByVerificationToken(req.params.token);
  if (!fan) {
    return res.status(404).render('error', { title: 'Invalid Link', statusCode: 404, message: 'This verification link is invalid or expired.', layout: false });
  }
  Fan.verify(fan.id);

  const campaign = Campaign.findById(fan.campaign_id);
  res.redirect(`/c/${campaign.slug}/dashboard`);
});

module.exports = router;
