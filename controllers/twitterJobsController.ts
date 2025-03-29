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
          "rNWEl5p9x7Atz+AyQGTvCmX5ywV4jYFI440gJrMcCLV9ZY4IvmpJBbKJwvujiS+jeNYBNK8JN9YEleu5+pXaDPI5FfvErw",
        "x-client-uuid": "4d2cc102-7c9f-41ec-8078-0c2a774fddf5",
        "x-csrf-token":
          "a81ee77313eb00f5ee68c5f0797baa16fb4eed64ccd749b2065e3a3484bcf9fd2901b45bd2c472d4e7e2580a1a258596574e21e44984c0c038b1f1821830dff962dbbbbc73a8fb677f3928b5d955589f",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
        cookie:
          'night_mode=2; kdt=dqdM1Qk1r2PqvPM5QoXUvvei4BuWSjyNRNzEBqgf; lang=en; _ga=GA1.1.1112572781.1739103139; _ga_Z8SSQG6MF6=GS1.1.1739103139.1.0.1739103148.51.0.0; dnt=1; __cf_bm=VkJG0K6.Q0B5Hc1DHumUgAtUR_j_IH0pMZOVbdbUFIM-1743261783-1.0.1.1-KgYZBPqhVzbixuA8CXPwnh.8QgDsCpnoZeLsKF0K4OAbfsJGxHcxw6PBt.G1nrmw8KI5VTqdEfU0iyEru0wcnhn9HAV1hwzWOquATatBhuo; guest_id=v1%3A174326179282981614; guest_id_marketing=v1%3A174326179282981614; guest_id_ads=v1%3A174326179282981614; gt=1906004221285269918; att=1-EgrX0dOh6ZJN4jjhds4S3DzCV168c4SysOO7y3oz; _twitter_sess=BAh7BiIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7AA%253D%253D--1164b91ac812d853b877e93ddb612b7471bebc74; auth_token=8fa8bac812aadc863bb48a0d9ea7bae0875476da; ct0=a81ee77313eb00f5ee68c5f0797baa16fb4eed64ccd749b2065e3a3484bcf9fd2901b45bd2c472d4e7e2580a1a258596574e21e44984c0c038b1f1821830dff962dbbbbc73a8fb677f3928b5d955589f; twid=u%3D1906004479004327936; personalization_id="v1_F613Sy+XauvaZir0LqqfJg=="',
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
          "Bn8uPTDXbRqHZUqY6s5FoM9TYa/SJyviSSeKjBm2oh/XzySiFMDjrxgjaFEJI4UJ0n2rngWjc/CsU7RWCrbnJaN6KDvrBQ",
        "x-client-uuid": "4d2cc102-7c9f-41ec-8078-0c2a774fddf5",
        "x-csrf-token":
          "a81ee77313eb00f5ee68c5f0797baa16fb4eed64ccd749b2065e3a3484bcf9fd2901b45bd2c472d4e7e2580a1a258596574e21e44984c0c038b1f1821830dff962dbbbbc73a8fb677f3928b5d955589f",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
        cookie:
          'night_mode=2; kdt=dqdM1Qk1r2PqvPM5QoXUvvei4BuWSjyNRNzEBqgf; lang=en; _ga=GA1.1.1112572781.1739103139; _ga_Z8SSQG6MF6=GS1.1.1739103139.1.0.1739103148.51.0.0; dnt=1; __cf_bm=VkJG0K6.Q0B5Hc1DHumUgAtUR_j_IH0pMZOVbdbUFIM-1743261783-1.0.1.1-KgYZBPqhVzbixuA8CXPwnh.8QgDsCpnoZeLsKF0K4OAbfsJGxHcxw6PBt.G1nrmw8KI5VTqdEfU0iyEru0wcnhn9HAV1hwzWOquATatBhuo; guest_id=v1%3A174326179282981614; guest_id_marketing=v1%3A174326179282981614; guest_id_ads=v1%3A174326179282981614; gt=1906004221285269918; att=1-EgrX0dOh6ZJN4jjhds4S3DzCV168c4SysOO7y3oz; _twitter_sess=BAh7BiIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7AA%253D%253D--1164b91ac812d853b877e93ddb612b7471bebc74; auth_token=8fa8bac812aadc863bb48a0d9ea7bae0875476da; ct0=a81ee77313eb00f5ee68c5f0797baa16fb4eed64ccd749b2065e3a3484bcf9fd2901b45bd2c472d4e7e2580a1a258596574e21e44984c0c038b1f1821830dff962dbbbbc73a8fb677f3928b5d955589f; twid=u%3D1906004479004327936; personalization_id="v1_F613Sy+XauvaZir0LqqfJg=="',
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
