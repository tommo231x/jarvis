import { useEffect, useState } from 'react';
import { api, Identity, Email, Service } from '../api';
import { useDataRefresh } from '../context/DataRefreshContext';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { 
    Shield, CreditCard, Folder, ArrowRight, LayoutGrid, Bot, Zap, 
    CheckCircle, XCircle, AlertCircle, RefreshCw, Mail,
    User, Building2, Globe, Briefcase, Code
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ApiConnection {
    name: string;
    status: string;
    latency?: number;
    provider?: string;
    model?: string;
    error?: string;
}

export const HomePage = () => {
    const navigate = useNavigate();
    const { refreshKey, triggerRefresh } = useDataRefresh();
    const [stats, setStats] = useState({
        monthlyCost: 0,
        activeProjects: 0,
        serviceCount: 0,
        identityCount: 0,
        emailCount: 0,
        isLoading: true
    });

    const [identities, setIdentities] = useState<Identity[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [services, setServices] = useState<Service[]>([]);

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
                const [identitiesData, emailsData, servicesData, projects] = await Promise.all([
                    api.identities.list(),
                    api.emails.list(),
                    api.services.list(),
                    api.projects.list()
                ]);

                setIdentities(identitiesData);
                setEmails(emailsData);
                setServices(servicesData);

                const monthlyCost = servicesData.reduce((total, service) => {
                    if (!service.cost || service.status === 'cancelled') return total;
                    if (service.billingCycle === 'monthly') return total + service.cost.amount;
                    if (service.billingCycle === 'yearly') return total + (service.cost.amount / 12);
                    return total;
                }, 0);

                const activeProjects = projects.filter(p => p.status === 'active').length;

                setStats({
                    monthlyCost,
                    activeProjects,
                    serviceCount: servicesData.length,
                    identityCount: identitiesData.length,
                    emailCount: emailsData.length,
                    isLoading: false
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                setStats(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchData();
        fetchApiConnections();
    }, [refreshKey]);

    const getIdentityIcon = (category: string) => {
        switch (category) {
            case 'work': return <Briefcase className="w-5 h-5" />;
            case 'business': return <Building2 className="w-5 h-5" />;
            case 'project': return <Code className="w-5 h-5" />;
            default: return <User className="w-5 h-5" />;
        }
    };

    const getIdentityColor = (category: string) => {
        switch (category) {
            case 'work': return 'bg-blue-500/10 text-blue-400';
            case 'business': return 'bg-emerald-500/10 text-emerald-400';
            case 'project': return 'bg-amber-500/10 text-amber-400';
            default: return 'bg-violet-500/10 text-violet-400';
        }
    };

    const getEmailsForIdentity = (identityId: string) => {
        return emails.filter(e => e.identityId === identityId);
    };

    const getServicesForIdentity = (identityId: string) => {
        return services.filter(s => s.identityId === identityId);
    };

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header - Mobile Optimized */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white mb-0.5 md:mb-1">Command Center</h1>
                    <p className="text-sm md:text-base text-jarvis-muted">Overview of your digital ecosystem.</p>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                    <button
                        onClick={triggerRefresh}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-4 h-4 ${stats.isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <div className="text-xs md:text-sm text-jarvis-muted">
                        <span className="hidden sm:inline">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="sm:hidden">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Summary Stats - Mobile Optimized Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card 
                    hover 
                    className="p-3 md:p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate('/apps/identity/services')}
                >
                    <div className="min-w-0">
                        <p className="text-xs md:text-sm text-jarvis-muted mb-0.5 md:mb-1 truncate">Monthly Spend</p>
                        <p className="text-lg md:text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : `£${stats.monthlyCost.toFixed(0)}`}
                        </p>
                    </div>
                    <div className="p-2 md:p-3 bg-jarvis-accent/10 rounded-lg text-jarvis-accent flex-shrink-0">
                        <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                </Card>

                <Card 
                    hover 
                    className="p-3 md:p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate('/apps/identity/emails')}
                >
                    <div className="min-w-0">
                        <p className="text-xs md:text-sm text-jarvis-muted mb-0.5 md:mb-1 truncate">Identities</p>
                        <p className="text-lg md:text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : stats.identityCount}
                        </p>
                    </div>
                    <div className="p-2 md:p-3 bg-violet-500/10 rounded-lg text-violet-400 flex-shrink-0">
                        <User className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                </Card>

                <Card 
                    hover 
                    className="p-3 md:p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate('/apps/identity/services')}
                >
                    <div className="min-w-0">
                        <p className="text-xs md:text-sm text-jarvis-muted mb-0.5 md:mb-1 truncate">Services</p>
                        <p className="text-lg md:text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : stats.serviceCount}
                        </p>
                    </div>
                    <div className="p-2 md:p-3 bg-emerald-500/10 rounded-lg text-emerald-400 flex-shrink-0">
                        <Shield className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                </Card>

                <Card 
                    hover 
                    className="p-3 md:p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate('/apps/identity/projects')}
                >
                    <div className="min-w-0">
                        <p className="text-xs md:text-sm text-jarvis-muted mb-0.5 md:mb-1 truncate">Projects</p>
                        <p className="text-lg md:text-2xl font-bold text-white">
                            {stats.isLoading ? '...' : stats.activeProjects}
                        </p>
                    </div>
                    <div className="p-2 md:p-3 bg-purple-500/10 rounded-lg text-purple-400 flex-shrink-0">
                        <Folder className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                </Card>
            </div>

            {/* Identities & Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Identities Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <User className="w-4 h-4 md:w-5 md:h-5 text-violet-400" />
                            <h2 className="text-base md:text-lg font-semibold text-white">Identities</h2>
                        </div>
                        <Link to="/apps/identity/emails">
                            <Button variant="ghost" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                                <span className="hidden sm:inline">Manage</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <Card className="divide-y divide-jarvis-border">
                        {identities.length === 0 ? (
                            <div className="p-6 md:p-8 text-center text-jarvis-muted">
                                <User className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No identities configured yet</p>
                            </div>
                        ) : (
                            identities.map((identity) => {
                                const identityEmails = getEmailsForIdentity(identity.id);
                                const identityServices = getServicesForIdentity(identity.id);
                                return (
                                    <div 
                                        key={identity.id} 
                                        className="p-3 md:p-4 flex items-center justify-between hover:bg-jarvis-border/20 active:bg-jarvis-border/30 transition cursor-pointer"
                                        onClick={() => navigate('/apps/identity/emails')}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIdentityColor(identity.category)}`}>
                                                {getIdentityIcon(identity.category)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{identity.name}</p>
                                                <p className="text-xs text-jarvis-muted truncate">{identity.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 ml-2">
                                            <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2">
                                                <Mail className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                                                {identityEmails.length}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2 hidden sm:flex">
                                                <Globe className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                                                {identityServices.length}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </Card>
                </div>

                {/* Services Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Globe className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                            <h2 className="text-base md:text-lg font-semibold text-white">Services</h2>
                        </div>
                        <Link to="/apps/identity/services">
                            <Button variant="ghost" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                                <span className="hidden sm:inline">View All</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <Card className="divide-y divide-jarvis-border">
                        {services.length === 0 ? (
                            <div className="p-6 md:p-8 text-center text-jarvis-muted">
                                <Globe className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No services tracked yet</p>
                            </div>
                        ) : (
                            services.slice(0, 5).map((service) => (
                                <div 
                                    key={service.id} 
                                    className="p-3 md:p-4 flex items-center justify-between hover:bg-jarvis-border/20 active:bg-jarvis-border/30 transition cursor-pointer"
                                    onClick={() => navigate('/apps/identity/services')}
                                >
                                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-jarvis-accent/20 to-purple-500/20 flex items-center justify-center text-jarvis-accent font-bold text-xs md:text-sm flex-shrink-0">
                                            {service.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{service.name}</p>
                                            <p className="text-xs text-jarvis-muted truncate">{service.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        {service.cost ? (
                                            <p className="text-xs md:text-sm font-medium text-white">
                                                £{service.cost.amount.toFixed(0)}
                                                <span className="text-[10px] md:text-xs text-jarvis-muted ml-0.5">
                                                    /{service.billingCycle === 'yearly' ? 'yr' : 'mo'}
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-jarvis-muted">Free</p>
                                        )}
                                        <Badge 
                                            variant={service.status === 'active' ? 'success' : service.status === 'past_due' ? 'danger' : 'outline'}
                                            className="text-[10px] md:text-xs mt-1"
                                        >
                                            {service.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </div>

            {/* API Connections Card */}
            <div className="border-t border-jarvis-border pt-4 md:pt-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-base md:text-lg font-semibold text-white">API Connections</h2>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={fetchApiConnections}
                        disabled={isRefreshing}
                        className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                    {/* Identity App Card - Fully Clickable */}
                    <Card 
                        hover 
                        className="group relative overflow-hidden text-left bg-gradient-to-br from-jarvis-card to-jarvis-bg border-jarvis-accent/20 cursor-pointer"
                        onClick={() => navigate('/apps/identity/services')}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <LayoutGrid className="w-16 h-16 text-jarvis-accent/20" />
                        </div>
                        <div className="p-6 relative z-10">
                            <div className="p-3 bg-jarvis-accent/10 rounded-lg w-fit mb-4">
                                <Shield className="w-6 h-6 text-jarvis-accent" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-jarvis-accent transition-colors">Identity & Services</h3>
                                <p className="text-sm text-jarvis-muted mb-4">
                                    Manage your digital identities, email accounts, subscriptions, and projects.
                                </p>
                                <div className="flex items-center text-jarvis-accent text-sm font-medium gap-1">
                                    Open App <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* AI Assistant Card - Fully Clickable */}
                    <Card 
                        hover 
                        className="group relative overflow-hidden text-left bg-gradient-to-br from-jarvis-card to-jarvis-bg border-purple-500/20 cursor-pointer"
                        onClick={() => navigate('/apps/identity/ai-query')}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Bot className="w-16 h-16 text-purple-500/20" />
                        </div>
                        <div className="p-6 relative z-10">
                            <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
                                <Bot className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">AI Assistant</h3>
                                <p className="text-sm text-jarvis-muted mb-4">
                                    Query your data using natural language. Ask about costs, renewals, and more.
                                </p>
                                <div className="flex items-center text-purple-400 text-sm font-medium gap-1">
                                    Open App <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
