const { getDb } = require('../../db/database');

const Leaderboard = {
  refresh(campaignId, period = 'alltime') {
    const db = getDb();
    let dateFilter = '';
    if (period === 'weekly') dateFilter = "AND r.created_at >= date('now', '-7 days')";
    else if (period === 'monthly') dateFilter = "AND r.created_at >= date('now', '-30 days')";

    db.prepare('DELETE FROM leaderboard_cache WHERE campaign_id = ? AND period = ?').run(campaignId, period);

    db.prepare(`
      INSERT INTO leaderboard_cache (campaign_id, fan_id, period, rank, referral_count, updated_at)
      SELECT
        f.campaign_id,
        f.id,
        ?,
        ROW_NUMBER() OVER (ORDER BY COALESCE(ref_counts.cnt, 0) DESC, f.created_at ASC),
        COALESCE(ref_counts.cnt, 0),
        datetime('now')
      FROM fans f
      LEFT JOIN (
        SELECT r.referrer_id, COUNT(*) as cnt
        FROM referrals r
        WHERE r.campaign_id = ? AND r.status = 'confirmed' ${dateFilter}
        GROUP BY r.referrer_id
      ) ref_counts ON f.id = ref_counts.referrer_id
      WHERE f.campaign_id = ? AND f.status = 'active' AND COALESCE(ref_counts.cnt, 0) > 0
    `).run(period, campaignId, campaignId);
  },

  get(campaignId, period = 'alltime', limit = 50) {
    return getDb().prepare(`
      SELECT lc.*, f.name as fan_name, f.email as fan_email
      FROM leaderboard_cache lc
      JOIN fans f ON lc.fan_id = f.id
      WHERE lc.campaign_id = ? AND lc.period = ?
      ORDER BY lc.rank ASC LIMIT ?
    `).all(campaignId, period, limit);
  },

  getRank(campaignId, fanId, period = 'alltime') {
    return getDb().prepare(
      'SELECT * FROM leaderboard_cache WHERE campaign_id = ? AND fan_id = ? AND period = ?'
    ).get(campaignId, fanId, period);
  }
};

module.exports = Leaderboard;
