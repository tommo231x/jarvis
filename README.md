# Jarvis Identity Hub

A personal "Internal Tools" application designed to manage digital identity, subscriptions, and project contexts.

## Features

- **Identity Hub**: Manage Email and Service credentials.
- **Service Management**: Track subscription costs, billing cycles, and renewal dates.
- **Project Association**: Group assets into contexts (e.g., "Freelance", "Personal").
- **AI Search**: Natural language interface to query your digital footprint.
- **Dashboard**: Live metrics on monthly burn and active projects.
- **Authentication**: secure JWT-based login and registration.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, File-based JSON DB (for simplicity).
- **AI**: OpenAI API integration.

## Getting Started

### Prerequisites

- Node.js (v18+)

### Installation

1.  Clone the repository.
2.  Install dependencies for both client and server:

```bash
cd client
npm install

cd ../server
npm install
```

3.  Configure Environment:
    - Create `server/.env` with:
      ```
      PORT=3000
      JWT_SECRET=your_secret_key
      OPENAI_API_KEY=your_openai_key
      ```

### Running the App

1.  Start the Backend:
    ```bash
    cd server
    npm run dev
    ```

2.  Start the Frontend:
    ```bash
    cd client
    npm run dev
    ```

3.  Open `http://localhost:5173`.

## Deployment

Build the client for production:

```bash
cd client
npm run build
```

The output will be in `client/dist`.
