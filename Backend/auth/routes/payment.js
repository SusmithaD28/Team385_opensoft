const { Router } = require("express");
const router = Router();
const paypal = require("@paypal/checkout-server-sdk");
const axios = require('axios');
const clientId =
  "AUoQ_vz_gwA2-cqyyQD2CHvGILhFIzFKMzRReOyi4C9h5J58ZhqcsgsaqFKvuLwlGGHgqCIQ7kqj2ScO";
const clientSecret =
  "EE_ZaJukMUuPlxL8k4J08oPkLH8F_QmJeCxc-sAAxbdt6ZkllWnmIPDfy23rh16GpvdC0xLLqY3DxPRj";
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

const sendSubscriptionRequest = async (subscription, token) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/user/subscription",
      {subscription}, 
      {
        headers: {
          Authorization: token,
        },
      }
    );
    console.log(response.data);
    return response.data; // Returning response data
  } catch (error) {
    throw error; // Rethrowing error for further handling
  }
};


// Route to handle PayPal transactions
router.post("/paypal/checkout", async (req, res) => {
  const { amount } = req.body;
  const token = req.headers.authorization;
  // Create PayPal order
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD", // Change to your currency code
          value: amount,
        },
      },
    ],
  });
  try {
    const response = await client.execute(request);
    const orderId = response.result.id;
    // You may want to save the orderId in your database for future reference
    res.json({ orderId });
    const subscriptionPlans = {
      299: "tier1",
      699: "tier2",
      999: "tier3",
    };
    const subscription = subscriptionPlans[amount];
    await sendSubscriptionRequest(subscription, token);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong with PayPal checkout" });
  }
});

module.exports = router