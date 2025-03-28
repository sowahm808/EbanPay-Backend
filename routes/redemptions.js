const express = require("express");
const router = express.Router();
const Redemption = require("../models/Redemption");

router.get("/", async (req, res) => {
  const phone = req.query.phone;

  if (!phone) {
    return res.status(400).json({ error: "Missing recipient phone" });
  }

  const history = await Redemption.find({ recipientPhone: phone }).sort({ redeemedAt: -1 });

  res.json(history);
});

module.exports = router;
