import type { Request, Response } from 'express';
import type { IUser } from '../models/User.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, ApiError, ValidationError } from '../utils/errorHandler.js';

/**
 * Generate JWT token for a user
 * @param id - User ID to encode in the token
 * @returns JWT token string
 */
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d'
  });
};

/**
 * Validates registration input
 * @param username - Username to validate
 * @param email - Email to validate
 * @param password - Password to validate
 * @throws ValidationError if validation fails
 */
const validateRegisterInput = (username: string, email: string, password: string) => {
  const errors: Record<string, string> = {};
  
  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }
  
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  
  // Validate input
  validateRegisterInput(username, email, password);
  
  // Check if user already exists
  const userExists = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (userExists) {
    if (userExists.email === email) {
      throw new ApiError('User with this email already exists', 400);
    } else {
      throw new ApiError('Username already taken', 400);
    }
  }
  
  // Create user
  const user = await User.create({
    username,
    email,
    password
  }) as IUser;
  
  if (user) {
    // Generate token
    const token = generateToken(user._id.toString());
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } else {
    throw new ApiError('Invalid user data', 400);
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Check for email and password
  if (!email || !password) {
    throw new ApiError('Please provide email and password', 400);
  }
  
  // Find user by email
  const user = await User.findOne({ email }) as IUser;
  
  // Check if user exists and password is correct
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid credentials', 401);
  }
  
  // Generate token
  const token = generateToken(user._id.toString());
  
  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // User is already available from auth middleware
  const user = (req as any).user;
  
  res.json({
    success: true,
    data: user
  });
}); 