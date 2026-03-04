const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({ errors: errors.array() });
    }
    req.flash_errors = errors.array().map(e => e.msg);
    return next();
  }
  next();
}

const fanSignupRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  handleValidation
];

const campaignCreateRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('slug').trim().notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers, and hyphens'),
  body('type').optional().isIn(['pre-save', 'merch-drop', 'ticket-giveaway', 'exclusive-content', 'meet-greet', 'fan-club', 'contest']),
  body('artist_id').notEmpty().withMessage('Artist is required'),
  handleValidation
];

const artistCreateRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('slug').trim().notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers, and hyphens'),
  handleValidation
];

const rewardCreateRules = [
  body('tier_name').trim().notEmpty().withMessage('Tier name is required'),
  body('referrals_required').isInt({ min: 1 }).withMessage('Referrals required must be at least 1'),
  handleValidation
];

module.exports = { fanSignupRules, campaignCreateRules, artistCreateRules, rewardCreateRules, handleValidation };
