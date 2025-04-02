require("dotenv").config();
require('./cron/reminderJob'); 

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 
const isAdmin = require('./middleware/isAdmin');


const ussdRoutes = require("./routes/ussd");
const payorRoutes = require("./routes/payor");
const userRoutes = require("./routes/users");
const pointsRoutes = require("./routes/points");
const redemptionRoutes = require("./routes/redemptions");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const cashoutRoutes = require("./routes/cashout");
const momoCallbackRoutes = require("./routes/momoCallback");
const exportRoutes = require("./routes/export");
const notificationRoutes = require('./routes/notifications');
const remindersRoute = require('./routes/reminders'); 





const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


app.use("/ussd", ussdRoutes);
app.use("/payor", payorRoutes);
app.use("/users", userRoutes);
app.use("/points", pointsRoutes);
app.use("/redemptions", redemptionRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/cashout", cashoutRoutes);

app.use("/momo-callback", momoCallbackRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
app.use('/api-docs', isAdmin, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/export", exportRoutes);
app.use('/notifications', notificationRoutes);
app.use('/reminders', remindersRoute);



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB connection error", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EbanPay backend running on port ${PORT}`);
});
