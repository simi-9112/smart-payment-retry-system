const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: String,
    amount: Number,
    idempotencyKey: String,
    webhookUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["initiated", "processing", "completed", "failed"],
      default: "initiated",
    },
    retryCount: { type: Number, default: 0 },
    lastError: String,

    // Retry logs to track each attempt
    retryLogs: [
      {
        attempt: Number,
        timestamp: Date,
        delayMs: Number,
        success: Boolean,
        errorMessage: String,
      },
    ],
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
