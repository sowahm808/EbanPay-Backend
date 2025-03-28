const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const sendSMS = require("../services/smsService");
const crypto = require("crypto");

function generateCode(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
}

router.post("/create-voucher", async (req, res) => {
  const { recipientPhone, amount, payorPhone } = req.body;

  if (!recipientPhone || !amount || !payorPhone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const code = generateCode();

  const voucher = new Voucher({
    recipientPhone,
    amount,
    code,
    isRedeemed: false
  });

  try {
    await voucher.save();

    // ✅ 1. Award Points to Payor
    const payor = await User.findOne({ phone: payorPhone });

    if (payor) {
      const pointsToAdd = Math.floor(amount / 10); // 1 point per 10 GHS
      payor.points += pointsToAdd;
      await payor.save();
    }

    // ✅ 2. Send Voucher to Recipient
    const message = `EBANPAY: You've received GHS ${amount} from a client. Redeem via *777# using code: ${code}.`;
    await sendSMS(recipientPhone, message);

    return res.json({
      message: "Voucher created and SMS sent.",
      code,
      amount,
      recipient: recipientPhone,
      payorPoints: payor?.points ?? 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating voucher" });
  }
});
// Get vouchers created by payor
router.get('/vouchers', authMiddleware, async (req, res) => {
  const phone = req.user.phone;
  const vouchers = await Voucher.find({ createdBy: phone });
  res.json(vouchers);
});

module.exports = router;
