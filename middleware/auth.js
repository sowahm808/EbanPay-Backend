const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "eban_secret";

async function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id); // assuming you store { id: user._id } in the token
    console.log("Authorization header:", req.headers.authorization);
console.log("Decoded user ID:", decoded.id);
console.log("Fetched user:", user);

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // ✅ Attach full user object
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(403).json({ error: "Token invalid" });
  }
}

module.exports = auth;
