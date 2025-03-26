import express from 'express';
import type { Response } from 'express';
import { getUsers, getUserById, updateProfile, deleteUser, updateUser, handleClerkWebhook, getUserByClerkId } from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import type { AuthRequest } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/users/webhook
 * @desc    Webhook endpoint for Clerk events
 * @access  Public - but secured by Svix signature verification
 */
router.post('/webhook', handleClerkWebhook);

/**
 * @route   GET /api/users/clerk/:clerkId
 * @desc    Get user by Clerk ID with JWT token
 * @access  Public
 */
router.get('/clerk/:clerkId', getUserByClerkId);

// Apply authentication middleware to all routes below this line
router.use(authenticate as any);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile (same as auth/me but in user routes)
 * @access  Private
 */
router.get('/profile', (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: req.user
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', updateProfile);

// Admin routes - require admin role
router.use(authorizeAdmin as any);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private/Admin
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', deleteUser);

export default router; 