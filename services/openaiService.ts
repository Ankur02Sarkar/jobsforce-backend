import OpenAI from "openai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

/**
 * Helper function to sanitize JSON responses that may be wrapped in markdown code blocks
 */
const sanitizeJsonResponse = (content: string): string => {
  // Remove markdown code block markers if present
  return content
    .replace(/^```(?:json)?[\r\n]/, '')
    .replace(/```$/, '')
    .trim();
};

// Verify API key is available
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is missing in environment variables!");
}

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  defaultHeaders: {
    "HTTP-Referer": process.env.FRONTEND_URL || "https://jobs-force.vercel.app",
    "X-Title": "JobsForce Code Analysis",
  },
});

/**
 * Service for interacting with OpenAI-compatible APIs through OpenRouter
 */
export class OpenAIService {
  /**
   * Analyze code for algorithm patterns, complexity, and suggestions
   */
  async analyzeCode(
    code: string,
    language: string,
    problemStatement?: string,
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert algorithm and code reviewer specialized in competitive programming. 
              Analyze the provided code and return a structured JSON response with the following fields:
              - approachIdentified: string with the name of the algorithm or approach identified
              - optimizationTips: array of strings with specific tips to optimize the code
              - edgeCasesFeedback: array of strings with feedback regarding edge case handling
              - alternativeApproaches: array of objects with {description, complexity, suitability} fields
              - detailedAnalysis: string with a detailed analysis of the code's approach and implementation`,
          },
          {
            role: "user",
            content: `
              Analyze the following ${language} code:
              
              ${code}
              
              ${problemStatement ? `The code is solving this problem: ${problemStatement}` : ""}
            `,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      console.log("analyzeCode response : ", response.choices[0]?.message?.content)

      // Parse the response content as JSON, sanitizing first
      const sanitizedContent = sanitizeJsonResponse(response.choices[0]?.message?.content || "{}");
      const analysisData = JSON.parse(sanitizedContent);

      // Return both the structured data and the full analysis text
      return {
        algorithmAnalysis: {
          approachIdentified:
            analysisData.approachIdentified || "Unknown approach",
          optimizationTips: analysisData.optimizationTips || [],
          edgeCasesFeedback: analysisData.edgeCasesFeedback || [],
          alternativeApproaches: analysisData.alternativeApproaches || [],
        },
        analysisText:
          analysisData.detailedAnalysis || "No detailed analysis available",
      };
    } catch (error) {
      console.error("Error in analyzeCode:", error);
      return {
        algorithmAnalysis: {
          approachIdentified: "Analysis failed",
          optimizationTips: ["Could not analyze code"],
          edgeCasesFeedback: ["Analysis unavailable"],
          alternativeApproaches: [],
        },
        analysisText: "Error performing code analysis",
        error: true
      };
    }
  }

  /**
   * Analyze time and space complexity of code
   */
  async analyzeComplexity(
    code: string,
    language: string,
    problemType?: string,
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert in algorithmic analysis and complexity theory.
              Provide precise complexity analysis in structured JSON format with the following fields:
              - timeComplexity: object with {bestCase, averageCase, worstCase} as strings
              - spaceComplexity: string with the space complexity in Big O notation
              - criticalOperations: array of objects with {operation, impact, lineNumbers} fields
              - comparisonToOptimal: string comparing to optimal solution for this problem type
              - detailedAnalysis: string with a detailed analysis of the code's complexity`,
          },
          {
            role: "user",
            content: `
              Analyze the time and space complexity of the following ${language} code:
              
              ${code}
              
              ${problemType ? `This is a ${problemType} type problem.` : ""}
            `,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      console.log("analyzeComplexity response : ", response.choices[0]?.message?.content)

      // Parse the response content as JSON, sanitizing first
      const sanitizedContent = sanitizeJsonResponse(response.choices[0]?.message?.content || "{}");
      const complexityData = JSON.parse(sanitizedContent);

      // Return both the structured data and the full analysis text
      return {
        complexityAnalysis: {
          timeComplexity: complexityData.timeComplexity || {
            bestCase: "Unknown",
            averageCase: "Unknown",
            worstCase: "Unknown",
          },
          spaceComplexity: complexityData.spaceComplexity || "Unknown",
          criticalOperations: complexityData.criticalOperations || [],
          comparisonToOptimal: complexityData.comparisonToOptimal || "Unknown",
        },
        analysisText:
          complexityData.detailedAnalysis || "No detailed analysis available",
      };
    } catch (error) {
      console.error("Error in analyzeComplexity:", error);
      return {
        complexityAnalysis: {
          timeComplexity: {
            bestCase: "Analysis failed",
            averageCase: "Analysis failed",
            worstCase: "Analysis failed",
          },
          spaceComplexity: "Analysis failed",
          criticalOperations: [],
          comparisonToOptimal: "Could not compare to optimal solution",
        },
        analysisText: "Error performing complexity analysis",
        error: true
      };
    }
  }

  /**
   * Optimize code for better performance
   */
  async optimizeCode(
    code: string,
    language: string,
    problemStatement: string,
    optimizationFocus: "time" | "space",
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert algorithm optimizer. Focus on algorithmic improvements rather than code style.
              Return a structured JSON response with the following fields:
              - optimizedCode: string with the optimized version of the code. Make sure the code is well-formatted with consistent indentation (2 spaces) and proper line breaks. Do not include any extra comments or explanation in the code itself.
              - improvements: array of objects with {description, complexityBefore, complexityAfter, algorithmicChange} fields
              - explanationText: string with a detailed explanation of the optimizations made`,
          },
          {
            role: "user",
            content: `
              Optimize the following ${language} code for ${optimizationFocus === "time" ? "time efficiency" : "space efficiency"}:
              
              ${code}
              
              The code is solving this problem:
              ${problemStatement}
              
              IMPORTANT: Ensure the optimized code is well-formatted with proper indentation (2 spaces) and line breaks.
            `,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      console.log("optimizeCode response : ", response.choices[0]?.message?.content)

      // Parse the response content as JSON, sanitizing first
      const sanitizedContent = sanitizeJsonResponse(response.choices[0]?.message?.content || "{}");
      const optimizationData = JSON.parse(sanitizedContent);

      // Return both the structured data and the full explanation text
      return {
        optimizationSuggestions: {
          optimizedCode:
            optimizationData.optimizedCode || "No optimized code available",
          improvements: optimizationData.improvements || [],
        },
        analysisText:
          optimizationData.explanationText ||
          "No optimization explanation available",
      };
    } catch (error) {
      console.error("Error in optimizeCode:", error);
      return {
        optimizationSuggestions: {
          optimizedCode: "Optimization failed",
          improvements: [
            {
              description: "Could not optimize code",
              complexityBefore: "Unknown",
              complexityAfter: "Unknown",
              algorithmicChange: "None",
            },
          ],
        },
        analysisText: "Error performing code optimization",
        error: true
      };
    }
  }

  /**
   * Generate test cases for a problem
   */
  async generateTestCases(
    problemStatement: string,
    constraints: any,
    solutionHint?: string,
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert test case generator for competitive programming problems.
              You MUST respond with a valid JSON object containing the following fields:
              - testCases: array of objects with {input, expectedOutput, purpose, difficulty, performanceTest} fields
                where difficulty is one of ["easy", "medium", "hard", "edge"]
              - explanationText: string with a detailed explanation of the test cases generated
              
              IMPORTANT: For arrays, use only literal values (not code expressions). For example:
              - CORRECT: "nums": [1, 2, 3, 4, 5]
              - INCORRECT: "nums": [i for i in range(10000)]
              
              For large arrays, either list a few elements or set a reasonable number of elements (less than 100).
              
              DO NOT include any text before or after the JSON object. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `
              Generate comprehensive test cases for the following problem:
              
              ${problemStatement}
              
              Constraints:
              ${JSON.stringify(constraints, null, 2)}
              
              ${solutionHint ? `Solution approach hint: ${solutionHint}` : ""}
              
              Remember to respond with ONLY valid JSON.
            `,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      console.log("generateTestCases response : ", response.choices[0]?.message?.content)

      // Parse the response content as JSON, sanitizing first
      let testCaseData;
      try {
        const content = response.choices[0]?.message?.content || "{}";
        const sanitizedContent = sanitizeJsonResponse(content);
        
        // Try to remove any potential Python expressions or other invalid JSON
        // This regex finds Python-like list comprehensions and replaces them with empty arrays
        const cleanedContent = sanitizedContent
          .replace(/\[[^\]]*for[^\]]*\]/g, '[]')
          .replace(/range\(\d+\)/g, '[]');
        
        testCaseData = JSON.parse(cleanedContent);
        
        // Validate that testCases is an array
        if (testCaseData.testCases && !Array.isArray(testCaseData.testCases)) {
          testCaseData.testCases = [];
        }
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        console.log("Raw response content:", response.choices[0]?.message?.content);
        testCaseData = {
          testCases: [],
          explanationText: "Failed to parse response as JSON"
        };
      }

      // Return both the structured data and the full explanation text
      return {
        testCases: testCaseData.testCases || [],
        analysisText:
          testCaseData.explanationText || "No test case explanation available",
      };
    } catch (error) {
      console.error("Error in generateTestCases:", error);
      return {
        testCases: [
          {
            input: { sample: "input" },
            expectedOutput: "sample output",
            purpose: "Test case generation failed",
            difficulty: "easy",
            performanceTest: false,
          },
        ],
        analysisText: "Error generating test cases",
        error: true
      };
    }
  }
}

export default new OpenAIService();
