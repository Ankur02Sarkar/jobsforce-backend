import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Service for interacting with OpenAI API
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
    const prompt = `
      Analyze the following ${language} code:
      
      ${code}
      
      ${problemStatement ? `The code is solving this problem: ${problemStatement}` : ""}
      
      Please provide:
      1. Algorithm identification
      2. Approach analysis
      3. Edge case handling assessment
      4. Potential optimization suggestions
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert algorithm and code reviewer specialized in competitive programming. Provide detailed technical analysis.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    return response.choices[0]?.message?.content || "No analysis available";
  }

  /**
   * Analyze time and space complexity of code
   */
  async analyzeComplexity(
    code: string,
    language: string,
    problemType?: string,
  ): Promise<any> {
    const prompt = `
      Analyze the time and space complexity of the following ${language} code:
      
      ${code}
      
      ${problemType ? `This is a ${problemType} type problem.` : ""}
      
      Please provide:
      1. Best, average, and worst-case time complexity in Big O notation
      2. Space complexity in Big O notation
      3. Identification of critical operations affecting complexity
      4. Comparison to optimal solution for this problem type (if known)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in algorithmic analysis and complexity theory. Provide precise complexity analysis.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    return (
      response.choices[0]?.message?.content ||
      "No complexity analysis available"
    );
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
    const prompt = `
      Optimize the following ${language} code for ${optimizationFocus === "time" ? "time efficiency" : "space efficiency"}:
      
      ${code}
      
      The code is solving this problem:
      ${problemStatement}
      
      Please provide:
      1. An optimized version of the code
      2. Explanation of algorithmic improvements
      3. Complexity comparison between original and optimized solution
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert algorithm optimizer. Focus on algorithmic improvements rather than code style.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    return response.choices[0]?.message?.content || "No optimization available";
  }

  /**
   * Generate test cases for a problem
   */
  async generateTestCases(
    problemStatement: string,
    constraints: any,
    solutionHint?: string,
  ): Promise<any> {
    const prompt = `
      Generate comprehensive test cases for the following problem:
      
      ${problemStatement}
      
      Constraints:
      ${JSON.stringify(constraints, null, 2)}
      
      ${solutionHint ? `Solution approach hint: ${solutionHint}` : ""}
      
      Please provide:
      1. A variety of test cases covering different scenarios
      2. Edge cases that might break naive solutions
      3. Performance test cases to challenge inefficient solutions
      4. For each test case, include input, expected output, and what aspect it's testing
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert test case generator for competitive programming problems.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || "No test cases available";
  }
}

export default new OpenAIService();
