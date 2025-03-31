const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define a POST route to handle incoming webhook messages
app.post("/webhook", (req, res) => {
  const eventType = req.body.type;
  const threadId = req.body.thid;

  console.log(
    `Received webhook message: ${eventType} with threadId: ${threadId}`,
  );

  // Example handling based on event type
  if (eventType === "relationship-status/accepted") {
    console.log("New relationship created or reconnected.");
  } else if (eventType === "present-proof/presentation-result") {
    console.log("Proof shared by the user.");
    console.log(`Verification result: ${req.body.verification_result}`);
    console.log(
      `Revealed attributes: ${JSON.stringify(req.body.requested_presentation.revealed_attrs)}`,
    );
  } else if (eventType === "issue-credential/accepted") {
    console.log("Credential offer accepted by the user.");
  } else {
    console.log(`Unhandled event type: ${eventType}`);
  }

  // Respond with 202 Accepted to acknowledge receipt
  res.status(202).send("Accepted");
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
