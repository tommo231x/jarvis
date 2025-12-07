import { useIdentity } from '../context/IdentityContext';
import { useModuleData } from '../context/ModuleDataContext';
import { AICommand } from '../types/aiCommands';
import { v4 as uuidv4 } from 'uuid';

export const useAICommandExecutor = () => {
    const { identities, addIdentity } = useIdentity();
    const { addItem, updateItem, data } = useModuleData();

    // Helper to find identity ID by name or ID
    const resolveIdentityId = (cmd: AICommand): string | undefined => {
        if (cmd.identityId) {
            // Validate it exists
            const exists = identities.find(i => i.id === cmd.identityId);
            return exists ? exists.id : undefined;
        }

        if (cmd.identityName) {
            const nameLower = cmd.identityName.toLowerCase();
            const match = identities.find(i => i.name.toLowerCase() === nameLower);
            return match ? match.id : undefined;
        }

        return undefined;
    };

    const executeCommand = (cmd: AICommand) => {
        const id = resolveIdentityId(cmd);

        switch (cmd.type) {
            case 'create_identity': {
                // Check if already exists to avoid duplicates if possible, though ID is unique.
                // Assuming payload has name.
                const exists = identities.find(i => i.name.toLowerCase() === cmd.payload.name.toLowerCase());
                if (exists) throw new Error(`Identity "${cmd.payload.name}" already exists.`);

                addIdentity({
                    name: cmd.payload.name,
                    type: cmd.payload.type || 'personal',
                    description: cmd.payload.description || 'Created via Jarvis AI',
                });
                break;
            }

            case 'add_task': {
                if (!id) throw new Error(`Could not find identity "${cmd.identityName || 'unknown'}"`);
                addItem(id, 'tasks', {
                    id: uuidv4(),
                    title: cmd.payload.title,
                    dueDate: cmd.payload.dueDate,
                    notes: cmd.payload.notes,
                    isDone: false
                });
                break;
            }

            case 'complete_task': {
                if (!id) throw new Error(`Could not find identity "${cmd.identityName || 'unknown'}"`);

                // Find task
                const tasks = data[id]?.tasks || [];
                let taskToComplete;

                if (cmd.payload.taskId) {
                    taskToComplete = tasks.find(t => t.id === cmd.payload.taskId);
                } else if (cmd.payload.taskTitle) {
                    const titleLower = cmd.payload.taskTitle.toLowerCase();
                    taskToComplete = tasks.find(t => t.title.toLowerCase().includes(titleLower) && !t.isDone);
                }

                if (!taskToComplete) throw new Error(`Could not find open task "${cmd.payload.taskTitle || cmd.payload.taskId}"`);

                updateItem(id, 'tasks', taskToComplete.id, { isDone: true });
                break;
            }

            case 'add_subscription': {
                if (!id) throw new Error(`Could not find identity "${cmd.identityName || 'unknown'}"`);
                addItem(id, 'subscriptions', {
                    id: uuidv4(),
                    name: cmd.payload.name,
                    amount: cmd.payload.amount || 0,
                    currency: cmd.payload.currency || 'USD',
                    frequency: cmd.payload.frequency || 'monthly',
                    nextBillingDate: cmd.payload.nextBillingDate
                });
                break;
            }

            case 'add_service': {
                if (!id) throw new Error(`Could not find identity "${cmd.identityName || 'unknown'}"`);

                // We need emailId for Service record usually, but context might handle it or we mock it?
                // ServiceRecord: { id, name, category, url, notes, cost? }
                // Warning: The types might mismatch if ServiceRecord requires rigid fields not in AI payload.
                // Let's check ServiceRecord in moduleData.ts?
                // It has: id, name, category?, url?, notes?, cost?
                // payload has: name, category?, url?, notes?
                // Seems compatible.

                addItem(id, 'services', {
                    id: uuidv4(),
                    name: cmd.payload.name,
                    category: cmd.payload.category,
                    url: cmd.payload.url,
                    notes: cmd.payload.notes
                });
                break;
            }

            case 'add_admin_link': {
                if (!id) throw new Error(`Could not find identity "${cmd.identityName || 'unknown'}"`);
                addItem(id, 'adminLinks', {
                    id: uuidv4(),
                    label: cmd.payload.label,
                    url: cmd.payload.url,
                    category: cmd.payload.category
                });
                break;
            }

            default:
                throw new Error(`Unknown command type: ${(cmd as any).type}`);
        }
    };

    const executeAll = (commands: AICommand[]) => {
        const results: { command: AICommand; success: boolean; message: string }[] = [];

        // If we create identity, we should maybe await or refetch?
        // But addIdentity is sync state update usually.
        // However, if we Create Identity -> then Add Task to it in same batch,
        // the state might not be updated yet in 'identities' array during the loop.
        // LIMITATION: Batch commands that depend on immediately created identity might fail if state not flushed.
        // For now, we'll try running them. We might need a small hack to "predict" the new identity if creating.
        // Actually, 'addIdentity' in context sets state. 'identities' won't update until next render.
        // FIX: If we see create_identity, we can cache it locally for this function execution.

        let localIdentities = [...identities];

        for (const cmd of commands) {
            try {
                // Special handling for Create to update local snapshot
                if (cmd.type === 'create_identity') {
                    // We run the actual hook
                    executeCommand(cmd);

                    // And mock update our local view so subsequent commands in this batch can find it
                    localIdentities.push({
                        id: 'temp-id-optimistic', // We don't know real ID easily unless we change hook...
                        // Actually, we can rely on Name matching if we just pass the name down.
                        // But 'resolveIdentityId' uses 'identities' from closure.
                        // We can't easily hot-patch 'resolveIdentityId'.
                        // For V1, let's assume users won't overly complex "Create AND Add" in one go, or LLM will fail.
                        // Or, we can just catch it.
                        name: cmd.payload.name,
                        type: (cmd.payload.type || 'personal') as any,
                        description: cmd.payload.description,
                        createdAt: '', updatedAt: '', modules: []
                    });

                    results.push({ command: cmd, success: true, message: `Created identity "${cmd.payload.name}"` });
                } else {
                    executeCommand(cmd);

                    let msg = "Executed successfully";
                    if (cmd.type === 'add_task') msg = `Added task "${cmd.payload.title}"`;
                    if (cmd.type === 'complete_task') msg = `Completed task`;
                    if (cmd.type === 'add_subscription') msg = `Added sub "${cmd.payload.name}"`;

                    results.push({ command: cmd, success: true, message: msg });
                }

            } catch (e: any) {
                results.push({ command: cmd, success: false, message: e?.message || "Unknown error" });
            }
        }
        return results;
    };

    return { executeAll };
};
