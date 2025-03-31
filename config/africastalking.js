// config/africastalking.js
const AfricasTalking = require('africastalking');

const africasTalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,      // your Africa's Talking API key
  username: process.env.AT_USERNAME     // your Africa's Talking username
});

module.exports = africasTalking;
