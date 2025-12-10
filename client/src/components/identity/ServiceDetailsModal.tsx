import { Service, Identity } from '../../api';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { X, Globe, Mail, User, Calendar, CreditCard, Edit2, Trash2, ExternalLink, Tag } from 'lucide-react';

interface ServiceDetailsModalProps {
    service: Service;
    identities: Identity[];
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ServiceDetailsModal({ service, identities, isOpen, onClose, onEdit, onDelete }: ServiceDetailsModalProps) {
    if (!isOpen) return null;

    const linkedProfiles = identities.filter(id => 
        service.profileIds?.includes(id.id) || 
        service.ownerIdentityIds?.includes(id.id) || 
        service.identityId === id.id
    );

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'trial': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-jarvis-card border border-jarvis-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-jarvis-card border-b border-jarvis-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${getStatusColor(service.status)}`}>
                            {service.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">{service.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-jarvis-muted">{service.category}</span>
                                <Badge className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(service.status)}`}>
                                    {service.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-jarvis-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {(service.cost && service.cost.amount > 0) && (
                        <div className="bg-jarvis-bg/50 rounded-xl p-4 border border-jarvis-border/50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-jarvis-muted mb-1">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Cost</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {formatCurrency(service.cost.amount, service.cost.currency)}
                                        <span className="text-sm font-normal text-jarvis-muted ml-1">/{service.billingCycle}</span>
                                    </div>
                                </div>
                                {service.nextBillingDate && (
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-jarvis-muted mb-1 justify-end">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Next Bill</span>
                                        </div>
                                        <div className="text-lg font-semibold text-white">
                                            {formatDate(service.nextBillingDate)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!service.cost?.amount && (
                        <div className="bg-jarvis-bg/50 rounded-xl p-4 border border-jarvis-border/50">
                            <div className="flex items-center gap-2 text-jarvis-muted mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Cost</span>
                            </div>
                            <div className="text-lg font-medium text-jarvis-muted">Free</div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-jarvis-bg/30 rounded-lg">
                            <Mail className="w-4 h-4 text-jarvis-muted mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-jarvis-muted uppercase tracking-wider mb-0.5">Login Email</div>
                                {service.loginEmail ? (
                                    <div className="text-sm text-white truncate">{service.loginEmail}</div>
                                ) : (
                                    <div className="text-sm text-amber-500/70 italic">Not set</div>
                                )}
                            </div>
                        </div>

                        {service.websiteUrl && (
                            <div className="flex items-start gap-3 p-3 bg-jarvis-bg/30 rounded-lg">
                                <Globe className="w-4 h-4 text-jarvis-muted mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-jarvis-muted uppercase tracking-wider mb-0.5">Website</div>
                                    <a 
                                        href={service.websiteUrl.startsWith('http') ? service.websiteUrl : `https://${service.websiteUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-jarvis-accent hover:underline flex items-center gap-1"
                                    >
                                        {service.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {service.handleOrUsername && (
                            <div className="flex items-start gap-3 p-3 bg-jarvis-bg/30 rounded-lg">
                                <Tag className="w-4 h-4 text-jarvis-muted mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-jarvis-muted uppercase tracking-wider mb-0.5">Username / Handle</div>
                                    <div className="text-sm text-white">{service.handleOrUsername}</div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3 p-3 bg-jarvis-bg/30 rounded-lg">
                            <User className="w-4 h-4 text-jarvis-muted mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-jarvis-muted uppercase tracking-wider mb-0.5">Linked Profiles</div>
                                {linkedProfiles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {linkedProfiles.map(profile => (
                                            <Badge key={profile.id} variant="outline" className="text-xs">
                                                {profile.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-jarvis-muted italic">No profiles linked</div>
                                )}
                            </div>
                        </div>

                        {service.notes && (
                            <div className="p-3 bg-jarvis-bg/30 rounded-lg">
                                <div className="text-xs text-jarvis-muted uppercase tracking-wider mb-1">Notes</div>
                                <div className="text-sm text-white whitespace-pre-wrap">{service.notes}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 bg-jarvis-card border-t border-jarvis-border p-4 flex justify-between">
                    <div>
                        {onDelete && (
                            <Button variant="ghost" onClick={onDelete} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                        {onEdit && (
                            <Button onClick={onEdit} className="gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
