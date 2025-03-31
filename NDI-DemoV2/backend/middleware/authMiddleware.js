import { getAccessToken } from "..";

export const authMiddleware = async (req, res, next) => {
  try {
    req.accessToken = await getAccessToken();
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
