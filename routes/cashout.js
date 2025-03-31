const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const { simulateMoMoPayout } = require("../utils/momoSim");
const { simulateSMS } = require("../utils/smsSim");
const requireAuth = require("../middleware/requireAuth"); // your JWT middleware


// POST /cashout
router.post("/", requireAuth,async (req, res) => {
  const { voucherCode, phoneNumber } = req.body;

  try {
    // Find the voucher by its code
    const voucher = await Voucher.findOne({ code: voucherCode });
    
    // Validate: voucher must exist, be redeemed, and belong to this phoneNumber
    if (!voucher || !voucher.isRedeemed || voucher.recipientPhone !== phoneNumber) {
      return res.status(400).json({ error: "Voucher is invalid, not redeemed, or not assigned to your phone" });
    }
    
    // Simulate mobile money payout
    const payoutResult = simulateMoMoPayout(phoneNumber, voucher.amount);

    // Optionally send SMS notification about the cashout
    await simulateSMS(phoneNumber, `Your cashout of GHS ${voucher.amount} was successful. Transaction ID: ${payoutResult.transactionId}`);

    // Respond with the simulated payout details
    res.json({
      message: "Cashout successful",
      payout: payoutResult
    });
  } catch (error) {
    console.error("Cashout error:", error);
    res.status(500).json({ error: "Cashout failed", details: error.message });
  }
});

module.exports = router;
