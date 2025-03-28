
---

## 🔧 Backend: `ebanpay-backend/README.md`

```markdown
# EbanPay Backend

The backend for EbanPay – a Node.js API that handles user auth, voucher creation, redemption, point tracking, and tax deductions.

## 📦 Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- CORS enabled for frontend
- RESTful API structure

## 🔧 Setup

```bash
# Clone repo
git clone https://github.com/your-username/EbanPay-Backend.git
cd EbanPay-Backend

# Install dependencies
npm install

# Create a `.env` file
touch .env

#Add this to .env....
PORT=3000
MONGO_URI=mongodb://localhost:27017/ebanpay
JWT_SECRET=your_super_secret

#Run:
node server.js
# OR for auto reload
npx nodemon server.js


routes/
  auth.js
  payor.js
  users.js
  points.js
  redemptions.js
  ussd.js
  admin.js

models/
  User.js
  Voucher.js
  Redemption.js
  Point.js

middleware/
  authMiddleware.js

utils/
  momoSim.js (optional)


🔐 API Endpoints
Auth
POST /auth/signup

POST /auth/login

Payor
POST /payor/create-voucher

Recipient
POST /redemptions/redeem

Points
GET /points/check?phone=me

Admin
GET /admin/summary

✅ Features
Secure JWT auth

Points tracking

Voucher issuance & redemption

Tax deduction on MoMo cash-out

Admin summary endpoints

🛡️ Security
All protected routes use JWT in Authorization header

Input validation and error handling included

