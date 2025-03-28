const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/create", async (req, res) => {
  const { fullName, phone, role } = req.body;

  try {
    const user = new User({ fullName, phone, role });
    await user.save();
    res.json({ message: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create user" });
  }
});

module.exports = router;
