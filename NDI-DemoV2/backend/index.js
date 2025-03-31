// server.js
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['NGROK_AUTH_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`);
    process.exit(1);
  }
}

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import proofRoutes from "./route/proof.route.js";
import { registerWebhook } from "./services/webhookRegistration.js";
import ngrok from "ngrok";
import { isValidThreadId } from "./utils/threadUtils.js";
import { User } from './models/user.model.js';

const app = express();
const PORT = 5000;

// In-memory storage for proof results and pending requests
const proofResults = new Map();
const pendingRequests = new Map();
const threadIdMapping = new Map(); // Map between our threadId and NDI's threadId
const processedWebhooks = new Map(); // Track processed webhook notifications

// Middleware
app.use(
  cors({
    origin: "*",
  }),
);
app.use(bodyParser.json());

// Routes
app.use("/api", proofRoutes);

// New endpoint to get proof results
app.get("/api/proof-results/:threadId", (req, res) => {
  const { threadId } = req.params;
  
  if (!isValidThreadId(threadId)) {
    return res.status(400).json({ 
      status: "error",
      error: "Invalid thread ID format" 
    });
  }

  console.log(`\n==== Checking proof results for threadId: ${threadId} ====`);
  console.log('Current pending requests:', Array.from(pendingRequests.keys()));
  console.log('Current thread mappings:', Array.from(threadIdMapping.entries()));
  console.log('Current proof results:', Array.from(proofResults.keys()));

  const result = proofResults.get(threadId);
  
  if (!result) {
    // Check if this is a pending request
    const isPending = pendingRequests.has(threadId);
    if (!isPending) {
      console.log(`No pending request found for threadId: ${threadId}`);
      return res.status(404).json({ 
        status: "error",
        error: "Proof result not found" 
      });
    }
    // If it's pending, return a 202 status
    console.log(`Request is pending for threadId: ${threadId}`);
    return res.status(202).json({ 
      status: "pending",
      message: "Proof verification in progress",
      threadId: threadId
    });
  }
  
  console.log(`Found result for threadId: ${threadId}`);
  console.log('Result:', result);

  // Return a consistent response structure
  return res.json({
    status: "success",
    message: result.isExistingUser ? "User already exists" : "Registration successful",
    threadId: threadId,
    verification_result: result.verification_result,
    userData: result.userData,
    isExistingUser: result.isExistingUser,
    timestamp: result.timestamp
  });
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Check if body exists and is not empty
    if (!body || Object.keys(body).length === 0) {
      console.log("Empty request body received");
      return res.status(400).json({ error: "Empty request body" });
    }

    // Handle presentation results
    if (body.type === "present-proof/presentation-result") {
      // Check if we've already processed this webhook
      if (processedWebhooks.has(body.thid)) {
        console.log(`\nSkipping duplicate webhook for thread ID: ${body.thid}`);
        return res.status(200).json({ 
          status: "success",
          message: "Webhook already processed"
        });
      }

      console.log("\n==== PROOF PRESENTATION RECEIVED ====");
      console.log(`Verification Result: ${body.verification_result}`);
      console.log(`Relationship DID: ${body.relationship_did}`);
      console.log(`Thread ID: ${body.thid}`);
      console.log(`Holder DID: ${body.holder_did}`);

      // Extract and display revealed attributes
      if (body.requested_presentation && body.requested_presentation.revealed_attrs) {
        console.log("\n==== REVEALED ATTRIBUTES ====");
        const revealedAttrs = body.requested_presentation.revealed_attrs;

        // Parse revealed attributes
        const userName = revealedAttrs["Full Name"]?.[0]?.value;
        const idNumber = revealedAttrs["ID Number"]?.[0]?.value;

        console.log(`Full Name: ${userName}`);
        console.log(`ID Number: ${idNumber}`);

        if (!userName || !idNumber) {
          return res.status(400).json({ error: "Name or ID not found in revealed attributes" });
        }

        // Find our threadId from the mapping
        let ourThreadId = null;
        for (const [key, value] of threadIdMapping.entries()) {
          if (value === body.thid) {
            ourThreadId = key;
            break;
          }
        }

        if (!ourThreadId) {
          console.error("No matching thread ID found for:", body.thid);
          return res.status(500).json({ error: "Thread ID mapping not found" });
        }

        try {
          // Check if user exists
          const existingUser = await User.findByID(idNumber);
          const userData = { Name: userName, ID: idNumber };

          // Mark this webhook as processed
          processedWebhooks.set(body.thid, {
            timestamp: new Date().toISOString(),
            isExistingUser: !!existingUser
          });

          if (existingUser) {
            console.log(`User with ID ${idNumber} already exists`);

            // Store the proof result in memory
            const proofResult = {
              status: "success",
              verification_result: body.verification_result,
              userData: userData,
              timestamp: new Date().toISOString(),
              isExistingUser: true
            };
            
            proofResults.set(ourThreadId, proofResult);
            pendingRequests.delete(ourThreadId);

            return res.status(200).json({ 
              status: "success",
              message: "User already exists",
              threadId: ourThreadId,
              proofResult: proofResult
            });
          }

          // Create new user
          await User.create(userData);
          console.log(`Created new user with ID: ${idNumber}`);

          // Store the proof result in memory
          const proofResult = {
            status: "success",
            verification_result: body.verification_result,
            userData: userData,
            timestamp: new Date().toISOString(),
            isExistingUser: false
          };
          
          proofResults.set(ourThreadId, proofResult);
          pendingRequests.delete(ourThreadId);

          return res.status(201).json({ 
            status: "success",
            message: "Registration successful",
            threadId: ourThreadId,
            proofResult: proofResult
          });
        } catch (error) {
          console.error("Error processing user:", error);
          return res.status(500).json({ error: "Failed to process user" });
        }
      }
    } else {
      // For other message types
      console.log(`Received webhook message of type: ${body.type || "unknown"}`);
      return res.status(200).json({ message: "Webhook processed successfully" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Clean up old data periodically (every hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 3600000;

  // Clean up pending requests
  for (const [threadId, timestamp] of pendingRequests.entries()) {
    if (now - timestamp > oneHour) {
      pendingRequests.delete(threadId);
    }
  }

  // Clean up processed webhooks
  for (const [threadId, data] of processedWebhooks.entries()) {
    if (now - new Date(data.timestamp).getTime() > oneHour) {
      processedWebhooks.delete(threadId);
    }
  }
}, 3600000); // Run every hour

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    // Step 1: Start ngrok and get the public URL
    await ngrok.disconnect();
    await ngrok.kill();
    const ngrokUrlGlobal = await ngrok.connect({
      authtoken: process.env.NGROK_AUTH_TOKEN,
      addr: PORT,
    });
    console.log(`ngrok tunnel established: ${ngrokUrlGlobal}`);
    
    await registerWebhook(ngrokUrlGlobal);
    console.log("Webhook registered successfully.");
  } catch (err) {
    console.error("Failed to register webhook:", err);
    // Don't exit here, let the server continue running
    // The webhook registration can be retried later
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Kill ngrok tunnel
    await ngrok.kill();
    console.log('Ngrok tunnel closed');
    
    // Close server
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Export the maps for use in other files
export { threadIdMapping, pendingRequests };
