const express = require('express');
const { sendMobileMoneyCashOut } = require('../services/hubtelService');

const router = express.Router();

router.post('/cashout', async (req, res) => {
  try {
    const data = await sendMobileMoneyCashOut(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;
