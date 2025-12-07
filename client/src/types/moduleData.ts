export interface EmailRecord {
    id: string;
    sender: string;
    subject: string;
    date: string;
    preview: string;
    read: boolean;
}

export interface ServiceRecord {
    id: string;
    name: string;
    category?: string;
    url?: string;
    notes?: string;
    cost?: string; // Optional cost tracking
}

export interface SubscriptionRecord {
    id: string;
    name: string;
    amount: number;
    currency: string;
    frequency: 'monthly' | 'yearly';
    nextBillingDate?: string;
}

export interface TaskRecord {
    id: string;
    title: string;
    dueDate?: string;
    isDone: boolean;
    notes?: string;
}

export interface AdminLinkRecord {
    id: string;
    label: string;
    url: string;
    category?: string;
}

export type ModuleDataStore = {
    [identityId: string]: {
        email: EmailRecord[];
        services: ServiceRecord[];
        subscriptions: SubscriptionRecord[];
        tasks: TaskRecord[];
        adminLinks: AdminLinkRecord[];
    }
};
