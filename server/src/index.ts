import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import apiRouter from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import { authenticateToken } from './auth';

// ... (previous imports)

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes (Public) should be mounted before secure middleware if they were separate, 
// but here they are inside apiRouter. We need to split them or allow public access.
// Since we put /auth/* in apiRouter, we need to apply middleware mostly to protected routes.
// Strategy: Mount apiRouter at /api, but let apiRouter handle auth middleware internally? 
// Or better: Let's split public auth routes vs protected data routes in index.ts if possible, 
// OR just modify apiRouter to have public endpoints.
// 
// For currently simplicity, let's keep it in apiRouter but Use middleware on specific routes inside routes.ts?
// Actually, standard practice for this scale: 
// 1. /api/auth/* -> Public
// 2. /api/* -> Protected (except auth)
//
// Let's modify index.ts to apply middleware to everything EXCEPT /auth.
// However, express middleware order matters.

app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) {
        return next();
    }
    authenticateToken(req, res, next);
}, apiRouter);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
