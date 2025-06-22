const Transaction = require("../models/transaction");
const { simulatePaymentAPI } = require("../utils/paymentUtils");

exports.getAllTransactions = async (req, res) => {
  const txns = await Transaction.find().sort({ createdAt: -1 });
  res.json(txns);
};

exports.manualRetry = async (req, res) => {
  const { id } = req.params;

  const txn = await Transaction.findById(id);
  if (!txn) return res.status(404).json({ message: "Transaction not found" });

  if (txn.status === "completed") {
    return res.status(200).json({ message: "Transaction already completed", txn });
  }

  try {
    txn.status = "processing";
    await txn.save();

    const result = await simulatePaymentAPI();

    txn.status = "completed";
    txn.retryCount += 1;
    txn.lastError = null;
    await txn.save();

    return res.status(200).json({ message: "✅ Manual retry successful", result, txn });
  } catch (err) {
    txn.retryCount += 1;
    txn.status = "failed";
    txn.lastError = err.message;
    await txn.save();

    return res.status(500).json({ message: "❌ Manual retry failed", error: err.message, txn });
  }

};

exports.getMetrics = async (req, res) => {
  try {
    const total = await Transaction.countDocuments();
    const successCount = await Transaction.countDocuments({ status: "completed" });
    const failedCount = await Transaction.countDocuments({ status: "failed" });

    const retryStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          avgRetries: { $avg: "$retryCount" }
        }
      }
    ]);

    const avgRetries = retryStats[0]?.avgRetries?.toFixed(2) || "0";

    res.json({
      total,
      successCount,
      failedCount,
      avgRetries
    });
  } catch (err) {
    console.error("❌ Error fetching metrics:", err.message);
    res.status(500).json({ error: "Failed to retrieve metrics" });
  }
};
