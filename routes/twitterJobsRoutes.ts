import express from "express";
import {
  getTwitterJobById,
  getTwitterJobs,
} from "../controllers/twitterJobsController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as any);

/**
 * @route   POST /api/xjobs
 * @desc    Fetch Twitter jobs based on search criteria
 * @access  Private
 */
router.post("/", getTwitterJobs);

/**
 * @route   POST /api/xjobs/details
 * @desc    Fetch Twitter job details by job ID
 * @access  Private
 */
router.post("/details", getTwitterJobById);

export default router;
