import { useState, useEffect } from 'react';
import { Service, Identity, api } from '../../api';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { X, Globe, Mail, Tag, Save, ExternalLink, User } from 'lucide-react';

interface ServiceDetailsModalProps {
    service: Service;
    identities: Identity[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function ServiceDetailsModal({ service, identities, isOpen, onClose, onUpdate }: ServiceDetailsModalProps) {
    const [editedService, setEditedService] = useState<Partial<Service>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (service) {
            setEditedService({
                loginEmail: service.loginEmail || '',
                websiteUrl: service.websiteUrl || service.loginUrl || '',
                handleOrUsername: service.handleOrUsername || '',
                status: service.status,
                notes: service.notes || '',
            });
        }
    }, [service]);

    if (!isOpen) return null;

    const linkedProfiles = identities.filter(id => 
        service.profileIds?.includes(id.id) || 
        service.ownerIdentityIds?.includes(id.id) || 
        service.identityId === id.id
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.services.update(service.id, editedService);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update service:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-jarvis-card border border-jarvis-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-jarvis-card border-b border-jarvis-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${service.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                            {service.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">{service.name}</h2>
                            <p className="text-xs text-jarvis-muted">{service.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-jarvis-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-5">
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" />
                                Login Email
                            </span>
                            <input
                                type="email"
                                value={editedService.loginEmail || ''}
                                onChange={(e) => setEditedService({ ...editedService, loginEmail: e.target.value })}
                                className="mt-1.5 w-full bg-jarvis-bg/50 border border-jarvis-border rounded-lg px-3 py-2 text-white placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                                placeholder="email@example.com"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5" />
                                Website URL
                            </span>
                            <div className="mt-1.5 flex gap-2">
                                <input
                                    type="url"
                                    value={editedService.websiteUrl || ''}
                                    onChange={(e) => setEditedService({ ...editedService, websiteUrl: e.target.value })}
                                    className="flex-1 bg-jarvis-bg/50 border border-jarvis-border rounded-lg px-3 py-2 text-white placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                                    placeholder="https://example.com"
                                />
                                {editedService.websiteUrl && (
                                    <a 
                                        href={editedService.websiteUrl.startsWith('http') ? editedService.websiteUrl : `https://${editedService.websiteUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-jarvis-accent/10 text-jarvis-accent rounded-lg hover:bg-jarvis-accent/20 transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" />
                                Handle / Username
                            </span>
                            <input
                                type="text"
                                value={editedService.handleOrUsername || ''}
                                onChange={(e) => setEditedService({ ...editedService, handleOrUsername: e.target.value })}
                                className="mt-1.5 w-full bg-jarvis-bg/50 border border-jarvis-border rounded-lg px-3 py-2 text-white placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                                placeholder="@username"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider">Status</span>
                            <select
                                value={editedService.status || 'active'}
                                onChange={(e) => setEditedService({ ...editedService, status: e.target.value as Service['status'] })}
                                className="mt-1.5 w-full bg-jarvis-bg/50 border border-jarvis-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="trial">Trial</option>
                                <option value="free_trial">Free Trial</option>
                                <option value="past_due">Past Due</option>
                                <option value="expired">Expired</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider">Notes</span>
                            <textarea
                                value={editedService.notes || ''}
                                onChange={(e) => setEditedService({ ...editedService, notes: e.target.value })}
                                rows={3}
                                className="mt-1.5 w-full bg-jarvis-bg/50 border border-jarvis-border rounded-lg px-3 py-2 text-white placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent/50 transition-colors resize-none"
                                placeholder="Add notes..."
                            />
                        </label>
                    </div>

                    <div className="border-t border-jarvis-border pt-4">
                        <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider flex items-center gap-2 mb-2">
                            <User className="w-3.5 h-3.5" />
                            Linked Profiles
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {linkedProfiles.length > 0 ? (
                                linkedProfiles.map(profile => (
                                    <Badge key={profile.id} variant="outline" className="text-xs">
                                        {profile.name}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-jarvis-muted">No profiles linked</span>
                            )}
                        </div>
                    </div>

                    {service.cost && service.cost.amount > 0 && (
                        <div className="border-t border-jarvis-border pt-4">
                            <span className="text-xs font-medium text-jarvis-muted uppercase tracking-wider mb-2 block">Billing</span>
                            <div className="flex items-center gap-4">
                                <div className="text-lg font-semibold text-white">
                                    {service.cost.currency === 'GBP' ? '£' : '$'}{service.cost.amount}
                                    <span className="text-sm text-jarvis-muted font-normal">/{service.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                </div>
                                <Badge variant={service.status === 'active' ? 'success' : 'outline'}>
                                    {service.status}
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-jarvis-card border-t border-jarvis-border p-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
