const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const auth = require('../middleware/auth');
const { simulateMoMoPayout } = require('../utils/momoSim');
const { simulateSMS } = require('../utils/smsSim');
const { getVouchersAvailableToUser } = require('../services/voucherService');
const EbanPoint = require('../models/EbanPoint');
const PointTransaction = require('../models/PointTransaction');
const User = require('../models/User'); // assuming phone is unique

// 🔹 Redeem Voucher
router.post('/redeem', auth, async (req, res) => {
  const { code } = req.body;
  const recipientPhone = req.user.phone;

  try {
    const voucher = await Voucher.findOne({ code });

    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.isRedeemed) return res.status(400).json({ error: 'Voucher already redeemed' });
    if (voucher.recipientPhone !== recipientPhone) {
      return res.status(403).json({ error: 'This voucher was not assigned to you' });
    }

    // 🔹 Calculate tax and net amount
    const tax = Math.round(voucher.amount * 0.05);
    const netAmount = voucher.amount - tax;

    // 🔹 Simulate MoMo payout
    const momoResult = simulateMoMoPayout(recipientPhone, netAmount);

    // 🔹 Mark voucher as redeemed
    voucher.isRedeemed = true;
    voucher.taxCharged = tax;
    voucher.momoTransactionId = momoResult.transactionId;
    voucher.redeemedAt = new Date();
    await voucher.save();

    // 🔹 Send SMS
    simulateSMS(recipientPhone, `You received GH¢${netAmount}. Tax: GH¢${tax}. Voucher: ${code}`);

    // 🔹 Award Eban points
    const earnedPoints = Math.floor(voucher.amount / 10);
    let recipientPoints = await EbanPoint.findOne({ phone: recipientPhone });

    if (recipientPoints) {
      recipientPoints.points += earnedPoints;
      recipientPoints.lastUpdated = new Date();
      await recipientPoints.save();
    } else {
      await EbanPoint.create({
        phone: recipientPhone,
        points: earnedPoints
      });
    }

    // 🔹 Log point transaction for recipient
    const recipientUser = await User.findOne({ phone: recipientPhone });
    if (recipientUser) {
      await PointTransaction.create({
        userId: recipientUser._id,
        role: "recipient", 
        type: "earn",
        points: earnedPoints,
        reason: `Redeemed voucher ${code}`,
        relatedTransactionId: voucher._id
      });
      
    }

    // 🔹 Respond
    res.json({
      message: 'Voucher redeemed successfully and points awarded',
      originalAmount: voucher.amount,
      tax,
      netAmount,
      momoTransaction: momoResult
    });

  } catch (err) {
    console.error('❌ Redemption error:', err);
    res.status(500).json({ error: 'Redemption failed' });
  }
});

// 🔹 Redemption History
router.get('/history', auth, async (req, res) => {
  const phone = req.user.phone;

  try {
    const vouchers = await Voucher.find({ recipientPhone: phone, isRedeemed: true });
    res.json(vouchers);
  } catch (err) {
    console.error('❌ Redemption history error:', err);
    res.status(500).json({ error: 'Failed to fetch redemption history' });
  }
});

// 🔹 Available Vouchers
router.get('/available', auth, async (req, res) => {
  try {
    const userPhone = req.user.phone;
    const vouchers = await getVouchersAvailableToUser(userPhone);
    res.json(vouchers);
  } catch (err) {
    console.error('❌ Error fetching available vouchers:', err);
    res.status(500).json({ error: 'Server error fetching vouchers' });
  }
});

module.exports = router;
