const africastalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});
const Notification = require('../models/Notification');

const sms = africastalking.SMS;

const sendSMS = async (to, message) => {
  try {
    const response = await sms.send({
      to: [to],
      message,
    });

    await Notification.create({ phone: to, message, type: 'sms', status: 'sent' });
    console.log("✅ SMS logged and sent:", response);
  } catch (error) {
    console.error("❌ SMS error:", error.message);
    await Notification.create({ phone: to, message, type: 'sms', status: 'failed' });
  }
};

module.exports = sendSMS;
