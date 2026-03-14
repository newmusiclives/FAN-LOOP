/**
 * GoHighLevel (GHL) Integration Service
 *
 * Syncs FanLoop fans into GHL as contacts with:
 * - Contact creation/update (upsert by email)
 * - Tags for campaign type, referral tier, source
 * - Custom fields for referral code, referral count, campaign name
 * - Workflow triggers via contact tag additions
 *
 * GHL API v2: https://highlevel.stoplight.io/docs/integrations
 */

const Integration = require('../models/Integration');

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

/**
 * Send a fan signup to all active GHL integrations for an artist
 */
async function syncFanToGHL(artistId, { fan, campaign, referrer }) {
  const integrations = Integration.getActiveByType(artistId, 'gohighlevel');
  if (!integrations.length) return;

  for (const integration of integrations) {
    try {
      const config = JSON.parse(integration.config || '{}');
      if (!config.api_key && !config.access_token) continue;

      const token = config.access_token || config.api_key;
      const locationId = config.location_id;

      if (!locationId) {
        console.error(`GHL integration "${integration.name}": missing location_id`);
        continue;
      }

      // Build tags
      const tags = ['fanloop', `campaign:${campaign.type || 'general'}`, `campaign:${campaign.slug}`];
      if (fan.source === 'referral') tags.push('referred');
      if (fan.source === 'direct') tags.push('direct-signup');

      // Build contact payload
      const contactPayload = {
        locationId,
        email: fan.email,
        name: fan.name || undefined,
        firstName: fan.name ? fan.name.split(' ')[0] : undefined,
        lastName: fan.name && fan.name.includes(' ') ? fan.name.split(' ').slice(1).join(' ') : undefined,
        tags,
        source: 'TrueFans LOOP',
        customFields: []
      };

      // Add custom fields if configured
      if (config.custom_field_referral_code) {
        contactPayload.customFields.push({
          id: config.custom_field_referral_code,
          value: fan.referral_code
        });
      }
      if (config.custom_field_campaign) {
        contactPayload.customFields.push({
          id: config.custom_field_campaign,
          value: campaign.title
        });
      }
      if (config.custom_field_referral_count) {
        contactPayload.customFields.push({
          id: config.custom_field_referral_count,
          value: String(fan.referral_count || 0)
        });
      }

      // Remove empty customFields
      if (contactPayload.customFields.length === 0) {
        delete contactPayload.customFields;
      }

      // Upsert contact in GHL
      const response = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28'
        },
        body: JSON.stringify(contactPayload),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`GHL contact upsert failed (${response.status}):`, errText);
        continue;
      }

      const result = await response.json();
      const contactId = result.contact?.id;

      // Trigger workflow if configured
      if (config.workflow_id && contactId) {
        await triggerWorkflow(token, config.workflow_id, contactId).catch(err =>
          console.error(`GHL workflow trigger failed:`, err.message)
        );
      }

      console.log(`[GHL] Synced fan ${fan.email} to "${integration.name}" (contact: ${contactId || 'upserted'})`);

    } catch (err) {
      console.error(`GHL integration "${integration.name}" error:`, err.message);
    }
  }
}

/**
 * Trigger a GHL workflow for a contact
 */
async function triggerWorkflow(token, workflowId, contactId) {
  const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}/workflow/${workflowId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eventStartTime: new Date().toISOString() }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Workflow trigger failed (${response.status}): ${errText}`);
  }
}

/**
 * Update a fan's tags/fields in GHL when their referral count changes
 * (e.g., when they hit a new reward tier)
 */
async function updateFanInGHL(artistId, { fan, campaign, newTier }) {
  const integrations = Integration.getActiveByType(artistId, 'gohighlevel');
  if (!integrations.length) return;

  for (const integration of integrations) {
    try {
      const config = JSON.parse(integration.config || '{}');
      if (!config.api_key && !config.access_token) continue;
      const token = config.access_token || config.api_key;
      const locationId = config.location_id;
      if (!locationId) continue;

      // Search for existing contact by email
      const searchRes = await fetch(`${GHL_API_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(fan.email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const contactId = searchData.contact?.id;
      if (!contactId) continue;

      // Build update payload
      const updatePayload = {
        tags: [`tier:${newTier}`]
      };

      if (config.custom_field_referral_count) {
        updatePayload.customFields = [{
          id: config.custom_field_referral_count,
          value: String(fan.referral_count || 0)
        }];
      }

      await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28'
        },
        body: JSON.stringify(updatePayload),
        signal: AbortSignal.timeout(10000)
      });

      // Trigger tier-upgrade workflow if configured
      if (config.tier_workflow_id) {
        await triggerWorkflow(token, config.tier_workflow_id, contactId).catch(() => {});
      }

      console.log(`[GHL] Updated fan ${fan.email} — new tier: ${newTier}`);

    } catch (err) {
      console.error(`GHL update error:`, err.message);
    }
  }
}

/**
 * Test GHL connection with given credentials
 */
async function testConnection(apiKeyOrToken, locationId) {
  try {
    const response = await fetch(`${GHL_API_BASE}/locations/${locationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKeyOrToken}`,
        'Version': '2021-07-28'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, location_name: data.location?.name || 'Connected' };
    } else {
      return { success: false, error: `API returned ${response.status}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { syncFanToGHL, updateFanInGHL, testConnection };
