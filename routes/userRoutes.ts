import express from 'express';
import type { Response } from 'express';
import { getUsers, getUserById, updateProfile, deleteUser, updateUser } from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';
import type { AuthRequest } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
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