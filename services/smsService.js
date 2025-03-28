require("dotenv").config();
const africastalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = africastalking.SMS;

const sendSMS = (phone, message) => {
  return sms.send({
    to: [phone],
    message,
    from: process.env.AT_SHORTCODE, // optional
  });
};

module.exports = sendSMS;
