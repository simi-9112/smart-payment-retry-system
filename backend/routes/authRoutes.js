const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;

router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

module.exports = router;
