import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { AuthRequest } from "../middlewares/auth.js";
import Interview, {
  type IInterview,
  type IQuestion,
} from "../models/Interview.js";
import {
  ApiError,
  ValidationError,
  asyncHandler,
} from "../utils/errorHandler.js";

/**
 * Validate interview input data
 */
const validateInterviewInput = (
  title: string,
  date: string,
  duration?: number,
) => {
  const errors: Record<string, string> = {};

  if (!title || title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters long";
  }

  if (!date) {
    errors.date = "Interview date is required";
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.date = "Invalid date format";
    }
  }

  if (duration !== undefined && (isNaN(duration) || duration < 1)) {
    errors.duration = "Duration must be a positive number";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }
};

/**
 * @desc    Get all interviews for the current user
 * @route   GET /api/interviews
 * @access  Private
 */
export const getInterviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const interviews = await Interview.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  },
);

/**
 * @desc    Create a new interview
 * @route   POST /api/interviews
 * @access  Private
 */
export const createInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, date, status, duration, questions, feedback } = req.body;

    // Validate input
    validateInterviewInput(title, date, duration);

    // Create interview
    const interview = await Interview.create({
      userId: req.user._id,
      title,
      date,
      status: status || "scheduled",
      duration: duration || 60,
      questions: questions || [],
      feedback: feedback || "",
    });

    res.status(201).json({
      success: true,
      data: interview,
    });
  },
);

/**
 * @desc    Get details for a specific interview
 * @route   GET /api/interviews/:id
 * @access  Private
 */
export const getInterviewById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid interview ID: ${id}`, 400);
    }

    const interview = await Interview.findById(id);

    // Check if interview exists
    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    // Check if user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ApiError("Not authorized to access this interview", 403);
    }

    res.json({
      success: true,
      data: interview,
    });
  },
);

/**
 * @desc    Update interview data
 * @route   PUT /api/interviews/:id
 * @access  Private
 */
export const updateInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      title,
      date,
      status,
      duration,
      questions,
      feedback,
      questionId,
      question,
      answer,
      score,
      timeTaken,
    } = req.body;

    // Validate ObjectId
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid interview ID: ${id}`, 400);
    }

    // Find interview
    const interview = await Interview.findById(id);

    // Check if interview exists
    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    // Check if user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ApiError("Not authorized to update this interview", 403);
    }

    // Validate input if title or date is being updated
    if (title || date) {
      validateInterviewInput(
        title || interview.title,
        date ? date.toString() : interview.date.toString(),
        duration,
      );
    }

    const updateData: any = {
      ...(title && { title }),
      ...(date && { date }),
      ...(status && { status }),
      ...(duration && { duration }),
      ...(feedback !== undefined && { feedback }),
    };

    // Handle updating a single question if question fields are provided
    if (questionId !== undefined) {
      const currentQuestions = [...interview.questions];
      const index = currentQuestions.findIndex(
        (q) => q.questionId === questionId,
      );

      if (index >= 0) {
        // Update existing question
        if (question !== undefined)
          currentQuestions[index]!.question = question;
        if (answer !== undefined) currentQuestions[index]!.answer = answer;
        if (score !== undefined) currentQuestions[index]!.score = score;
        if (timeTaken !== undefined)
          currentQuestions[index]!.timeTaken = timeTaken;
      } else {
        // Add new question
        currentQuestions.push({
          question: question || "Untitled Question",
          answer: answer || "",
          score: score || 0,
          questionId: questionId,
          ...(timeTaken !== undefined && { timeTaken }),
        });
      }

      updateData.questions = currentQuestions;
    } else if (questions) {
      // If replacing the entire questions array
      updateData.questions = questions;
    }

    // Update interview
    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: updatedInterview,
    });
  },
);

/**
 * @desc    Delete an interview
 * @route   DELETE /api/interviews/:id
 * @access  Private
 */
export const deleteInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid interview ID: ${id}`, 400);
    }

    // Find interview
    const interview = await Interview.findById(id);

    // Check if interview exists
    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    // Check if user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ApiError("Not authorized to delete this interview", 403);
    }

    // Delete interview
    await Interview.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Interview deleted successfully",
    });
  },
);

/**
 * @desc    Get or create an interview by job ID
 * @route   GET /api/interviews/job/:jobId
 * @access  Private
 */
export const getOrCreateInterviewByJobId = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { jobId } = req.params;

    if (!jobId) {
      throw new ApiError(`Invalid job ID`, 400);
    }

    // Try to find an existing interview that was created from this job
    let interview = await Interview.findOne({
      userId: req.user._id,
      jobId: jobId,
    });

    // If no interview exists, create one
    if (!interview) {
      interview = await Interview.create({
        userId: req.user._id,
        title: `Job Interview - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        status: "pending",
        duration: 60,
        questions: [],
        feedback: "",
        jobId: jobId,
      });
    }

    res.json({
      success: true,
      data: interview,
    });
  },
);
