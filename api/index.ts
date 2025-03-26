import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import connectDB from "../config/db.js";
import authRoutes from "../routes/authRoutes.js";
import twitterJobsRoutes from "../routes/twitterJobsRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import { errorHandler } from "../utils/errorHandler.js";

// Load environment variables
dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://jobs-force.vercel.app",
  "https://jobsforce-assignment-eight.vercel.app",
];

// Connect to database
connectDB();

const app = express();

// CORS middleware
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, success?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "JobsForce API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/xjobs", twitterJobsRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// Handle 404 - Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

export default app;
