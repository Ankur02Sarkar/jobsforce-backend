import express from "express";
import {
    getTwitterJobById,
    getTwitterJobs,
} from "../controllers/twitterJobsController.js";

const router = express.Router();

/**
 * @route   POST /api/xjobs
 * @desc    Fetch Twitter jobs based on search criteria
 * @access  Public
 */
router.post("/", getTwitterJobs);

/**
 * @route   POST /api/xjobs/details
 * @desc    Fetch Twitter job details by job ID
 * @access  Public
 */
router.post("/details", getTwitterJobById);

export default router;