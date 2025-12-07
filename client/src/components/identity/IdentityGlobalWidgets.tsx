import { useMemo } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { useModuleData } from '../../context/ModuleDataContext';
import { TaskRecord, AdminLinkRecord } from '../../types/moduleData';
import { CreditCard, CheckSquare, Clock, Link as LinkIcon, Mail, ExternalLink } from 'lucide-react';

const IdentityGlobalWidgets = () => {
    const { identities } = useIdentity();
    const { data } = useModuleData();

    // -- 1. Subscription Overview --
    const subscriptionData = useMemo(() => {
        let totalCount = 0;
        let monthlyCost = 0;

        identities.forEach(identity => {
            const subs = data[identity.id]?.subscriptions || [];
            totalCount += subs.length;
            subs.forEach(sub => {
                if (sub.frequency === 'monthly') {
                    monthlyCost += sub.amount;
                } else if (sub.frequency === 'yearly') {
                    monthlyCost += sub.amount / 12;
                }
            });
        });

        return { totalCount, monthlyCost };
    }, [identities, data]);

    // -- 2. Reminders / Upcoming Tasks --
    const upcomingTasks = useMemo(() => {
        let allTasks: (TaskRecord & { identityName: string; identityId: string })[] = [];

        identities.forEach(identity => {
            const tasks = data[identity.id]?.tasks || [];
            const openTasks = tasks
                .filter(t => !t.isDone)
                .map(t => ({ ...t, identityName: identity.name, identityId: identity.id }));
            allTasks = [...allTasks, ...openTasks];
        });

        // Sort by due date (earliest first), put no-date last
        return allTasks.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }).slice(0, 5);
    }, [identities, data]);

    // -- 3. Recent Updates / Activity Feed --
    type RecentEventType = 'email' | 'task' | 'subscription';
    interface RecentEvent {
        id: string;
        type: RecentEventType;
        title: string;
        date?: string;
        identityName: string;
        identityId: string;
    }

    const recentActivity = useMemo(() => {
        let events: RecentEvent[] = [];

        identities.forEach(identity => {
            const modData = data[identity.id];
            if (!modData) return;

            // Emails
            (modData.email || []).forEach(email => {
                events.push({
                    id: email.id,
                    type: 'email',
                    title: email.subject,
                    date: email.date,
                    identityName: identity.name,
                    identityId: identity.id
                });
            });

            // Tasks (upcoming)
            (modData.tasks || []).forEach(task => {
                if (!task.isDone && task.dueDate) {
                    events.push({
                        id: task.id,
                        type: 'task',
                        title: task.title,
                        date: task.dueDate,
                        identityName: identity.name,
                        identityId: identity.id
                    });
                }
            });

            // Subscriptions (upcoming billing)
            (modData.subscriptions || []).forEach(sub => {
                if (sub.nextBillingDate) {
                    events.push({
                        id: sub.id,
                        type: 'subscription',
                        title: `Billing: ${sub.name}`,
                        date: sub.nextBillingDate,
                        identityName: identity.name,
                        identityId: identity.id
                    });
                }
            });
        });

        // Sort by date descending (Activity Feed style)
        // Note: For upcoming stuff, "newest first" (furthest future) puts them at top?
        // Actually usually "Recent Updates" implies "What just happened" OR "What is most relevant".
        // The user said: "Most recent emails (by date)", "Tasks upcoming soon".
        // If we sort simply by date descending:
        // Future dates (tasks/subs) > Current > Past (emails).
        // This effectively shows upcoming tasks first, then recent emails. This works well.
        return events.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }).slice(0, 5);
    }, [identities, data]);

    // -- 4. Quick Admin Links --
    const quickLinks = useMemo(() => {
        let links: (AdminLinkRecord & { identityName: string; identityId: string })[] = [];

        identities.forEach(identity => {
            const adminLinks = data[identity.id]?.adminLinks || [];
            const mapped = adminLinks.map(l => ({ ...l, identityName: identity.name, identityId: identity.id }));
            links = [...links, ...mapped];
        });

        // Limit to 8
        return links.slice(0, 8);
    }, [identities, data]);


    // -- UI HELPERS --

    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    // Format date relative or short
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">System Overview</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* WIDGET 1: Subscription Overview */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-blue-400 mb-4">
                                <CreditCard size={18} />
                                <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-400">Recurring</h3>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-white tracking-tight">
                                    {formatCurrency(subscriptionData.monthlyCost)}
                                    <span className="text-sm text-gray-500 font-normal ml-1">/mo</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    across {subscriptionData.totalCount} active subscriptions
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                            <span>Estimated Spend</span>
                            <span className="text-blue-400/80">Analysis</span>
                        </div>
                    </div>
                </div>

                {/* WIDGET 2: Reminders / Upcoming */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-amber-400 mb-4">
                            <CheckSquare size={18} />
                            <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-400">Up Next</h3>
                        </div>

                        <div className="space-y-3 flex-1">
                            {upcomingTasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 py-2">
                                    <CheckSquare size={24} className="opacity-20" />
                                    <span className="text-xs">No open tasks</span>
                                </div>
                            ) : (
                                upcomingTasks.slice(0, 3).map(task => ( // Show top 3 tightly
                                    <div key={task.id} className="flex items-start gap-3 group/item">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500/50 group-hover/item:bg-amber-400 transition-colors"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-300 truncate group-hover/item:text-white transition-colors">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-white/5 rounded border border-white/5 truncate max-w-[80px]">
                                                    {task.identityName}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                                        <Clock size={10} /> {formatDate(task.dueDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* WIDGET 3: Activity Feed */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-purple-400 mb-4">
                            <Clock size={18} />
                            <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-400">Activity</h3>
                        </div>

                        <div className="space-y-3 flex-1 overflow-hidden">
                            {recentActivity.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 py-2">
                                    <Clock size={24} className="opacity-20" />
                                    <span className="text-xs">No recent activity</span>
                                </div>
                            ) : (
                                recentActivity.slice(0, 4).map((event) => ( // Show top 4
                                    <div key={`${event.type}-${event.id}`} className="flex items-center gap-3">
                                        {/* Icon */}
                                        <div className={`p-1.5 rounded-md bg-white/5 border border-white/5 text-gray-400 
                                            ${event.type === 'email' ? 'text-blue-400/80' : ''}
                                            ${event.type === 'task' ? 'text-amber-400/80' : ''}
                                            ${event.type === 'subscription' ? 'text-emerald-400/80' : ''}
                                        `}>
                                            {event.type === 'email' && <Mail size={12} />}
                                            {event.type === 'task' && <CheckSquare size={12} />}
                                            {event.type === 'subscription' && <CreditCard size={12} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-300 truncate">{event.title}</p>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <span className="text-[10px] text-gray-600">{formatDate(event.date)}</span>
                                                <span className="text-[10px] text-gray-600 opacity-50">{event.identityName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* WIDGET 4: Quick Links */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-emerald-400 mb-4">
                            <LinkIcon size={18} />
                            <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-400">Quick Access</h3>
                        </div>

                        <div className="flex-1">
                            {quickLinks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 py-2">
                                    <LinkIcon size={24} className="opacity-20" />
                                    <span className="text-xs">No admin links</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {quickLinks.slice(0, 5).map(link => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
                                                <span className="text-xs text-gray-300 font-medium truncate group-hover/link:text-emerald-300 transition-colors">
                                                    {link.label}
                                                </span>
                                            </div>
                                            <ExternalLink size={10} className="text-gray-600 group-hover/link:text-emerald-400 opacity-0 group-hover/link:opacity-100 transition-all" />
                                        </a>
                                    ))}
                                    {quickLinks.length > 5 && (
                                        <div className="text-[10px] text-center text-gray-600 pt-1">
                                            + {quickLinks.length - 5} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IdentityGlobalWidgets;
