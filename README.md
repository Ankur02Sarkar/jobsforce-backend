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
│   └── twitterJobsController.ts # Twitter job scraping logic
├── middlewares/
│   └── auth.ts               # Authentication middleware
├── models/
│   └── User.ts               # User data model
├── routes/
│   ├── authRoutes.ts         # Authentication routes
│   ├── userRoutes.ts         # User management routes
│   └── twitterJobsRoutes.ts  # Twitter job routes
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

### Environment Variables
Copy the example environment file and modify as needed:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `PORT`: Port for the server (default: 3000)
- `CLERK_WEBHOOK_SECRET`: Clerk Webhhok Secret

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

## Deployment
The application is configured for deployment on Vercel with the included `vercel.json` configuration.
