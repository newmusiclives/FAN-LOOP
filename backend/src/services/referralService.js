const { v4: uuidv4 } = require('uuid');
const Fan = require('../models/Fan');
const Referral = require('../models/Referral');
const Reward = require('../models/Reward');
const RewardClaim = require('../models/RewardClaim');
const Campaign = require('../models/Campaign');
const Analytics = require('../models/Analytics');
const Leaderboard = require('../models/Leaderboard');
const fraudService = require('./fraudService');
const webhookService = require('./webhookService');
const ghlService = require('./gohighlevelService');

function generateCode() {
  return uuidv4().replace(/-/g, '').substring(0, 8);
}

function generateVerificationToken() {
  return uuidv4();
}

async function processSignup({ campaign_id, email, name, referral_code_from, ip_address, device_fingerprint, source, user_agent }) {
  const campaign = Campaign.findById(campaign_id);
  if (!campaign || campaign.status !== 'active') {
    throw new Error('Campaign is not active');
  }

  // Check if fan already exists for this campaign
  const existing = Fan.findByEmail(campaign_id, email);
  if (existing) {
    return { fan: existing, isNew: false };
  }

  // Create new fan
  const code = generateCode();
  const verification_token = generateVerificationToken();

  let referred_by = null;
  if (referral_code_from) {
    const referrer = Fan.findByCode(referral_code_from);
    if (referrer && referrer.campaign_id === campaign_id && referrer.email !== email.toLowerCase()) {
      referred_by = referrer.id;
    }
  }

  const fan = Fan.create({
    campaign_id,
    email,
    name,
    referral_code: code,
    referred_by,
    verification_token,
    ip_address,
    device_fingerprint,
    source: source || (referral_code_from ? 'referral' : 'direct')
  });

  // Increment campaign fan count
  Campaign.incrementFanCount(campaign_id);

  // Log analytics
  Analytics.log({
    campaign_id,
    fan_id: fan.id,
    event_type: 'signup',
    event_data: { source: fan.source, referred_by },
    ip_address,
    user_agent
  });

  // Process referral if applicable
  if (referred_by) {
    const referral = Referral.create({
      campaign_id,
      referrer_id: referred_by,
      referred_id: fan.id,
      status: 'confirmed'
    });

    Fan.incrementReferralCount(referred_by);

    // Check reward tiers for referrer
    const referrer = Fan.findById(referred_by);
    checkAndUnlockRewards(referrer, campaign_id);

    // Refresh leaderboard
    try {
      Leaderboard.refresh(campaign_id, 'alltime');
      Leaderboard.refresh(campaign_id, 'weekly');
      Leaderboard.refresh(campaign_id, 'monthly');
    } catch (e) {
      console.error('Leaderboard refresh error:', e.message);
    }

    Analytics.log({
      campaign_id,
      fan_id: referred_by,
      event_type: 'referral_earned',
      event_data: { referred_fan_id: fan.id },
      ip_address,
      user_agent
    });
  }

  // Run fraud checks
  try {
    fraudService.checkSignup(fan, ip_address, device_fingerprint);
  } catch (e) {
    console.error('Fraud check error:', e.message);
  }

  // Fire webhooks
  try {
    const Artist = require('../models/Artist');
    const artist = Artist.findById(campaign.artist_id);
    if (artist) {
      webhookService.fireSignupWebhooks(artist.id, { fan, campaign });
      // Sync to GoHighLevel
      ghlService.syncFanToGHL(artist.id, { fan, campaign }).catch(e =>
        console.error('GHL sync error:', e.message)
      );
    }
  } catch (e) {
    console.error('Webhook error:', e.message);
  }

  // Log verification URL (no SMTP in v1)
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  console.log(`[Email Verification] ${email}: ${baseUrl}/verify/${verification_token}`);

  return { fan, isNew: true };
}

function checkAndUnlockRewards(fan, campaignId) {
  const rewards = Reward.listByCampaign(campaignId);
  let highestTier = null;
  for (const reward of rewards) {
    if (fan.referral_count >= reward.referrals_required) {
      RewardClaim.create({ fan_id: fan.id, reward_id: reward.id });
      highestTier = reward.tier_name;
    }
  }

  // Update GHL contact when fan reaches a new tier
  if (highestTier) {
    try {
      const campaign = Campaign.findById(campaignId);
      if (campaign) {
        const Artist = require('../models/Artist');
        const artist = Artist.findById(campaign.artist_id);
        if (artist) {
          ghlService.updateFanInGHL(artist.id, { fan, campaign, newTier: highestTier }).catch(e =>
            console.error('GHL tier update error:', e.message)
          );
        }
      }
    } catch (e) {
      console.error('GHL tier update error:', e.message);
    }
  }
}

module.exports = { processSignup, generateCode, checkAndUnlockRewards };
