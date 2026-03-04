const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Artist = require('../models/Artist');
const Fan = require('../models/Fan');
const Referral = require('../models/Referral');
const Reward = require('../models/Reward');
const RewardClaim = require('../models/RewardClaim');
const Analytics = require('../models/Analytics');
const Tag = require('../models/Tag');
const Integration = require('../models/Integration');
const FraudFlag = require('../models/FraudFlag');
const User = require('../models/User');
const { campaignCreateRules, artistCreateRules, rewardCreateRules } = require('../middleware/validate');
const { exportFansCSV } = require('../services/exportService');
const fraudService = require('../services/fraudService');
const router = express.Router();

router.use(adminAuth);

// ──────────── Dashboard ────────────
router.get('/', (req, res) => {
  const totalFans = Fan.countAll();
  const todaySignups = Fan.countToday();
  const kFactor = Analytics.getGlobalKFactor();
  const activeCampaigns = Campaign.getActiveCampaigns();
  const recentSignups = Fan.getRecentSignups(10);
  const pendingRewards = RewardClaim.countPending();
  const pendingFraud = FraudFlag.countPending();
  const totalCampaigns = Campaign.countAll();

  res.render('admin/dashboard', {
    title: 'Dashboard',
    stats: { totalFans, todaySignups, kFactor, activeCampaigns: activeCampaigns.length, totalCampaigns, pendingRewards, pendingFraud },
    recentSignups,
    topCampaigns: activeCampaigns.slice(0, 5),
    user: req.user
  });
});

// ──────────── Artists ────────────
router.get('/artists', (req, res) => {
  const artists = Artist.listAll();
  res.render('admin/artists', { title: 'Artists', artists, user: req.user });
});

router.get('/artists/new', (req, res) => {
  res.render('admin/artist-form', { title: 'New Artist', artist: null, error: null, user: req.user });
});

router.post('/artists', artistCreateRules, (req, res) => {
  if (req.flash_errors) {
    return res.render('admin/artist-form', { title: 'New Artist', artist: req.body, error: req.flash_errors.join(', '), user: req.user });
  }
  try {
    const existing = Artist.findBySlug(req.body.slug);
    if (existing) {
      return res.render('admin/artist-form', { title: 'New Artist', artist: req.body, error: 'Slug already taken', user: req.user });
    }
    Artist.create({ user_id: req.user.id, ...req.body });
    res.redirect('/admin/artists');
  } catch (err) {
    res.render('admin/artist-form', { title: 'New Artist', artist: req.body, error: err.message, user: req.user });
  }
});

router.get('/artists/:id/edit', (req, res) => {
  const artist = Artist.findById(req.params.id);
  if (!artist) return res.redirect('/admin/artists');
  res.render('admin/artist-form', { title: 'Edit Artist', artist, error: null, user: req.user });
});

router.post('/artists/:id', artistCreateRules, (req, res) => {
  if (req.flash_errors) {
    return res.render('admin/artist-form', { title: 'Edit Artist', artist: { id: req.params.id, ...req.body }, error: req.flash_errors.join(', '), user: req.user });
  }
  Artist.update(req.params.id, req.body);
  res.redirect('/admin/artists');
});

router.post('/artists/:id/delete', (req, res) => {
  Artist.delete(req.params.id);
  res.redirect('/admin/artists');
});

// ──────────── Campaigns ────────────
router.get('/campaigns', (req, res) => {
  const campaigns = Campaign.listAll();
  const artists = Artist.listAll();
  res.render('admin/campaigns', { title: 'Campaigns', campaigns, artists, user: req.user });
});

router.get('/campaigns/new', (req, res) => {
  const artists = Artist.listAll();
  res.render('admin/campaign-form', { title: 'New Campaign', campaign: null, artists, error: null, user: req.user });
});

router.post('/campaigns', campaignCreateRules, (req, res) => {
  const artists = Artist.listAll();
  if (req.flash_errors) {
    return res.render('admin/campaign-form', { title: 'New Campaign', campaign: req.body, artists, error: req.flash_errors.join(', '), user: req.user });
  }
  try {
    const existing = Campaign.findBySlug(req.body.slug);
    if (existing) {
      return res.render('admin/campaign-form', { title: 'New Campaign', campaign: req.body, artists, error: 'Slug already taken', user: req.user });
    }

    const shareMessages = {};
    if (req.body.share_twitter) shareMessages.twitter = req.body.share_twitter;
    if (req.body.share_whatsapp) shareMessages.whatsapp = req.body.share_whatsapp;
    if (req.body.share_email_subject) shareMessages.email_subject = req.body.share_email_subject;
    if (req.body.share_email_body) shareMessages.email_body = req.body.share_email_body;

    Campaign.create({
      ...req.body,
      share_messages: shareMessages,
      brand_config: {
        primary_color: req.body.primary_color || '#8b5cf6',
        secondary_color: req.body.secondary_color || '#ec4899'
      }
    });
    res.redirect('/admin/campaigns');
  } catch (err) {
    res.render('admin/campaign-form', { title: 'New Campaign', campaign: req.body, artists, error: err.message, user: req.user });
  }
});

router.get('/campaigns/:id', (req, res) => {
  const campaign = Campaign.findById(req.params.id);
  if (!campaign) return res.redirect('/admin/campaigns');
  const artist = Artist.findById(campaign.artist_id);
  const fans = Fan.listByCampaign(campaign.id, { limit: 20 });
  const rewards = Reward.listByCampaign(campaign.id);
  const referralCount = Referral.countByCampaign(campaign.id);
  const kFactor = Analytics.getKFactor(campaign.id);
  res.render('admin/campaign-detail', { title: campaign.title, campaign, artist, fans, rewards, referralCount, kFactor, user: req.user });
});

router.get('/campaigns/:id/edit', (req, res) => {
  const campaign = Campaign.findById(req.params.id);
  if (!campaign) return res.redirect('/admin/campaigns');
  const artists = Artist.listAll();
  res.render('admin/campaign-form', { title: 'Edit Campaign', campaign, artists, error: null, user: req.user });
});

router.post('/campaigns/:id', campaignCreateRules, (req, res) => {
  const artists = Artist.listAll();
  if (req.flash_errors) {
    return res.render('admin/campaign-form', { title: 'Edit Campaign', campaign: { id: req.params.id, ...req.body }, artists, error: req.flash_errors.join(', '), user: req.user });
  }

  const shareMessages = {};
  if (req.body.share_twitter) shareMessages.twitter = req.body.share_twitter;
  if (req.body.share_whatsapp) shareMessages.whatsapp = req.body.share_whatsapp;
  if (req.body.share_email_subject) shareMessages.email_subject = req.body.share_email_subject;
  if (req.body.share_email_body) shareMessages.email_body = req.body.share_email_body;

  Campaign.update(req.params.id, {
    ...req.body,
    share_messages: shareMessages,
    brand_config: {
      primary_color: req.body.primary_color || '#8b5cf6',
      secondary_color: req.body.secondary_color || '#ec4899'
    }
  });
  res.redirect(`/admin/campaigns/${req.params.id}`);
});

router.post('/campaigns/:id/status', (req, res) => {
  Campaign.update(req.params.id, { status: req.body.status });
  res.redirect(`/admin/campaigns/${req.params.id}`);
});

router.post('/campaigns/:id/delete', (req, res) => {
  Campaign.delete(req.params.id);
  res.redirect('/admin/campaigns');
});

// ──────────── Rewards ────────────
router.post('/campaigns/:id/rewards', rewardCreateRules, (req, res) => {
  if (!req.flash_errors) {
    Reward.create({ campaign_id: req.params.id, ...req.body });
  }
  res.redirect(`/admin/campaigns/${req.params.id}`);
});

router.post('/rewards/:id/delete', (req, res) => {
  const reward = Reward.findById(req.params.id);
  if (reward) {
    Reward.delete(req.params.id);
    res.redirect(`/admin/campaigns/${reward.campaign_id}`);
  } else {
    res.redirect('/admin/campaigns');
  }
});

// ──────────── Fans CRM ────────────
router.get('/fans', (req, res) => {
  const { search, sort, order, page = 1 } = req.query;
  const limit = 25;
  const offset = (page - 1) * limit;
  const fans = Fan.listAll({ limit, offset, search });
  const total = Fan.countAll();
  const tags = Tag.listAll();
  res.render('admin/fans', {
    title: 'Fan CRM', fans, tags, search, sort, order,
    page: parseInt(page), totalPages: Math.ceil(total / limit), total,
    user: req.user
  });
});

router.get('/fans/:id', (req, res) => {
  const fan = Fan.findById(req.params.id);
  if (!fan) return res.redirect('/admin/fans');
  const campaign = Campaign.findById(fan.campaign_id);
  const referrals = Fan.getReferralTree(fan.id);
  const fanTags = Tag.getForFan(fan.id);
  const allTags = Tag.listAll();
  const claims = RewardClaim.listByFan(fan.id);
  res.render('admin/fan-detail', { title: fan.email, fan, campaign, referrals, fanTags, allTags, claims, user: req.user });
});

router.post('/fans/:id/tag', (req, res) => {
  Tag.addToFan(req.params.id, req.body.tag_id);
  res.redirect(`/admin/fans/${req.params.id}`);
});

router.post('/fans/:id/untag', (req, res) => {
  Tag.removeFromFan(req.params.id, req.body.tag_id);
  res.redirect(`/admin/fans/${req.params.id}`);
});

router.get('/fans/export/csv', (req, res) => {
  exportFansCSV(req.query.campaign_id, res);
});

// ──────────── Analytics ────────────
router.get('/analytics', (req, res) => {
  const campaigns = Campaign.listAll();
  res.render('admin/analytics', { title: 'Analytics', campaigns, user: req.user });
});

// ──────────── Reward Fulfillment ────────────
router.get('/rewards', (req, res) => {
  const pending = RewardClaim.listPending();
  res.render('admin/rewards', { title: 'Reward Fulfillment', claims: pending, user: req.user });
});

router.post('/rewards/:id/approve', (req, res) => {
  RewardClaim.approve(req.params.id, req.user.id);
  res.redirect('/admin/rewards');
});

router.post('/rewards/:id/deny', (req, res) => {
  RewardClaim.deny(req.params.id, req.body.notes);
  res.redirect('/admin/rewards');
});

// ──────────── Fraud Review ────────────
router.get('/fraud', (req, res) => {
  const flags = FraudFlag.listPending();
  res.render('admin/fraud', { title: 'Fraud Review', flags, user: req.user });
});

router.post('/fraud/:id/confirm', (req, res) => {
  fraudService.confirmFraud(req.params.id, req.user.id);
  res.redirect('/admin/fraud');
});

router.post('/fraud/:id/dismiss', (req, res) => {
  fraudService.dismissFraud(req.params.id, req.user.id);
  res.redirect('/admin/fraud');
});

// ──────────── Settings ────────────
router.get('/settings', (req, res) => {
  const artists = Artist.listAll();
  const integrations = artists.length > 0 ? Integration.listByArtist(artists[0].id) : [];
  res.render('admin/settings', { title: 'Settings', artists, integrations, user: req.user });
});

router.post('/settings/password', (req, res) => {
  const { current_password, new_password } = req.body;
  if (!User.verifyPassword(req.user, current_password)) {
    return res.redirect('/admin/settings?error=invalid_password');
  }
  User.updatePassword(req.user.id, new_password);
  res.redirect('/admin/settings?success=password_updated');
});

router.post('/settings/integrations', (req, res) => {
  const { artist_id, type, name, webhook_url, api_key } = req.body;
  const config = {};
  if (webhook_url) config.url = webhook_url;
  if (api_key) config.api_key = api_key;
  Integration.create({ artist_id, type, name, config });
  res.redirect('/admin/settings');
});

router.post('/settings/integrations/:id/delete', (req, res) => {
  Integration.delete(req.params.id);
  res.redirect('/admin/settings');
});

// ──────────── Tags ────────────
router.post('/tags', (req, res) => {
  Tag.create({ name: req.body.name, color: req.body.color });
  res.redirect(req.headers.referer || '/admin/fans');
});

router.post('/tags/:id/delete', (req, res) => {
  Tag.delete(req.params.id);
  res.redirect(req.headers.referer || '/admin/fans');
});

module.exports = router;
