const formData = `
widget_form[custom_data]=&widget_form[time_limit]=5&widget_form[_token]=k8d6BSkq3JkBlrSZOlTJcOhANMWLhTw0sfZxd5sVg5M&widget_form[source]=// Two Sum solution
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
    console.log(\`Found solution! Numbers at indices ${result[0]} and ${result[1]} add up to ${target}\`);
}&widget_form[compiler]=${languageIds.javascript}&widget_form[input]=2,7,11,15
`;

const languageIds = {
  javascript: 112,
  python: 113,
  c: 114,
  cpp: 115,
  java: 116,
};

fetch(
  "https://compilers.widgets.sphere-engine.com/_submit/d5c96ef667b9da6b01b891f2d47ffd8c",
  {
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
      cookie: "_ga=GA10",
      Referer:
        "https://compilers.widgets.sphere-engine.com/d5c96ef667b9da6b01b891f2d47ffd8c?place_id=widget-0&sdk=1&se_signature=305afd417929ca3e8da46f6c2bbbc6b9b90d86287be778258b375ff6e876fbb4&se_nonce=113316da6db68451972389659bc98d95a5039a10&se_theme=sphere_engine",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: formData,
    method: "POST",
  }
);

/*
Response :- 
{
    "result": true,
    "errors": [],
    "message": "running!",
    "data": {
        "id": 3371610,
        "api_id": 877991173,
        "language_id": 112
    }
}
*/

///////////////////// Code Result //////////////////////
const codeResultId = 3371610
fetch(
  `https://compilers.widgets.sphere-engine.com/_statuses/d5c96ef667b9da6b01b891f2d47ffd8c/${codeResultId}`,
  {
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
      cookie: "_ga=GA1.167465.1.1.1743067859.0.0.0",
      Referer:
        "https://compilers.widgets.sphere-engine.com/d5c96ef667b9da6b01b891f2d47ffd8c?place_id=widget-0&sdk=1&se_signature=305afd417929ca3e8da46f6c2bbbc6b9b90d86287be778258b375ff6e876fbb4&se_nonce=113316da6db68451972389659bc98d95a5039a10&se_theme=sphere_engine",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  }
);

///////////////////// Response //////////////////////

/*
Response Type 1 :- (if data.executing is true then the code is still running and call this api after sometime untill it is false and then youll get response 2)
{
    "result": true,
    "data": [
        {
            "id": 3371628,
            "api_id": 877995159,
            "status": 3,
            "executing": true,
            "signal": {
                "number": 0
            },
            "time": 0,
            "memory": 0
        }
    ]
}

Response Type 2 :-
{
    "result": true,
    "data": [
        {
            "id": 3371628,
            "api_id": 877995159,
            "status": 15,
            "executing": false,
            "signal": {
                "number": 0
            },
            "time": 0.058096,
            "memory": 14232,
            "input": {
                "data": "2,7,11,15",
                "isHtml": false,
                "originSize": 9,
                "size": 9,
                "isFull": true
            },
            "output": {
                "data": "Found solution! Numbers at indices 0 and 1 add up to 9\n",
                "isHtml": false,
                "originSize": 55,
                "size": 55,
                "isFull": true
            },
            "error": {
                "data": "",
                "isHtml": false,
                "originSize": 0,
                "size": 0,
                "isFull": true
            },
            "cmpinfo": {
                "data": "",
                "isHtml": false,
                "originSize": 0,
                "size": 0,
                "isFull": true
            }
        }
    ]
}
*/