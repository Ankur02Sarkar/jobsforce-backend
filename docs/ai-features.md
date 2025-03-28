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
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1" // Optional
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
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1" // Optional
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
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1" // Optional
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
  "problemId": "60a1b2c3d4e5f6a7b8c9d0e1" // Optional
}
```

## Technical Implementation

The AI features are implemented using:

1. **OpenAI API**: Utilizes GPT-4o to analyze code, generate optimizations, and create test cases
2. **Database Integration**: Stores analysis results for future reference
3. **JWT Authentication**: All AI endpoints are protected and require authentication

## Configuration

The following environment variables are required:

```
OPENAI_API_KEY=your_openai_api_key
```

## Future Enhancements

Planned future enhancements include:

1. **Interactive Learning**: Custom explanations of algorithmic concepts based on user's solution
2. **Code Generation**: Generate complete solutions with step-by-step explanations
3. **Personalized Feedback**: Track user progress and provide targeted improvement suggestions
4. **Complexity Visualization**: Visual representations of time and space complexity 