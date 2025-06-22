const { Worker } = require("bullmq");
const { redisConnection } = require("../queues/redisConfig");
const Transaction = require("../models/transaction");
const { v4: uuidv4 } = require("uuid");

const MAX_RETRIES = 3;

const simulatePaymentAPI = async () => {
  const success = Math.random() > 0.5;
  if (!success) throw new Error("Simulated API failure");
  return { status: "success", txnRef: uuidv4() };
};

const worker = new Worker(
  "retryQueue",
  async job => {
    const { txnId } = job.data;
    const txn = await Transaction.findById(txnId);
    if (!txn || txn.status === "completed" || txn.retryCount >= MAX_RETRIES) return;

    try {
      txn.status = "processing";
      await txn.save();

      const result = await simulatePaymentAPI();

      txn.status = "completed";
      txn.retryCount += 1;
      await txn.save();

      console.log("✅ Background retry successful:", txn._id);
    } catch (err) {
      txn.retryCount += 1;
      txn.lastError = err.message;

      if (txn.retryCount >= MAX_RETRIES) {
        txn.status = "failed";
      }

      await txn.save();
      throw err;
    }
  },
  { connection: redisConnection }
);

// Optional logs
worker.on("completed", job => {
  console.log(`🎉 Job ${job.id} completed`);
});
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});
