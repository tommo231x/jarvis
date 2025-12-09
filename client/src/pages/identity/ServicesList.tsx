import { useState, useEffect } from 'react';
import { api, Service, Identity, Email } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { BackButton } from '../../components/BackButton';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Search, Plus, Globe, Edit2, Trash2, Archive, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { ServiceForm } from '../../components/identity/ServiceForm';

export const ServicesList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
    const [filterIdentity, setFilterIdentity] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Confirmation Modal State
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

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
    };

    const handleDeleteClick = (service: Service) => {
        if (!service.id) return;
        const isCurrentlyArchived = service.isArchived;
        const action = isCurrentlyArchived ? 'Permanently Delete' : 'Archive';

        setConfirmationModal({
            isOpen: true,
            title: `${action} Service`,
            message: `Are you sure you want to ${action.toLowerCase()} "${service.name}"? ${isCurrentlyArchived ? 'This action cannot be undone.' : 'You can restore it later from the archived list.'}`,
            confirmText: action,
            variant: 'danger',
            onConfirm: () => executeDelete(service)
        });
    };

    const executeDelete = async (service: Service) => {
        if (!service.id) return;
        const isCurrentlyArchived = service.isArchived;

        // Optimistic update
        if (isCurrentlyArchived) {
            setServices(prev => prev.filter(s => s.id !== service.id));
        } else {
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, isArchived: true } : s));
        }

        try {
            if (isCurrentlyArchived) {
                await api.services.delete(service.id);
            } else {
                await api.services.update(service.id, { isArchived: true });
            }
            fetchData();
        } catch (error) {
            console.error('Failed to update service:', error);
            fetchData();
        }
    };

    const handleRestore = async (service: Service) => {
        if (!service.id) return;
        // Optimistic update
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, isArchived: false } : s));

        try {
            await api.services.update(service.id, { isArchived: false });
            fetchData();
        } catch (error) {
            console.error('Failed to restore service:', error);
            fetchData();
        }
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        fetchData();
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase());

        const matchesIdentity = !filterIdentity ||
            (s.ownerIdentityIds && s.ownerIdentityIds.includes(filterIdentity)) ||
            (s.identityId === filterIdentity); // Legacy fallback

        const matchesEmail = !filterEmail ||
            s.billingEmailId === filterEmail ||
            s.emailId === filterEmail; // Legacy fallback

        // Exclude archived by default from main list
        const notArchived = !s.isArchived;

        return matchesSearch && matchesIdentity && matchesEmail && notArchived;
    });

    const archivedServices = services.filter(s => s.isArchived);

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            <BackButton to="/" label="Back to Dashboard" />

            {/* Header & Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Services</h1>
                        <p className="text-sm md:text-base text-jarvis-muted">Global view of all subscriptions and services.</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { setSelectedService(undefined); setIsFormOpen(true); }}
                        icon={<Plus className="w-4 h-4" />}
                        className="shrink-0"
                    >
                        <span className="hidden sm:inline">New Service</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 p-3 bg-jarvis-card/50 border border-jarvis-border/50 rounded-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jarvis-muted" />
                        <Input
                            placeholder="Search services..."
                            className="pl-9 h-9 text-sm bg-jarvis-bg/50 border-transparent focus:border-jarvis-accent"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="h-9 px-3 rounded-md bg-jarvis-bg/50 border border-jarvis-border/50 text-sm text-white focus:border-jarvis-accent outline-none"
                        value={filterIdentity}
                        onChange={(e) => setFilterIdentity(e.target.value)}
                    >
                        <option value="">All Identities</option>
                        {identities.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>

                    <select
                        className="h-9 px-3 rounded-md bg-jarvis-bg/50 border border-jarvis-border/50 text-sm text-white focus:border-jarvis-accent outline-none"
                        value={filterEmail}
                        onChange={(e) => setFilterEmail(e.target.value)}
                    >
                        <option value="">All Billing Emails</option>
                        {emails.map(e => <option key={e.id} value={e.id}>{e.address}</option>)}
                    </select>
                </div>
            </div>

            {/* Archived Services Section */}
            {archivedServices.length > 0 && (
                <div className="bg-jarvis-card/30 border border-jarvis-border/30 rounded-lg overflow-hidden transition-all">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-jarvis-muted">
                            <Archive className="w-4 h-4" />
                            <span className="text-sm font-medium">Archived Services ({archivedServices.length})</span>
                        </div>
                        {showArchived ? <ChevronDown className="w-4 h-4 text-jarvis-muted" /> : <ChevronRight className="w-4 h-4 text-jarvis-muted" />}
                    </button>

                    {showArchived && (
                        <div className="border-t border-jarvis-border/30 divide-y divide-jarvis-border/30 animate-fade-in">
                            {archivedServices.map(service => {
                                const billingEmail = emails.find(e => e.id === service.billingEmailId || e.id === service.emailId);
                                return (
                                    <div key={service.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-jarvis-muted">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-jarvis-muted strike-through opacity-80">{service.name}</h3>
                                                <p className="text-xs text-jarvis-muted opacity-60">
                                                    {billingEmail?.address || 'No billing email'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRestore(service)}
                                                className="h-8 text-xs gap-1.5 border-jarvis-border"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-jarvis-card/50 backdrop-blur-sm border border-jarvis-border/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-jarvis-border/50 text-xs font-medium text-jarvis-muted uppercase tracking-wider bg-white/5">
                    <div className="col-span-3">Service</div>
                    <div className="col-span-3">Owners</div>
                    <div className="col-span-2">Billing</div>
                    <div className="col-span-2">Cost</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-jarvis-border/30">
                    {isLoading ? (
                        <div className="p-8 text-center text-jarvis-muted">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="p-8 text-center text-jarvis-muted">No services found matching filters.</div>
                    ) : (
                        filteredServices.map((service) => {
                            const billingEmail = emails.find(e => e.id === service.billingEmailId || e.id === service.emailId);

                            return (
                                <div
                                    key={service.id}
                                    className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors duration-200"
                                >
                                    {/* Service */}
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-jarvis-bg/50 border border-jarvis-border flex items-center justify-center text-jarvis-accent group-hover:text-white transition-colors">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-white truncate group-hover:text-jarvis-accent transition-colors">{service.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-jarvis-muted truncate">{service.category}</span>
                                                <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="text-[10px] px-1 py-0 h-4">
                                                    {service.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owners */}
                                    <div className="col-span-3 flex items-center -space-x-2">
                                        {service.ownerIdentityIds && service.ownerIdentityIds.length > 0 ? (
                                            service.ownerIdentityIds.map(id => {
                                                const identity = identities.find(i => i.id === id);
                                                if (!identity) return null;
                                                return (
                                                    <div key={id} className="w-8 h-8 rounded-full bg-jarvis-bg border-2 border-jarvis-card flex items-center justify-center text-xs text-white" title={identity.name}>
                                                        {identity.avatar ? (
                                                            <img src={identity.avatar} alt={identity.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            identity.name.substring(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Fallback for legacy
                                            service.identityId && (
                                                <span className="text-xs text-jarvis-muted italic">Legacy Owner</span>
                                            )
                                        )}
                                    </div>

                                    {/* Billing */}
                                    <div className="col-span-2">
                                        {billingEmail ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-white truncate" title={billingEmail.address}>{billingEmail.address}</span>
                                                {billingEmail.label && <span className="text-[10px] text-jarvis-muted">{billingEmail.label}</span>}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-jarvis-muted">-</span>
                                        )}
                                    </div>

                                    {/* Cost */}
                                    <div className="col-span-2">
                                        {service.cost && service.cost.amount > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: service.cost.currency }).format(service.cost.amount)}
                                                </span>
                                                <span className="text-[10px] text-jarvis-muted capitalize">/{service.billingCycle}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-jarvis-muted">Free</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-8 w-8 text-jarvis-muted hover:text-white">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(service)} className="h-8 w-8 text-jarvis-muted hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Mobile List View (Simplified Card) */}
            <div className="md:hidden space-y-3">
                {filteredServices.map((service) => (
                    <div key={service.id} className="bg-jarvis-card/50 backdrop-blur-sm border border-jarvis-border/50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-white font-medium">{service.name}</h3>
                                <p className="text-xs text-jarvis-muted">{service.category}</p>
                            </div>
                            <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="text-[10px] capitalize">
                                {service.status}
                            </Badge>
                        </div>
                        {/* Mobile Actions */}
                        <div className="flex gap-2 justify-end mt-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>Edit</Button>
                        </div>
                    </div>
                ))}
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

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText={confirmationModal.confirmText}
                variant={confirmationModal.variant}
            />
        </div>
    );
};
