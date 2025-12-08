import { useState, useEffect } from 'react';
import { api, Service, Identity, Email } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { BackButton } from '../../components/BackButton';
import { Search, Plus, ExternalLink, Globe, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { ServiceForm } from '../../components/identity/ServiceForm';

export const ServicesList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [servicesData, identitiesData, emailsData] = await Promise.all([
                api.services.list(),
                api.identities.list(),
                api.emails.list()
            ]);
            setServices(servicesData);
            setIdentities(identitiesData);
            setEmails(emailsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setIsFormOpen(true);
        setActiveMenu(null);
    };

    const handleDelete = async (service: Service) => {
        if (!service.id) return;
        if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
            try {
                await api.services.delete(service.id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete service:', error);
            }
        }
        setActiveMenu(null);
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        fetchData();
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            <BackButton to="/" label="Back to Dashboard" />
            
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Services</h1>
                    <p className="text-sm md:text-base text-jarvis-muted">Manage your subscription stack.</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jarvis-muted" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 h-10 md:h-9 text-sm bg-jarvis-card/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { setSelectedService(undefined); setIsFormOpen(true); }}
                        icon={<Plus className="w-4 h-4" />}
                        className="shrink-0 h-10 md:h-9 px-3 md:px-4"
                    >
                        <span className="hidden sm:inline">New Service</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-jarvis-card/50 backdrop-blur-sm border border-jarvis-border/50 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-jarvis-border/50 text-xs font-medium text-jarvis-muted uppercase tracking-wider bg-white/5">
                    <div className="col-span-4">Service</div>
                    <div className="col-span-3">Details</div>
                    <div className="col-span-2">Cost</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-jarvis-border/30">
                    {isLoading ? (
                        <div className="p-8 text-center text-jarvis-muted">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="p-8 text-center text-jarvis-muted">No services found.</div>
                    ) : (
                        filteredServices.map((service) => (
                            <div
                                key={service.id}
                                className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors duration-200"
                            >
                                {/* Name & Category */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-jarvis-bg/50 border border-jarvis-border flex items-center justify-center text-jarvis-accent group-hover:text-white transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-jarvis-accent transition-colors">{service.name}</h3>
                                        <span className="text-xs text-jarvis-muted">{service.category}</span>
                                    </div>
                                </div>

                                {/* Details (Link/Email) */}
                                <div className="col-span-3 flex flex-col justify-center gap-1">
                                    {service.loginUrl && (
                                        <a href={service.loginUrl} target="_blank" rel="noreferrer" className="text-xs text-jarvis-muted hover:text-white flex items-center gap-1 transition-colors w-fit">
                                            <ExternalLink className="w-3 h-3" />
                                            Login
                                        </a>
                                    )}
                                </div>

                                {/* Cost */}
                                <div className="col-span-2">
                                    <div className="flex flex-col">
                                        {service.cost && service.cost.amount > 0 ? (
                                            <>
                                                <span className="text-sm font-medium text-white">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: service.cost.currency }).format(service.cost.amount)}
                                                </span>
                                                <span className="text-[10px] text-jarvis-muted capitalize">
                                                    /{service.billingCycle}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-jarvis-muted">-</span>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="text-[10px] capitalize">
                                        {service.status}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-8 w-8 text-jarvis-muted hover:text-white">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service)} className="h-8 w-8 text-jarvis-muted hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {isLoading ? (
                    <div className="p-8 text-center text-jarvis-muted bg-jarvis-card/50 rounded-xl border border-jarvis-border/50">
                        Loading services...
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="p-8 text-center text-jarvis-muted bg-jarvis-card/50 rounded-xl border border-jarvis-border/50">
                        <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No services found.</p>
                    </div>
                ) : (
                    filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="bg-jarvis-card/50 backdrop-blur-sm border border-jarvis-border/50 rounded-xl p-4 active:bg-white/5 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-jarvis-bg/50 border border-jarvis-border flex items-center justify-center text-jarvis-accent flex-shrink-0">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">{service.name}</h3>
                                        <p className="text-xs text-jarvis-muted truncate">{service.category}</p>
                                    </div>
                                </div>
                                
                                {/* Mobile Actions Menu */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setActiveMenu(activeMenu === service.id ? null : service.id)}
                                        className="p-2 text-jarvis-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {activeMenu === service.id && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setActiveMenu(null)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                                                <button 
                                                    onClick={() => handleEdit(service)}
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(service)}
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-jarvis-border/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="text-xs capitalize">
                                        {service.status}
                                    </Badge>
                                    {service.loginUrl && (
                                        <a 
                                            href={service.loginUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-xs text-jarvis-accent flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Login
                                        </a>
                                    )}
                                </div>
                                <div className="text-right">
                                    {service.cost && service.cost.amount > 0 ? (
                                        <p className="text-sm font-medium text-white">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: service.cost.currency }).format(service.cost.amount)}
                                            <span className="text-xs text-jarvis-muted ml-1">/{service.billingCycle}</span>
                                        </p>
                                    ) : (
                                        <span className="text-sm text-jarvis-muted">Free</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isFormOpen && (
                <ServiceForm
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsFormOpen(false)}
                    initialData={selectedService}
                    identities={identities}
                    emails={emails}
                />
            )}
        </div>
    );
};
