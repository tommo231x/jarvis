export interface User {
    id: string;
    username: string;
    passwordHash: string;
}

export interface Identity {
    id: string;
    name: string;
    category: 'personal' | 'work' | 'business' | 'project' | 'alias' | 'organization' | 'shared';
    description?: string;
    avatar?: string;
    notes?: string;
    isOrganization?: boolean;
    parentIdentityId?: string;
}

export interface Email {
    id: string;
    identityId: string;
    sharedWithIdentityIds?: string[];
    label: string;
    address: string;
    provider: 'gmail' | 'outlook' | 'yahoo' | 'proton' | 'icloud' | 'aws' | 'other';
    isPrimary: boolean;
    description?: string;
    notes?: string;
    isAmbiguous?: boolean;
    confidenceScore?: number;
}

export interface ServiceOwnership {
    primaryOwnerId: string;
    loginManagerId?: string;
    sharedWithIdentityIds?: string[];
    financialOwnerId?: string;
}

export interface Service {
    id: string;
    name: string;
    category: string;
    identityId: string;
    emailId?: string;
    ownership?: ServiceOwnership;
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
    usageHistory?: {
        identityId: string;
        firstSeen: string;
        lastSeen: string;
        isActive: boolean;
    }[];
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
    to?: string;
    subject: string;
    body: string;
    date: string;
    category: 'transactional' | 'security' | 'financial' | 'marketing' | 'social' | 'work' | 'personal' | 'spam' | 'subscription' | 'receipt' | 'notification';
    priority: 'high' | 'medium' | 'low';
    read: boolean;
    isRelevant: boolean;
    flags?: string[];
    attachments?: string[];
    detectedService?: string;
    detectedIdentities?: string[];
    billingInfo?: {
        chargedTo?: string;
        amount?: number;
        currency?: string;
    };
    securityEvent?: {
        type: 'login' | 'password_reset' | 'new_device' | 'suspicious';
        location?: string;
        device?: string;
    };
    financialType?: 'pension' | 'trust_fund' | 'investment' | 'tax' | 'estate' | 'insurance' | 'mortgage';
    greetingName?: string;
}
