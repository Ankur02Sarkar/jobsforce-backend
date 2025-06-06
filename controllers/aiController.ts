import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import AIAnalysis from "../models/AIAnalysis.js";
import openAIService from "../services/openaiService.js";

/**
 * Helper function for async handlers
 */
const asyncHandler = (fn: Function) => (req: Request, res: Response) => {
  Promise.resolve(fn(req, res)).catch((error) => {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  });
};

/**
 * @desc    Analyze algorithmic approach and implementation
 * @route   POST /api/ai/analyze-solution
 * @access  Authenticated
 */
export const analyzeSolution = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      code,
      language,
      problemStatement,
      problemId,
      interviewId,
      questionId,
    } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if we already have analysis for this code and question
      let existingAnalysis = null;

      if (interviewId && questionId) {
        existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          interviewId,
          questionId,
          code,
        });
      } else if (problemId) {
        existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          problemId,
          code,
        });
      }

      // If we have cached results, return them
      if (existingAnalysis && existingAnalysis.algorithmAnalysis) {
        return res.status(200).json({
          success: true,
          message: "Cached code analysis retrieved",
          data: {
            analysisText: existingAnalysis.analysisText,
            algorithmAnalysis: existingAnalysis.algorithmAnalysis,
            fromCache: true,
          },
        });
      }

      // Otherwise, get new analysis from API
      const analysisResult = await openAIService.analyzeCode(
        code,
        language,
        problemStatement,
      );

      // No need to parse manually - the service now returns structured data directly
      const { algorithmAnalysis, analysisText, error } = analysisResult;

      // Check if there was an error in the analysis
      if (error) {
        return res.status(200).json({
          success: false,
          message: "Error performing code analysis",
          data: {
            analysisText,
            algorithmAnalysis,
            fromCache: false,
          },
        });
      }

      // Save to database
      if (existingAnalysis) {
        existingAnalysis.set("algorithmAnalysis", algorithmAnalysis);
        existingAnalysis.set("analysisText", analysisText);
        await existingAnalysis.save();
      } else {
        const analysis = new AIAnalysis({
          userId: req.user._id,
          interviewId: interviewId || null,
          questionId: questionId || null,
          problemId: problemId || null,
          code,
          language,
          analysisText,
          algorithmAnalysis,
        });

        await analysis.save();
      }

      return res.status(200).json({
        success: true,
        message: "Code analysis completed",
        data: {
          analysisText,
          algorithmAnalysis,
          fromCache: false,
        },
      });
    } catch (error) {
      console.error("Error analyzing code:", error);
      return res.status(500).json({
        success: false,
        message: "Error analyzing code",
      });
    }
  },
);

/**
 * @desc    Calculate time and space complexity of solution
 * @route   POST /api/ai/complexity-analysis
 * @access  Authenticated
 */
export const complexityAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code, language, problemType, problemId, interviewId, questionId } =
      req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if we already have analysis for this code and question
      let existingAnalysis = null;

      if (interviewId && questionId) {
        existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          interviewId,
          questionId,
          code,
        });
      } else if (problemId) {
        existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          problemId,
          code,
        });
      }

      // If we have cached results, return them
      if (existingAnalysis && existingAnalysis.complexityAnalysis) {
        return res.status(200).json({
          success: true,
          message: "Cached complexity analysis retrieved",
          data: {
            analysisText: existingAnalysis.analysisText,
            complexityAnalysis: existingAnalysis.complexityAnalysis,
            fromCache: true,
          },
        });
      }

      // Otherwise, get new analysis from API
      const complexityResult = await openAIService.analyzeComplexity(
        code,
        language,
        problemType,
      );

      // No need to parse manually - the service now returns structured data directly
      const { complexityAnalysis, analysisText, error } = complexityResult;

      // Check if there was an error in the analysis
      if (error) {
        return res.status(200).json({
          success: false,
          message: "Error performing complexity analysis",
          data: {
            analysisText,
            complexityAnalysis,
            fromCache: false,
          },
        });
      }

      // Save to database
      if (existingAnalysis) {
        existingAnalysis.set("complexityAnalysis", complexityAnalysis);
        existingAnalysis.set("analysisText", analysisText);
        await existingAnalysis.save();
      } else {
        const analysis = new AIAnalysis({
          userId: req.user._id,
          interviewId: interviewId || null,
          questionId: questionId || null,
          problemId: problemId || null,
          code,
          language,
          analysisText,
          complexityAnalysis,
        });
        await analysis.save();
      }

      return res.status(200).json({
        success: true,
        message: "Complexity analysis completed",
        data: {
          analysisText,
          complexityAnalysis,
          fromCache: false,
        },
      });
    } catch (error) {
      console.error("Error analyzing complexity:", error);
      return res.status(500).json({
        success: false,
        message: "Error analyzing complexity",
      });
    }
  },
);

/**
 * @desc    Get optimized version of solution
 * @route   POST /api/ai/optimize-solution
 * @access  Authenticated
 */
export const optimizeSolution = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      code,
      language,
      problemStatement,
      optimizationFocus,
      problemId,
      interviewId,
      questionId,
    } = req.body;

    if (!code || !language || !problemStatement) {
      return res.status(400).json({
        success: false,
        message: "Code, language, and problem statement are required",
      });
    }

    if (!optimizationFocus || !["time", "space"].includes(optimizationFocus)) {
      return res.status(400).json({
        success: false,
        message: "Valid optimization focus (time or space) is required",
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if we already have analysis for this code and question
      let existingAnalysis = null;

      if (interviewId && questionId) {
        existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          interviewId,
          questionId,
          code,
        });
      } else if (problemId) {
        existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          problemId,
          code,
        });
      }

      // If we have cached results, return them
      if (existingAnalysis && existingAnalysis.optimizationSuggestions) {
        return res.status(200).json({
          success: true,
          message: "Cached optimization suggestions retrieved",
          data: {
            optimizationText: existingAnalysis.analysisText,
            optimizationSuggestions: existingAnalysis.optimizationSuggestions,
            fromCache: true,
          },
        });
      }

      // Otherwise, get new analysis from API
      const optimizationResult = await openAIService.optimizeCode(
        code,
        language,
        problemStatement,
        optimizationFocus as "time" | "space",
      );

      console.log("optimizationResult : ", optimizationResult);
      

      // No need to parse manually - the service now returns structured data directly
      const { optimizationSuggestions, analysisText, error } =
        optimizationResult;

      // Check if there was an error in the optimization
      if (error) {
        return res.status(200).json({
          success: false,
          message: "Error performing code optimization",
          data: {
            optimizationText: analysisText,
            optimizationSuggestions,
            fromCache: false,
          },
        });
      }

      // Save to database
      if (existingAnalysis) {
        existingAnalysis.set(
          "optimizationSuggestions",
          optimizationSuggestions,
        );
        existingAnalysis.set("analysisText", analysisText);
        await existingAnalysis.save();
      } else {
        const analysis = new AIAnalysis({
          userId: req.user._id,
          interviewId: interviewId || null,
          questionId: questionId || null,
          problemId: problemId || null,
          code,
          language,
          analysisText,
          optimizationSuggestions,
        });
        await analysis.save();
      }

      return res.status(200).json({
        success: true,
        message: "Solution optimization completed",
        data: {
          optimizationText: analysisText,
          optimizationSuggestions,
          fromCache: false,
        },
      });
    } catch (error) {
      console.error("Error optimizing solution:", error);
      return res.status(500).json({
        success: false,
        message: "Error optimizing solution",
      });
    }
  },
);

/**
 * @desc    Generate challenging test cases for a problem
 * @route   POST /api/ai/generate-test-cases
 * @access  Authenticated
 */
export const generateTestCases = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { problemStatement, constraints, solutionHint, forceRefresh } =
      req.body;

    if (!problemStatement || !constraints) {
      return res.status(400).json({
        success: false,
        message: "Problem statement and constraints are required",
      });
    }

    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Generate new test cases - always fresh
      const testCaseResult = await openAIService.generateTestCases(
        problemStatement,
        constraints,
        solutionHint,
      );

      // Get structured data from the service
      const { testCases, analysisText, error } = testCaseResult;

      // Check if there was an error generating test cases
      if (error) {
        return res.status(200).json({
          success: false,
          message: "Error generating test cases",
          data: {
            analysisText,
            testCases,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Test case generation completed",
        data: {
          testCasesText: analysisText,
          testCases,
        },
      });
    } catch (error) {
      console.error("Error generating test cases:", error);
      return res.status(500).json({
        success: false,
        message: "Error generating test cases",
      });
    }
  },
);
