const { v4: uuidv4 } = require("uuid");

exports.simulatePaymentAPI = async () => {
const success = Math.random() > 0.5;
  if (!success) throw new Error("Simulated API failure");
  return { status: "success", txnRef: uuidv4() };
};
