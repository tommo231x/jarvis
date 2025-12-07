export type IdentityType = 'personal' | 'business' | 'project' | 'other';
export type IdentityModuleStatus = 'planned' | 'active' | 'disabled';

export interface IdentityModule {
    id: string;              // unique per identity
    key: string;             // stable key, e.g. "email", "subscriptions", "services", "tasks", "adminLinks"
    name: string;            // human label for the card
    category: 'communication' | 'billing' | 'productivity' | 'navigation' | 'other';
    description?: string;    // short text shown in the UI
    status: IdentityModuleStatus;
    enabled: boolean;
    order: number;           // for layout ordering
}

export interface Identity {
    id: string;
    name: string;
    avatarUrl?: string;
    description?: string;
    type: IdentityType;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
    modules: IdentityModule[];
}
