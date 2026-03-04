const Integration = require('../models/Integration');

async function fireSignupWebhooks(artistId, data) {
  const webhooks = Integration.getActiveWebhooks(artistId);
  for (const wh of webhooks) {
    try {
      const config = JSON.parse(wh.config || '{}');
      if (!config.url) continue;

      fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'fan_signup',
          timestamp: new Date().toISOString(),
          data: {
            fan_email: data.fan.email,
            fan_name: data.fan.name,
            campaign_title: data.campaign.title,
            campaign_slug: data.campaign.slug,
            referral_code: data.fan.referral_code
          }
        }),
        signal: AbortSignal.timeout(5000)
      }).catch(err => console.error(`Webhook ${wh.name} failed:`, err.message));
    } catch (err) {
      console.error(`Webhook ${wh.name} error:`, err.message);
    }
  }
}

module.exports = { fireSignupWebhooks };
