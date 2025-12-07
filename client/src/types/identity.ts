export type IdentityType = 'personal' | 'business' | 'project' | 'other';
export type ModuleStatus = 'planned' | 'active' | 'beta' | 'deprecated';

export interface ModuleDefinition {
    key: string;
    name: string;
    category: 'communication' | 'billing' | 'productivity' | 'admin' | 'other';
    description: string;
    defaultStatus: ModuleStatus;
}

export interface IdentityModuleConfig {
    key: string; // References ModuleDefinition.key
    enabled: boolean;
    order: number;
}

export interface Identity {
    id: string;
    name: string;
    avatarUrl?: string;
    description?: string;
    type: IdentityType;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
    modules: IdentityModuleConfig[];
}
