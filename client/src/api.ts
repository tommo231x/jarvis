const API_BASE = '/api';

export interface Identity {
    id: string;
    name: string;
    category: 'personal' | 'work' | 'business' | 'project' | 'alias';
    description?: string;
    avatar?: string;
    notes?: string;
}

export interface Email {
    id: string;
    identityId: string;
    label: string;
    address: string;
    provider: 'gmail' | 'outlook' | 'yahoo' | 'proton' | 'icloud' | 'aws' | 'other';
    isPrimary: boolean;
    description?: string;
    notes?: string;
}

export interface Service {
    id: string;
    name: string;
    category: string;
    identityId: string;
    emailId?: string;
    billingCycle: 'monthly' | 'yearly' | 'none' | 'one-time';
    cost?: {
        amount: number;
        currency: string;
    };
    startDate?: string;
    renewalDate?: string;
    status: 'active' | 'cancelled' | 'trial' | 'past_due' | 'expired';
    loginUrl?: string;
    notes?: string;
}

export interface Project {
    id: string;
    name: string;
    status: 'active' | 'archived' | 'planning' | 'completed' | 'paused';
    identityId?: string;
    serviceIds: string[];
    startDate?: string;
    endDate?: string;
    description?: string;
    notes?: string;
}

export interface Message {
    id: string;
    emailId: string;
    from: string;
    subject: string;
    body: string;
    date: string;
    category: 'transactional' | 'security' | 'financial' | 'marketing' | 'social' | 'work' | 'personal' | 'spam';
    priority: 'high' | 'medium' | 'low';
    read: boolean;
    isRelevant: boolean;
    flags?: string[];
    attachments?: string[];
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    auth: {
        login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
        register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    },
    identities: {
        list: () => request<Identity[]>('/identities'),
        create: (data: Omit<Identity, 'id'>) => request<Identity>('/identities', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Identity>) => request<Identity>(`/identities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/identities/${id}`, { method: 'DELETE' }),
    },
    emails: {
        list: () => request<Email[]>('/emails'),
        create: (data: Omit<Email, 'id'>) => request<Email>('/emails', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Email>) => request<Email>(`/emails/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/emails/${id}`, { method: 'DELETE' }),
    },
    messages: {
        list: () => request<Message[]>('/messages'),
        create: (data: Omit<Message, 'id'>) => request<Message>('/messages', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Message>) => request<Message>(`/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/messages/${id}`, { method: 'DELETE' }),
    },
    services: {
        list: () => request<Service[]>('/services'),
        create: (data: Omit<Service, 'id'>) => request<Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Service>) => request<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/services/${id}`, { method: 'DELETE' }),
    },
    projects: {
        list: () => request<Project[]>('/projects'),
        create: (data: Omit<Project, 'id'>) => request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
    },
    ai: {
        query: (query: string) => request<{ answer: string; commands?: import('./types/aiCommands').AICommand[] }>('/ai/query', { method: 'POST', body: JSON.stringify({ query }) }),
    },
    status: {
        openai: () => request<{ 
            status: 'connected' | 'not_configured' | 'error'; 
            latency?: number; 
            error?: string;
            provider?: string;
            model?: string;
        }>('/status/openai'),
    }
};
