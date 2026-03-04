const BASE_URL = process.env.MANIFEST_ENV === 'production'
  ? 'https://api.manifestfinancial.com/enterprise/v1'
  : 'https://api.sandbox.manifestfinancial.com/enterprise/v1';

function getHeaders() {
  const apiKey = process.env.MANIFEST_API_KEY;
  if (!apiKey) throw new Error('MANIFEST_API_KEY not configured');
  const encoded = Buffer.from(apiKey + ':').toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + encoded
  };
}

async function createBuyer({ first_name, last_name, email, external_id }) {
  const res = await fetch(`${BASE_URL}/buyer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ first_name, last_name, email, external_id }),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create buyer: ${res.status}`);
  }
  return res.json();
}

async function getBuyer(buyerId) {
  const res = await fetch(`${BASE_URL}/buyer/${buyerId}`, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Failed to get buyer: ${res.status}`);
  return res.json();
}

async function getBuyerByExternalId(externalId) {
  const res = await fetch(`${BASE_URL}/buyer/external/${externalId}`, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) return null;
  return res.json();
}

async function createPurchase(buyerId, { name, amountInCents }) {
  const res = await fetch(`${BASE_URL}/purchase`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      buyer: buyerId,
      items: [{ name, amount_in_cents: amountInCents, quantity: 1 }],
      auto_refund_on_fraud: true,
      user_data: { product: 'truefans-loop', plan: 'monthly' }
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create purchase: ${res.status}`);
  }
  return res.json();
}

async function commitPurchase(purchaseId) {
  const res = await fetch(`${BASE_URL}/purchase/${purchaseId}/commit`, {
    method: 'POST',
    headers: getHeaders(),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to commit purchase: ${res.status}`);
  }
  return res.json();
}

async function getPurchase(purchaseId) {
  const res = await fetch(`${BASE_URL}/purchase/${purchaseId}`, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Failed to get purchase: ${res.status}`);
  return res.json();
}

module.exports = { createBuyer, getBuyer, getBuyerByExternalId, createPurchase, commitPurchase, getPurchase };
