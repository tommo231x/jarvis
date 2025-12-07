export type IdentityType = 'personal' | 'business' | 'project' | 'other';

export interface IdentityModule {
    id: string;
    name: string;
    type: string; // placeholder for now
    enabled: boolean;
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
