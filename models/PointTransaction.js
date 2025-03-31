
const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["earn", "redeem"], required: true },
  points: { type: Number, required: true },
  reason: { type: String },
  relatedTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);
