import express from "express";
import {
  analyzeSolution,
  complexityAnalysis,
  generateTestCases,
  optimizeSolution,
} from "../controllers/aiController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// AI analysis routes
/**
 * @route   POST /api/ai/analyze-solution
 * @desc    Analyze algorithmic approach and implementation
 * @access  Private
 */
router.post("/analyze-solution", authenticate as any, analyzeSolution);

/**
 * @route   POST /api/ai/complexity-analysis
 * @desc    Calculate time and space complexity of solution
 * @access  Private
 */
router.post("/complexity-analysis", authenticate as any, complexityAnalysis);

/**
 * @route   POST /api/ai/optimize-solution
 * @desc    Get optimized version of solution
 * @access  Private
 */
router.post("/optimize-solution", authenticate as any, optimizeSolution);

/**
 * @route   POST /api/ai/generate-test-cases
 * @desc    Generate challenging test cases for a problem
 * @access  Private
 */
router.post("/generate-test-cases", authenticate as any, generateTestCases);

export default router;
