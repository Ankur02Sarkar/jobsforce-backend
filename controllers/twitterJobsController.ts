import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";

// Define response types for better type safety
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  count?: number;
  message?: string;
}

/**
 * Helper function to fetch jobs from the Twitter GraphQL endpoint
 * @param count - Number of jobs to fetch
 * @param cursor - Pagination cursor
 * @param keyword - Search keyword
 * @param job_location_id - Location ID
 * @param job_location - Location string
 * @param job_location_type - Array of location types
 * @param seniority_level - Array of seniority levels
 * @param company_name - Company name filter
 * @param employment_type - Array of employment types
 * @param industry - Industry filter
 * @returns Twitter jobs data
 */
async function fetchTwitterJobs(
  count: number,
  cursor: unknown,
  keyword: string,
  job_location_id: number | null,
  job_location: string,
  job_location_type: unknown[],
  seniority_level: unknown[],
  company_name: string | null,
  employment_type: unknown[],
  industry: string | null,
) {
  // Construct the variables object using the provided parameters
  const variables = {
    count,
    cursor,
    searchParams: {
      keyword,
      job_location_id,
      job_location,
      job_location_type,
      seniority_level,
      company_name,
      employment_type,
      industry,
    },
  };

  // Stringify and encode the variables for safe URL usage
  const variablesStr = JSON.stringify(variables);
  const encodedVariables = encodeURIComponent(variablesStr);

  // Base URL for the Twitter GraphQL endpoint
  const baseUrl =
    "https://x.com/i/api/graphql/JyATh-zc07YHeyDDl3rDgg/JobSearchQueryScreenJobsQuery";
  // Construct the final URL with the encoded query parameters
  const url = `${baseUrl}?variables=${encodedVariables}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
        authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-client-transaction-id":
          "ufG3vVITJZTH7nxHB4I7wNp8ar9xDoFwyWSkUN8aTH6M5vYAYhVdVQ+s9KfrP+8vV5FaK7rLnV9AEIc1L7/YJcAS0y9qug",
        "x-client-uuid": "958cd791-55d4-4157-a6f3-a3d5e04dcd8d",
        "x-csrf-token":
          "6b40994b2f9fdb3403eaac106c783106d17db771afeb1adfe480df7111d662d9d808971bc94c97c3873de19f6307e27c89efd024ea03f60e5da2d06f58a074cf332a3107b353ee71a0f03481a0e54c50",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
        cookie:
          'night_mode=2; kdt=dqdM1Qk1r2PqvPM5QoXUvvei4BuWSjyNRNzEBqgf; lang=en; _ga=GA1.1.1112572781.1739103139; _ga_Z8SSQG6MF6=GS1.1.1739103139.1.0.1739103148.51.0.0; dnt=1; __cf_bm=ix5DbPYzYPaTAa_j50v13VLCSh8AtXb9rN8G4Bh9xVQ-1742882255-1.0.1.1-Dg.d2SMnUQtIQdSkOdE2l04LUdQncmerXjfrti6D8lF2v.XnFRuOTPxlynjXm4tMYjZxwOTo4nICVWwsoLmxZyuDZejTh9oRb7uBJIlPABs; att=1-isNfq5u7HCfWALpc7qTk5UUANREVIB6vN1K1egkZ; guest_id=v1%3A174288229009956697; guest_id_marketing=v1%3A174288229009956697; guest_id_ads=v1%3A174288229009956697; gt=1904412471454261373; _twitter_sess=BAh7CSIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCD1L4cuVAToMY3NyZl9p%250AZCIlNzM3MGZhZDI2MTA0ZmI3NDljYWQzZWYwN2VjNmRmODU6B2lkIiVmNTJh%250ANTEyZmM2ZGZkOGJmOTc4NDFjMDkzM2QzYmNiOQ%253D%253D--cfe3efc86f3d593eae45914d07727db7071e3f16; auth_token=6d8b7f4c5210b1dfad85ec37243704277e45e5bf; twid=u%3D1904412626014388225; ct0=6b40994b2f9fdb3403eaac106c783106d17db771afeb1adfe480df7111d662d9d808971bc94c97c3873de19f6307e27c89efd024ea03f60e5da2d06f58a074cf332a3107b353ee71a0f03481a0e54c50; personalization_id="v1_F613Sy+XauvaZir0LqqfJg=="',
        Referer: `https://x.com/jobs?q=${keyword}&lstr=${job_location}`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Twitter jobs:", error);
    throw error;
  }
}

/**
 * @desc    Fetch Twitter jobs based on search criteria
 * @route   POST /api/xjobs
 * @access  Private
 */
export const getTwitterJobs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Extract necessary variables from the request body
    const {
      count,
      cursor,
      keyword,
      job_location_id,
      job_location,
      job_location_type,
      seniority_level,
      company_name,
      employment_type,
      industry,
    } = req.body;

    // Validate required input parameters
    const missingParams: string[] = [];
    if (count === undefined) missingParams.push("count");
    if (cursor === undefined) missingParams.push("cursor");
    if (!keyword) missingParams.push("keyword");
    if (job_location_id === undefined) missingParams.push("job_location_id");
    if (!job_location) missingParams.push("job_location");
    if (!job_location_type) missingParams.push("job_location_type");
    if (!seniority_level) missingParams.push("seniority_level");
    if (company_name === undefined) missingParams.push("company_name");
    if (!employment_type) missingParams.push("employment_type");
    if (industry === undefined) missingParams.push("industry");

    if (missingParams.length > 0) {
      throw new ApiError(
        `Missing parameters: ${missingParams.join(", ")}`,
        400,
      );
    }

    // Call the helper function with parsed inputs
    const twitterJobs = await fetchTwitterJobs(
      count,
      cursor,
      keyword,
      job_location_id,
      job_location,
      job_location_type,
      seniority_level,
      company_name,
      employment_type,
      industry,
    );

    // Return the fetched Twitter job data as JSON
    res.status(200).json({
      success: true,
      data: twitterJobs,
    });
  },
);

/**
 * Helper function to fetch job details by ID from Twitter GraphQL API
 * @param jobId - The Twitter job ID to fetch details for
 * @param loggedIn - Whether the user is logged in (affects response data)
 * @returns Twitter job details data
 */
async function fetchTwitterJobById(jobId: string, loggedIn: boolean) {
  // Construct the variables object
  const variables = {
    jobId,
    loggedIn,
  };

  // Encode variables for safe URL usage
  const variablesStr = JSON.stringify(variables);
  const encodedVariables = encodeURIComponent(variablesStr);

  // Base URL for the Twitter GraphQL job details endpoint
  const baseUrl =
    "https://x.com/i/api/graphql/lkS1Zj_iyLY_hmJCQIqqJg/JobScreenQuery";

  // Construct the final URL with encoded query parameters
  const url = `${baseUrl}?variables=${encodedVariables}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
        authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-client-transaction-id":
          "HFQSGPe2gDFiS9nioieeZX/ZzxrUqyTVbMEB9Xq/6dspQ1Olx7D48KoJUQJOmkqK8jT/jh+Wo0+io74O/wR145J6FbzNHw",
        "x-client-uuid": "958cd791-55d4-4157-a6f3-a3d5e04dcd8d",
        "x-csrf-token":
          "6b40994b2f9fdb3403eaac106c783106d17db771afeb1adfe480df7111d662d9d808971bc94c97c3873de19f6307e27c89efd024ea03f60e5da2d06f58a074cf332a3107b353ee71a0f03481a0e54c50",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
        cookie:
          'night_mode=2; kdt=dqdM1Qk1r2PqvPM5QoXUvvei4BuWSjyNRNzEBqgf; lang=en; _ga=GA1.1.1112572781.1739103139; _ga_Z8SSQG6MF6=GS1.1.1739103139.1.0.1739103148.51.0.0; dnt=1; __cf_bm=ix5DbPYzYPaTAa_j50v13VLCSh8AtXb9rN8G4Bh9xVQ-1742882255-1.0.1.1-Dg.d2SMnUQtIQdSkOdE2l04LUdQncmerXjfrti6D8lF2v.XnFRuOTPxlynjXm4tMYjZxwOTo4nICVWwsoLmxZyuDZejTh9oRb7uBJIlPABs; att=1-isNfq5u7HCfWALpc7qTk5UUANREVIB6vN1K1egkZ; guest_id=v1%3A174288229009956697; guest_id_marketing=v1%3A174288229009956697; guest_id_ads=v1%3A174288229009956697; gt=1904412471454261373; _twitter_sess=BAh7CSIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCD1L4cuVAToMY3NyZl9p%250AZCIlNzM3MGZhZDI2MTA0ZmI3NDljYWQzZWYwN2VjNmRmODU6B2lkIiVmNTJh%250ANTEyZmM2ZGZkOGJmOTc4NDFjMDkzM2QzYmNiOQ%253D%253D--cfe3efc86f3d593eae45914d07727db7071e3f16; auth_token=6d8b7f4c5210b1dfad85ec37243704277e45e5bf; twid=u%3D1904412626014388225; ct0=6b40994b2f9fdb3403eaac106c783106d17db771afeb1adfe480df7111d662d9d808971bc94c97c3873de19f6307e27c89efd024ea03f60e5da2d06f58a074cf332a3107b353ee71a0f03481a0e54c50; personalization_id="v1_F613Sy+XauvaZir0LqqfJg=="',
        Referer:
          "https://x.com/jobs/1874245712197935104?q=frontend%20dev&lstr=bangalore",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Twitter job by ID:", error);
    throw error;
  }
}

/**
 * @desc    Fetch Twitter job details by job ID
 * @route   POST /api/xjobs/details
 * @access  Private
 */
export const getTwitterJobById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Extract jobId and loggedIn status from request body
    const { jobId, loggedIn } = req.body;

    // Validate required parameters
    if (!jobId) {
      throw new ApiError("Missing required parameter: jobId", 400);
    }

    // Fetch job details using the helper function
    const jobDetails = await fetchTwitterJobById(jobId, loggedIn ?? true);

    // Return job details as JSON
    res.status(200).json({
      success: true,
      data: jobDetails,
    });
  },
);

/**
 * Handle errors from Prisma and other sources
 * @param error - The caught error
 * @param res - Express response object
 */
export const handleError = async (
  error: unknown,
  res: Response,
): Promise<void> => {
  console.error("Error:", error);

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: "SERVER_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    },
  };

  res.status(500).json(response);
};
