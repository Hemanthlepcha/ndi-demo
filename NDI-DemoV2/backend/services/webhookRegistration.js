// services/webhookService.js
import axios from "axios";
import { getAccessToken } from "./authService.js";
import { authConfig } from "../config/auth.config.js";
import dotenv from "dotenv";
dotenv.config();

export const registerWebhook = async (ngrokUrl) => {
  console.log("ngrokUrl", ngrokUrl);
  try {
    const token = await getAccessToken();
    console.log("token", token);

    const response = await axios.post(
      `${authConfig.NDI_BASE_URL}/webhook/v1/register`,
      {
        webhookId: process.env.WEBHOOK_ID,
        webhookURL: `${ngrokUrl}/webhook`,
        authentication: {
          type: "OAuth2",
          version: "v2",
          data: {
            token: process.env.WEBHOOK_AUTH_TOKEN,
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("Webhook registered successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Webhook registration failed:", error);
    throw error;
  }
};
