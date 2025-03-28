const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const authMiddleware = require('../middleware/auth');
const { simulateMoMoPayout } = require('../utils/momoSim');
const { simulateSMS } = require('../utils/smsSim');

//  Redeem Voucher
router.post('/redeem', authMiddleware, async (req, res) => {
  const { code } = req.body;
  const recipientPhone = req.user.phone;

  try {
    const voucher = await Voucher.findOne({ code });

    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.isRedeemed) return res.status(400).json({ error: 'Voucher already redeemed' });
    if (voucher.recipientPhone !== recipientPhone) {
      return res.status(403).json({ error: 'This voucher was not assigned to you' });
    }

    const tax = Math.round(voucher.amount * 0.05);
    const netAmount = voucher.amount - tax;

    //  Simulate MoMo payout
    const momoResult = simulateMoMoPayout(recipientPhone, netAmount);

    // Update voucher
    voucher.isRedeemed = true;
    voucher.taxCharged = tax;
    voucher.momoTransactionId = momoResult.transactionId;
    voucher.redeemedAt = new Date();
    await voucher.save();

    // Simulate SMS
    simulateSMS(recipientPhone, `You received GH¢${netAmount}. Tax: GH¢${tax}. Voucher: ${code}`);

    res.json({
      message: 'Voucher redeemed successfully',
      originalAmount: voucher.amount,
      tax,
      netAmount,
      momoTransaction: momoResult
    });

  } catch (err) {
    console.error('Redemption error:', err);
    res.status(500).json({ error: 'Redemption failed' });
  }
});

// 🔸 Redemption History
router.get('/history', authMiddleware, async (req, res) => {
  const phone = req.user.phone;

  try {
    const vouchers = await Voucher.find({ recipientPhone: phone, isRedeemed: true });
    res.json(vouchers);
  } catch (err) {
    console.error('Redemption history error:', err);
    res.status(500).json({ error: 'Failed to fetch redemption history' });
  }
});

module.exports = router;
