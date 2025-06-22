const Redis = require("ioredis");

let redis;

if (process.env.REDIS_URL) {
  // Use remote Redis (e.g. from Upstash or Render env var)
  redis = new Redis(process.env.REDIS_URL);
} else {
  // Default to local Redis (for local development)
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });
}

module.exports = { redis };
