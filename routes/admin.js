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

module.exports = router; 