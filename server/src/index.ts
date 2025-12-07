import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import apiRouter from './routes';
import { authenticateToken } from './auth';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || (isProduction ? '5000' : '3001'), 10);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) {
        return next();
    }
    authenticateToken(req, res, next);
}, apiRouter);

if (process.env.NODE_ENV === 'production') {
    const clientDistPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

const host = isProduction ? '0.0.0.0' : 'localhost';
app.listen(port, host, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
});
