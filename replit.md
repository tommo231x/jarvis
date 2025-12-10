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
│   │   ├── models.ts    # TypeScript data models
│   │   └── index.ts     # Server entry point
│   ├── data/            # JSON data files
│   │   ├── identities.json
│   │   ├── emails.json
│   │   ├── services.json
│   │   ├── messages.json
│   │   └── projects.json
│   └── package.json
└── package.json         # Root monorepo scripts
```

## Data Architecture

### Hierarchical Model
The application uses a three-tier hierarchical structure:

1. **Identity** (top-level entity)
   - Categories: personal, work, business, project, alias
   - Contains multiple email addresses, services, and projects
   - Aggregates all digital presence under one umbrella

2. **Email** (belongs to Identity)
   - Represents email accounts (e.g., john@gmail.com)
   - Links to an Identity via `identityId`
   - Receives Messages

3. **Message** (belongs to Email)
   - Only stores "relevant" emails (bills, receipts, important notifications)
   - Not a comprehensive inbox sync
   - Categories: subscription, financial, security, marketing, notification, receipt

4. **Service** (belongs to Identity)
   - Tracks subscriptions with cost, billing cycle, status
   - Links to Identity via `identityId`
   - Optional email specification via `emailId`

5. **Project** (belongs to Identity)
   - Organizes work contexts
   - Links to Identity via `identityId`
   - Can have multiple linked services

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
1. **Identity Management**: Central hub for digital identities (personal, work, business)
2. **Email Accounts**: Manage email addresses grouped by identity
3. **Relevant Messages**: AI-filtered important emails only (not full inbox sync)
4. **Service Tracking**: Subscriptions with costs, billing cycles, renewal dates
5. **Project Organization**: Group assets into project contexts
6. **AI Search**: Natural language interface to query data (requires OpenAI API key)
7. **Dashboard**: Live metrics with clickable navigation cards
8. **Authentication**: JWT-based login and registration

## Deployment
For production deployment:
1. Build the client and server
2. The server serves static files from `client/dist` in production mode
3. All routes run on port 5000 in production

## Sample Data
The system comes pre-loaded with realistic demo data:

**Identities (3):**
- Personal (personal category) - personal accounts and subscriptions
- Work (work category) - professional/employment related
- Side Projects (project category) - hobby and side project assets

**Email Accounts (4):**
- john.doe@gmail.com (Personal identity)
- johnd@icloud.com (Personal identity)
- john.doe@company.com (Work identity)
- sidehustle@proton.me (Side Projects identity)

**Services (8):**
- Netflix, Spotify, iCloud+ (Personal)
- Microsoft 365, Slack Pro (Work)
- GitHub Pro, DigitalOcean (Side Projects)
- AWS (Side Projects)

**Relevant Messages (7):**
- Subscription receipts, billing notifications, security alerts
- Only important emails, not full inbox sync

**Projects (1):** Jarvis Identity Hub

## Recent Changes (December 10, 2025)
- **Service Form & Email Display Updates:**
  - Category field changed from free-text to dropdown with fixed options (Infrastructure, AI Tools, Development, Entertainment, Finance, Productivity, Social/Marketing, Other)
  - Removed "Billing Email" dropdown from New Service form - loginEmail is now the only email field (free text with autocomplete suggestions)
  - Current profile is now pre-selected and shown at top of "Linked Profiles" with "(current profile)" marker
  - Added optional "Next Bill Due" date field with `nextBillingDate` in Service model
  - Status options updated to: active, cancelled, trial, archived (removed expired/past_due/inactive/free_trial)
  - Handle/username field clearly marked as optional
  - "Primary" badge removed from email cards - now just shows email address and description/reason
  - Email descriptions strip "Primary - " prefix automatically

- **Auth Token Validation Fix:**
  - Added token verification endpoint (`GET /api/auth/verify`) to validate stored tokens on app load
  - AuthContext now validates tokens with the backend before accepting them from localStorage
  - Stale/invalid tokens are automatically cleared, forcing fresh login on app reload
  - Fixes preview mode issue where stale tokens from previous sessions were loading the home page with no data
  - Login page now correctly shows on initial load in both preview and webview

- **Identity → Profile Refactoring:**
  - Conceptual rename from "Identities" to "Profiles" in UI
  - Added `loginEmail` as canonical login field for services (previously derived from billingEmailId)
  - Added `profileIds` array for many-to-many service-to-profile relationships
  - Added `websiteUrl` and `handleOrUsername` fields to Service model
  - `profileIds` is now source of truth, synced to legacy `ownerIdentityIds` for backward compatibility
  
- **New Service Fields:**
  - `loginEmail`: Primary login email (user-editable, not overwritten by legacy field derivation)
  - `profileIds`: Array of profile IDs that own/use this service
  - `websiteUrl`: Service website (synced bidirectionally with legacy `loginUrl`)
  - `handleOrUsername`: Optional handle/username for the service

- **Backend Improvements:**
  - `syncServiceFields` now async, preserves user edits to loginEmail
  - PUT /services fetches existing service to avoid overwriting user-edited fields
  - Legacy fields (ownerIdentityIds, identityId, billingEmailId, loginUrl) maintained for backward compatibility

- **New UI Components:**
  - ServiceDetailsModal: Full service details with editable fields
  - AddServicesToProfileModal: Multi-select services to link to a profile
  - IdentityHome updated: Services section shows loginEmail and website domain
  - Sidebar sign-out button added (door/arrow icon)

## Previous Changes (December 9, 2025)
- **Multi-Currency Conversion System:**
  - Auto-detects base currency from most common currency in user's services
  - Only fetches exchange rates when foreign currencies are present
  - Uses Frankfurter API for real-time exchange rates
  - 24-hour caching in localStorage to minimize API calls
  - Subtle exchange rate indicator on "Monthly Spend" card (clickable)
  - Popover shows active rates with inverse conversion display
  - Refresh button clears cache and fetches fresh rates
  - New files: `client/src/utils/currency.ts`, `client/src/components/ExchangeRateIndicator.tsx`

- **AI Data Consistency Fix:**
  - AI chatbot now uses the same filtered data as the dashboard (excludes cancelled/archived services)
  - Monthly cost normalization added (yearly costs divided by 12)
  - Exchange rate conversion added to AI context (fetches from Frankfurter API)
  - AI receives pre-computed totals by currency AND total in base currency
  - Summary includes exchange rates used for transparency
  - Both dashboard and AI now show identical spending figures

## Previous Changes (December 8, 2025)
- **Mobile-Responsive UI:**
  - New MobileNav component with bottom navigation bar (Overview, Services, Projects, Emails, AI)
  - Full-screen ChatWidget on mobile with safe area support
  - Responsive grid layouts (2x2 stats cards, mobile card views)
  - Touch-friendly tap targets (44px minimum)
  - iOS notch and safe area inset support
  - Desktop sidebar navigation fixed to use correct /apps/identity/... routes

- **Advanced AI Scenario Support:**
  - **Shared Service Ownership**: Many-to-many identity relationships via sharedWithIdentityIds
  - **Two-Layer Ownership Model**: Distinguishes primaryOwnerId (account holder) from financialOwnerId (bill payer)
  - **Ambiguity Detection**: isAmbiguous and confidenceScore (0.0-1.0) for uncertain attributions
  - **High-Value Financial Detection**: Automatic flagging for pensions, trust funds, ISAs
  - **Usage Drift Tracking**: Historical ownership changes over time via usageHistory
  - **Enhanced AI System Prompt**: 13 sections covering all advanced scenarios
  
- **Test Scenarios Validated:**
  - Scenario 1A: Shared accounts (Midjourney shared by Fina, Leila, Lara)
  - Scenario 2A: Ambiguous emails (creativehubproject@gmail.com correctly flagged)
  - Scenario 4A: Financial detection (pension emails with action recommendations)
  - Scenario 5A: Security analysis (distinguishes shared usage from breaches)

- **Mock Data (Personas):**
  - Fina Feels (id-fina): Primary owner, pays for shared services
  - Leila (id-leila): Creative alias, manages Stable Diffusion login
  - Lara Feels (id-lara): Family member, uses Spotify
  - Fina Feels Studio (id-studio): Organization account
  - Creative Hub (id-generic-creative): Shared/ambiguous account
  - Tomo Connor (id-tomo): Pension and trust fund holder

## Previous Changes (December 7, 2025)
- Created Identity model as top-level entity
- Refactored Email, Service, and Project models to use identityId
- Added Message model with emailId and isRelevant flag
- ChatWidget with enhanced UX and GPT-5.1 model support

## User Preferences
- Dark "Jarvis" theme with violet/indigo gradients
- Identity-centric workflow (Identity → Emails → Messages)
- Clean, clickable dashboard for navigation
- Only store "relevant" emails, not comprehensive inbox sync
