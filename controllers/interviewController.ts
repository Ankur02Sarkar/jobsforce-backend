import type { Request, Response } from "express";
import { Types } from "mongoose";
import Interview, { type IInterview } from "../models/Interview.js";
import { 
  ApiError, 
  ValidationError, 
  asyncHandler 
} from "../utils/errorHandler.js";
import type { AuthRequest } from "../middlewares/auth.js";

/**
 * Validate interview input data
 */
const validateInterviewInput = (
  title: string,
  date: string,
  duration?: number
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
export const getInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interviews = await Interview.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: interviews.length,
    data: interviews,
  });
});

/**
 * @desc    Create a new interview
 * @route   POST /api/interviews
 * @access  Private
 */
export const createInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

/**
 * @desc    Get details for a specific interview
 * @route   GET /api/interviews/:id
 * @access  Private
 */
export const getInterviewById = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

/**
 * @desc    Update interview data
 * @route   PUT /api/interviews/:id
 * @access  Private
 */
export const updateInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, date, status, duration, questions, feedback } = req.body;

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
      duration
    );
  }

  // Update interview
  const updatedInterview = await Interview.findByIdAndUpdate(
    id,
    {
      $set: {
        ...(title && { title }),
        ...(date && { date }),
        ...(status && { status }),
        ...(duration && { duration }),
        ...(feedback !== undefined && { feedback }),
      },
      ...(questions && { $set: { questions } }),
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedInterview,
  });
});

/**
 * @desc    Delete an interview
 * @route   DELETE /api/interviews/:id
 * @access  Private
 */
export const deleteInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
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
}); 