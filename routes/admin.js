const express = require("express");
const router = express.Router();
const Payout = require("../models/Payout");
const auth = require("../middleware/auth");

router.get("/tax-summary", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const payouts = await Payout.find({});
  const totalTax = payouts.reduce((sum, p) => sum + p.tax, 0);
  const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    totalVouchers: payouts.length,
    totalPaid,
    totalTax
  });
});

router.get('/summary', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const totalVouchers = await Voucher.countDocuments();
  const redeemedCount = await Voucher.countDocuments({ isRedeemed: true });
  const totalTax = await Voucher.aggregate([
    { $match: { isRedeemed: true } },
    { $group: { _id: null, total: { $sum: "$taxCharged" } } }
  ]);

  res.json({
    totalVouchers,
    redeemedCount,
    totalTax: totalTax[0]?.total || 0
  });
});


module.exports = router; 