const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Redemption = require("../models/Redemption");
const sendSMS = require("../services/smsService"); // Ensure this is your production SMS service

const crypto = require("crypto");

function generateCode(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
}

router.post("/", async (req, res) => {
  // Extract USSD session parameters from the request body
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split("*");
  let response = "";

  try {
    // Main menu if no input is provided
    if (text === "") {
      response = `CON Welcome to EbanPay USSD
1. Redeem Voucher
2. My Points`;
    }
    // Option 1: Redeem Voucher - Step 1: Ask for voucher code
    else if (text === "1") {
      response = `CON Enter voucher code:`;
    }
    // Option 1: Redeem Voucher - Step 2: Validate voucher and prompt for MoMo PIN
    else if (inputs[0] === "1" && inputs.length === 2) {
      const code = inputs[1].trim();
      const voucher = await Voucher.findOne({ code });
      // Validate voucher: exists, not redeemed, and assigned to this phone number
      if (!voucher || voucher.isRedeemed || voucher.recipientPhone !== phoneNumber) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        const tax = Math.round(voucher.amount * 0.1);
        const netAmount = voucher.amount - tax;
        response = `CON Voucher found: Amount GH¢${voucher.amount} (Tax GH¢${tax}).
You will receive GH¢${netAmount}.
Enter your MoMo PIN to confirm:`;
      }
    }
    // Option 1: Redeem Voucher - Step 3: Process redemption with entered MoMo PIN
    else if (inputs[0] === "1" && inputs.length === 3) {
      const code = inputs[1].trim();
      const momoPin = inputs[2].trim();
      // (Here you could integrate real MoMo PIN verification)
      const voucher = await Voucher.findOne({ code });
      if (!voucher || voucher.isRedeemed || voucher.recipientPhone !== phoneNumber) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        const tax = Math.round(voucher.amount * 0.1);
        const netAmount = voucher.amount - tax;
        // Mark voucher as redeemed
        voucher.isRedeemed = true;
        voucher.taxCharged = tax;
        voucher.redeemedAt = new Date();
        await voucher.save();

        // Log redemption
        await Redemption.create({
          voucherCode: code,
          recipientPhone: phoneNumber,
          amountBeforeTax: voucher.amount,
          taxCharged: tax,
          amountReceived: netAmount,
          redeemedAt: new Date()
        });

        // Trigger SMS notification
        await sendSMS(phoneNumber, `EbanPay: Voucher redeemed successfully! You received GH¢${netAmount}. Tax GH¢${tax} forwarded to GRA.`);
        response = `END Voucher Redeemed!
Received: GH¢${netAmount}
Tax: GH¢${tax} sent to GRA.`;
      }
    }
    // Option 2: My Points - Return the user's current points
    else if (text === "2") {
      // In a production system, look up the user via phoneNumber
      // Here, we simulate a points balance.
      response = "END Your current points balance is 50 points.";
    }
    // Fallback for invalid inputs
    else {
      response = "END Invalid option selected. Please try again.";
    }

    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (err) {
    console.error("USSD Error:", err);
    res.set("Content-Type", "text/plain");
    res.send("END System error. Please try again later.");
  }
});

module.exports = router;
