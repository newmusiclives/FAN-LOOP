const { stringify } = require('csv-stringify');
const Fan = require('../models/Fan');

function exportFansCSV(campaignId, res) {
  const fans = campaignId
    ? Fan.listByCampaign(campaignId, { limit: 100000, offset: 0 })
    : Fan.listAll({ limit: 100000, offset: 0 });

  const columns = ['email', 'name', 'referral_code', 'referral_count', 'verified', 'source', 'status', 'created_at'];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="fans-export-${Date.now()}.csv"`);

  const stringifier = stringify({ header: true, columns });
  stringifier.pipe(res);

  for (const fan of fans) {
    stringifier.write({
      email: fan.email,
      name: fan.name || '',
      referral_code: fan.referral_code,
      referral_count: fan.referral_count,
      verified: fan.verified ? 'Yes' : 'No',
      source: fan.source || 'direct',
      status: fan.status,
      created_at: fan.created_at
    });
  }

  stringifier.end();
}

module.exports = { exportFansCSV };
