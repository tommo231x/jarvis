import { useState, useEffect, useMemo } from 'react';
import { api, Identity, Email, Service } from '../../api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ServiceForm } from '../../components/identity/ServiceForm';
import { EmailForm } from '../../components/identity/EmailForm';
import { ServiceDetailsModal } from '../../components/identity/ServiceDetailsModal';
import { AddServicesToProfileModal } from '../../components/identity/AddServicesToProfileModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import {
    User, Building2, Code, Plus, Mail, Shield,
    LayoutGrid, CreditCard,
    Loader2, Trash2, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IdentityHome() {
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isAddServicesModalOpen, setIsAddServicesModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [identitiesData, emailsData, servicesData] = await Promise.all([
                    api.identities.list(),
                    api.emails.list(),
                    api.services.list()
                ]);
                setIdentities(identitiesData);
                setEmails(emailsData);
                setServices(servicesData);

                if (identitiesData.length > 0 && !selectedIdentityId) {
                    setSelectedIdentityId(identitiesData[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch identity data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const refreshData = async () => {
        try {
            const [identitiesData, emailsData, servicesData] = await Promise.all([
                api.identities.list(),
                api.emails.list(),
                api.services.list()
            ]);
            setIdentities(identitiesData);
            setEmails(emailsData);
            setServices(servicesData);
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    const selectedIdentity = useMemo(() =>
        identities.find(i => i.id === selectedIdentityId),
        [identities, selectedIdentityId]);

    const identityEmails = useMemo(() =>
        selectedIdentity ? emails.filter(e => e.identityId === selectedIdentity.id) : [],
        [emails, selectedIdentity]);

    const identityServices = useMemo(() =>
        selectedIdentity ? services.filter(s =>
            !s.isArchived && // Filter out archived
            ((s.profileIds && s.profileIds.includes(selectedIdentity.id)) ||
                (s.ownerIdentityIds && s.ownerIdentityIds.includes(selectedIdentity.id)) ||
                s.identityId === selectedIdentity.id)
        ) : [],
        [services, selectedIdentity]);

    // Helpers for styles
    const getIdentityIcon = (category: string) => {
        switch (category) {
            case 'business': return <Building2 className="w-5 h-5" />;
            case 'project': return <Code className="w-5 h-5" />;
            case 'personal':
            default: return <User className="w-5 h-5" />;
        }
    };

    const getIdentityColor = (category: string) => {
        switch (category) {
            case 'business': return 'bg-emerald-500/10 text-emerald-400';
            case 'project': return 'bg-amber-500/10 text-amber-400';
            case 'personal':
            default: return 'bg-violet-500/10 text-violet-400';
        }
    };

    const handleTrashClick = (service: Service) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Archive Service',
            message: `Are you sure you want to archive "${service.name}"? It will be removed from this list but can be restored from the main services page.`,
            confirmText: 'Archive',
            variant: 'danger',
            onConfirm: () => {
                // Optimistic update
                setServices(prev => prev.map(s => s.id === service.id ? { ...s, isArchived: true } : s));
                api.services.update(service.id, { isArchived: true }).then(refreshData);
            }
        });
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-jarvis-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 text-gray-200">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-3rem)]">

                {/* LEFT PANEL: Identity List */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Profiles</h1>
                            <p className="text-sm text-jarvis-muted">Manage your identities</p>
                        </div>
                        <Link to="/identities/create">
                            <Button size="sm" className="bg-jarvis-accent/10 text-jarvis-accent hover:bg-jarvis-accent/20 border-jarvis-accent/10">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <Card className="flex-1 overflow-hidden flex flex-col p-2 space-y-1 bg-[#0A0A0A]/50">
                        {identities.map((identity) => {
                            const isSelected = selectedIdentityId === identity.id;
                            const countDetails = emails.filter(e => e.identityId === identity.id).length +
                                services.filter(s => (s.ownerIdentityIds?.includes(identity.id) || s.identityId === identity.id)).length;

                            return (
                                <div
                                    key={identity.id}
                                    onClick={() => setSelectedIdentityId(identity.id)}
                                    className={`
                                        group flex items-center p-3 rounded-lg cursor-pointer transition-all border
                                        ${isSelected
                                            ? 'bg-jarvis-accent/10 border-jarvis-accent/20'
                                            : 'hover:bg-white/5 border-transparent hover:border-white/5'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors
                                        ${getIdentityColor(identity.category)}
                                        ${isSelected ? 'bg-opacity-20' : ''}
                                    `}>
                                        {getIdentityIcon(identity.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {identity.name}
                                            </h3>
                                            <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5 h-4 opacity-50">
                                                {identity.category}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <p className="truncate pr-2">{identity.description || "No description"}</p>
                                            <span className="flex-shrink-0">{countDetails} items</span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="w-1 h-8 rounded-full bg-jarvis-accent absolute left-0" />
                                    )}
                                </div>
                            );
                        })}
                    </Card>
                </div>

                {/* RIGHT PANEL: Details View */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    {selectedIdentity ? (
                        <>
                            {/* Header & Stats Summary */}
                            <div className="flex flex-col gap-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getIdentityColor(selectedIdentity.category)}`}>
                                            {selectedIdentity.category === 'business' ? <Building2 className="w-8 h-8" /> :
                                                selectedIdentity.category === 'project' ? <Code className="w-8 h-8" /> :
                                                    <User className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-3xl font-bold text-white">{selectedIdentity.name}</h1>
                                                <Badge variant="outline" className="uppercase tracking-wider">{selectedIdentity.category}</Badge>
                                            </div>
                                            <p className="text-gray-400 mt-1">{selectedIdentity.description}</p>
                                        </div>
                                    </div>
                                    {/* Edit Action */}
                                    <Button variant="ghost" size="sm" onClick={() => window.alert("Edit Identity implementation pending - CreateIdentity is a full page. Will refactor in next step.")}>Edit</Button>
                                </div>

                                {/* Summary Card (Reusing Global Widget Style) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
                                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Emails</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">{identityEmails.length}</div>
                                    </Card>
                                    <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
                                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Services</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">{identityServices.length}</div>
                                    </Card>
                                    <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10">
                                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                                            <CreditCard className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Monthly</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            £{identityServices.reduce((acc, s) => {
                                                if (s.status !== 'active' || !s.cost) return acc;
                                                return acc + (s.billingCycle === 'monthly' ? s.cost.amount : s.billingCycle === 'yearly' ? s.cost.amount / 12 : 0);
                                            }, 0).toFixed(0)}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Email Accounts Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        Email Accounts
                                    </h2>
                                    <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setIsEmailModalOpen(true)}>
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Email
                                    </Button>
                                </div>

                                {identityEmails.length === 0 ? (
                                    <div className="p-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-white/5">
                                        <Mail className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm">No emails linked</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {identityEmails.map(email => (
                                            <Card key={email.id} className="p-4 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                                                <div className="mt-1">
                                                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-white truncate">{email.address}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {(email.label || '').replace(/^Primary\s*[-–—]\s*/i, '')}
                                                    </p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr className="border-white/5" />

                            {/* Linked Services Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        Services
                                    </h2>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setIsAddServicesModalOpen(true)}>
                                            <Plus className="w-3.5 h-3.5" />
                                            Add services to this profile
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setIsServiceModalOpen(true)}>
                                            <Plus className="w-3.5 h-3.5" />
                                            New Service
                                        </Button>
                                    </div>
                                </div>

                                {identityServices.length === 0 ? (
                                    <div className="p-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-white/5">
                                        <Shield className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm">No services linked</p>
                                    </div>
                                ) : (
                                    <Card className="divide-y divide-white/5">
                                        {identityServices.map(service => {
                                            const websiteDomain = service.websiteUrl ? 
                                                new URL(service.websiteUrl.startsWith('http') ? service.websiteUrl : `https://${service.websiteUrl}`).hostname.replace('www.', '') : 
                                                (service.loginUrl ? new URL(service.loginUrl.startsWith('http') ? service.loginUrl : `https://${service.loginUrl}`).hostname.replace('www.', '') : null);
                                            
                                            return (
                                                <div 
                                                    key={service.id} 
                                                    className="p-4 hover:bg-white/5 transition-colors group cursor-pointer"
                                                    onClick={() => setSelectedService(service)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${service.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                                                                {service.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium text-white text-sm truncate hover:text-jarvis-accent transition-colors">
                                                                        {service.name}
                                                                        {service.handleOrUsername && <span className="text-jarvis-muted ml-1">({service.handleOrUsername})</span>}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                                    {service.loginEmail && (
                                                                        <span className="truncate" title={service.loginEmail}>
                                                                            {service.loginEmail}
                                                                        </span>
                                                                    )}
                                                                    {websiteDomain && (
                                                                        <a 
                                                                            href={service.websiteUrl || service.loginUrl} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-1 text-jarvis-accent/70 hover:text-jarvis-accent transition-colors shrink-0"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Globe className="w-3 h-3" />
                                                                            {websiteDomain}
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0 ml-2">
                                                            {service.cost && service.cost.amount > 0 && (
                                                                <span className="text-sm text-gray-300">
                                                                    {service.cost.currency === 'GBP' ? '£' : '$'}{service.cost.amount}
                                                                    <span className="text-xs text-gray-500">/{service.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                                                                </span>
                                                            )}
                                                            <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="text-[10px]">
                                                                {service.status}
                                                            </Badge>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTrashClick(service);
                                                                }}
                                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                                                title="Archive Service"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </Card>
                                )}
                            </div>

                            <hr className="border-white/5" />

                            {/* Workspace Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <LayoutGrid className="w-5 h-5 text-gray-400" />
                                        Workspace
                                    </h2>
                                </div>
                                <Card className="p-8 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center">
                                    <LayoutGrid className="w-10 h-10 text-blue-500/20 mb-3" />
                                    <h3 className="text-base font-medium text-white mb-1">Workspace not configured</h3>
                                    <p className="text-sm text-gray-500 mb-4 max-w-sm">
                                        Workspaces allow you to organize files, tasks, and resources specific to this identity.
                                    </p>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Workspace
                                    </Button>
                                </Card>
                            </div>

                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <User className="w-16 h-16 opacity-20 mb-4" />
                            <p>Select an identity to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedIdentity && (
                <>
                    <EmailForm
                        isOpen={isEmailModalOpen}
                        onClose={() => setIsEmailModalOpen(false)}
                        onSubmit={async (data) => {
                            await api.emails.create({ ...data, identityId: selectedIdentity.id });
                            await refreshData();
                        }}
                        initialData={undefined} // Add mode
                    />

                    {isServiceModalOpen && (
                        <ServiceForm
                            identities={identities}
                            emails={emails}
                            currentProfileId={selectedIdentity.id}
                            initialData={undefined} // Add mode
                            onClose={() => setIsServiceModalOpen(false)}
                            onSubmit={async () => {
                                await refreshData();
                                setIsServiceModalOpen(false);
                            }}
                        />
                    )}
                </>
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

            {selectedService && (
                <ServiceDetailsModal
                    service={selectedService}
                    identities={identities}
                    isOpen={!!selectedService}
                    onClose={() => setSelectedService(null)}
                    onUpdate={refreshData}
                />
            )}

            {selectedIdentity && (
                <AddServicesToProfileModal
                    profileId={selectedIdentity.id}
                    currentServiceIds={identityServices.map(s => s.id)}
                    allServices={services}
                    isOpen={isAddServicesModalOpen}
                    onClose={() => setIsAddServicesModalOpen(false)}
                    onUpdate={refreshData}
                />
            )}
        </div>
    );
}
