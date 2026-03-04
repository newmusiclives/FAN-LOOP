const { getDb } = require('../../db/database');

const Reward = {
  findById(id) {
    return getDb().prepare('SELECT * FROM rewards WHERE id = ?').get(id);
  },

  create({ campaign_id, tier_name, referrals_required, description, reward_type, reward_value }) {
    const result = getDb().prepare(
      'INSERT INTO rewards (campaign_id, tier_name, referrals_required, description, reward_type, reward_value) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(campaign_id, tier_name, referrals_required, description || null, reward_type || 'digital', reward_value || null);
    return this.findById(result.lastInsertRowid);
  },

  listByCampaign(campaignId) {
    return getDb().prepare('SELECT * FROM rewards WHERE campaign_id = ? ORDER BY referrals_required ASC').all(campaignId);
  },

  delete(id) {
    getDb().prepare('DELETE FROM rewards WHERE id = ?').run(id);
  },

  deleteByCampaign(campaignId) {
    getDb().prepare('DELETE FROM rewards WHERE campaign_id = ?').run(campaignId);
  }
};

module.exports = Reward;
