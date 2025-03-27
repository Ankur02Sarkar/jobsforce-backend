/**
 * Sample Code to demonstrate the usage of the Code Compiler API
 */

// Sample JavaScript code to be compiled and executed
const sampleCode = `
// Two Sum solution
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

// Read input directly
const input = [2, 7, 11, 15];  // You can modify this array directly
const target = 9;              // You can modify the target directly

// Calculate and display result
const result = twoSum(input, target);
if (result.length === 0) {
    console.log("No solution found!");
} else {
    console.log(\`Found solution! Numbers at indices \${result[0]} and \${result[1]} add up to \${target}\`);
}
`;

// API request for code submission
async function submitCodeToAPI() {
  try {
    const response = await fetch("http://localhost:8000/api/compiler/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: sampleCode,
        language: "javascript",
        input: "2,7,11,15",
        timeLimit: 5,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("Failed to submit code:", data.message);
      return;
    }

    console.log(
      "Code submitted successfully. Submission ID:",
      data.data.submissionId
    );

    // Now check for results
    return checkResults(data.data.submissionId);
  } catch (error) {
    console.error("Error submitting code:", error);
  }
}

// API request to get execution results
async function checkResults(submissionId) {
  try {
    // Poll for results (in production, you would implement a proper polling mechanism with backoff)
    const maxAttempts = 10;
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      const response = await fetch(
        `http://localhost:8000/api/compiler/result/${submissionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to get results: " + data.message);
      }

      if (data.data.status === "executing" && attempts < maxAttempts) {
        // Still executing, wait and try again
        console.log(
          `Code still executing, checking again in 1 second (attempt ${attempts}/${maxAttempts})...`
        );
        return new Promise((resolve) =>
          setTimeout(() => resolve(checkStatus()), 1000)
        );
      }

      return data;
    };

    return checkStatus();
  } catch (error) {
    console.error("Error checking results:", error);
  }
}

// Example usage
/*
submitCodeToAPI().then(result => {
  if (result && result.data.status === 'completed') {
    console.log('Code execution completed with result:');
    console.log('Output:', result.data.output?.data);
    console.log('Execution time:', result.data.time, 'seconds');
    console.log('Memory used:', result.data.memory, 'KB');
    
    if (result.data.error?.data) {
      console.error('Errors:', result.data.error.data);
    }
  }
});
*/

// Export functions for use in other files
// module.exports = {
//   submitCodeToAPI,
//   checkResults,
// };

submitCodeToAPI();