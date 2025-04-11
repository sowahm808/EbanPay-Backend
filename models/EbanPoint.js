const mongoose = require('mongoose');

const ebanPointSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EbanPoint', ebanPointSchema);
