const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');

// POST /api/voucher/redeem
router.post('/redeem', async (req, res) => {
  const { voucherCode, momoPin } = req.body;

  if (!voucherCode || !momoPin) {
    return res.status(400).json({ error: 'Missing voucher code or MoMo PIN' });
  }

  // Simulate MoMo PIN validation (sandbox/testing)
  if (momoPin !== '1234') {
    return res.status(401).json({ error: 'Invalid MoMo PIN (test mode)' });
  }

  try {
    const voucher = await Voucher.findOne({ code: voucherCode });

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    if (voucher.isRedeemed) {
      return res.status(400).json({ error: 'Voucher already redeemed' });
    }

    // Mark voucher as redeemed
    voucher.isRedeemed = true;
    voucher.redeemedAt = new Date(); // Optional: track redemption time
    await voucher.save();

    return res.json({
      message: 'Voucher redeemed successfully!',
      voucher
    });

  } catch (error) {
    console.error('Redeem error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
