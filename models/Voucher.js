const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  recipientPhone: { type: String, required: true },
  amount: { type: Number, required: true },
  code: { type: String, required: true, unique: true },
  isRedeemed: { type: Boolean, default: false },
  taxCharged: { type: Number, default: 0 },
  momoTransactionId: { type: String },
  redeemedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Voucher", voucherSchema);
