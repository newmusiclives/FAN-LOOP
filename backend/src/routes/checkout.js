const express = require('express');
const bcrypt = require('bcryptjs');
const manifestService = require('../services/manifestService');
const User = require('../models/User');
const router = express.Router();

// Checkout page
router.get('/checkout', (req, res) => {
  res.render('fan/checkout', { layout: false });
});

// Step 1: Create buyer in Manifest
router.post('/api/checkout/create-buyer', async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if user already exists
    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Check if buyer already exists in Manifest
    let buyer = await manifestService.getBuyerByExternalId(email);

    if (!buyer) {
      buyer = await manifestService.createBuyer({
        first_name,
        last_name,
        email,
        external_id: email
      });
    }

    res.json({
      buyer_id: buyer.id,
      embed_url: buyer.payment_method_embed_url
    });
  } catch (err) {
    console.error('Create buyer error:', err.message);
    res.status(500).json({ error: 'Failed to set up payment. Please try again.' });
  }
});

// Step 2: Process payment — create and commit purchase
router.post('/api/checkout/process-payment', async (req, res) => {
  try {
    const { buyer_id, plan, amount_in_cents } = req.body;

    if (!buyer_id) {
      return res.status(400).json({ error: 'Missing buyer information.' });
    }

    // Validate plan and amount
    const validPlans = { standard: 2700, pro: 6700 };
    const selectedPlan = plan && validPlans[plan] ? plan : 'standard';
    const amountInCents = validPlans[selectedPlan];

    const planName = selectedPlan === 'pro'
      ? 'TrueFans LOOP PRO Monthly Subscription'
      : 'TrueFans LOOP Monthly Subscription';

    // Create purchase
    const purchase = await manifestService.createPurchase(buyer_id, {
      name: planName,
      amountInCents
    });

    // Commit (charge) the purchase
    const committed = await manifestService.commitPurchase(purchase.id);

    // Get buyer info to create the user account
    const buyer = await manifestService.getBuyer(buyer_id);

    // Create admin user account
    const password = generatePassword();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = User.create({
      email: buyer.email,
      password: hashedPassword,
      name: `${buyer.first_name} ${buyer.last_name}`,
      role: 'admin'
    });

    // TODO: Send welcome email with password (for now log it)
    console.log(`\n  New paid user: ${buyer.email} / ${password}\n`);

    res.json({
      success: true,
      purchase_id: committed.id,
      status: committed.status
    });
  } catch (err) {
    console.error('Process payment error:', err.message);
    res.status(500).json({ error: err.message || 'Payment processing failed. Please try again.' });
  }
});

function generatePassword() {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

module.exports = router;
