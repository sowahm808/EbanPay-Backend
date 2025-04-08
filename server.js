require('dotenv').config();
require('./cron/reminderJob');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const isAdmin = require('./middleware/isAdmin');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// CORS Setup
app.use(cors({
  origin: ['https://ebanpay.netlify.app', 'http://localhost:4200'],
  credentials: true
}));

// Swagger Documentation (apply isAdmin only to /api-docs if needed)
app.use('/api-docs', isAdmin, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/ussd', require('./routes/ussd'));
app.use('/payor', require('./routes/payor'));
app.use('/users', require('./routes/users'));
app.use('/points', require('./routes/points'));
app.use('/redemptions', require('./routes/redemptions'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/cashout', require('./routes/cashout'));
app.use('/momo-callback', require('./routes/momoCallback'));
app.use('/export', require('./routes/export'));
app.use('/notifications', require('./routes/notifications'));
app.use('/voucherReminder', require('./routes/voucherReminder'));
app.use('/momo', require('./routes/momo'));
app.use('/callback', require('./routes/hubtelCallback'));
app.use('/api', require('./routes/voucher')); // API routes (e.g. /api/voucher/redeem)

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB connection error:', err));

// Log connection errors
mongoose.connection.on('error', err => {
  console.error('❌ Mongoose runtime error:', err);
});

// Server Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 EbanPay backend running on port ${PORT}`);
});
