// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  momoTransactionId: { type: String, required: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  voucherCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
