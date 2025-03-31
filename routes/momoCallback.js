const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction"); // Your transaction model
const Voucher = require("../models/Voucher"); // Optional: if you want to update vouchers
const crypto = require("crypto");

/**
 * Verifies the callback signature using a shared secret.
 * Replace the algorithm and payload formatting as required by your provider.
 *
 * @param {object} payload - The request body received from the MoMo provider.
 * @param {string} signature - The signature from the request headers.
 * @returns {boolean} - Whether the signature matches the expected signature.
 */
const verifyCallbackSignature = (payload, signature) => {
  // Create the expected HMAC signature using the shared callback secret.
  const expected = crypto
    .createHmac("sha256", process.env.MOMO_CALLBACK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
  return expected === signature;
};

router.post("/", async (req, res) => {
  const payload = req.body;
  const signature = req.headers["x-signature"]; // This header name depends on your provider

  // Verify callback authenticity
  if (!verifyCallbackSignature(payload, signature)) {
    return res.status(401).send("Unauthorized");
  }

  try {
    // Extract necessary data from the payload
    const { transactionId, status, voucherCode } = payload;

    // Option 1: Update a transaction record if you track MoMo payouts
    const transaction = await Transaction.findOne({ momoTransactionId: transactionId });
    if (transaction) {
      transaction.status = status;
      await transaction.save();
      console.log("Transaction updated:", transaction);
    }
    
    // Option 2: Update voucher record if you want to mark it redeemed after callback confirmation
    // Uncomment and modify if required:
    // const voucher = await Voucher.findOne({ code: voucherCode });
    // if (voucher) {
    //   voucher.isRedeemed = true;
    //   voucher.redeemedAt = new Date();
    //   await voucher.save();
    //   console.log("Voucher updated:", voucher);
    // }

    console.log("MoMo callback processed:", payload);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing MoMo callback:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
