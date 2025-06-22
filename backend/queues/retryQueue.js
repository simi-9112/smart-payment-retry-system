const { Queue } = require("bullmq");
const { redisConnection } = require("./redisConfig");

const retryQueue = new Queue("retryQueue", {
  connection: redisConnection,
});

module.exports = retryQueue;
