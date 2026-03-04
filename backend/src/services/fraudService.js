const Fan = require('../models/Fan');
const FraudFlag = require('../models/FraudFlag');

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'trashmail.com', 'mailnesia.com', 'maildrop.cc',
  'temp-mail.org', '10minutemail.com', 'fakeinbox.com'
];

function checkSignup(fan, ipAddress, deviceFingerprint) {
  const flags = [];

  // Check 1: Duplicate IP (>3 signups in 24h)
  if (ipAddress) {
    const ipCount = Fan.countByIpToday(ipAddress);
    if (ipCount > 3) {
      flags.push({
        reason: 'duplicate_ip',
        details: { ip: ipAddress, count: ipCount }
      });
    }
  }

  // Check 2: Self-referral detection
  if (fan.referred_by) {
    const referrer = Fan.findById(fan.referred_by);
    if (referrer && referrer.email === fan.email) {
      flags.push({
        reason: 'self_referral',
        details: { referrer_email: referrer.email }
      });
    }
  }

  // Check 3: Rapid signup (>2 from same IP in 5 min)
  if (ipAddress) {
    const recentFromIp = Fan.getRecentByIp(ipAddress, 5);
    if (recentFromIp.length > 2) {
      flags.push({
        reason: 'rapid_signup',
        details: { ip: ipAddress, count_in_5min: recentFromIp.length }
      });
    }
  }

  // Check 4: Disposable email
  const domain = fan.email.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    flags.push({
      reason: 'disposable_email',
      details: { domain }
    });
  }

  // Check 5: Device fingerprint matching
  if (deviceFingerprint) {
    const { getDb } = require('../../db/database');
    const matchCount = getDb().prepare(
      "SELECT COUNT(*) as count FROM fans WHERE device_fingerprint = ? AND id != ? AND campaign_id = ? AND created_at >= datetime('now', '-24 hours')"
    ).get(deviceFingerprint, fan.id, fan.campaign_id).count;
    if (matchCount > 2) {
      flags.push({
        reason: 'device_fingerprint_match',
        details: { fingerprint: deviceFingerprint, matches: matchCount }
      });
    }
  }

  // Create fraud flags
  for (const flag of flags) {
    FraudFlag.create({
      fan_id: fan.id,
      campaign_id: fan.campaign_id,
      reason: flag.reason,
      details: flag.details
    });
  }

  return flags;
}

function confirmFraud(flagId, reviewedBy) {
  const flag = FraudFlag.findById(flagId);
  if (!flag) return;

  FraudFlag.review(flagId, { status: 'confirmed', reviewed_by: reviewedBy });

  // Ban the fan
  Fan.ban(flag.fan_id);

  // Reverse referral credit if this fan was referred
  const fan = Fan.findById(flag.fan_id);
  if (fan && fan.referred_by) {
    Fan.decrementReferralCount(fan.referred_by);
    const Referral = require('../models/Referral');
    const ref = Referral.findByReferredId(fan.id);
    if (ref) Referral.updateStatus(ref.id, 'reversed');
  }
}

function dismissFraud(flagId, reviewedBy) {
  FraudFlag.review(flagId, { status: 'dismissed', reviewed_by: reviewedBy });
}

module.exports = { checkSignup, confirmFraud, dismissFraud };
