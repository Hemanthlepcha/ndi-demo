import axios from "axios";
import { authConfig } from "../config/auth.config.js";

let accessToken = null;

export const getAccessToken = async () => {
  if (accessToken) return accessToken;

  try {
    const response = await axios.post(authConfig.AUTH_URL, {
      client_id: authConfig.CLIENT_ID,
      client_secret: authConfig.CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    throw new Error("Authentication failed");
  }
};
