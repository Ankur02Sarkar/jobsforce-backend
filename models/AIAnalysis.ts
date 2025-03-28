import mongoose from "mongoose";

// Define schema for algorithmic analysis
const algorithmAnalysisSchema = new mongoose.Schema({
  approachIdentified: {
    type: String,
    required: true,
  },
  optimizationTips: [String],
  edgeCasesFeedback: [String],
  alternativeApproaches: [
    {
      description: String,
      complexity: String,
      suitability: String,
    },
  ],
});

// Define schema for complexity analysis
const complexityAnalysisSchema = new mongoose.Schema({
  timeComplexity: {
    bestCase: String,
    averageCase: String,
    worstCase: String,
  },
  spaceComplexity: String,
  criticalOperations: [
    {
      operation: String,
      impact: String,
      lineNumbers: [Number],
    },
  ],
  comparisonToOptimal: String,
});

// Define schema for optimization suggestions
const optimizationSuggestionsSchema = new mongoose.Schema({
  optimizedCode: String,
  improvements: [
    {
      description: String,
      complexityBefore: String,
      complexityAfter: String,
      algorithmicChange: String,
    },
  ],
});

// Define schema for test cases
const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  expectedOutput: mongoose.Schema.Types.Mixed,
  purpose: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard", "edge"],
  },
  performanceTest: Boolean,
});

// Define the main AI analysis schema
const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    algorithmAnalysis: algorithmAnalysisSchema,
    complexityAnalysis: complexityAnalysisSchema,
    optimizationSuggestions: optimizationSuggestionsSchema,
    testCases: [testCaseSchema],
  },
  {
    timestamps: true,
  },
);

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;
