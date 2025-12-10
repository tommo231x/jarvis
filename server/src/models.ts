export interface User {
    id: string;
    username: string;
    passwordHash: string;
}

export interface Address {
    id: string;
    label: string; // e.g., "Headquarters", "Warehouse", "Home"
    type: 'business' | 'residential' | 'mailing' | 'warehouse' | 'other';
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
    isPrimary?: boolean;
}

export interface PhoneNumber {
    id: string;
    label: string; // e.g., "Mobile", "Office", "WhatsApp"
    type: 'mobile' | 'landline' | 'fax' | 'business' | 'personal';
    number: string;
    countryCode?: string;
    isPrimary?: boolean;
}

export interface SocialLink {
    platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'website' | 'other';
    url: string;
    username?: string;
}

export interface Identity {
    id: string;
    name: string;
    category: 'personal' | 'business' | 'project' | 'event';
    description?: string;
    avatar?: string;
    notes?: string;
    isOrganization?: boolean;
    parentIdentityId?: string;
    addresses?: Address[];
    phoneNumbers?: PhoneNumber[];
    socialLinks?: SocialLink[];
    website?: string;
    companyNumber?: string; // For registered businesses
    vatNumber?: string;
}

// Profile extends Identity with new fields for the evolved data model
export interface Profile extends Identity {
    type?: 'personal' | 'business' | 'brand' | 'project' | 'client' | 'event' | 'other';
    referenceEmails?: string[];      // Emails relevant to this profile (not identity-defining)
    reasonUsed?: string;             // Why this profile exists
    serviceIds?: string[];           // Services linked to this profile
    workspaceIds?: string[];         // Workspaces linked to this profile
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

    // Primary Fields (New Model)
    loginEmail?: string;        // Canonical email used to log in (primary field)
    profileIds?: string[];      // Profiles this service is attached to
    websiteUrl?: string;        // Full URL e.g. "https://www.midjourney.com"
    handleOrUsername?: string;  // e.g. "@finafeels" for Twitter/IG

    // Legacy Fields (kept for backward compatibility)
    ownerIdentityIds?: string[]; // Supports multiple owners (legacy)
    billingEmailId?: string;    // Explicit billing email relation (legacy)
    isArchived?: boolean;       // Soft delete support
    identityId?: string;        // @deprecated use profileIds
    emailId?: string;           // @deprecated use loginEmail

    ownership?: ServiceOwnership;
    billingCycle: 'monthly' | 'yearly' | 'none' | 'one-time';
    cost?: {
        amount: number;
        currency: string;
    };
    startDate?: string;
    renewalDate?: string;
    status: 'active' | 'cancelled' | 'trial' | 'past_due' | 'expired' | 'inactive' | 'free_trial';
    loginUrl?: string;          // @deprecated use websiteUrl
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
