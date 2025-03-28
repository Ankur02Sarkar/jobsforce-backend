# AI Features for LeetCode-Style Platform

This document outlines the AI-powered features implemented in the platform to assist with competitive programming and algorithmic problem-solving.

## Overview

The platform integrates with OpenAI's API to provide intelligent assistance for code analysis, optimization, and test case generation. These features are designed to help users improve their algorithmic problem-solving skills, understand time and space complexity trade-offs, and learn optimization techniques.

## Features

### 1. Algorithm Analysis & Code Review

**Endpoint:** `POST /api/ai/analyze-solution`

Analyzes code to identify the algorithm used, approach efficiency, and potential improvements. The analysis includes:

- Algorithm identification (e.g., "Dynamic Programming", "Greedy")
- Approach analysis
- Edge case handling assessment
- Potential optimizations

**Request:**
```json
{
  "code": "function solution(nums) { ... }",
  "language": "javascript",
  "problemStatement": "Given an array of integers, find the maximum sum of a contiguous subarray",
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1", // Optional
  "interviewId": "60a1b2c3d4e5f6a7b8c9d0e2", // Optional
  "questionId": 123 // Optional
}
```

**Sample Postman Payload:**
```json
{
  "code": "function maxSubarray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  \n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  \n  return maxSum;\n}",
  "language": "javascript",
  "problemStatement": "Given an array of integers, find the maximum sum of any contiguous subarray.",
  "problemId": "60d21b4667d0d8992e610c85" 
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code analysis completed",
  "data": {
    "analysisText": "Detailed analysis of the code...",
    "algorithmAnalysis": {
      "approachIdentified": "Dynamic Programming",
      "optimizationTips": ["Use memoization to avoid redundant calculations"],
      "edgeCasesFeedback": ["Handles empty arrays correctly"],
      "alternativeApproaches": [
        {
          "description": "Kadane's algorithm",
          "complexity": "O(n)",
          "suitability": "Optimal for this problem"
        }
      ]
    },
    "fromCache": false
  }
}
```

### 2. Time & Space Complexity Analysis

**Endpoint:** `POST /api/ai/complexity-analysis`

Calculates and explains the time and space complexity of a solution, including:

- Best, average, and worst-case time complexity
- Space complexity
- Critical operations affecting complexity
- Comparison to optimal solution

**Request:**
```json
{
  "code": "function solution(nums) { ... }",
  "language": "javascript",
  "problemType": "array", // Optional
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1", // Optional
  "interviewId": "60a1b2c3d4e5f6a7b8c9d0e2", // Optional
  "questionId": 123 // Optional
}
```

**Sample Postman Payload:**
```json
{
  "code": "function maxSubarray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  \n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  \n  return maxSum;\n}",
  "language": "javascript",
  "problemType": "array",
  "problemId": "60d21b4667d0d8992e610c85"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complexity analysis completed",
  "data": {
    "analysisText": "Detailed complexity analysis...",
    "complexityAnalysis": {
      "timeComplexity": {
        "bestCase": "O(n)",
        "averageCase": "O(n log n)",
        "worstCase": "O(n²)"
      },
      "spaceComplexity": "O(n)",
      "criticalOperations": [
        {
          "operation": "Nested loop",
          "impact": "Dominates time complexity",
          "lineNumbers": [10, 15]
        }
      ],
      "comparisonToOptimal": "The optimal solution for this problem is O(n log n)"
    },
    "fromCache": false
  }
}
```

### 3. Solution Optimization

**Endpoint:** `POST /api/ai/optimize-solution`

Suggests optimized versions of the code focusing on either time or space efficiency:

- Optimized code implementation
- Explanation of algorithmic improvements
- Complexity comparison

**Request:**
```json
{
  "code": "function solution(nums) { ... }",
  "language": "javascript",
  "problemStatement": "Given an array of integers, find the maximum sum of a contiguous subarray",
  "optimizationFocus": "time", // or "space"
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1", // Optional
  "interviewId": "60a1b2c3d4e5f6a7b8c9d0e2", // Optional
  "questionId": 123 // Optional
}
```

**Sample Postman Payload:**
```json
{
  "code": "function maxSubarray(nums) {\n  let maxSum = -Infinity;\n  \n  for (let i = 0; i < nums.length; i++) {\n    let sum = 0;\n    for (let j = i; j < nums.length; j++) {\n      sum += nums[j];\n      maxSum = Math.max(maxSum, sum);\n    }\n  }\n  \n  return maxSum;\n}",
  "language": "javascript",
  "problemStatement": "Given an array of integers, find the maximum sum of any contiguous subarray.",
  "optimizationFocus": "time",
  "problemId": "60d21b4667d0d8992e610c85"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solution optimization completed",
  "data": {
    "optimizationText": "Detailed optimization explanation...",
    "optimizationSuggestions": {
      "optimizedCode": "function solution(nums) { ... optimized implementation ... }",
      "improvements": [
        {
          "description": "Used memoization to avoid redundant calculations",
          "complexityBefore": "O(2^n)",
          "complexityAfter": "O(n)",
          "algorithmicChange": "Dynamic Programming approach"
        }
      ]
    },
    "fromCache": false
  }
}
```

### 4. Test Case Generator

**Endpoint:** `POST /api/ai/generate-test-cases`

Generates comprehensive test cases, including edge cases and performance tests:

- Basic test cases covering different scenarios
- Edge cases that might break naive solutions
- Performance test cases to challenge inefficient solutions

**Request:**
```json
{
  "problemStatement": "Given an array of integers, find the maximum sum of a contiguous subarray",
  "constraints": {
    "arrayLength": "1 <= n <= 10^5",
    "values": "-10^4 <= nums[i] <= 10^4"
  },
  "solutionHint": "Dynamic Programming", // Optional
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1", // Optional, but either problemId or interviewId+questionId is required
  "interviewId": "60a1b2c3d4e5f6a7b8c9d0e2", // Optional
  "questionId": 123 // Optional
}
```

**Sample Postman Payload:**
```json
{
  "problemStatement": "Given an array of integers, find the maximum sum of any contiguous subarray.",
  "constraints": "The array may contain both positive and negative integers. Array length is between 1 and 10^5. Values range from -10^4 to 10^4.",
  "solutionHint": "Consider using Kadane's algorithm for an O(n) solution.",
  "problemId": "60d21b4667d0d8992e610c85"
}
```

**Alternative for interview context:**
```json
{
  "problemStatement": "Given an array of integers, find the maximum sum of any contiguous subarray.",
  "constraints": "The array may contain both positive and negative integers. Array length is between 1 and 10^5. Values range from -10^4 to 10^4.",
  "solutionHint": "Consider using Kadane's algorithm for an O(n) solution.",
  "interviewId": "60d21b4667d0d8992e610c85", 
  "questionId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test case generation completed",
  "data": {
    "testCasesText": "Detailed explanation of test cases...",
    "testCases": [
      {
        "input": { "n": 5, "arr": [1, 2, 3, 4, 5] },
        "expectedOutput": 15,
        "purpose": "Basic test with sequential array",
        "difficulty": "easy",
        "performanceTest": false
      },
      {
        "input": { "n": 10000, "arr": [1, 1, 1, ...] },
        "expectedOutput": 10000,
        "purpose": "Performance test with large input",
        "difficulty": "hard",
        "performanceTest": true
      }
    ],
    "fromCache": false
  }
}
```

**Note**: When testing in Postman, replace the `problemId` and `interviewId` values with actual MongoDB ObjectIds from your database. For testing, you can use any valid ObjectId format (24 hexadecimal characters). Also, make sure to include the authentication token in your requests.

## Caching Mechanism

All AI analysis results are cached in the database to improve performance and reduce API calls. The caching works as follows:

1. When a request is made to any AI endpoint, the system first checks if there's a cached result for the same parameters:
   - For code analysis/optimization: Using the combination of user ID, interview ID, question ID (or problem ID), and code
   - For test case generation: Using the combination of user ID, interview ID, and question ID (or problem ID)

2. If a cached result exists, it's returned immediately with a `fromCache: true` flag in the response

3. If no cached result exists, the system makes an API call to OpenAI, processes the response, saves it to the database, and returns it with `fromCache: false`

This caching mechanism significantly improves response times for repeated requests and reduces API usage costs.

## Technical Implementation

The AI features are implemented using:

1. **OpenAI API**: Utilizes multiple AI models (Gemini) for different types of analysis
2. **Database Integration**: Stores analysis results for future reference and caching
3. **JWT Authentication**: All AI endpoints are protected and require authentication

## Configuration

The following environment variables are required:

```
OPENAI_API_KEY=your_openai_api_key
SITE_URL=your_website_url
```

## Future Enhancements

Planned future enhancements include:

1. **Interactive Learning**: Custom explanations of algorithmic concepts based on user's solution
2. **Code Generation**: Generate complete solutions with step-by-step explanations
3. **Personalized Feedback**: Track user progress and provide targeted improvement suggestions
4. **Complexity Visualization**: Visual representations of time and space complexity 