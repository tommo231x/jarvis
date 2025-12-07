import { useEffect, useState } from 'react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Shield, CreditCard, Folder, ArrowRight, LayoutGrid, Bot, Zap, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApiConnection {
    name: string;
    status: 'connected' | 'not_configured' | 'error' | 'loading';
    latency?: number;
    provider?: string;
    model?: string;
    error?: string;
}

export const HomePage = () => {
    const [stats, setStats] = useState({
        monthlyCost: 0,
        activeProjects: 0,
        serviceCount: 0,
        isLoading: true
    });

    const [apiConnections, setApiConnections] = useState<ApiConnection[]>([
        { name: 'OpenAI', status: 'loading' }
    ]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchApiConnections = async () => {
        setIsRefreshing(true);
        try {
            const openaiStatus = await api.status.openai();
            setApiConnections([{
                name: 'OpenAI',
                status: openaiStatus.status,
                latency: openaiStatus.latency,
                provider: openaiStatus.provider,
                model: openaiStatus.model,
                error: openaiStatus.error
            }]);
        } catch (error) {
            setApiConnections([{
                name: 'OpenAI',
                status: 'error',
                error: 'Failed to check connection'
            }]);
        }
        setIsRefreshing(false);
    };

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
        fetchApiConnections();
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

            {/* API Connections Card */}
            <div className="border-t border-jarvis-border pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">API Connections</h2>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={fetchApiConnections}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apiConnections.map((connection) => (
                        <Card key={connection.name} className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        connection.status === 'connected' 
                                            ? 'bg-emerald-500/10 text-emerald-400' 
                                            : connection.status === 'error' 
                                            ? 'bg-red-500/10 text-red-400'
                                            : connection.status === 'loading'
                                            ? 'bg-blue-500/10 text-blue-400'
                                            : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">{connection.name}</h3>
                                        {connection.provider && (
                                            <p className="text-xs text-jarvis-muted">{connection.provider}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {connection.status === 'connected' && (
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    )}
                                    {connection.status === 'error' && (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                    {connection.status === 'not_configured' && (
                                        <AlertCircle className="w-5 h-5 text-amber-400" />
                                    )}
                                    {connection.status === 'loading' && (
                                        <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-jarvis-border">
                                <div className="flex items-center justify-between">
                                    <Badge 
                                        variant={
                                            connection.status === 'connected' ? 'success' 
                                            : connection.status === 'error' ? 'danger'
                                            : connection.status === 'loading' ? 'default'
                                            : 'outline'
                                        }
                                    >
                                        {connection.status === 'connected' ? 'Connected' 
                                         : connection.status === 'error' ? 'Error'
                                         : connection.status === 'loading' ? 'Checking...'
                                         : 'Not Configured'}
                                    </Badge>
                                    {connection.latency && (
                                        <span className="text-xs text-jarvis-muted">{connection.latency}ms</span>
                                    )}
                                </div>
                                {connection.model && (
                                    <p className="text-xs text-jarvis-muted mt-2">Model: {connection.model}</p>
                                )}
                                {connection.error && (
                                    <p className="text-xs text-red-400 mt-2 truncate" title={connection.error}>
                                        {connection.error}
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
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
