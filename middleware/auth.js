const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "eban_secret";

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token invalid" });
  }
}

module.exports = auth;
