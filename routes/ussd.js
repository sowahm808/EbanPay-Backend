const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Redemption = require("../models/Redemption");
// You can add Payout or other models as needed

// USSD endpoint handling the session-based input
router.post("/", async (req, res) => {
  // Extract USSD session parameters from the request body
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split("*");
  let response = "";

  try {
    // Main menu if no input is provided
    if (text === "") {
      response = `CON Welcome to EbanPay
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
        response = `CON Voucher found: GHS ${voucher.amount} (Tax: GHS ${tax}).
You will receive GHS ${netAmount}.
Enter your MoMo PIN to confirm:`;
      }
    }
    // Option 1: Redeem Voucher - Step 3: Process redemption with entered MoMo PIN
    else if (inputs[0] === "1" && inputs.length === 3) {
      const code = inputs[1].trim();
      // MoMo PIN can be validated here if integrated with a Momo service
      const momoPin = inputs[2].trim(); // Currently, we simply accept it
      const voucher = await Voucher.findOne({ code });
      if (!voucher || voucher.isRedeemed || voucher.recipientPhone !== phoneNumber) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        const tax = Math.round(voucher.amount * 0.1);
        const netAmount = voucher.amount - tax;
        // Mark voucher as redeemed and record tax, net amount and timestamp
        voucher.isRedeemed = true;
        voucher.taxCharged = tax;
        voucher.redeemedAt = new Date();
        await voucher.save();

        // Optionally log redemption details in a separate collection
        await Redemption.create({
          voucherCode: code,
          recipientPhone: phoneNumber,
          amountBeforeTax: voucher.amount,
          taxCharged: tax,
          amountReceived: netAmount,
          redeemedAt: new Date()
        });

        // Optionally, trigger an SMS notification here (e.g., simulateSMS(phoneNumber, message))
        response = `END Voucher Redeemed!
Received: GHS ${netAmount}
Tax: GHS ${tax} sent to GRA.`;
      }
    }
    // Option 2: My Points - Display the user's current points
    else if (text === "2") {
      // In a real implementation, look up the user via phoneNumber or session
      // For simulation, we return a dummy points balance
      response = "END Your current points balance is 50 points.";
    }
    // Fallback for invalid inputs
    else {
      response = "END Invalid option selected. Please try again.";
    }

    // Set the response content type to plain text (required for USSD responses)
    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (err) {
    console.error("USSD Error:", err);
    res.set("Content-Type", "text/plain");
    res.send("END System error. Please try again later.");
  }
});

module.exports = router;
