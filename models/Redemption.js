const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema({
  voucherCode: String,
  recipientPhone: String,
  amountBeforeTax: Number,
  taxCharged: Number,
  amountReceived: Number,
  redeemedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Redemption", redemptionSchema);
