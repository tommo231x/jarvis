export interface User {
    id: string;
    username: string;
    passwordHash: string;
}

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
