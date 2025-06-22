const { ExpressAdapter } = require("@bull-board/express");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const retryQueue = require("./retryQueue");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

serverAdapter.getRouter().use((req, res, next) => {
  const providedSecret = req.headers["x-admin-secret"];
  if (providedSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).send("Unauthorized");
  }
  next();
});

createBullBoard({
  queues: [new BullMQAdapter(retryQueue)],
  serverAdapter,
});

module.exports = serverAdapter.getRouter();
