const express = require("express");
const router = express.Router();
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth"); // Ensure the path is correct

router.get("/check",requireAuth, async (req, res) => {
  const phone = req.query.phone;

  if (phone === 'me') {
    phone = req.user.phone; // 👈 from JWT token
  }
  
  if (!phone) {
    return res.status(400).json({ error: "Missing phone number" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user || user.role !== "payor") {
      return res.status(404).json({ error: "Payor not found" });
    }

    res.json({
      fullName: user.fullName,
      phone: user.phone,
      points: user.points
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching points" });
  }
});

module.exports = router;
