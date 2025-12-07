# Jarvis Identity Hub

## Overview
A personal "Internal Tools" application designed to manage digital identity, subscriptions, and project contexts. This is a full-stack TypeScript application with a React frontend and Express backend.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, File-based JSON DB
- **AI**: OpenAI API integration (optional, for AI search features)

## Project Structure
```
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   └── types/       # TypeScript types
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes.ts    # API routes
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── db.ts        # Database utilities
│   │   └── index.ts     # Server entry point
│   └── package.json
└── package.json         # Root monorepo scripts
```

## Development Setup

### Environment Variables
The server requires the following environment variables in `server/.env`:
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT authentication
- `OPENAI_API_KEY`: OpenAI API key (optional, only needed for AI features)

### Running Locally
The application runs on:
- **Frontend**: http://0.0.0.0:5000 (Vite dev server)
- **Backend**: http://localhost:3001 (Express API)

The frontend proxies API requests to the backend automatically.

### Key Features
1. **Identity Hub**: Manage email identities and service credentials
2. **Service Management**: Track subscription costs, billing cycles, and renewal dates
3. **Project Association**: Group assets into project contexts
4. **AI Search**: Natural language interface to query data (requires OpenAI API key)
5. **Dashboard**: Live metrics on monthly costs and active projects
6. **Authentication**: JWT-based login and registration

## Deployment
For production deployment:
1. Build the client and server
2. The server serves static files from `client/dist` in production mode
3. All routes run on port 5000 in production

## Recent Changes (December 7, 2025)
- Configured for Replit environment
- Updated Vite to run on port 5000 with host 0.0.0.0
- Changed backend port to 3001 to avoid conflicts
- Added static file serving for production deployment
- Set up deployment configuration for autoscale
- Created workflow to run both frontend and backend concurrently
