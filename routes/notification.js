const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ phone: req.user.phone }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Notifications error:", err);
    res.status(500).json({ error: 'Could not fetch notifications' });
  }
});

module.exports = router;
