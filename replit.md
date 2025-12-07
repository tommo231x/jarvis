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
The server requires the following environment variables:
- `PORT`: Server port (default: 3001 in dev, 5000 in production)
- `JWT_SECRET`: Secret key for JWT authentication
- `JARVIS_OPENAI_API_KEY`: Custom OpenAI API key for AI features (uses gpt-5.1 model)

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

## Sample Data
The system comes pre-loaded with realistic demo data:

**Messages (12 emails):**
- Netflix receipt, Apple subscription renewal, Gmail login alert
- HMRC tax notice, Trust fund statement, Amazon marketing
- Revolut bank transaction, Spotify payment decline, EE bill
- PayPal password reset, TechCrunch newsletter, Stripe payout

**Services (7):** Netflix, Spotify, Amazon Prime, iCloud+, EE Mobile, Revolut, Stripe

**Identities (2):** Primary Gmail (personal), Work Email (corporate)

**Projects (1):** Jarvis Identity Hub

## Recent Changes (December 7, 2025)
- Configured for Replit environment
- Updated Vite to run on port 5000 with host 0.0.0.0
- Changed backend port to 3001 to avoid conflicts
- Added static file serving for production deployment
- Set up deployment configuration for autoscale
- Created workflow to run both frontend and backend concurrently
- Configured JARVIS_OPENAI_API_KEY for custom OpenAI integration
- Fixed Vite proxy to use IPv6 address (::1) for backend connection
- Added /status endpoints as public (no auth required) for API monitoring
- Added API Connections monitoring card to Command Center dashboard
- Added Message model and routes for inbox messages
- Created 12 realistic sample emails with proper categories
- Added 7 sample services with costs and billing info
- Added 2 sample email identities and 1 project
- Upgraded ChatWidget with enhanced UX:
  - Violet/indigo gradient design matching Jarvis theme
  - Chat history persistence in localStorage
  - Clear conversation button (disabled when empty)
  - Expand/minimize window toggle
  - Copy message to clipboard
  - Timestamps on all messages
  - Quick action buttons for common queries
  - Loading animation with bounce effect
  - GPT-5.1 model indicator
