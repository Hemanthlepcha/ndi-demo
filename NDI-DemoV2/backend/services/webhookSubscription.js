import axios from "axios";
import { getAccessToken } from "./authService.js";
import { authConfig } from "../config/auth.config.js";
import dotenv from "dotenv";
dotenv.config();

export const subscribeToWebhook = async (threadId) => {
  try {
    const token = await getAccessToken();
    console.log(`Subscribing to webhook for threadId: ${threadId}`);

    const response = await axios.post(
      `${authConfig.NDI_BASE_URL}/webhook/v1/subscribe`,
      {
        webhookId: process.env.WEBHOOK_ID,
        threadId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // 202 status is actually a success for webhook subscription
    if (response.status === 202 || (response.data && response.data.success)) {
      console.log("Webhook subscription successful:", response.data);
      return response.data;
    }

    throw new Error(`Webhook subscription failed: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error("Webhook subscription failed:", error.response?.data || error.message);
    throw error;
  }
};
