const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
  voucherCode: String,
  recipientPhone: String,
  amount: Number,
  tax: Number,
  amountSent: Number,
  payoutDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Payout", payoutSchema);
