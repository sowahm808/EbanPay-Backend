const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Payout = require("../models/Payout");
const authMiddleware = require('../middleware/auth');

// 🟢 Admin-only route: Voucher + Tax Summary from Voucher model
router.get('/summary', authMiddleware, async (req, res) => {
  /**
 * @swagger
 * /admin/summary:
 *   get:
 *     summary: Get admin summary of vouchers and tax
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVouchers:
 *                   type: number
 *                   example: 120
 *                 redeemedCount:
 *                   type: number
 *                   example: 100
 *                 totalTax:
 *                   type: number
 *                   example: 350
 *       403:
 *         description: Forbidden (not an admin)
 *       500:
 *         description: Internal server error
 */

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalVouchers = await Voucher.countDocuments();
    const redeemedCount = await Voucher.countDocuments({ isRedeemed: true });

    const totalTaxResult = await Voucher.aggregate([
      { $match: { isRedeemed: true } },
      { $group: { _id: null, total: { $sum: "$taxCharged" } } }
    ]);

    res.json({
      totalVouchers,
      redeemedCount,
      totalTax: totalTaxResult[0]?.total || 0
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🟢 Optional Extra Route: Tax from Payouts table (if separate)
router.get("/tax-summary", authMiddleware, async (req, res) => {
  /**
 * @swagger
 * /admin/tax-summary:
 *   get:
 *     summary: Get total tax and amount paid from payout records
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tax and payout summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVouchers:
 *                   type: number
 *                   example: 45
 *                 totalPaid:
 *                   type: number
 *                   example: 1200
 *                 totalTax:
 *                   type: number
 *                   example: 150
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const payouts = await Payout.find({});
    const totalTax = payouts.reduce((sum, p) => sum + (p.tax || 0), 0);
    const totalPaid = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      totalVouchers: payouts.length,
      totalPaid,
      totalTax
    });
  } catch (err) {
    console.error("Tax Summary Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
