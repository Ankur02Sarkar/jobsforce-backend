import express from "express";
import {
  getCodeResult,
  submitCode,
} from "../controllers/codeCompilerController.js";

const router = express.Router();

// Submit code for compilation and execution
router.post("/submit", submitCode);

// Get code execution results
router.get("/result/:submissionId", getCodeResult);

export default router;
