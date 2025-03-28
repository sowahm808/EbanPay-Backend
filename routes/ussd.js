const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Redemption = require("../models/Redemption");
const Payout = require("../models/Payout");


router.post("/", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split("*");
  let response = "";

  try {
    if (text === "") {
      response = `CON Welcome to EbanPay
1. Redeem Voucher
2. My Points`;
    } else if (text === "1") {
      response = `CON Enter voucher code`;
    } else if (inputs[0] === "1" && inputs.length === 2) {
      const code = inputs[1];
      const voucher = await Voucher.findOne({ code });

      if (!voucher || voucher.isRedeemed) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        const tax = voucher.amount * 0.1;
        const finalAmount = voucher.amount - tax;
        response = `CON Voucher found. You will receive GHS ${finalAmount}.
Enter your MoMo PIN to confirm:`;
    await Redemption.create({
        voucherCode: code,
        recipientPhone: voucher.recipientPhone,
        amountBeforeTax: voucher.amount,
        taxCharged: voucher.taxCharged,
        amountReceived: voucher.amount - voucher.taxCharged,
        redeemedAt: new Date()
    });
  
      }
    } else if (inputs[0] === "1" && inputs.length === 3) {
      const code = inputs[1];
      const voucher = await Voucher.findOne({ code });

      if (!voucher || voucher.isRedeemed) {
        response = `END Invalid or already redeemed voucher.`;
      } else {
        // Simulate redeem logic
        voucher.isRedeemed = true;
        voucher.taxCharged = voucher.amount * 0.1;
        voucher.redeemedAt = new Date();
        await voucher.save();

        response = `END Redeemed! You received GHS ${voucher.amount - voucher.taxCharged}. Tax GHS ${voucher.taxCharged} sent to GRA.`;
      }
    } else {
      response = `END Invalid choice.`;
    }

    res.set("Content-Type", "text/plain");
    res.send(response);

  } catch (err) {
    console.error(err);
    res.send("END System error, try again later.");
  }
});

module.exports = router;
