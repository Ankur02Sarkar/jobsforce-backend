# JobsForce Backend

A robust backend API for the JobsForce platform built with Express.js, TypeScript, and MongoDB.

## Project Structure

```
jobsforce-backend/
├── api/
│   └── index.ts              # Main application entry point
├── config/
│   └── db.js                 # Database connection setup
├── controllers/
│   ├── authController.ts     # Authentication logic
│   ├── userController.ts     # User management logic
│   ├── twitterJobsController.ts # Twitter job scraping logic
│   ├── codeCompilerController.ts # Code compilation and execution 
│   └── aiController.ts       # AI-powered code analysis
├── middlewares/
│   └── auth.ts               # Authentication middleware
├── models/
│   ├── User.ts               # User data model
│   └── AIAnalysis.ts         # AI analysis data model
├── routes/
│   ├── authRoutes.ts         # Authentication routes
│   ├── userRoutes.ts         # User management routes
│   ├── twitterJobsRoutes.ts  # Twitter job routes
│   ├── codeCompilerRoutes.ts # Code compiler routes
│   └── aiRoutes.ts           # AI analysis routes
├── services/
│   └── openaiService.ts      # OpenAI integration service
├── docs/
│   └── ai-features.md        # AI features documentation
├── utils/
│   └── errorHandler.js       # Error handling utilities
├── .env.example              # Example environment variables
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── vercel.json              # Vercel deployment configuration
```

## Setup and Installation

### Prerequisites
- Node.js 18.x or later
- Bun runtime
- MongoDB
- OpenAI API key (for AI features)

### Environment Variables
Copy the example environment file and modify as needed:
```bash
cp .env.example
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `PORT`: Port for the server (default: 3000)
- `CLERK_WEBHOOK_SECRET`: Clerk Webhhok Secret
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `FRONTEND_URL`: Your site URL for OpenAI referrer tracking
- `SPHERE_ENGINE_TOKEN`: Sphere Engine token for code compilation
- `SPHERE_ENGINE_SUBMIT_URL`: Sphere Engine submission URL
- `SPHERE_ENGINE_STATUS_URL`: Sphere Engine status check URL

### Installation

```bash
# Install dependencies
bun install

# Development mode with hot reloading
bun dev

# Production mode
bun start
```

## Architecture and Design

### API Design
The API follows RESTful principles with resource-based routing. Core endpoints include:
- Auth: `/api/auth/*` - User registration, login, and token management
- Users: `/api/users/*` - User profile management
- Twitter Jobs: `/api/xjobs/*` - Job scraping from Twitter
- Code Compiler: `/api/compiler/*` - Code compilation and execution
- AI Features: `/api/ai/*` - AI-powered code analysis and optimization

### Security
- JWT-based authentication with refresh tokens
- Password hashing using bcrypt
- CORS protection with configurable origins
- Request validation and sanitization
- Environment variables for sensitive information

### Scalability
- MongoDB for scalable data storage
- Express.js for request handling with middleware architecture
- Modular codebase with separation of concerns (routes, controllers, models)
- Error handling middleware for consistent error responses

### Code Quality
- TypeScript for static type checking
- Biome for code linting and formatting
- Modular architecture for maintainability and reusability

### AI Features
The platform includes several AI-powered features to assist with competitive programming:

1. **Algorithm Analysis**: Analyze code to identify algorithms and suggest improvements
2. **Complexity Analysis**: Calculate time and space complexity of solutions
3. **Code Optimization**: Suggest optimized versions focusing on time or space efficiency
4. **Test Case Generation**: Generate comprehensive test cases, including edge cases

These features are powered by OpenAI
For detailed documentation on AI features, see [AI Features Documentation](docs/ai-features.md).

## Development Workflow

### Code Formatting and Linting
```bash
# Fix linting issues
bun lint:fix

# Format code
bun format

# Check code
bun check
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow for continuous integration that runs automatically when:
- Code is pushed to the main branch
- A pull request is opened or updated against the main branch

### CI Pipeline Components:

1. **Linting and Formatting**:
   - Runs Biome to check and format code according to project standards
   - Ensures consistent code style across the codebase

2. **Security Checks**:
   - Scans code for hardcoded secrets or API keys using Gitleaks
   - Runs npm audit to identify security vulnerabilities in dependencies

The deployment is handled automatically by Vercel when changes are pushed to the main branch.

## Deployment
The application is configured for deployment on Vercel with the included `vercel.json` configuration.
