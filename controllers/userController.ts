import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.js';
import type { IUser } from '../models/User.js';
import User from '../models/User.js';
import { asyncHandler, ApiError } from '../utils/errorHandler.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().select('-password');
  
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  // Update fields if provided
  const { username, email } = req.body;
  
  if (username) {
    // Check if username is taken
    const existingUser = await User.findOne({ username }) as IUser | null;
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      throw new ApiError('Username already taken', 400);
    }
    user.username = username;
  }
  
  if (email) {
    // Check if email is taken
    const existingUser = await User.findOne({ email }) as IUser | null;
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      throw new ApiError('Email already in use', 400);
    }
    user.email = email;
  }
  
  // Update password if provided
  if (req.body.password) {
    user.password = req.body.password;
  }
  
  const updatedUser = await user.save();
  
  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  await user.deleteOne();
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @desc    Update user by ID (admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  // Update fields if provided
  const { username, email, role } = req.body;
  
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  
  const updatedUser = await user.save();
  
  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
}); 