import fs from "fs";
import path from "path";

export const NGROK_URL_FILE = path.resolve("./ngrok-url.txt");

// Save Ngrok URL to a file
export const saveNgrokUrl = (url) => {
  fs.writeFileSync(NGROK_URL_FILE, url);
};

// Load Ngrok URL from a file
export const loadNgrokUrl = () => {
  if (fs.existsSync(NGROK_URL_FILE)) {
    return fs.readFileSync(NGROK_URL_FILE, "utf-8").trim();
  }
  return null;
};
