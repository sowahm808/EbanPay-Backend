require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB...");

    const users = [
      {
        fullName: "Ama Mensah",
        phone: "+233244123456",
        role: "payor",
        points: 0,
        password: "123456" // <-- Default password
      },
      {
        fullName: "Kwame Kofi",
        phone: "+233200123456",
        role: "recipient",
        points: 0,
        password: "123456" // <-- Default password
      },
      {
        fullName: "Admin User",
        phone: "+233244000000",
        role: "admin",
        points: 0,
        password: "123456" // <-- Default password for admin
      }
    ];

    await User.deleteMany({});
    await User.insertMany(users);
    console.log("✅ Users seeded successfully.");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Error connecting to DB", err);
  });
