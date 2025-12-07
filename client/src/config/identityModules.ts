import { IdentityModule } from '../types/identity';

export const CORE_MODULE_DEFINITIONS: Record<string, Omit<IdentityModule, 'id'>> = {
    email: {
        key: 'email',
        name: 'Email & Messages',
        category: 'communication',
        description: 'Email and notifications for this identity.',
        status: 'active',
        enabled: true,
        order: 1,
    },
    services: {
        key: 'services',
        name: 'Services',
        category: 'billing',
        description: 'Services linked to this identity.',
        status: 'active',
        enabled: true,
        order: 2,
    },
    subscriptions: {
        key: 'subscriptions',
        name: 'Subscriptions',
        category: 'billing',
        description: 'Subscriptions and recurring payments.',
        status: 'active',
        enabled: true,
        order: 3,
    },
    tasks: {
        key: 'tasks',
        name: 'Tasks & Calendar',
        category: 'productivity',
        description: 'Tasks, reminders, and scheduling.',
        status: 'active',
        enabled: true,
        order: 4,
    },
    adminLinks: {
        key: 'adminLinks',
        name: 'Admin Links',
        category: 'navigation',
        description: 'Quick admin links and shortcuts.',
        status: 'active',
        enabled: true,
        order: 5,
    },
};
