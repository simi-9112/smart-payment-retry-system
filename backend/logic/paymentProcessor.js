const { v4: uuidv4 } = require("uuid");
const Transaction = require("../models/transaction");

const MAX_RETRIES = 3;
const BASE_DELAY = 100; // milliseconds
const MAX_DELAY = 5000;

// Utility: Waits for `ms` milliseconds
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Utility: Calculates exponential backoff with jitter
function getExponentialBackoffDelay(base, retryCount, max) {
  const exp = Math.pow(2, retryCount) * base;
  const jitter = Math.random() * exp;
  return Math.min(jitter, max);
}

// Simulated 50% chance payment success
const simulatePaymentAPI = async () => {
  const success = Math.random() > 0.5;
  if (!success) throw new Error("Simulated API failure");
  return { status: "success", txnRef: uuidv4() };
};

exports.processPaymentLogic = async ({ userId, amount, idempotencyKey, webhookUrl }) => {
  let txn = await Transaction.findOne({ idempotencyKey });

  if (txn && txn.status === "completed") {
    return { reused: true, txn };
  }

  // Create txn with webhookUrl (only if it's a new one)
  txn = txn || await Transaction.create({ userId, amount, idempotencyKey, webhookUrl });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const delay = getExponentialBackoffDelay(BASE_DELAY, attempt, MAX_DELAY);

    try {
      txn.status = "processing";
      await txn.save();

      await wait(delay);

      const result = await simulatePaymentAPI();

      txn.status = "completed";
      txn.retryCount = attempt;
      txn.lastError = null;
      txn.retryLogs.push({
        attempt,
        timestamp: new Date(),
        delayMs: delay,
        success: true,
        errorMessage: null,
      });

      await txn.save();
      return { reused: false, txn, result };
    } catch (err) {
      txn.status = attempt === MAX_RETRIES ? "failed" : "processing";
      txn.retryCount = attempt;
      txn.lastError = err.message;

      txn.retryLogs.push({
        attempt,
        timestamp: new Date(),
        delayMs: delay,
        success: false,
        errorMessage: err.message,
      });

      await txn.save();

      if (attempt === MAX_RETRIES) {
        throw new Error("Payment failed after retries");
      }

      await wait(delay);
    }
  }
};
