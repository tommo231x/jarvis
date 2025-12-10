import express from 'express';
import { db } from './db';
import { Email, Project, Service, User, Message, Identity } from './models';
import { IDENTITY_AGENT_SYSTEM_PROMPT } from './prompts/identityAgentSystemPrompt';
import OpenAI from 'openai';
import { hashPassword, comparePassword, generateToken, authenticateToken } from './auth';

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

router.get('/auth/verify', authenticateToken, async (req, res) => {
    // Token is valid if we reach this point (authenticateToken passed)
    res.json({ valid: true });
});

// Initialize OpenAI - supports Jarvis API key or Replit AI Integrations
// Priority: JARVIS_OPENAI_API_KEY > Replit AI Integrations
const useJarvisKey = !!process.env.JARVIS_OPENAI_API_KEY;
const apiKey = useJarvisKey ? process.env.JARVIS_OPENAI_API_KEY : process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

// Fallback to avoid crash if no key is present - allows server to start for non-AI features
const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY || 'not-configured';

const openai = new OpenAI({
    baseURL: useJarvisKey ? undefined : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: effectiveApiKey
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

// --- Protected Routes Middleware ---
// All routes defined after this will require authentication
router.use(authenticateToken);

// --- Identities ---
router.get('/identities', async (req, res) => {
    const identities = await db.collection<Identity>('identities').find();
    res.json(identities);
});

router.post('/identities', async (req, res) => {
    const newIdentity = await db.collection<Identity>('identities').add(req.body);
    res.status(201).json(newIdentity);
});

router.put('/identities/:id', async (req, res) => {
    const updated = await db.collection<Identity>('identities').update(req.params.id, req.body);
    res.json(updated);
});

router.delete('/identities/:id', async (req, res) => {
    const success = await db.collection<Identity>('identities').delete(req.params.id);
    res.json({ success });
});

// --- Emails (Email Accounts) ---
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

// Validate nextBillingDate is not in the past
const validateNextBillingDate = (dateStr: string | undefined | null): string | null => {
    if (!dateStr) return null; // Empty is allowed
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(dateStr);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
        return 'Next bill due must be today or a future date.';
    }
    return null;
};

// Get next billing date moved forward by one cycle
const getNextBillingDate = (currentDate: Date, billingCycle: string): Date => {
    const next = new Date(currentDate);
    switch (billingCycle) {
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
        case 'quarterly':
            next.setMonth(next.getMonth() + 3);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        default:
            // For 'one-time', 'none', or unknown, don't advance
            break;
    }
    return next;
};

// Ensure billing date is in the future for active/trial services
const ensureFutureBillingDate = (service: Service): Service => {
    if (!service.nextBillingDate) return service;
    if (service.status !== 'active' && service.status !== 'trial') return service;
    if (!service.billingCycle || service.billingCycle === 'one-time' || service.billingCycle === 'none') return service;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextDate = new Date(service.nextBillingDate);
    nextDate.setHours(0, 0, 0, 0);
    
    // Keep advancing until the date is in the future
    while (nextDate < today) {
        nextDate = getNextBillingDate(nextDate, service.billingCycle);
    }
    
    return {
        ...service,
        nextBillingDate: nextDate.toISOString().split('T')[0]
    };
};

router.get('/services', async (req, res) => {
    const services = await db.collection<Service>('services').find();
    // Apply rollover logic to ensure billing dates are in the future for active/trial services
    const servicesWithRollover = services.map(ensureFutureBillingDate);
    res.json(servicesWithRollover);
});

const syncServiceFields = async (data: any, existingService?: any) => {
    // 1. profileIds is the source of truth - sync to legacy fields
    // If profileIds provided, use it; otherwise try legacy fields
    if (data.profileIds && data.profileIds.length > 0) {
        data.ownerIdentityIds = [...data.profileIds];
        data.identityId = data.profileIds[0];
    } else if (data.ownerIdentityIds && data.ownerIdentityIds.length > 0) {
        data.profileIds = [...data.ownerIdentityIds];
        data.identityId = data.ownerIdentityIds[0];
    } else if (data.identityId) {
        data.ownerIdentityIds = [data.identityId];
        data.profileIds = [data.identityId];
    } else if (existingService?.profileIds) {
        // Preserve existing profileIds if no new ones provided
        data.profileIds = existingService.profileIds;
        data.ownerIdentityIds = existingService.profileIds;
    }

    // 2. Sync websiteUrl <-> loginUrl (prefer websiteUrl if provided)
    if (data.websiteUrl) {
        data.loginUrl = data.websiteUrl;
    } else if (data.loginUrl && !data.websiteUrl) {
        data.websiteUrl = data.loginUrl;
    } else if (existingService?.websiteUrl || existingService?.loginUrl) {
        // Preserve existing URLs if no new ones provided
        data.websiteUrl = data.websiteUrl || existingService.websiteUrl || existingService.loginUrl;
        data.loginUrl = data.loginUrl || existingService.loginUrl || existingService.websiteUrl;
    }

    // 3. Sync Billing Email -> Legacy Email (keep for backward compat)
    if (data.billingEmailId && !data.emailId) {
        data.emailId = data.billingEmailId;
    } else if (data.emailId && !data.billingEmailId) {
        data.billingEmailId = data.emailId;
    }

    // 4. loginEmail is user-editable - only derive from billingEmailId if not explicitly set
    // and if there's no existing loginEmail
    if (data.loginEmail === undefined && !existingService?.loginEmail && data.billingEmailId) {
        const emails = await db.collection<Email>('emails').find();
        const email = emails.find((e: Email) => e.id === data.billingEmailId);
        if (email) {
            data.loginEmail = email.address;
        }
    }

    return data;
};

router.post('/services', async (req, res) => {
    // Validate nextBillingDate
    const dateError = validateNextBillingDate(req.body.nextBillingDate);
    if (dateError) {
        return res.status(400).json({ error: dateError });
    }
    
    const serviceData = await syncServiceFields(req.body);
    const newService = await db.collection<Service>('services').add(serviceData);
    res.status(201).json(newService);
});

router.put('/services/:id', async (req, res) => {
    // Validate nextBillingDate
    const dateError = validateNextBillingDate(req.body.nextBillingDate);
    if (dateError) {
        return res.status(400).json({ error: dateError });
    }
    
    const services = await db.collection<Service>('services').find();
    const existingService = services.find((s: Service) => s.id === req.params.id);
    const serviceData = await syncServiceFields(req.body, existingService);
    const updated = await db.collection<Service>('services').update(req.params.id, serviceData);
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

// --- Messages (Inbox) ---
router.get('/messages', async (req, res) => {
    const messages = await db.collection<Message>('messages').find();
    res.json(messages);
});

router.post('/messages', async (req, res) => {
    const newMessage = await db.collection<Message>('messages').add(req.body);
    res.status(201).json(newMessage);
});

router.put('/messages/:id', async (req, res) => {
    const updated = await db.collection<Message>('messages').update(req.params.id, req.body);
    res.json(updated);
});

router.delete('/messages/:id', async (req, res) => {
    const success = await db.collection<Message>('messages').delete(req.params.id);
    res.json({ success });
});

// --- AI Query ---
router.post('/ai/query', async (req, res) => {
    try {
        const { query, conversationHistory } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // 1. Fetch all data to provide context
        const [identities, emails, allServices, projects, messages] = await Promise.all([
            db.collection<Identity>('identities').find(),
            db.collection<Email>('emails').find(),
            db.collection<Service>('services').find(),
            db.collection<Project>('projects').find(),
            db.collection<Message>('messages').find()
        ]);

        // 2. Filter and normalize services (same logic as dashboard)
        const activeServices = allServices.filter(s => 
            s.status !== 'cancelled' && !s.isArchived
        );

        // Detect base currency (most common currency in services)
        const currencyCounts: Record<string, number> = {};
        activeServices.forEach(s => {
            if (s.cost?.currency) {
                const currency = s.cost.currency.toUpperCase();
                currencyCounts[currency] = (currencyCounts[currency] || 0) + 1;
            }
        });
        let baseCurrency = 'GBP';
        let maxCount = 0;
        Object.entries(currencyCounts).forEach(([currency, count]) => {
            if (count > maxCount) {
                maxCount = count;
                baseCurrency = currency;
            }
        });

        // Detect foreign currencies
        const foreignCurrencies = new Set<string>();
        activeServices.forEach(s => {
            if (s.cost?.currency) {
                const currency = s.cost.currency.toUpperCase();
                if (currency !== baseCurrency) {
                    foreignCurrencies.add(currency);
                }
            }
        });

        // Fetch exchange rates if needed
        let exchangeRates: Record<string, number> = {};
        if (foreignCurrencies.size > 0) {
            try {
                const symbols = Array.from(foreignCurrencies).join(',');
                const response = await fetch(
                    `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${symbols}`
                );
                if (response.ok) {
                    const data = await response.json();
                    exchangeRates = data.rates || {};
                }
            } catch (e) {
                console.error('Failed to fetch exchange rates for AI context:', e);
            }
        }

        // Add computed monthly cost to each service (with base currency conversion)
        const servicesWithMonthlyCost = activeServices.map(s => {
            let monthlyAmount = 0;
            if (s.cost) {
                if (s.billingCycle === 'monthly') {
                    monthlyAmount = s.cost.amount;
                } else if (s.billingCycle === 'yearly') {
                    monthlyAmount = s.cost.amount / 12;
                }
            }

            // Convert to base currency if foreign
            const serviceCurrency = (s.cost?.currency || 'GBP').toUpperCase();
            let monthlyInBaseCurrency = monthlyAmount;
            if (serviceCurrency !== baseCurrency && exchangeRates[serviceCurrency]) {
                monthlyInBaseCurrency = monthlyAmount / exchangeRates[serviceCurrency];
            }

            return {
                ...s,
                computedMonthlyAmount: monthlyAmount,
                computedMonthlyCurrency: serviceCurrency,
                computedMonthlyInBaseCurrency: Math.round(monthlyInBaseCurrency * 100) / 100
            };
        });

        // Calculate totals by currency AND total in base currency
        const totalsByCurrency: Record<string, number> = {};
        let totalInBaseCurrency = 0;
        servicesWithMonthlyCost.forEach(s => {
            const currency = s.computedMonthlyCurrency;
            totalsByCurrency[currency] = (totalsByCurrency[currency] || 0) + s.computedMonthlyAmount;
            totalInBaseCurrency += s.computedMonthlyInBaseCurrency;
        });

        // 3. Prepare Context with filtered/normalized data
        const context = {
            identities,
            emails,
            services: servicesWithMonthlyCost,
            projects,
            messages,
            summary: {
                activeServiceCount: activeServices.length,
                baseCurrency,
                monthlyTotalInBaseCurrency: Math.round(totalInBaseCurrency * 100) / 100,
                monthlyTotalsByCurrency: totalsByCurrency,
                exchangeRatesUsed: Object.keys(exchangeRates).length > 0 ? exchangeRates : null,
                note: "All service costs shown as monthly amounts (yearly costs divided by 12). Only active services are included. Totals converted to base currency using current exchange rates."
            }
        };

        // 3. Build conversation messages
        const finalPrompt = IDENTITY_AGENT_SYSTEM_PROMPT + `\n\nData Context:\n${JSON.stringify(context, null, 2)}`;

        // Build messages array with conversation history
        const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: finalPrompt }
        ];

        // Add conversation history (last 50 messages for context)
        if (conversationHistory && Array.isArray(conversationHistory)) {
            const recentHistory = conversationHistory.slice(-50);
            for (const msg of recentHistory) {
                if (msg.sender === 'user') {
                    chatMessages.push({ role: 'user', content: msg.text });
                } else if (msg.sender === 'jarvis') {
                    chatMessages.push({ role: 'assistant', content: msg.text });
                }
            }
        }

        // Add the current query
        chatMessages.push({ role: 'user', content: query });

        const completion = await openai.chat.completions.create({
            messages: chatMessages,
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
