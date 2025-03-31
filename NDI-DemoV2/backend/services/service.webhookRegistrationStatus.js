import fs from "fs";
import path from "path";

const WEBHOOK_STATUS_FILE = path.resolve("./webhook-status.json");

// Function to save webhook registration status
export const saveWebhookStatus = (status) => {
  fs.writeFileSync(
    WEBHOOK_STATUS_FILE,
    JSON.stringify({ webhookRegistered: status }),
  );
};

// Function to load webhook registration status
export const loadWebhookStatus = () => {
  if (fs.existsSync(WEBHOOK_STATUS_FILE)) {
    const data = JSON.parse(fs.readFileSync(WEBHOOK_STATUS_FILE, "utf-8"));
    return data.webhookRegistered || false;
  }
  return false; // Default to false if the file doesn't exist
};
