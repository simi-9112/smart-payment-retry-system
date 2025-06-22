const { processPaymentLogic } = require("../logic/paymentProcessor");
const retryQueue = require("../queues/retryQueue");
const Transaction = require("../models/transaction");
const axios = require("axios");

// Utility to send webhook
const sendWebhookNotification = async (txn) => {
  if (!txn.webhookUrl) return;

  try {
    await axios.post(txn.webhookUrl, {
      transactionId: txn._id,
      userId: txn.userId,
      amount: txn.amount,
      retryCount: txn.retryCount,
      lastError: txn.lastError,
      finalStatus: txn.status,
      createdAt: txn.createdAt,
    });

    console.log("✅ Webhook sent successfully");
  } catch (err) {
    console.error("❌ Failed to send webhook:", err.message);
    // Optional: store this webhook delivery failure in DB
  }
};

exports.processPayment = async (req, res) => {
  const { userId, amount, idempotencyKey, webhookUrl } = req.body;

  try {
    const { reused, txn, result } = await processPaymentLogic({
      userId,
      amount,
      idempotencyKey,
      webhookUrl,
    });

    if (!reused) await sendWebhookNotification(txn);

    const message = reused ? "Already processed" : "✅ Payment successful";
    return res.status(200).json({ message, txn, result });
  } catch (err) {
    const txn = await Transaction.findOne({ idempotencyKey });

    if (txn) {
      await retryQueue.add(
        "retryPayment",
        { txnId: txn._id.toString() },
        { delay: 10_000 }
      );

      await sendWebhookNotification(txn); // notify even on failure
    }

    return res.status(500).json({
      message: "❌ Payment failed after retries, added to background queue",
      error: err.message,
      txn,
    });
  }
};
