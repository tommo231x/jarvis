import express from 'express';
import { db } from './db';
import { Email, Project, Service, User } from './models';
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

// Initialize OpenAI
// Note: Client should ensure OPENAI_API_KEY is in .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: false
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
        const systemPrompt = `
      You are an intelligent assistant for a personal "Identity & Services Command Center".
      You have access to the user's data (Emails, Services, Projects) in JSON format.
      
      Your goal is to:
      1. Answer the user's question based strictly on this data if applicable.
      2. If the user asks to perform an action (create, add, update, etc.), generate a structured command object.
      
      Supported Commands:
      - create_identity: { name, type, description }
      - add_task: { title, dueDate, notes }
      - add_subscription: { name, amount, currency, frequency, nextBillingDate }
      - add_service: { name, category, url, notes }
      - add_admin_link: { label, url, category, notes }
      - complete_task: { taskTitle, taskId }

      Respond with a JSON object ONLY:
      {
        "answer": "Natural language response here",
        "commands": [ ...list of command objects or empty array... ]
      }
      
      For commands, always try to infer 'identityName' if mentioned (e.g. "for my Studio identity").
      
      Data Context:
      ${JSON.stringify(context, null, 2)}
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            model: 'gpt-3.5-turbo', // Or gpt-4 if preferred/available
            response_format: { type: "json_object" }
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
