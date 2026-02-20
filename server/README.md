# Library Management System - Server

Backend API for the Library Management System built with Node.js, Express, TypeScript, and MongoDB.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express 4.19
- **Language**: TypeScript 5.4
- **Database**: MongoDB with Mongoose 8.3
- **Authentication**: JWT (jsonwebtoken 9.0) with bcryptjs 3.0
- **File Upload**: Multer 2.0 with Cloudinary integration
- **Security**: Helmet 7.1, CORS 2.8, Express Rate Limit 7.2
- **Validation**: Zod 3.22
- **Utilities**: csv-parser 3.2, bwip-js 4.8 (barcode generation)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the server directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with nodemon for hot reloading.

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist` directory.

### Production
```bash
npm start
```
Runs the compiled production build from the `dist` directory.

### Lint
```bash
npm run lint
```
Runs ESLint to check code quality and style issues.

### Utilities
```bash
npm run notifications:check
```
Checks and processes pending notifications.

```bash
npm run seed:books
```
Seeds the database with sample book data.

## Project Structure

```
server/
├── src/
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── book/        # Book management
│   │   ├── borrow/      # Borrowing system
│   │   ├── reservation/ # Reservation system
│   │   └── user/        # User management
│   ├── middleware/      # Express middleware
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   ├── scripts/         # Utility scripts
│   ├── routes/          # Route definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── public/              # Static files
├── uploads/             # Uploaded files (gitignored)
└── dist/                # Compiled output
```

## API Architecture

The server follows a modular architecture with:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define MongoDB schemas with Mongoose
- **Routes**: Define API endpoints
- **Middleware**: Handle validation, authentication, and error handling

## Features

- **100% Type Safety**: Zero `any` types. Full end-to-end type safety across all services, controllers, and models.
- **Advanced Mongoose Typing**: Robust population interfaces (`PopulatedEdition`, `IBorrowWithCopy`) for type-safe document handling after `.populate()`.
- **Explainable Recommendation AI**: Hybrid engine (Content + Collaborative) providing explainable results tailored to user history.
- **Smart Catalog Import**: Fuzzy-deduplicated CSV import system with human-in-the-loop resolution for near-duplicates.
- **Dynamic Resource Analytics**: Real-time predictive hold forecasting using weighted moving averages.
- **Automated Workflows**: Daily notification checks and automated floating collection rebalancing.
- **Secure Infrastructure**: JWT auth with secure hashing, role-based controls, and rate-limiting.

## Security Features

- Helmet for HTTP header security
- CORS configuration
- Rate limiting to prevent abuse
- JWT token-based authentication
- Password hashing with bcryptjs
- Environment variable protection

## Database

The application uses MongoDB with Mongoose ODM. Key collections include:
- Users
- Books
- Borrows
- Reservations
- Notifications

## Development Guidelines

- **Zero `any` Policy**: The backend is 100% type-safe. No `any` types or unsafe casts are permitted.
- **Typed Populations**: Always use custom interfaces when working with populated Mongoose documents to ensure type safety.
- **Service-Controller Pattern**: Business logic resides exclusively in Services; Controllers handle entry/exit points.
- **Schema First Validation**: All data entry points must be validated against a Zod schema.
- **Clean Service Design**: Maintain granular, focused service functions to facilitate testing and readability.
- **Performance Focused**: Use targeted MongoDB indexing and avoid excessive data hydration where lean results suffice.

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Start the production server:
```bash
npm start
```

## API Documentation

The API endpoints are organized by modules:
- `/api/auth` - Authentication endpoints
- `/api/books` - Book management
- `/api/borrows` - Borrowing operations
- `/api/reservations` - Reservation management
- `/api/users` - User operations

Detailed API documentation should be maintained separately or using tools like Swagger/OpenAPI.
