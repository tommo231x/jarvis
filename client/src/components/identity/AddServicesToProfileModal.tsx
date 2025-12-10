import { useState, useMemo } from 'react';
import { Service, api } from '../../api';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { X, Search, Check, Globe, Mail } from 'lucide-react';

interface AddServicesToProfileModalProps {
    profileId: string;
    currentServiceIds: string[];
    allServices: Service[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function AddServicesToProfileModal({ 
    profileId, 
    currentServiceIds,
    allServices, 
    isOpen, 
    onClose, 
    onUpdate 
}: AddServicesToProfileModalProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const availableServices = useMemo(() => {
        return allServices.filter(s => 
            !s.isArchived && 
            !currentServiceIds.includes(s.id)
        );
    }, [allServices, currentServiceIds]);

    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) return availableServices;
        const query = searchQuery.toLowerCase();
        return availableServices.filter(s => 
            s.name.toLowerCase().includes(query) ||
            s.loginEmail?.toLowerCase().includes(query) ||
            s.category?.toLowerCase().includes(query)
        );
    }, [availableServices, searchQuery]);

    if (!isOpen) return null;

    const toggleService = (serviceId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(serviceId)) {
                next.delete(serviceId);
            } else {
                next.add(serviceId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (selectedIds.size === 0) return;
        
        setIsSaving(true);
        try {
            const updates = Array.from(selectedIds).map(serviceId => {
                const service = allServices.find(s => s.id === serviceId);
                if (!service) return Promise.resolve();
                
                const currentProfileIds = service.profileIds || service.ownerIdentityIds || [];
                const newProfileIds = [...new Set([...currentProfileIds, profileId])];
                
                return api.services.update(serviceId, { 
                    profileIds: newProfileIds,
                    ownerIdentityIds: newProfileIds
                });
            });
            
            await Promise.all(updates);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to link services:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getWebsiteDomain = (service: Service) => {
        const url = service.websiteUrl || service.loginUrl;
        if (!url) return null;
        try {
            return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-jarvis-card border border-jarvis-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="sticky top-0 bg-jarvis-card border-b border-jarvis-border p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Add Services to Profile</h2>
                        <button onClick={onClose} className="p-2 text-jarvis-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jarvis-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search services..."
                            className="w-full bg-jarvis-bg/50 border border-jarvis-border rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-8 text-jarvis-muted">
                            {availableServices.length === 0 
                                ? 'All services are already linked to this profile'
                                : 'No services match your search'
                            }
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredServices.map(service => {
                                const isSelected = selectedIds.has(service.id);
                                const websiteDomain = getWebsiteDomain(service);
                                
                                return (
                                    <div 
                                        key={service.id}
                                        onClick={() => toggleService(service.id)}
                                        className={`
                                            p-3 rounded-lg border cursor-pointer transition-all
                                            ${isSelected 
                                                ? 'bg-jarvis-accent/10 border-jarvis-accent/30' 
                                                : 'bg-jarvis-bg/30 border-jarvis-border hover:border-jarvis-accent/20'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                                                ${isSelected 
                                                    ? 'bg-jarvis-accent border-jarvis-accent' 
                                                    : 'border-jarvis-border'
                                                }
                                            `}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${service.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                                                {service.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white text-sm truncate">{service.name}</p>
                                                    <Badge variant={service.status === 'active' ? 'success' : 'outline'} className="text-[10px]">
                                                        {service.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    {service.loginEmail && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <Mail className="w-3 h-3" />
                                                            {service.loginEmail}
                                                        </span>
                                                    )}
                                                    {websiteDomain && (
                                                        <span className="flex items-center gap-1 shrink-0">
                                                            <Globe className="w-3 h-3" />
                                                            {websiteDomain}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {service.cost && service.cost.amount > 0 && (
                                                <span className="text-sm text-gray-400 shrink-0">
                                                    {service.cost.currency === 'GBP' ? '£' : '$'}{service.cost.amount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-jarvis-card border-t border-jarvis-border p-4 flex items-center justify-between">
                    <span className="text-sm text-jarvis-muted">
                        {selectedIds.size} service{selectedIds.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || selectedIds.size === 0}
                        >
                            {isSaving ? 'Linking...' : `Link ${selectedIds.size > 0 ? selectedIds.size : ''} Service${selectedIds.size !== 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
