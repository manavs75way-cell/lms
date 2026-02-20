# Library Management System - Client

Frontend application for the Library Management System built with React, TypeScript, and Vite.

## Technology Stack

- **Framework**: React 18.2
- **Build Tool**: Vite 5.2
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.4
- **State Management**: Redux Toolkit 2.2
- **Routing**: React Router DOM 6.22
- **Form Handling**: React Hook Form 7.71 with Zod validation
- **Icons**: Heroicons 2.2, Lucide React 0.368
- **Date Utilities**: date-fns 4.1

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the client directory with necessary configuration (API endpoint, etc.)

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot module replacement.
The application will be available at `http://localhost:5173` (default Vite port).

### Build
```bash
npm run build
```
Compiles TypeScript and builds the production-ready application to the `dist` directory.

### Preview
```bash
npm run preview
```
Previews the production build locally.

### Lint
```bash
npm run lint
```
Runs ESLint to check code quality and style issues.

## Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── modules/     # Feature modules (auth, books, etc.)
│   ├── components/  # Reusable components
│   ├── store/       # Redux store configuration
│   ├── routes/      # Route definitions
│   ├── utils/       # Utility functions
│   └── App.tsx      # Main application component
├── index.html       # HTML entry point
└── vite.config.ts   # Vite configuration
```

## Features

- **Auth & Profiles**: Secure registration, login, and profile management with QR personal identifiers.
- **Catalog Exploration**: Advanced search and browsing across multi-library collections.
- **Borrowing & Reservations**: Real-time status tracking for active rentals and priority-based reservation queue.
- **Explainable Recommendations**: AI-driven suggestions with "Explainable AI" badges showing the rationale.
- **Reading History**: Detailed tracking of past reads and current progress.
- **Consortium Support**: Seamless experience across a network of libraries.
- **Type-Safe Forms**: End-to-end type safety using React Hook Form and Zod.

## Development Guidelines

- **Strict Type Safety**: A zero `any` policy is enforced. All components, hooks, and services must be fully typed.
- **Form Patterns**: Use `React Hook Form` combined with `Zod` schemas for validation.
- **Component Design**: Follow a modular, atomic approach with clear separation of concerns.
- **Modern Styling**: Use Tailwind CSS consistently; avoid inline styles.
- **Error Handling**: Use the built-in `ErrorBoundary` components for graceful failure recovery.
- **Clean Code**: Ensure imports are organized and code is self-documenting.

## Build Output

The production build will be generated in the `dist` directory and can be deployed to any static hosting service.
