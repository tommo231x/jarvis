import express from 'express';
import { db } from './db';
import { Email, Project, Service, User } from './models';
import { IDENTITY_AGENT_SYSTEM_PROMPT } from './prompts/identityAgentSystemPrompt';
import OpenAI from 'openai';
import { hashPassword, comparePassword, generateToken } from './auth';

const router = express.Router();

// --- Auth ---
router.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const users = await db.collection<User>('users').find();
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const passwordHash = await hashPassword(password);
        const newUser = await db.collection<User>('users').add({ username, passwordHash });

        const token = generateToken({ id: newUser.id, username });
        res.status(201).json({ token, user: { id: newUser.id, username } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await db.collection<User>('users').find();
        const user = users.find(u => u.username === username);

        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ id: user.id, username });
        res.json({ token, user: { id: user.id, username } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Initialize OpenAI - supports Jarvis API key or Replit AI Integrations
// Priority: JARVIS_OPENAI_API_KEY > Replit AI Integrations
const useJarvisKey = !!process.env.JARVIS_OPENAI_API_KEY;
const openai = new OpenAI({
    baseURL: useJarvisKey ? undefined : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: useJarvisKey ? process.env.JARVIS_OPENAI_API_KEY : process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// --- Status Checks ---
router.get('/status/openai', async (req, res) => {
    const jarvisApiKey = process.env.JARVIS_OPENAI_API_KEY;
    const integrationBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    const integrationApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    
    const provider = jarvisApiKey ? 'OpenAI Direct (Jarvis)' : 'Replit AI Integrations';
    const isConfigured = jarvisApiKey || (integrationBaseUrl && integrationApiKey);
    
    if (!isConfigured) {
        return res.json({ status: 'not_configured', provider: 'None' });
    }

    try {
        const start = Date.now();
        const testCompletion = await openai.chat.completions.create({
            model: 'gpt-5.1',
            messages: [{ role: 'user', content: 'Hello' }],
            max_completion_tokens: 50
        });
        const latency = Date.now() - start;
        res.json({ 
            status: 'connected', 
            latency, 
            provider,
            model: testCompletion.model || 'gpt-5.1'
        });
    } catch (error: any) {
        console.error('OpenAI Status Check Failed:', error.message);
        res.json({ status: 'error', error: error.message, provider });
    }
});

// --- Emails ---
router.get('/emails', async (req, res) => {
    const emails = await db.collection<Email>('emails').find();
    res.json(emails);
});

router.post('/emails', async (req, res) => {
    const newEmail = await db.collection<Email>('emails').add(req.body);
    res.status(201).json(newEmail);
});

router.put('/emails/:id', async (req, res) => {
    const updated = await db.collection<Email>('emails').update(req.params.id, req.body);
    res.json(updated);
});

router.delete('/emails/:id', async (req, res) => {
    const success = await db.collection<Email>('emails').delete(req.params.id);
    res.json({ success });
});

// --- Services ---
router.get('/services', async (req, res) => {
    const services = await db.collection<Service>('services').find();
    res.json(services);
});

router.post('/services', async (req, res) => {
    const newService = await db.collection<Service>('services').add(req.body);
    res.status(201).json(newService);
});

router.put('/services/:id', async (req, res) => {
    const updated = await db.collection<Service>('services').update(req.params.id, req.body);
    res.json(updated);
});

router.delete('/services/:id', async (req, res) => {
    const success = await db.collection<Service>('services').delete(req.params.id);
    res.json({ success });
});

// --- Projects ---
router.get('/projects', async (req, res) => {
    const projects = await db.collection<Project>('projects').find();
    res.json(projects);
});

router.post('/projects', async (req, res) => {
    const newProject = await db.collection<Project>('projects').add(req.body);
    res.status(201).json(newProject);
});

router.put('/projects/:id', async (req, res) => {
    const updated = await db.collection<Project>('projects').update(req.params.id, req.body);
    res.json(updated);
});

router.delete('/projects/:id', async (req, res) => {
    const success = await db.collection<Project>('projects').delete(req.params.id);
    res.json({ success });
});

// --- AI Query ---
router.post('/ai/query', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // 1. Fetch all data to provide context
        const [emails, services, projects] = await Promise.all([
            db.collection<Email>('emails').find(),
            db.collection<Service>('services').find(),
            db.collection<Project>('projects').find()
        ]);

        // 2. Prepare Context
        const context = {
            emails,
            services,
            projects
        };

        // 3. Call LLM
        const systemPrompt = IDENTITY_AGENT_SYSTEM_PROMPT.replace('${JSON.stringify(context, null, 2)}', JSON.stringify(context, null, 2)) + `\n\nData Context:\n${JSON.stringify(context, null, 2)}`;
        // Note: The prompt file doesn't have the context placeholder at the bottom by default in the user text, so we append it.
        // Actually, looking at the user text, it ends with "Never hide uncertainty — always ask."
        // And my technical override ends with "...return an empty 'commands' array."
        // I need to make sure the Data Context is appended.

        const finalPrompt = IDENTITY_AGENT_SYSTEM_PROMPT + `\n\nData Context:\n${JSON.stringify(context, null, 2)}`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: finalPrompt },
                { role: 'user', content: query }
            ],
            model: 'gpt-5.1',
            response_format: { type: "json_object" },
            max_completion_tokens: 4096
        });

        const content = completion.choices[0].message.content;
        let responseData = { answer: "Failed to parse response", commands: [] };

        try {
            if (content) {
                responseData = JSON.parse(content);
            }
        } catch (e) {
            console.error("Failed to parse LLM JSON", e);
            responseData = { answer: content || "Error processing", commands: [] };
        }

        res.json(responseData);

    } catch (error: any) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to process AI query', details: error.message });
    }
});

export default router;
