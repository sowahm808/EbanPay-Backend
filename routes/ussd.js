const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Redemption = require("../models/Redemption"); // Optional: for logging
const Payout = require("../models/Payout"); // Optional: not yet used

router.post("/", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split("*");
  let response = "";

  try {
    if (text === "") {
      response = `CON Welcome to EbanPay
1. Redeem Voucher
2. My Points`;
    }

    // STEP 1: Ask for code
    else if (text === "1") {
      response = `CON Enter voucher code:`;
    }

    // STEP 2: Confirm amount + ask for MoMo PIN
    else if (inputs[0] === "1" && inputs.length === 2) {
      const code = inputs[1];
      const voucher = await Voucher.findOne({ code });

      if (!voucher || voucher.isRedeemed || voucher.recipientPhone !== phoneNumber) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        const tax = Math.round(voucher.amount * 0.1);
        const netAmount = voucher.amount - tax;

        response = `CON You will receive GHS ${netAmount}.
Enter your MoMo PIN to confirm:`;
      }
    }

    // STEP 3: Final confirmation + simulate redemption
    else if (inputs[0] === "1" && inputs.length === 3) {
      const code = inputs[1];
      const voucher = await Voucher.findOne({ code });

      if (!voucher || voucher.isRedeemed || voucher.recipientPhone !== phoneNumber) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        const tax = Math.round(voucher.amount * 0.1);
        const netAmount = voucher.amount - tax;

        // Mark redeemed
        voucher.isRedeemed = true;
        voucher.taxCharged = tax;
        voucher.redeemedAt = new Date();
        await voucher.save();

        // Optionally log redemption
        await Redemption.create({
          voucherCode: code,
          recipientPhone: phoneNumber,
          amountBeforeTax: voucher.amount,
          taxCharged: tax,
          amountReceived: netAmount,
          redeemedAt: new Date()
        });

        response = `END Voucher Redeemed!\nReceived: GHS ${netAmount}\nTax: GHS ${tax} sent to GRA.`;
      }
    }

    // Invalid option fallback
    else {
      response = `END Invalid option selected.`;
    }

    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (err) {
    console.error("USSD Error:", err);
    res.send("END System error. Try again later.");
  }
});

module.exports = router;
