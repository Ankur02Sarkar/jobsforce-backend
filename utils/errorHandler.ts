import type { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends ApiError {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Async handler to wrap async route handlers and avoid try/catch repetition
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  let statusCode = 500;
  let message = 'Server Error';
  let errors: Record<string, string> = {};
  
  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    
    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  } else if (err.name === 'ValidationError' && err.errors) {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    
    // Format mongoose validation errors
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  } else if (err.name === 'CastError') {
    // Mongoose cast error (usually invalid ID)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000 && err.keyValue) {
    // MongoDB duplicate key error
    statusCode = 400;
    message = 'Duplicate field value entered';
    
    // Extract the field that caused the duplicate key error
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      errors[field] = `${field} already exists`;
    }
  }
  
  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(Object.keys(errors).length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 