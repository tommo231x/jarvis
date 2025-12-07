export interface User {
    id: string;
    username: string;
    passwordHash: string;
}

export interface Email {
    id: string;
    label: string;
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
    emailId: string; // Foreign Key to Email
    billingCycle: 'monthly' | 'yearly' | 'none' | 'one-time';
    cost?: {
        amount: number;
        currency: string;
    };
    startDate?: string;
    renewalDate?: string;
    status: 'active' | 'cancelled' | 'trial' | 'past_due';
    loginUrl?: string;
    notes?: string;
}

export interface Project {
    id: string;
    name: string;
    status: 'active' | 'archived' | 'planning' | 'completed' | 'paused';
    primaryEmailId?: string; // Foreign Key to Email
    serviceIds: string[]; // Foreign Keys to Service
    startDate?: string;
    endDate?: string;
    description?: string;
    notes?: string;
}

export interface Message {
    id: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    date: string;
    category: 'transactional' | 'security' | 'financial' | 'marketing' | 'social' | 'work' | 'personal' | 'spam';
    priority: 'high' | 'medium' | 'low';
    read: boolean;
    flags?: string[];
    attachments?: string[];
}
