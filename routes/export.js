// routes/export.js
const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const requireAuth = require('../middleware/requireAuth'); // or your auth middleware
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// Endpoint to export vouchers as CSV
router.get('/vouchers/csv', requireAuth, async (req, res) => {
  try {
    // Get vouchers for the authenticated payor (adjust query as needed)
    const vouchers = await Voucher.find({ createdBy: req.user.phone }).lean();

    // Define the fields you want to export
    const fields = ['code', 'recipientPhone', 'amount', 'isRedeemed', 'taxCharged', 'redeemedAt', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(vouchers);

    res.setHeader('Content-disposition', 'attachment; filename=vouchers.csv');
    res.set('Content-Type', 'text/csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ error: 'Error exporting CSV' });
  }
});

// Endpoint to export vouchers as PDF
router.get('/vouchers/pdf', requireAuth, async (req, res) => {
  try {
    const vouchers = await Voucher.find({ createdBy: req.user.phone }).lean();

    // Create a new PDF document
    const doc = new PDFDocument();
    // Set headers to indicate a PDF file attachment
    res.setHeader('Content-disposition', 'attachment; filename=vouchers.pdf');
    res.setHeader('Content-type', 'application/pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add a title
    doc.fontSize(18).text('Vouchers Export', { align: 'center' });
    doc.moveDown();

    // Add a table header (basic formatting)
    doc.fontSize(12).text('Code', { continued: true, width: 100 });
    doc.text('Recipient', { continued: true, width: 120 });
    doc.text('Amount', { continued: true, width: 60 });
    doc.text('Status', { continued: true, width: 60 });
    doc.text('Redeemed At', { width: 100 });
    doc.moveDown();

    // Add each voucher row
    vouchers.forEach(v => {
      const status = v.isRedeemed ? 'Redeemed' : 'Pending';
      const redeemedAt = v.redeemedAt ? new Date(v.redeemedAt).toLocaleString() : '';
      doc.text(v.code, { continued: true, width: 100 });
      doc.text(v.recipientPhone, { continued: true, width: 120 });
      doc.text(v.amount.toString(), { continued: true, width: 60 });
      doc.text(status, { continued: true, width: 60 });
      doc.text(redeemedAt, { width: 100 });
    });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return res.status(500).json({ error: 'Error exporting PDF' });
  }
});

module.exports = router;
