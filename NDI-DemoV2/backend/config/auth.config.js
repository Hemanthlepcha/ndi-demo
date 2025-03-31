import dotenv from "dotenv";
dotenv.config();
console.log("Process", process.env.CLIENT_ID);
export const authConfig = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  AUTH_URL: "https://staging.bhutanndi.com/authentication/v1/authenticate",
  NDI_VERIFIER_URL:
    "https://demo-client.bhutanndi.com/verifier/v1/proof-request",
  NDI_BASE_URL: "https://demo-client.bhutanndi.com",
};
