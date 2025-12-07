import { useEffect, useState } from 'react';
import { api, Service, Project } from '../../api';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Shield, Folder, Activity, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';

export const IdentityHome = () => {
    const [stats, setStats] = useState({
        serviceCount: 0,
        activeProjectCount: 0,
        emailCount: 0,
        monthlyCost: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [services, projects, emails] = await Promise.all([
                    api.services.list(),
                    api.projects.list(),
                    api.emails.list()
                ]);

                const monthlyCost = services.reduce((acc: number, service: Service) => {
                    const amount = service.cost?.amount || 0;
                    const cycle = service.billingCycle || 'monthly';
                    if (cycle === 'yearly') return acc + (amount / 12);
                    return acc + amount;
                }, 0);

                setStats({
                    serviceCount: services.length,
                    activeProjectCount: projects.filter((p: Project) => p.status === 'active').length,
                    emailCount: emails.length,
                    monthlyCost
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end pb-4 border-b border-jarvis-border/30">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Identity Hub</h1>
                    <p className="text-jarvis-muted/80">Digital footprint oversight and resource management.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/apps/identity/services">
                        <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />}>
                            Add Service
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-[auto_auto]">

                {/* 1. Monthly Burn (Main KPI) - Large Square */}
                <Card className="md:col-span-1 md:row-span-1 flex flex-col justify-between" hover>
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-jarvis-danger/10 text-jarvis-danger rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className="opacity-50 text-[10px]">ESTIMATED</Badge>
                    </div>
                    <div>
                        <p className="text-jarvis-muted text-xs font-medium uppercase tracking-wider mb-1">Monthly Burn</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {loading ? '...' : `$${stats.monthlyCost.toFixed(2)}`}
                        </h2>
                        <p className="text-xs text-jarvis-muted mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-jarvis-success" />
                            <span className="text-jarvis-success font-medium">+2.5%</span> from last month
                        </p>
                    </div>
                </Card>

                {/* 2. Services Count - Small Rectangle */}
                <Link to="/apps/identity/services" className="md:col-span-1">
                    <Card className="h-full flex flex-col justify-between group" hover>
                        <div className="flex items-center justify-between mb-2">
                            <Shield className="w-5 h-5 text-jarvis-accent group-hover:text-white transition-colors" />
                            <ArrowRight className="w-4 h-4 text-jarvis-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{loading ? '...' : stats.serviceCount}</h3>
                            <p className="text-sm text-jarvis-muted">Active Services</p>
                        </div>
                    </Card>
                </Link>

                {/* 3. Projects Count - Small Rectangle */}
                <Link to="/apps/identity/projects" className="md:col-span-1">
                    <Card className="h-full flex flex-col justify-between group" hover>
                        <div className="flex items-center justify-between mb-2">
                            <Folder className="w-5 h-5 text-jarvis-secondary group-hover:text-white transition-colors" />
                            <ArrowRight className="w-4 h-4 text-jarvis-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{loading ? '...' : stats.activeProjectCount}</h3>
                            <p className="text-sm text-jarvis-muted">Active Projects</p>
                        </div>
                    </Card>
                </Link>

                {/* 4. Action Center - Tall Vertical (Right Side) */}
                <Card className="md:col-span-1 md:row-span-2 hidden lg:block" title="Quick Actions" icon={Activity}>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-jarvis-muted hover:text-white transition-colors flex items-center gap-2 group">
                            <div className="w-1 h-1 rounded-full bg-jarvis-accent group-hover:scale-150 transition-transform" />
                            Rotate API Keys
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-jarvis-muted hover:text-white transition-colors flex items-center gap-2 group">
                            <div className="w-1 h-1 rounded-full bg-jarvis-secondary group-hover:scale-150 transition-transform" />
                            Check Domain Expiry
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-jarvis-muted hover:text-white transition-colors flex items-center gap-2 group">
                            <div className="w-1 h-1 rounded-full bg-jarvis-warning group-hover:scale-150 transition-transform" />
                            Review Compliance
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-jarvis-border/50">
                        <p className="text-xs text-jarvis-muted mb-4 uppercase tracking-wider font-semibold">System Health</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-jarvis-text">Identity API</span>
                                <span className="text-jarvis-success">Operational</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-jarvis-text">Database</span>
                                <span className="text-jarvis-success">Operational</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 5. Recent Activity - Wide Rectangle */}
                <Card className="md:col-span-3 lg:col-span-3" title="Recent Activity" icon={Activity}>
                    <div className="space-y-0">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-jarvis-border/30 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded transition-colors cursor-default group">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-full bg-jarvis-border text-jarvis-muted group-hover:bg-jarvis-accent/20 group-hover:text-jarvis-accent transition-colors">
                                        <Activity className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-jarvis-text">Updated service <span className="text-white font-medium">Netflix</span> cost</p>
                                    </div>
                                </div>
                                <span className="text-xs text-jarvis-muted font-mono">2h ago</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
