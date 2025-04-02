const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const sendEmail = require('../services/emailService'); // ✅ Import email service

// 🔹 Helper function to send an email reminder
const sendUnredeemedReminder = async (recipientEmail, voucherCode, amount) => {
  const subject = 'Reminder: You have an unredeemed voucher!';
  const text = `Hi! You received a GHS ${amount} voucher. Redeem it now using this code: ${voucherCode}.`;
  await sendEmail(recipientEmail, subject, text);  
};

// 🔹 Route to trigger email reminders
router.post('/remind-unredeemed', async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isRedeemed: false });

    for (const voucher of vouchers) {
      const user = await User.findOne({ phone: voucher.recipientPhone });
      if (user?.email) {
        await sendUnredeemedReminder(user.email, voucher.code, voucher.amount);
      }
    }

    res.json({ message: 'Reminders sent for unredeemed vouchers' });
  } catch (error) {
    console.error("Error sending reminders:", error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

module.exports = router;
