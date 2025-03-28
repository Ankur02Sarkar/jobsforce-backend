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
    const { code, language, problemStatement, problemId } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    try {
      const analysisText = await openAIService.analyzeCode(
        code,
        language,
        problemStatement,
      );

      // Parse the analysis text to extract structured data
      // This is a simplified example - in production, you'd implement more robust parsing
      const algorithmAnalysis = {
        approachIdentified: "Algorithm identified from analysis",
        optimizationTips: ["Extracted tip 1", "Extracted tip 2"],
        edgeCasesFeedback: ["Edge case 1", "Edge case 2"],
        alternativeApproaches: [
          {
            description: "Alternative approach description",
            complexity: "O(n)",
            suitability: "Good for small inputs",
          },
        ],
      };

      // Save to database if user is authenticated
      if (req.user) {
        const analysis = new AIAnalysis({
          userId: req.user._id,
          problemId: problemId || null,
          code,
          language,
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
    const { code, language, problemType, problemId } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    try {
      const analysisText = await openAIService.analyzeComplexity(
        code,
        language,
        problemType,
      );

      // Parse the analysis text to extract structured data
      // This is a simplified example - in production, you'd implement more robust parsing
      const complexityAnalysis = {
        timeComplexity: {
          bestCase: "O(n)",
          averageCase: "O(n log n)",
          worstCase: "O(n²)",
        },
        spaceComplexity: "O(n)",
        criticalOperations: [
          {
            operation: "Nested loop",
            impact: "Dominates time complexity",
            lineNumbers: [10, 15],
          },
        ],
        comparisonToOptimal:
          "The optimal solution for this problem is O(n log n)",
      };

      // Save to database if user is authenticated
      if (req.user) {
        // Check if analysis exists and update, or create new
        const existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          problemId: problemId || null,
          code,
        });

        if (existingAnalysis) {
          existingAnalysis.set("complexityAnalysis", complexityAnalysis);
          await existingAnalysis.save();
        } else {
          const analysis = new AIAnalysis({
            userId: req.user._id,
            problemId: problemId || null,
            code,
            language,
            complexityAnalysis,
          });
          await analysis.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: "Complexity analysis completed",
        data: {
          analysisText,
          complexityAnalysis,
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
    const { code, language, problemStatement, optimizationFocus, problemId } =
      req.body;

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
      const optimizationText = await openAIService.optimizeCode(
        code,
        language,
        problemStatement,
        optimizationFocus as "time" | "space",
      );

      // Parse the optimization text to extract structured data
      // This is a simplified example - in production, you'd implement more robust parsing
      const optimizationSuggestions = {
        optimizedCode: "Extracted optimized code",
        improvements: [
          {
            description: "Used memoization to avoid redundant calculations",
            complexityBefore: "O(2^n)",
            complexityAfter: "O(n)",
            algorithmicChange: "Dynamic Programming approach",
          },
        ],
      };

      // Save to database if user is authenticated
      if (req.user) {
        // Check if analysis exists and update, or create new
        const existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          problemId: problemId || null,
          code,
        });

        if (existingAnalysis) {
          existingAnalysis.set(
            "optimizationSuggestions",
            optimizationSuggestions,
          );
          await existingAnalysis.save();
        } else {
          const analysis = new AIAnalysis({
            userId: req.user._id,
            problemId: problemId || null,
            code,
            language,
            optimizationSuggestions,
          });
          await analysis.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: "Solution optimization completed",
        data: {
          optimizationText,
          optimizationSuggestions,
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
    const { problemStatement, constraints, solutionHint, problemId } = req.body;

    if (!problemStatement || !constraints) {
      return res.status(400).json({
        success: false,
        message: "Problem statement and constraints are required",
      });
    }

    try {
      const testCasesText = await openAIService.generateTestCases(
        problemStatement,
        constraints,
        solutionHint,
      );

      // Parse the test cases text to extract structured data
      // This is a simplified example - in production, you'd implement more robust parsing
      const testCases = [
        {
          input: { n: 5, arr: [1, 2, 3, 4, 5] },
          expectedOutput: 15,
          purpose: "Basic test with sequential array",
          difficulty: "easy",
          performanceTest: false,
        },
        {
          input: { n: 10000, arr: Array(10000).fill(1) },
          expectedOutput: 10000,
          purpose: "Performance test with large input",
          difficulty: "hard",
          performanceTest: true,
        },
      ];

      // Save to database if user is authenticated
      if (req.user && problemId) {
        // Check if analysis exists and update, or create new
        const existingAnalysis = await AIAnalysis.findOne({
          userId: req.user._id,
          problemId,
        });

        if (existingAnalysis) {
          existingAnalysis.set("testCases", testCases);
          await existingAnalysis.save();
        } else {
          const analysis = new AIAnalysis({
            userId: req.user._id,
            problemId,
            code: "", // No code for test case generation
            language: "none",
            testCases,
          });
          await analysis.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: "Test case generation completed",
        data: {
          testCasesText,
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
