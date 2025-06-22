const { Redis } = require("ioredis");

const redisConnection = {
  host: "127.0.0.1",
  port: 6379,
};

const redis = new Redis(redisConnection);

module.exports = { redis, redisConnection };
