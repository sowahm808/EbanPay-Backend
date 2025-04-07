// routes/hubtelCallback.js
const express = require('express');
const router = express.Router();

router.post('/hubtel-callback', (req, res) => {
  console.log('Callback received from Hubtel:', req.body);
  // Save transaction status, notify user, etc.
  res.sendStatus(200);
});

module.exports = router;
