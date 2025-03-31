import express from "express";
import { createProofRequest } from "../controller/proofController.js";

const router = express.Router();

router.post("/proof-request", createProofRequest);

export default router;
