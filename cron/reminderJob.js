const cron = require('node-cron');
const Voucher = require('../models/Voucher');
const sendSMS = require('../services/smsService');
// const sendEmail = require('../services/emailService'); // If you implement email

// Every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log("🔔 Checking for unredeemed vouchers...");

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const unredeemedVouchers = await Voucher.find({
    isRedeemed: false,
    reminderSent: false,
    createdAt: { $lte: twentyFourHoursAgo }
  });

  for (const voucher of unredeemedVouchers) {
    const msg = `Reminder: You have a GHS ${voucher.amount} voucher. Redeem it using code ${voucher.code} via *777#.`;

    try {
      await sendSMS(voucher.recipientPhone, msg);

      // Optionally send email
      // await sendEmail(voucher.recipientEmail, "Voucher Reminder", msg);

      voucher.reminderSent = true;
      await voucher.save();

      console.log(`✅ Reminder sent for voucher ${voucher.code}`);
    } catch (err) {
      console.error(`❌ Failed to send reminder for voucher ${voucher.code}`, err);
    }
  }
});
