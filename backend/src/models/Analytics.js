const { getDb } = require('../../db/database');

const Analytics = {
  log({ campaign_id, fan_id, event_type, event_data, ip_address, user_agent }) {
    getDb().prepare(
      'INSERT INTO analytics_events (campaign_id, fan_id, event_type, event_data, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(campaign_id || null, fan_id || null, event_type, JSON.stringify(event_data || {}), ip_address || null, user_agent || null);
  },

  getGrowthData(campaignId, days = 30) {
    const query = campaignId
      ? `SELECT date(created_at) as date, COUNT(*) as count FROM fans WHERE campaign_id = ? AND created_at >= date('now', '-${days} days') GROUP BY date(created_at) ORDER BY date`
      : `SELECT date(created_at) as date, COUNT(*) as count FROM fans WHERE created_at >= date('now', '-${days} days') GROUP BY date(created_at) ORDER BY date`;
    return campaignId ? getDb().prepare(query).all(campaignId) : getDb().prepare(query).all();
  },

  getChannelBreakdown(campaignId) {
    const query = campaignId
      ? "SELECT COALESCE(source, 'direct') as channel, COUNT(*) as count FROM fans WHERE campaign_id = ? GROUP BY source ORDER BY count DESC"
      : "SELECT COALESCE(source, 'direct') as channel, COUNT(*) as count FROM fans GROUP BY source ORDER BY count DESC";
    return campaignId ? getDb().prepare(query).all(campaignId) : getDb().prepare(query).all();
  },

  getConversionRate(campaignId) {
    const views = getDb().prepare(
      "SELECT COUNT(*) as count FROM analytics_events WHERE campaign_id = ? AND event_type = 'page_view'"
    ).get(campaignId)?.count || 0;
    const signups = getDb().prepare(
      'SELECT COUNT(*) as count FROM fans WHERE campaign_id = ?'
    ).get(campaignId)?.count || 0;
    return { views, signups, rate: views > 0 ? (signups / views * 100).toFixed(1) : 0 };
  },

  getKFactor(campaignId) {
    const totalFans = getDb().prepare('SELECT COUNT(*) as count FROM fans WHERE campaign_id = ?').get(campaignId)?.count || 0;
    const totalReferrals = getDb().prepare("SELECT COUNT(*) as count FROM referrals WHERE campaign_id = ? AND status = 'confirmed'").get(campaignId)?.count || 0;
    return totalFans > 0 ? (totalReferrals / totalFans).toFixed(2) : '0.00';
  },

  getGlobalKFactor() {
    const totalFans = getDb().prepare('SELECT COUNT(*) as count FROM fans').get()?.count || 0;
    const totalReferrals = getDb().prepare("SELECT COUNT(*) as count FROM referrals WHERE status = 'confirmed'").get()?.count || 0;
    return totalFans > 0 ? (totalReferrals / totalFans).toFixed(2) : '0.00';
  },

  getEventCounts(campaignId, days = 30) {
    return getDb().prepare(`
      SELECT event_type, COUNT(*) as count FROM analytics_events
      WHERE campaign_id = ? AND created_at >= date('now', '-${days} days')
      GROUP BY event_type ORDER BY count DESC
    `).all(campaignId);
  },

  getGeographicData(campaignId) {
    const query = campaignId
      ? "SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as count FROM fans WHERE campaign_id = ? GROUP BY country ORDER BY count DESC LIMIT 20"
      : "SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as count FROM fans GROUP BY country ORDER BY count DESC LIMIT 20";
    return campaignId ? getDb().prepare(query).all(campaignId) : getDb().prepare(query).all();
  }
};

module.exports = Analytics;
