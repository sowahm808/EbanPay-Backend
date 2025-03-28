const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "eban_secret";

// SIGNUP
router.post("/signup", async (req, res) => {
  const { fullName, phone, password, role } = req.body;

  // Validate input
  if (!fullName || !phone || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if phone is already used
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ error: "Phone already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      fullName,
      phone,
      role,
      password: hashedPassword
    });

    await newUser.save();

    // Optionally issue JWT
    const token = jwt.sign(
      { id: newUser._id, phone: newUser.phone, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      user: {
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        points: newUser.points
      },
      token
    });

  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ error: "Signup failed." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required." });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.password) {
      return res.status(400).json({ error: "User has no password. Please sign up again." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        points: user.points
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
