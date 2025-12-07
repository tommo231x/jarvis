import { useEffect, useState } from 'react';
import { api, Message, Email, Service } from '../api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { 
    Shield, CreditCard, Folder, ArrowRight, LayoutGrid, Bot, Zap, 
    CheckCircle, XCircle, AlertCircle, RefreshCw, Mail, Inbox,
    AlertTriangle, User, Building2, Globe
} from 'lucide-react';
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
        unreadMessages: 0,
        isLoading: true
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [identities, setIdentities] = useState<Email[]>([]);

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
                const [servicesData, projects, messagesData, emailsData] = await Promise.all([
                    api.services.list(),
                    api.projects.list(),
                    api.messages.list(),
                    api.emails.list()
                ]);

                setServices(servicesData);
                setMessages(messagesData);
                setIdentities(emailsData);

                const monthlyCost = servicesData.reduce((total, service) => {
                    if (!service.cost || service.status === 'cancelled') return total;
                    if (service.billingCycle === 'monthly') return total + service.cost.amount;
                    if (service.billingCycle === 'yearly') return total + (service.cost.amount / 12);
                    return total;
                }, 0);

                const activeProjects = projects.filter(p => p.status === 'active').length;
                const unreadMessages = messagesData.filter(m => !m.read).length;

                setStats({
                    monthlyCost,
                    activeProjects,
                    serviceCount: servicesData.length,
                    unreadMessages,
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-500/10';
            case 'medium': return 'text-amber-400 bg-amber-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'security': return 'danger';
            case 'financial': return 'warning';
            case 'transactional': return 'default';
            case 'marketing': return 'outline';
            default: return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

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
                            {stats.isLoading ? '...' : `£${stats.monthlyCost.toFixed(2)}`}
                        </p>
                    </div>
                    <div className="p-3 bg-jarvis-accent/10 rounded-lg text-jarvis-accent">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-jarvis-muted mb-1">Unread Messages</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : stats.unreadMessages}
                        </p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                        <Mail className="w-5 h-5" />
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
            </div>

            {/* Inbox Section */}
            <div className="border-t border-jarvis-border pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Inbox className="w-5 h-5 text-jarvis-accent" />
                        <h2 className="text-lg font-semibold text-white">Recent Inbox</h2>
                        {stats.unreadMessages > 0 && (
                            <Badge variant="danger">{stats.unreadMessages} unread</Badge>
                        )}
                    </div>
                    <Link to="/apps/identity/emails">
                        <Button variant="ghost" size="sm" className="gap-2">
                            View All <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
                <Card className="divide-y divide-jarvis-border">
                    {messages.length === 0 ? (
                        <div className="p-8 text-center text-jarvis-muted">
                            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No messages yet</p>
                        </div>
                    ) : (
                        [...messages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((message) => (
                            <div key={message.id} className={`p-4 flex items-start gap-4 hover:bg-jarvis-border/20 transition ${!message.read ? 'bg-jarvis-accent/5' : ''}`}>
                                <div className={`p-2 rounded-lg flex-shrink-0 ${getPriorityColor(message.priority)}`}>
                                    {message.priority === 'high' ? (
                                        <AlertTriangle className="w-4 h-4" />
                                    ) : (
                                        <Mail className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className={`text-sm truncate ${!message.read ? 'font-semibold text-white' : 'text-jarvis-muted'}`}>
                                                {message.subject}
                                            </p>
                                            <p className="text-xs text-jarvis-muted truncate mt-0.5">
                                                {message.from}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Badge variant={getCategoryColor(message.category) as any} className="text-xs">
                                                {message.category}
                                            </Badge>
                                            <span className="text-xs text-jarvis-muted whitespace-nowrap">
                                                {formatDate(message.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </Card>
            </div>

            {/* Services & Identities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-lg font-semibold text-white">Services</h2>
                        </div>
                        <Link to="/apps/identity/services">
                            <Button variant="ghost" size="sm" className="gap-2">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <Card className="divide-y divide-jarvis-border">
                        {services.length === 0 ? (
                            <div className="p-8 text-center text-jarvis-muted">
                                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No services tracked yet</p>
                            </div>
                        ) : (
                            services.slice(0, 5).map((service) => (
                                <div key={service.id} className="p-4 flex items-center justify-between hover:bg-jarvis-border/20 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-jarvis-accent/20 to-purple-500/20 flex items-center justify-center text-jarvis-accent font-bold text-sm">
                                            {service.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{service.name}</p>
                                            <p className="text-xs text-jarvis-muted">{service.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {service.cost ? (
                                            <p className="text-sm font-medium text-white">
                                                £{service.cost.amount.toFixed(2)}
                                                <span className="text-xs text-jarvis-muted ml-1">
                                                    /{service.billingCycle === 'yearly' ? 'yr' : 'mo'}
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-jarvis-muted">Free</p>
                                        )}
                                        <Badge 
                                            variant={service.status === 'active' ? 'success' : service.status === 'past_due' ? 'danger' : 'outline'}
                                            className="text-xs mt-1"
                                        >
                                            {service.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>

                {/* Identities Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-violet-400" />
                            <h2 className="text-lg font-semibold text-white">Identities</h2>
                        </div>
                        <Link to="/apps/identity/emails">
                            <Button variant="ghost" size="sm" className="gap-2">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <Card className="divide-y divide-jarvis-border">
                        {identities.length === 0 ? (
                            <div className="p-8 text-center text-jarvis-muted">
                                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No identities configured yet</p>
                            </div>
                        ) : (
                            identities.map((identity) => (
                                <div key={identity.id} className="p-4 flex items-center justify-between hover:bg-jarvis-border/20 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            identity.type === 'work' 
                                                ? 'bg-blue-500/10 text-blue-400' 
                                                : 'bg-violet-500/10 text-violet-400'
                                        }`}>
                                            {identity.type === 'work' ? (
                                                <Building2 className="w-5 h-5" />
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{identity.label}</p>
                                            <p className="text-xs text-jarvis-muted">{identity.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {identity.provider}
                                        </Badge>
                                        <Badge 
                                            variant={identity.type === 'work' ? 'default' : 'success'}
                                            className="text-xs capitalize"
                                        >
                                            {identity.type}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>
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
