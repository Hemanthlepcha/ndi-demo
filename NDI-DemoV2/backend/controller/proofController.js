import { authConfig } from "../config/auth.config.js";
import { getAccessToken } from "../services/authService.js";
import { subscribeToWebhook } from "../services/webhookSubscription.js";
import axios from "axios";
import { generateThreadId } from "../utils/threadUtils.js";
import { threadIdMapping, pendingRequests } from "../index.js";

export const createProofRequest = async (req, res) => {
  try {
    const token = await getAccessToken();
    const threadId = generateThreadId();
    console.log(`Creating proof request with threadId: ${threadId}`);

    const response = await axios.post(
      authConfig.NDI_VERIFIER_URL,
      {
        proofName: "Verify Foundational ID",
        proofAttributes: [
          {
            name: "ID Number",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
              },
            ],
          },
          {
            name: "Full Name",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
              },
            ],
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const { proofRequestThreadId, proofRequestURL } = response.data.data;
    console.log(`Received NDI threadId: ${proofRequestThreadId}`);

    // Store the thread ID mapping
    threadIdMapping.set(threadId, proofRequestThreadId);
    console.log(`Stored thread ID mapping: ${threadId} -> ${proofRequestThreadId}`);
    
    // Add to pending requests with current timestamp
    pendingRequests.set(threadId, Date.now());
    console.log(`Added to pending requests: ${threadId}`);

    // Subscribe to webhook using NDI's threadId
    try {
      await subscribeToWebhook(proofRequestThreadId);
      console.log(`Successfully subscribed to webhook for threadId: ${proofRequestThreadId}`);
    } catch (error) {
      console.error(`Failed to subscribe to webhook for threadId: ${proofRequestThreadId}`, error);
      // Don't throw here, let the request continue
    }

    // Format response for frontend
    res.status(201).json({
      data: {
        proofRequestURL,
        threadId: threadId // Use our generated threadId
      }
    });
  } catch (error) {
    console.error("Error creating proof request:", error.response?.data || error.message);
    res.status(500).json({ 
      error: error.message || "Failed to create proof request",
      details: error.response?.data || "No additional details available"
    });
  }
};
