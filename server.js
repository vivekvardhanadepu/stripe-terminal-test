const express = require("express");
const app = express();
const { resolve } = require("path");
// This is a sample test API key. Sign in to see examples pre-filled with your key.
const stripe = require("stripe")("sk_test_Hrs6SAopgFPF0bZXSN3f6ELN");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createLocation = async () => {
  const location = await stripe.terminal.locations.create({
    display_name: "HQ",
    address: {
      line1: "448A Crownhill Rd",
      city: "Plymouth",
      country: "GB",
      postal_code: "PL5 2QT",
    },
  });

  return location;
};

// The ConnectionToken's secret lets you connect to any Stripe Terminal reader
// and take payments with your Stripe account.
// Be sure to authenticate the endpoint for creating connection tokens.
app.post("/connection_token", async (req, res) => {
  let connectionToken = await stripe.terminal.connectionTokens.create();
  console.log(connectionToken);
  res.json({ secret: connectionToken.secret });
});
undefined;
app.post("/capture_payment_intent", async (req, res) => {
  const intent = await stripe.paymentIntents.capture(req.body.id);
  res.send(intent);
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
