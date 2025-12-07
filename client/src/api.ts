const API_BASE = '/api';

// Alias Email to EmailIdentity for consistency
export type EmailIdentity = Email;

export interface Email {
    id: string;
    label?: string; // Optional now as we might just use address
    address: string;
    provider: 'gmail' | 'outlook' | 'yahoo' | 'proton' | 'icloud' | 'aws' | 'other';
    type: 'personal' | 'work' | 'burner' | 'project';
    description?: string;
    notes?: string;
}

export interface Service {
    id: string;
    name: string;
    category: string;
    emailId: string;
    billingCycle: 'monthly' | 'yearly' | 'none' | 'one-time';
    cost?: {
        amount: number;
        currency: string;
        period?: 'monthly' | 'yearly' | 'one-time'; // Added period for consistency
    };
    startDate?: string;
    renewalDate?: string;
    status: 'active' | 'cancelled' | 'paused' | 'trial' | 'past_due'; // Added paused
    loginUrl?: string;
    username?: string; // Added
    password?: string; // Added
    description?: string; // Added
    icon?: string; // Added
    notes?: string;
    createdAt?: string; // Added (mock)
    updatedAt?: string; // Added (mock)
}

export interface Project {
    id: string;
    name: string;
    status: 'active' | 'archived' | 'planning' | 'completed' | 'paused';
    primaryEmailId?: string;
    serviceIds: string[];
    startDate?: string;
    endDate?: string;
    description?: string;
    notes?: string;
    repoUrl?: string; // Added
    docUrl?: string; // Added
    createdAt?: string; // Added
    updatedAt?: string; // Added
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
    emails: {
        list: () => request<Email[]>('/emails'),
        create: (data: Omit<Email, 'id'>) => request<Email>('/emails', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Email>) => request<Email>(`/emails/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/emails/${id}`, { method: 'DELETE' }),
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
