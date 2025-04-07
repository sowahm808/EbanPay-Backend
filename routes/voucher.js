router.post('/voucher/redeem', (req, res) => {
    const { voucherCode, momoPin } = req.body;
  
    if (!voucherCode || !momoPin) {
      return res.status(400).json({ error: 'Missing voucher code or MoMo PIN' });
    }
  
    // Simulate checking
    if (momoPin !== '1234') {
      return res.status(401).json({ error: 'Invalid MoMo PIN (test mode)' });
    }
  
    // Simulate success
    return res.json({ message: 'Voucher redeemed successfully!' });
  });
  