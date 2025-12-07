export type AICommandType =
    | 'create_identity'
    | 'add_task'
    | 'complete_task'
    | 'add_subscription'
    | 'add_service'
    | 'add_admin_link';

export interface BaseAICommand {
    type: AICommandType;
    identityName?: string;   // which identity to target, by human name
    identityId?: string;     // optional direct ID if known
}

export interface CreateIdentityCommand extends BaseAICommand {
    type: 'create_identity';
    payload: {
        name: string;
        type?: 'personal' | 'business' | 'project';
        description?: string;
    };
}

export interface AddTaskCommand extends BaseAICommand {
    type: 'add_task';
    payload: {
        title: string;
        dueDate?: string;
        notes?: string;
    };
}

export interface CompleteTaskCommand extends BaseAICommand {
    type: 'complete_task';
    payload: {
        taskTitle?: string;
        taskId?: string;
    };
}

export interface AddSubscriptionCommand extends BaseAICommand {
    type: 'add_subscription';
    payload: {
        name: string;
        amount?: number;
        currency?: string;
        frequency?: 'monthly' | 'yearly';
        nextBillingDate?: string;
    };
}

export interface AddServiceCommand extends BaseAICommand {
    type: 'add_service';
    payload: {
        name: string;
        category?: string;
        url?: string;
        notes?: string;
    };
}

export interface AddAdminLinkCommand extends BaseAICommand {
    type: 'add_admin_link';
    payload: {
        label: string;
        url: string;
        category?: string;
        notes?: string;
    };
}

export type AICommand =
    | CreateIdentityCommand
    | AddTaskCommand
    | CompleteTaskCommand
    | AddSubscriptionCommand
    | AddServiceCommand
    | AddAdminLinkCommand;
