import express from "express";
import {
  createInterview,
  deleteInterview,
  getInterviewById,
  getInterviews,
  updateInterview,
} from "../controllers/interviewController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected with authentication
// router.use(authenticate);

/**
 * @route   GET /api/interviews
 * @desc    Get all interviews for the current user
 * @access  Private
 */
router.get("/", authenticate as any, getInterviews);

/**
 * @route   POST /api/interviews
 * @desc    Create a new interview
 * @access  Private
 */
router.post("/", authenticate as any, createInterview);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get details for a specific interview
 * @access  Private
 */
router.get("/:id", authenticate as any, getInterviewById);

/**
 * @route   PUT /api/interviews/:id
 * @desc    Update interview data
 * @access  Private
 */
router.put("/:id", authenticate as any, updateInterview);

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete an interview
 * @access  Private
 */
router.delete("/:id", authenticate as any, deleteInterview);

export default router;
