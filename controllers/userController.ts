import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Webhook } from "svix";
import type { AuthRequest } from "../middlewares/auth.js";
import type { IUser } from "../models/User.js";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().select("-password");

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update fields if provided
    const { username, email } = req.body;

    if (username) {
      // Check if username is taken
      const existingUser = (await User.findOne({ username })) as IUser | null;
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        throw new ApiError("Username already taken", 400);
      }
      user.username = username;
    }

    if (email) {
      // Check if email is taken
      const existingUser = (await User.findOne({ email })) as IUser | null;
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        throw new ApiError("Email already in use", 400);
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
        role: updatedUser.role,
      },
    });
  },
);

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: "User deleted successfully",
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
    throw new ApiError("User not found", 404);
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
      role: updatedUser.role,
    },
  });
});

/**
 * @desc    Handle Clerk webhook events
 * @route   POST /api/users/webhook
 * @access  Public
 */
export const handleClerkWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Get the webhook secret from environment variables
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

      if (!webhookSecret) {
        return res.status(500).json({
          success: false,
          error: {
            code: "SERVER_CONFIGURATION_ERROR",
            message: "Webhook secret is not configured",
          },
        });
      }

      // Get the headers
      const svixHeaders = {
        "svix-id": req.headers["svix-id"] as string,
        "svix-timestamp": req.headers["svix-timestamp"] as string,
        "svix-signature": req.headers["svix-signature"] as string,
      };

      // Check if all required headers are present
      if (
        !svixHeaders["svix-id"] ||
        !svixHeaders["svix-timestamp"] ||
        !svixHeaders["svix-signature"]
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_HEADERS",
            message: "Required Svix headers are missing",
            details: {
              missingHeaders: Object.entries(svixHeaders)
                .filter(([_, value]) => !value)
                .map(([key]) => key),
            },
          },
        });
      }

      // Validate the webhook payload
      const webhook = new Webhook(webhookSecret);
      let payload: any;

      try {
        payload = webhook.verify(JSON.stringify(req.body), svixHeaders);
      } catch (error) {
        console.error("Error verifying webhook:", error);
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_SIGNATURE",
            message: "Invalid webhook signature",
            details:
              process.env.NODE_ENV === "development"
                ? { error: (error as Error).message }
                : undefined,
          },
        });
      }

      const { type, data } = payload;
      const clerkId = data?.id;

      if (!clerkId) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PAYLOAD",
            message: "Invalid webhook data: missing id",
          },
        });
      }

      // Handle user deletion event
      if (type === "user.deleted") {
        const existingUser = await User.findOne({ clerkId });

        if (!existingUser) {
          return res.status(404).json({
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: `User with Clerk ID ${clerkId} not found`,
              details: { clerkId },
            },
          });
        }

        await existingUser.deleteOne();
        return res.json({
          success: true,
          message: "User deleted successfully",
        });
      }

      // Handle user creation and update events
      if (type === "user.created" || type === "user.updated") {
        // Extract user data from the payload
        const userData: any = {
          clerkId,
          username: data?.username || `user_${clerkId.substring(0, 8)}`,
          email: data?.email_addresses?.[0]?.email_address,
          firstName: data?.first_name,
          lastName: data?.last_name,
          profileImage: data?.profile_image_url || data?.image_url,
          phone: data?.phone_numbers?.[0]?.phone_number,
        };

        // Check if required fields are present
        if (!userData.email) {
          return res.status(400).json({
            success: false,
            error: {
              code: "MISSING_REQUIRED_FIELD",
              message: "Email is required for user creation/update",
              details: { userData },
            },
          });
        }

        // Generate a random password for users created through Clerk
        // They would normally authenticate through Clerk, not our password system
        if (type === "user.created") {
          userData.password = Math.random().toString(36).slice(-10);
        }

        try {
          // Find or create the user
          const existingUser = await User.findOne({ clerkId });

          if (existingUser) {
            // Update existing user (don't update the password)
            const { password, ...updateData } = userData;

            Object.assign(existingUser, updateData);
            const updatedUser = await existingUser.save();

            return res.json({
              success: true,
              data: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                profileImage: updatedUser.profileImage,
                phone: updatedUser.phone,
              },
            });
          } else {
            // Create new user
            const newUser = await User.create(userData);

            return res.status(201).json({
              success: true,
              data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                profileImage: newUser.profileImage,
                phone: newUser.phone,
              },
            });
          }
        } catch (dbError) {
          console.error("Database operation failed:", dbError);
          return res.status(500).json({
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "Failed to create or update user",
              details:
                process.env.NODE_ENV === "development"
                  ? { error: (dbError as Error).message }
                  : undefined,
            },
          });
        }
      }

      // Unhandled webhook event type
      return res.status(400).json({
        success: false,
        error: {
          code: "UNHANDLED_EVENT",
          message: `Unhandled webhook event type: ${type}`,
          details: { type },
        },
      });
    } catch (error) {
      console.error("Error in handleClerkWebhook:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An unexpected error occurred",
          details:
            process.env.NODE_ENV === "development"
              ? { error: (error as Error).message }
              : undefined,
        },
      });
    }
  },
);

/**
 * @desc    Get user by Clerk ID with JWT token
 * @route   GET /api/users/clerk/:clerkId
 * @access  Public
 */
export const getUserByClerkId = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { clerkId } = req.params;

      if (!clerkId) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "Clerk ID parameter is required",
          },
        });
      }

      const user = await User.findOne({ clerkId }).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: `User with Clerk ID ${clerkId} not found`,
            details: { clerkId },
          },
        });
      }

      // Check if JWT_SECRET is configured
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({
          success: false,
          error: {
            code: "SERVER_CONFIGURATION_ERROR",
            message: "JWT secret is not configured",
          },
        });
      }

      try {
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, jwtSecret, {
          expiresIn: "7d",
        });

        return res.json({
          success: true,
          data: {
            user,
            token,
          },
        });
      } catch (tokenError) {
        console.error("Error generating token:", tokenError);
        return res.status(500).json({
          success: false,
          error: {
            code: "TOKEN_GENERATION_FAILED",
            message: "Failed to generate authentication token",
          },
        });
      }
    } catch (error) {
      console.error("Error in getUserByClerkId:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An unexpected error occurred",
          details:
            process.env.NODE_ENV === "development"
              ? { errorMessage: (error as Error).message }
              : undefined,
        },
      });
    }
  },
);
