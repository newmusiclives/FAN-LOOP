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
    const isProduction = process.env.NODE_ENV === 'production';
    const token = jwt.sign({ fanId: fan.id, campaignId: campaign.id }, process.env.COOKIE_SECRET, { expiresIn: '30d' });
    res.cookie('fan_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax', secure: isProduction });
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

// ──────────── Embeddable Widget for TrueFans CONNECT ────────────
// Renders a lightweight, iframe-friendly signup card for link-in-bio, artist pages, show pages
router.get('/embed/:slug', (req, res) => {
  const campaign = Campaign.findBySlug(req.params.slug);
  if (!campaign || campaign.status !== 'active') {
    return res.status(404).send('<p style="color:#999;font-family:sans-serif;">Campaign not available</p>');
  }

  const Artist = require('../models/Artist');
  const artist = Artist.findById(campaign.artist_id);
  const bc = campaign.brand_config ? (typeof campaign.brand_config === 'string' ? JSON.parse(campaign.brand_config) : campaign.brand_config) : {};
  const primary = bc.primary_color || '#8B5CF6';
  const secondary = bc.secondary_color || '#EC4899';
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${campaign.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:transparent;color:#F8FAFC}
.widget{max-width:420px;margin:0 auto;background:#111118;border:1px solid rgba(139,92,246,0.2);border-radius:16px;padding:28px;text-align:center}
.widget-artist{font-size:12px;font-weight:600;color:${primary};text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.widget-title{font-size:20px;font-weight:800;line-height:1.2;margin-bottom:6px}
.widget-sub{font-size:14px;color:#94A3B8;margin-bottom:20px;line-height:1.6}
.widget-form{display:flex;flex-direction:column;gap:10px}
.widget-input{width:100%;padding:12px 14px;background:#1a1a2e;border:1px solid #2a2a3e;border-radius:10px;color:#e2e8f0;font-size:14px;outline:none}
.widget-input:focus{border-color:${primary}}
.widget-btn{width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(135deg,${primary},${secondary});color:#fff;font-size:15px;font-weight:700;cursor:pointer;transition:opacity 0.2s}
.widget-btn:hover{opacity:0.9}
.widget-fans{margin-top:14px;font-size:12px;color:#64748B}
.widget-fans strong{color:${primary}}
.widget-success{display:none;padding:20px;text-align:center}
.widget-success h3{font-size:18px;font-weight:700;color:#10B981;margin-bottom:8px}
.widget-success p{font-size:13px;color:#94A3B8;margin-bottom:16px}
.widget-link{display:flex;align-items:center;gap:8px;background:#1a1a2e;border:1px solid #2a2a3e;border-radius:8px;padding:10px 12px;margin-bottom:12px}
.widget-link input{flex:1;background:transparent;border:none;color:#e2e8f0;font-size:13px;outline:none}
.widget-link button{padding:6px 12px;background:${primary};border:none;border-radius:6px;color:#fff;font-size:12px;font-weight:600;cursor:pointer}
.widget-powered{margin-top:16px;font-size:10px;color:#475569}
.widget-powered a{color:${primary};text-decoration:none}
</style>
</head>
<body>
<div class="widget" id="signupWidget">
  <div class="widget-artist">${artist ? artist.name : ''}</div>
  <div class="widget-title">${campaign.headline || campaign.title}</div>
  <div class="widget-sub">${campaign.subheadline || 'Join and share to unlock exclusive rewards'}</div>
  <form class="widget-form" id="embedForm" onsubmit="return submitEmbed(event)">
    <input type="text" name="name" class="widget-input" placeholder="Your name (optional)">
    <input type="email" name="email" class="widget-input" placeholder="Your email *" required>
    <button type="submit" class="widget-btn" id="embedBtn">Join &amp; Get My Link</button>
  </form>
  ${campaign.fan_count > 0 ? `<div class="widget-fans"><strong>${campaign.fan_count.toLocaleString()}</strong> fans have joined</div>` : ''}
</div>

<div class="widget widget-success" id="successWidget">
  <h3>You're In!</h3>
  <p>Share your unique link to unlock rewards:</p>
  <div class="widget-link">
    <input type="text" id="refLink" readonly>
    <button onclick="copyLink()">Copy</button>
  </div>
  <a href="${baseUrl}/c/${campaign.slug}/dashboard" target="_blank" class="widget-btn" style="display:inline-block;padding:10px 24px;text-decoration:none;font-size:13px;">View My Dashboard</a>
</div>

<div class="widget-powered">Powered by <a href="${baseUrl}" target="_blank">TrueFans LOOP</a></div>

<script>
async function submitEmbed(e) {
  e.preventDefault();
  var btn = document.getElementById('embedBtn');
  var form = document.getElementById('embedForm');
  btn.textContent = 'Joining...';
  btn.disabled = true;
  try {
    var res = await fetch('${baseUrl}/c/${campaign.slug}/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: form.email.value,
        name: form.name.value,
        source: 'embed'
      })
    });
    var data = await res.json();
    if (data.success && data.referral_code) {
      document.getElementById('refLink').value = '${baseUrl}/ref/' + data.referral_code;
      document.getElementById('signupWidget').style.display = 'none';
      document.getElementById('successWidget').style.display = 'block';
    } else {
      btn.textContent = data.message || 'Try again';
      btn.disabled = false;
    }
  } catch (err) {
    btn.textContent = 'Error — try again';
    btn.disabled = false;
  }
}
function copyLink() {
  var input = document.getElementById('refLink');
  navigator.clipboard.writeText(input.value);
  input.select();
}
</script>
</body>
</html>`);
});

module.exports = router;
