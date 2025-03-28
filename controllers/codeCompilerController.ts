import type { Request, Response } from "express";

// Define interfaces for API responses
interface SphereEngineSubmitResponse {
  result: boolean;
  errors?: string[];
  message?: string;
  data: {
    id: number;
    api_id: number;
    language_id: number;
  };
}

interface SphereEngineResultData {
  id: number;
  api_id: number;
  status: number;
  executing: boolean;
  signal: {
    number: number;
  };
  time: number;
  memory: number;
  input?: {
    data: string;
    isHtml: boolean;
    originSize: number;
    size: number;
    isFull: boolean;
  };
  output?: {
    data: string;
    isHtml: boolean;
    originSize: number;
    size: number;
    isFull: boolean;
  };
  error?: {
    data: string;
    isHtml: boolean;
    originSize: number;
    size: number;
    isFull: boolean;
  };
  cmpinfo?: {
    data: string;
    isHtml: boolean;
    originSize: number;
    size: number;
    isFull: boolean;
  };
}

interface SphereEngineStatusResponse {
  result: boolean;
  data: SphereEngineResultData[];
}

// Define the compiler language IDs
const languageIds = {
  javascript: 112,
  python: 113,
  c: 114,
  cpp: 115,
  java: 116,
};

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
 * @desc    Submit code for compilation and execution
 * @route   POST /api/compiler/submit
 * @access  Public
 */
export const submitCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, language, input, timeLimit } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      success: false,
      message: "Code and language are required",
    });
  }

  if (!languageIds[language as keyof typeof languageIds]) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid language. Supported languages: javascript, python, c, cpp, java",
    });
  }

  // Construct form data for the Sphere Engine API
  const formData = new URLSearchParams();
  formData.append("widget_form[custom_data]", "");
  formData.append("widget_form[time_limit]", timeLimit?.toString() || "5");
  formData.append("widget_form[_token]", process.env.SPHERE_ENGINE_TOKEN || "");
  formData.append("widget_form[source]", code);
  formData.append(
    "widget_form[compiler]",
    languageIds[language as keyof typeof languageIds].toString(),
  );
  formData.append("widget_form[input]", input || "");

  try {
    // Submit code to the Sphere Engine API
    const apiEndpoint = process.env.SPHERE_ENGINE_SUBMIT_URL || "";
    const submitResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        Referer:
          "https://compilers.widgets.sphere-engine.com/d5c96ef667b9da6b01b891f2d47ffd8c",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: formData.toString(),
    });

    if (!submitResponse.ok) {
      return res.status(submitResponse.status).json({
        success: false,
        message: "Failed to submit code to compilation service",
      });
    }

    const submitData =
      (await submitResponse.json()) as SphereEngineSubmitResponse;
    console.log("submitData : ", submitData);

    if (!submitData.result) {
      return res.status(400).json({
        success: false,
        message: "Code submission failed",
        errors: submitData.errors || [],
      });
    }

    // Get the submission ID for checking status
    const submissionId = submitData.data.id;

    // Return the submission ID for client to poll for results
    return res.status(200).json({
      success: true,
      message: "Code submitted successfully",
      data: {
        submissionId,
      },
    });
  } catch (error) {
    console.error("Error in code submission:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during code submission",
    });
  }
});

/**
 * @desc    Get code execution results
 * @route   GET /api/compiler/result/:submissionId
 * @access  Public
 */
export const getCodeResult = asyncHandler(
  async (req: Request, res: Response) => {
    const { submissionId } = req.params;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: "Submission ID is required",
      });
    }

    try {
      // Get result from the Sphere Engine API
      const apiEndpoint = `${process.env.SPHERE_ENGINE_STATUS_URL}/${submissionId}`;
      const resultResponse = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          Referer:
            "https://compilers.widgets.sphere-engine.com/d5c96ef667b9da6b01b891f2d47ffd8c",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      });

      if (!resultResponse.ok) {
        return res.status(resultResponse.status).json({
          success: false,
          message: "Failed to get code execution results",
        });
      }

      const resultData =
        (await resultResponse.json()) as SphereEngineStatusResponse;

      if (!resultData.result) {
        return res.status(400).json({
          success: false,
          message: "Failed to get code execution results",
        });
      }

      // Check if code is still executing
      if (resultData.data[0]?.executing) {
        return res.status(200).json({
          success: true,
          message: "Code is still executing",
          data: {
            status: "executing",
            submissionId,
          },
        });
      }

      // Return final result
      return res.status(200).json({
        success: true,
        message: "Code execution completed",
        data: {
          status: "completed",
          ...resultData.data[0],
        },
      });
    } catch (error) {
      console.error("Error in getting code result:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during result retrieval",
      });
    }
  },
);
