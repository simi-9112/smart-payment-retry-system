require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const adminAuth = require("./middleware/adminAuth");
const bullBoardRouter = require("./queues/bullBoard");

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/admin/queues", adminAuth, bullBoardRouter);
app.use("/api/admin", adminAuth, require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// DB + Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
