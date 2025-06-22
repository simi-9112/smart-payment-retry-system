# 💳 Smart Payment Retry System

A robust Node.js-based backend that wraps around any payment gateway (like Stripe or Razorpay) and ensures **fault-tolerant**, **idempotent**, and **monitored** payment retries using BullMQ, Express, and MongoDB.

---

## 🔧 Features

- ✅ **Idempotent Processing** — Avoid double-charging on retries using a unique key.
- 🔁 **Automatic Retry Logic** — Exponential backoff + jitter with a retry limit.
- 🧠 **Manual Retry Support** — Admins can manually trigger retries for failed transactions.
- 🧵 **Background Job Queue** — Retries are offloaded using BullMQ and Redis.
- 📬 **Webhook Support** — Success or failure of a transaction triggers optional webhook callbacks.
- 📊 **Admin Dashboard** — View transactions, retry logs, and metrics.
- 🔐 **JWT Admin Auth** — Secure admin access to routes and dashboards.
- 🎛️ **Bull Board UI** — Visual dashboard to monitor background retry jobs.

---

## 📁 Tech Stack

- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Queue**: BullMQ + Redis
- **Frontend**: React + Tailwind (Admin Panel)
- **Monitoring**: Bull Board
- **Security**: JWT for Admin Auth

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-payment-retry-system.git
cd smart-payment-retry-system
