import { api } from '../api';

export interface AICommandPayload {
    name?: string;
    category?: string;
    type?: string;
    description?: string;
    notes?: string;
    email?: string;
    address?: string;
    identityId?: string;
    isPrimary?: boolean;
    label?: string;
    provider?: string;
    serviceId?: string;
    emailId?: string;
    [key: string]: any;
}

export interface AICommand {
    action: string;
    payload: AICommandPayload;
}

export const useAICommandExecutor = () => {

    const executeCommand = async (cmd: AICommand): Promise<{ success: boolean; message: string; data?: any }> => {
        try {
            switch (cmd.action) {
                case 'create_identity': {
                    const identity = await api.identities.create({
                        name: cmd.payload.name || 'New Identity',
                        category: (cmd.payload.category || cmd.payload.type || 'personal') as any,
                        description: cmd.payload.description,
                        notes: cmd.payload.notes,
                    });
                    return {
                        success: true,
                        message: `Created identity "${identity.name}"`,
                        data: identity
                    };
                }

                case 'add_email_to_identity': {
                    const emailAddress = cmd.payload.email || cmd.payload.address;
                    if (!emailAddress) {
                        return { success: false, message: 'No email address provided' };
                    }
                    if (!cmd.payload.identityId) {
                        return { success: false, message: 'No identity ID provided for email' };
                    }

                    const provider = emailAddress.includes('gmail') ? 'gmail' :
                        emailAddress.includes('outlook') ? 'outlook' :
                            emailAddress.includes('yahoo') ? 'yahoo' :
                                emailAddress.includes('proton') ? 'proton' :
                                    emailAddress.includes('icloud') ? 'icloud' : 'other';

                    const email = await api.emails.create({
                        identityId: cmd.payload.identityId,
                        address: emailAddress,
                        label: cmd.payload.label || 'Primary',
                        provider: provider as any,
                        isPrimary: cmd.payload.isPrimary !== false,
                    });
                    return {
                        success: true,
                        message: `Added email "${emailAddress}"`,
                        data: email
                    };
                }

                case 'update_identity': {
                    if (!cmd.payload.identityId) {
                        return { success: false, message: 'No identity ID provided' };
                    }
                    const updates = cmd.payload.updates || cmd.payload;
                    const identity = await api.identities.update(cmd.payload.identityId, updates);
                    return {
                        success: true,
                        message: `Updated identity`,
                        data: identity
                    };
                }

                case 'delete_identity': {
                    if (!cmd.payload.identityId) {
                        return { success: false, message: 'No identity ID provided' };
                    }
                    await api.identities.delete(cmd.payload.identityId);
                    return { success: true, message: 'Deleted identity' };
                }

                case 'delete_email': {
                    if (!cmd.payload.emailId) {
                        return { success: false, message: 'No email ID provided' };
                    }
                    await api.emails.delete(cmd.payload.emailId);
                    return { success: true, message: 'Deleted email' };
                }

                case 'update_email': {
                    if (!cmd.payload.emailId) {
                        return { success: false, message: 'No email ID provided' };
                    }
                    const updates = cmd.payload.updates || cmd.payload;
                    const email = await api.emails.update(cmd.payload.emailId, updates);
                    return {
                        success: true,
                        message: `Updated email`,
                        data: email
                    };
                }

                case 'add_service':
                case 'create_service': {
                    if (!cmd.payload.identityId) {
                        return { success: false, message: 'No identity ID provided for service' };
                    }
                    const serviceData: any = {
                        name: cmd.payload.name || 'New Service',
                        category: cmd.payload.category || 'Other',
                        ownerIdentityIds: cmd.payload.identityId ? [cmd.payload.identityId] : [],
                        profileIds: cmd.payload.identityId ? [cmd.payload.identityId] : [],
                        identityId: cmd.payload.identityId,
                        billingEmailId: cmd.payload.emailId,
                        emailId: cmd.payload.emailId,
                        billingCycle: cmd.payload.billingCycle || 'monthly',
                        status: cmd.payload.status || 'active',
                        notes: cmd.payload.notes,
                        loginEmail: cmd.payload.loginEmail || cmd.payload.email,
                        websiteUrl: cmd.payload.websiteUrl || cmd.payload.url,
                    };
                    if (cmd.payload.cost) {
                        serviceData.cost = cmd.payload.cost;
                    } else if (cmd.payload.amount !== undefined) {
                        serviceData.cost = {
                            amount: cmd.payload.amount,
                            currency: cmd.payload.currency || 'GBP'
                        };
                    }
                    const service = await api.services.create(serviceData);
                    return {
                        success: true,
                        message: `Added service "${service.name}"`,
                        data: service
                    };
                }

                case 'update_service': {
                    if (!cmd.payload.serviceId) {
                        return { success: false, message: 'No service ID provided' };
                    }
                    const updates = cmd.payload.updates || {};
                    if (cmd.payload.name) updates.name = cmd.payload.name;
                    if (cmd.payload.status) updates.status = cmd.payload.status;
                    if (cmd.payload.loginEmail) updates.loginEmail = cmd.payload.loginEmail;
                    if (cmd.payload.cost) updates.cost = cmd.payload.cost;
                    if (cmd.payload.amount !== undefined) {
                        updates.cost = {
                            amount: cmd.payload.amount,
                            currency: cmd.payload.currency || 'GBP'
                        };
                    }
                    const service = await api.services.update(cmd.payload.serviceId, updates);
                    return {
                        success: true,
                        message: `Updated service`,
                        data: service
                    };
                }

                case 'delete_service': {
                    if (!cmd.payload.serviceId) {
                        return { success: false, message: 'No service ID provided' };
                    }
                    await api.services.delete(cmd.payload.serviceId);
                    return { success: true, message: 'Deleted service' };
                }

                case 'flag_financial_item':
                case 'security_alert':
                case 'flag_ambiguous_identity':
                case 'suggest_new_identity':
                case 'update_usage_attribution':
                case 'update_service_ownership':
                case 'note_shared_usage':
                case 'link_service_identity':
                    return {
                        success: true,
                        message: `Noted: ${cmd.action}`,
                        data: cmd.payload
                    };

                default:
                    console.warn(`Unknown command action: ${cmd.action}`);
                    return {
                        success: false,
                        message: `Unknown command: ${cmd.action}`
                    };
            }
        } catch (error: any) {
            console.error(`Command execution failed:`, error);
            return {
                success: false,
                message: error?.message || 'Command execution failed'
            };
        }
    };

    const executeAll = async (commands: AICommand[]): Promise<{ command: AICommand; success: boolean; message: string; data?: any }[]> => {
        const results: { command: AICommand; success: boolean; message: string; data?: any }[] = [];

        let createdIdentityId: string | null = null;

        for (const cmd of commands) {
            if (cmd.action === 'add_email_to_identity' && !cmd.payload.identityId && createdIdentityId) {
                cmd.payload.identityId = createdIdentityId;
            }

            const result = await executeCommand(cmd);
            results.push({ command: cmd, ...result });

            if (cmd.action === 'create_identity' && result.success && result.data?.id) {
                createdIdentityId = result.data.id;
            }
        }

        return results;
    };

    return { executeAll, executeCommand };
};
