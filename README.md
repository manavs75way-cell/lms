# Library Management System

A full-stack library management system with a React frontend and Node.js backend, designed to manage books, borrowing, reservations, and user accounts.

## Project Overview

This application provides a comprehensive solution for library operations including:
- User authentication and profile management
- Book catalog browsing and searching
- Book reservation and borrowing system
- Reading history tracking
- Automated notifications for due dates and overdue items
- Admin functionality for book and user management

## Architecture

The project is organized as a monorepo with two main components:

### Client (Frontend)
- **Location**: `./client`
- **Technology**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

### Server (Backend)
- **Location**: `./server`
- **Technology**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based
- **File Storage**: Cloudinary

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd assement-5
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Configure environment variables:

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Server** (`server/.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Running the Application

#### Development Mode

Run both client and server concurrently:

**Terminal 1 - Client**:
```bash
cd client
npm run dev
```
The client will be available at `http://localhost:5173`

**Terminal 2 - Server**:
```bash
cd server
npm run dev
```
The server will run at `http://localhost:5000`

#### Production Build

**Client**:
```bash
cd client
npm run build
npm run preview
```

**Server**:
```bash
cd server
npm run build
npm start
```

## Project Structure

```
assement-5/
├── client/              # React frontend application
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── components/  # Reusable components
│   │   ├── store/       # Redux store
│   │   └── routes/      # Route definitions
│   └── package.json
├── server/              # Express backend application
│   ├── src/
│   │   ├── modules/     # Feature modules (auth, book, borrow, etc.)
│   │   ├── middleware/  # Express middleware
│   │   ├── config/      # Configuration
│   │   └── scripts/     # Utility scripts
│   └── package.json
└── requiremt.txt        # Project requirements and checklist
```

## Key Features

### User Features
- User registration and authentication
- Browse and search book catalog
- Reserve and borrow books
- View borrowing history
- Track reading progress
- Receive notifications for due dates

### Admin Features
- Manage book inventory
- Add/edit/remove books
- Track all borrowing and reservations
- User management
- Generate reports

### Technical Features
- Type-safe codebase with TypeScript
- Form validation with React Hook Form and Zod
- Secure authentication with JWT
- File upload with Cloudinary integration
- Rate limiting for API protection
- Responsive design with Tailwind CSS
- Error boundaries and proper error handling

## Development Guidelines

This project follows best practices outlined in `requiremt.txt`, including:
- Proper folder structure and code organization
- Service-controller pattern separation
- Type safety (avoiding `any` types)
- Form handling with React Hook Form
- Proper validation with Zod
- Error boundaries and error handling
- Protected routes implementation
- Memoization where needed
- No inline styling
- Proper import organization

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run seed:books` - Seed database with sample books
- `npm run notifications:check` - Check pending notifications

## Documentation

For detailed information about each component:
- [Client Documentation](./client/README.md)
- [Server Documentation](./server/README.md)

## Technology Stack Summary

**Frontend**:
- React, TypeScript, Vite
- Redux Toolkit, React Router
- Tailwind CSS, Heroicons, Lucide React
- React Hook Form, Zod
- date-fns

**Backend**:
- Node.js, Express, TypeScript
- MongoDB, Mongoose
- JWT, bcryptjs
- Multer, Cloudinary
- Helmet, CORS, Rate Limiting
- Zod validation

## Contributing

When contributing to this project, please ensure:
1. Follow the existing code structure and patterns
2. Maintain type safety (no `any` types)
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## License

This project is part of an assessment and is intended for educational purposes.
