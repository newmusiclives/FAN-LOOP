const crypto = require('crypto');
const Integration = require('../models/Integration');

function signPayload(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function fireSignupWebhooks(artistId, data) {
  const webhooks = Integration.getActiveWebhooks(artistId);
  for (const wh of webhooks) {
    try {
      const config = JSON.parse(wh.config || '{}');
      if (!config.url) continue;

      // Validate URL before firing
      let parsedUrl;
      try {
        parsedUrl = new URL(config.url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) continue;
      } catch {
        continue;
      }

      const body = JSON.stringify({
        event: 'fan_signup',
        timestamp: new Date().toISOString(),
        data: {
          fan_email: data.fan.email,
          fan_name: data.fan.name,
          campaign_title: data.campaign.title,
          campaign_slug: data.campaign.slug,
          referral_code: data.fan.referral_code
        }
      });

      // Sign the payload for verification
      const signature = signPayload(body, process.env.COOKIE_SECRET || 'webhook-secret');

      fetch(parsedUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'fan_signup'
        },
        body,
        signal: AbortSignal.timeout(5000)
      }).catch(err => console.error(`Webhook ${wh.name} failed:`, err.message));
    } catch (err) {
      console.error(`Webhook ${wh.name} error:`, err.message);
    }
  }
}

module.exports = { fireSignupWebhooks };
