const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  manualRetry,
  getMetrics,
} = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

router.use(adminAuth);

// 📦 GET: List all transactions
router.get("/transactions", getAllTransactions);

// 🔁 POST: Manually retry a failed transaction by ID
router.post("/transactions/:id/manual-retry", manualRetry);

// 📊 GET: Basic system metrics (optional but useful for UI)
router.get("/metrics", getMetrics);

router.post("/transactions/:id/manual-retry", manualRetry);


module.exports = router;
