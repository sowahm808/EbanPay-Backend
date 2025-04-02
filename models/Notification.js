const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['sms', 'push'], default: 'sms' },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
