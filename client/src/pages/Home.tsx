import { useEffect, useState } from 'react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Shield, CreditCard, Folder, ArrowRight, LayoutGrid, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
    const [stats, setStats] = useState({
        monthlyCost: 0,
        activeProjects: 0,
        serviceCount: 0,
        isLoading: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [services, projects] = await Promise.all([
                    api.services.list(),
                    api.projects.list()
                ]);

                const monthlyCost = services.reduce((total, service) => {
                    if (!service.cost || service.status === 'cancelled') return total;
                    if (service.billingCycle === 'monthly') return total + service.cost.amount;
                    if (service.billingCycle === 'yearly') return total + (service.cost.amount / 12);
                    return total;
                }, 0);

                const activeProjects = projects.filter(p => p.status === 'active').length;

                setStats({
                    monthlyCost,
                    activeProjects,
                    serviceCount: services.length,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                setStats(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Command Center</h1>
                    <p className="text-jarvis-muted">Overview of your digital ecosystem.</p>
                </div>
                <div className="text-sm text-jarvis-muted">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-jarvis-muted mb-1">Monthly Spend</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : `$${stats.monthlyCost.toFixed(2)}`}
                        </p>
                    </div>
                    <div className="p-3 bg-jarvis-accent/10 rounded-lg text-jarvis-accent">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-jarvis-muted mb-1">Active Projects</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : stats.activeProjects}
                        </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                        <Folder className="w-5 h-5" />
                    </div>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-jarvis-muted mb-1">Services Tracked</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : stats.serviceCount}
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Shield className="w-5 h-5" />
                    </div>
                </Card>
            </div>

            <div className="border-t border-jarvis-border pt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Applications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Identity App Card */}
                    <Card hover className="group relative overflow-hidden text-left bg-gradient-to-br from-jarvis-card to-jarvis-bg border-jarvis-accent/20">
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Shield className="w-24 h-24 text-jarvis-accent/5 -rotate-12 transform translate-x-8 -translate-y-8" />
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-jarvis-accent/10 rounded-xl flex items-center justify-center text-jarvis-accent mb-2">
                                <Shield className="w-6 h-6" />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-jarvis-accent transition-colors">Identity & Services</h3>
                                <p className="text-sm text-jarvis-muted line-clamp-2">
                                    Manage email identities, subscriptions, and project infrastructure.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline">{stats.isLoading ? '...' : stats.serviceCount} Services</Badge>
                                <Badge variant="outline">{stats.isLoading ? '...' : stats.activeProjects} Projects</Badge>
                            </div>

                            <div className="pt-2">
                                <Link to="/apps/identity">
                                    <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent group-hover:text-jarvis-accent">
                                        Open App <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Fina Admin Placeholder */}
                    <Card className="opacity-75 border-dashed">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-jarvis-border/30 rounded-xl flex items-center justify-center text-jarvis-muted mb-2">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-jarvis-muted mb-1">Fina Admin</h3>
                                <p className="text-sm text-jarvis-muted/70">
                                    Content management and analytics for FinaFeels.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Badge variant="default" className="bg-jarvis-border/50">Coming Soon</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Automation Placeholder */}
                    <Card className="opacity-75 border-dashed">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-jarvis-border/30 rounded-xl flex items-center justify-center text-jarvis-muted mb-2">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-jarvis-muted mb-1">Automation Hub</h3>
                                <p className="text-sm text-jarvis-muted/70">
                                    Bot control and scheduled task management.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Badge variant="default" className="bg-jarvis-border/50">Coming Soon</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
