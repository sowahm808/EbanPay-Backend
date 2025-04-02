const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const sendSMS = require("../services/smsService");
const crypto = require("crypto");
const PointTransaction = require("../models/PointTransaction");

function generateCode(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
}

router.post("/create-voucher", authMiddleware, async (req, res) => {
  /**
   * @swagger
   * /payor/create-voucher:
   *   post:
   *     summary: Create a voucher and award points to payor
   *     tags: [Payor]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - recipientPhone
   *               - amount
   *             properties:
   *               recipientPhone:
   *                 type: string
   *                 example: "0244123456"
   *               amount:
   *                 type: number
   *                 example: 100
   *     responses:
   *       200:
   *         description: Voucher created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 code:
   *                   type: string
   *                 amount:
   *                   type: number
   *                 recipient:
   *                   type: string
   *                 payorPoints:
   *                   type: number
   *       400:
   *         description: Missing required fields
   *       401:
   *         description: Unauthorized
   */

  const { recipientPhone, amount } = req.body;
  const payorPhone = req.user.phone;

  if (!recipientPhone || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const code = generateCode();

  const voucher = new Voucher({
    recipientPhone,
    amount,
    code,
    createdBy: payorPhone,
    isRedeemed: false
  });

  try {
    await voucher.save();

    const payor = await User.findOne({ phone: payorPhone });
    if (payor) {
      const pointsEarned = Math.floor(amount / 10);
      payor.points += pointsEarned;
      await payor.save();

      // Log the point transaction
      await PointTransaction.create({
        userId: payor._id,
        type: "earn",
        points: pointsEarned,
        reason: `Voucher created for GH¢${amount} service payment`
      });
    }

    const message = `EBANPAY: You've received GHS ${amount} from a client. Redeem via *777# using code: ${code}.`;
    await sendSMS(recipientPhone, message);

    return res.json({
      message: "Voucher created and SMS sent.",
      code,
      amount,
      recipient: recipientPhone,
      payorPoints: payor?.points ?? 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating voucher" });
  }
});

// Get vouchers created by payor
router.get("/vouchers", authMiddleware, async (req, res) => {
  /**
   * @swagger
   * /payor/vouchers:
   *   get:
   *     summary: Get all vouchers created by the authenticated payor
   *     tags: [Payor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of vouchers created by the user
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   code:
   *                     type: string
   *                   recipientPhone:
   *                     type: string
   *                   amount:
   *                     type: number
   *                   isRedeemed:
   *                     type: boolean
   *                   redeemedAt:
   *                     type: string
   *                     format: date-time
   *       401:
   *         description: Unauthorized
   */

  const phone = req.user.phone;
  console.log("📞 Authenticated payor phone:", phone);

  const vouchers = await Voucher.find({ createdBy: phone });
  console.log("🧾 Found vouchers:", vouchers.length);

  res.json(vouchers);
});

module.exports = router;
