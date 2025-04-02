const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP: 'smtp.yourprovider.com'
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, text, html = null) {
  const mailOptions = {
    from: `"EbanPay" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

module.exports = sendEmail;
