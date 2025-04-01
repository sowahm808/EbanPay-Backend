const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PointTransaction = require("../models/PointTransaction");
const requireAuth = require("../middleware/requireAuth");

router.get("/check", requireAuth, async (req, res) => {
  let phone = req.query.phone;
  if (phone === 'me') {
    phone = req.user.phone; // Get phone from JWT token
  }
  
  if (!phone) {
    return res.status(400).json({ error: "Missing phone number" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      points: user.points ?? 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching points" });
  }
});

router.get("/balance", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ points: user.points });
  } catch (error) {
    console.error("Error fetching points balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/redeem", requireAuth, async (req, res) => {
  const { pointsToRedeem, rewardType } = req.body; // e.g., "airtime", "discount"
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.points < pointsToRedeem) {
      return res.status(400).json({ error: "Insufficient points" });
    }
    user.points -= pointsToRedeem;
    await user.save();

    // Log the point redemption
    await PointTransaction.create({
      userId: user._id,
      type: "redeem",
      points: pointsToRedeem,
      reason: `Redeemed for ${rewardType}`
    });

    res.json({ message: "Points redeemed successfully", remainingPoints: user.points });
  } catch (error) {
    console.error("Error redeeming points:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const transactions = await PointTransaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching point history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
