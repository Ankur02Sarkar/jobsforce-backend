import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Authentication middleware to verify JWT tokens
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    console.log("[Auth Middleware] Auth header exists:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Auth Middleware] Invalid auth header format");
      return res.status(401).json({
        success: false,
        message: "Authentication failed. No token provided or invalid format.",
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Basic token format validation
    if (!token || typeof token !== 'string') {
      console.log("[Auth Middleware] Token missing or not a string");
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Token is required.",
      });
    }
    
    // Check for valid JWT format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log("[Auth Middleware] Invalid JWT format, parts:", tokenParts.length);
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Invalid token format.",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
      
      if (!decoded || !decoded.id) {
        console.log("[Auth Middleware] Missing or invalid payload");
        return res.status(401).json({
          success: false,
          message: "Authentication failed. Invalid token payload.",
        });
      }
      
      // Check if user exists with that id
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("[Auth Middleware] User not found for decoded ID:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "User not found or token is invalid.",
        });
      }

      // Add user to request object
      (req as any).user = user;
      console.log("[Auth Middleware] Authentication successful for user:", user._id);
      next();
    } catch (jwtError: any) {
      console.log("[Auth Middleware] JWT verification error:", jwtError.message);
      
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please authorize again.",
        });
      }

      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token. Please authorize again.",
      });
    }
  } catch (error) {
    console.error("[Auth Middleware] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/**
 * Authorization middleware to restrict access to admin users
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if ((req as any).user && (req as any).user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

// Enhanced request interface with user property
export interface AuthRequest extends Request {
  user?: any;
}
