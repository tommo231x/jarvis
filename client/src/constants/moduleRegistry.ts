import { ModuleDefinition } from '../types/identity';

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
    email: {
        key: 'email',
        name: 'Email & Notifications',
        category: 'communication',
        description: 'Unified inbox for all your communication channels.',
        defaultStatus: 'planned',
    },
    services: {
        key: 'services',
        name: 'Services Management',
        category: 'billing',
        description: 'Track and manage your connected services and API keys.',
        defaultStatus: 'planned',
    },
    subscriptions: {
        key: 'subscriptions',
        name: 'Subscriptions',
        category: 'billing',
        description: 'Monitor recurring expenses and subscription renewal dates.',
        defaultStatus: 'planned',
    },
    tasks: {
        key: 'tasks',
        name: 'Tasks & Calendar',
        category: 'productivity',
        description: 'Project management and daily agenda view.',
        defaultStatus: 'planned',
    },
    admin_links: {
        key: 'admin_links',
        name: 'Admin Shortcuts',
        category: 'admin',
        description: 'Quick access to administrative panels and external tools.',
        defaultStatus: 'planned',
    },
};

export const DEFAULT_MODULE_CONFIGS = Object.values(MODULE_REGISTRY).map((module, index) => ({
    key: module.key,
    enabled: true, // Enable all by default for now to show them
    order: index,
}));
