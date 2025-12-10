import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { api, Service, Identity, Email } from '../../api';
import { Input } from '../Input';
import { Button } from '../Button';
import { X, Check, AlertCircle } from 'lucide-react';

interface ServiceFormProps {
    initialData?: Service;
    identities: Identity[];
    emails: Email[];
    currentProfileId?: string;
    onClose: () => void;
    onSubmit: () => void;
}

const SERVICE_CATEGORIES = [
    'Infrastructure',
    'AI Tools',
    'Development',
    'Entertainment',
    'Finance',
    'Productivity',
    'Social / Marketing',
    'Other'
];

const defaultService: Omit<Service, 'id'> = {
    name: '',
    category: '',
    loginUrl: '',
    websiteUrl: '',
    loginEmail: '',
    handleOrUsername: '',
    profileIds: [],
    ownerIdentityIds: [],
    billingEmailId: '',
    identityId: '',
    emailId: '',
    cost: {
        amount: 0,
        currency: 'GBP'
    },
    billingCycle: 'monthly',
    renewalDate: '',
    nextBillingDate: '',
    status: 'active',
    notes: ''
};

const INACTIVE_STATUSES = ['archived', 'cancelled'];
const ACTIVE_STATUSES = ['active', 'trial'];

const getNextBillingDateRollover = (currentDate: string, billingCycle: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextDate = new Date(currentDate);
    nextDate.setHours(0, 0, 0, 0);
    
    if (nextDate >= today) return currentDate;
    
    while (nextDate < today) {
        switch (billingCycle) {
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            default:
                return currentDate;
        }
    }
    return nextDate.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

export const ServiceForm = ({ initialData, identities, emails, currentProfileId, onClose, onSubmit }: ServiceFormProps) => {
    const [formData, setFormData] = useState<Omit<Service, 'id'>>(defaultService);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showReactivatePrompt, setShowReactivatePrompt] = useState(false);
    const [suggestedBillingDate, setSuggestedBillingDate] = useState('');
    const originalStatusRef = useRef<string | null>(null);

    useEffect(() => {
        if (initialData) {
            originalStatusRef.current = initialData.status;
            setFormData({
                name: initialData.name,
                category: initialData.category,
                loginUrl: initialData.loginUrl || '',
                websiteUrl: initialData.websiteUrl || initialData.loginUrl || '',
                loginEmail: initialData.loginEmail || '',
                handleOrUsername: initialData.handleOrUsername || '',
                profileIds: initialData.profileIds || initialData.ownerIdentityIds || [],
                ownerIdentityIds: initialData.ownerIdentityIds && initialData.ownerIdentityIds.length > 0
                    ? initialData.ownerIdentityIds
                    : (initialData.identityId ? [initialData.identityId] : []),
                billingEmailId: initialData.billingEmailId || initialData.emailId || '',
                identityId: initialData.identityId || '',
                emailId: initialData.emailId || '',
                cost: initialData.cost || { amount: 0, currency: 'GBP' },
                billingCycle: initialData.billingCycle || 'monthly',
                renewalDate: initialData.renewalDate || '',
                nextBillingDate: initialData.nextBillingDate || '',
                status: initialData.status,
                notes: initialData.notes || ''
            });
        } else if (currentProfileId) {
            // Pre-select current profile for new services
            setFormData(prev => ({
                ...prev,
                profileIds: [currentProfileId],
                ownerIdentityIds: [currentProfileId],
                identityId: currentProfileId
            }));
        }
    }, [initialData, currentProfileId]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'status') {
            const wasInactive = originalStatusRef.current && INACTIVE_STATUSES.includes(originalStatusRef.current);
            const becomingActive = ACTIVE_STATUSES.includes(value);
            
            if (wasInactive && becomingActive && initialData?.nextBillingDate) {
                const suggested = getNextBillingDateRollover(initialData.nextBillingDate, formData.billingCycle);
                setSuggestedBillingDate(suggested);
                setShowReactivatePrompt(true);
            }
            setFormData(prev => ({ ...prev, status: value as Service['status'] }));
            return;
        }
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: name === 'cost.amount' ? parseFloat(value) : value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleReactivateConfirm = (useSuggested: boolean) => {
        if (useSuggested) {
            setFormData(prev => ({ ...prev, nextBillingDate: suggestedBillingDate }));
        }
        setShowReactivatePrompt(false);
    };

    const toggleOwner = (identityId: string) => {
        setFormData(prev => {
            const current = prev.ownerIdentityIds || [];
            const exists = current.includes(identityId);
            const newOwners = exists
                ? current.filter(id => id !== identityId)
                : [...current, identityId];

            return {
                ...prev,
                ownerIdentityIds: newOwners,
                profileIds: newOwners,
                identityId: newOwners.length > 0 ? newOwners[0] : ''
            };
        });
    };

    const validateNextBillingDate = (dateStr: string | undefined): string | null => {
        if (!dateStr) return null; // Empty is allowed
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(dateStr);
        inputDate.setHours(0, 0, 0, 0);
        
        if (inputDate < today) {
            return 'Next bill due must be today or a future date.';
        }
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate nextBillingDate
        const dateError = validateNextBillingDate(formData.nextBillingDate);
        if (dateError) {
            setError(dateError);
            setLoading(false);
            return;
        }

        try {
            if (initialData) {
                await api.services.update(initialData.id, formData);
            } else {
                await api.services.create(formData);
            }
            onSubmit();
        } catch (err: any) {
            console.error('Failed to save service:', err);
            setError(err.message || 'Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    // Sort identities: current profile first
    const sortedIdentities = [...identities].sort((a, b) => {
        if (a.id === currentProfileId) return -1;
        if (b.id === currentProfileId) return 1;
        return 0;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-jarvis-card border border-jarvis-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-jarvis-border bg-jarvis-bg/50 shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button onClick={onClose} className="text-jarvis-muted hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {showReactivatePrompt && (
                        <div className="p-4 bg-jarvis-accent/10 border border-jarvis-accent/30 rounded-lg space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-jarvis-accent shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-white font-medium">Reactivating Service</p>
                                    <p className="text-sm text-jarvis-muted">
                                        {formData.billingCycle === 'monthly' 
                                            ? `This service was billed on the ${new Date(initialData?.nextBillingDate || '').getDate()}${getOrdinalSuffix(new Date(initialData?.nextBillingDate || '').getDate())} of each month.`
                                            : formData.billingCycle === 'yearly'
                                                ? `This service was billed yearly around ${formatDateForDisplay(initialData?.nextBillingDate || '')}.`
                                                : `Last billing date was ${formatDateForDisplay(initialData?.nextBillingDate || '')}.`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-8">
                                <button
                                    type="button"
                                    onClick={() => handleReactivateConfirm(true)}
                                    className="text-left px-3 py-2 bg-jarvis-bg/50 hover:bg-jarvis-bg border border-jarvis-border rounded-lg transition-colors"
                                >
                                    <span className="text-white text-sm">Use next billing date: </span>
                                    <span className="text-jarvis-accent font-medium">{formatDateForDisplay(suggestedBillingDate)}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleReactivateConfirm(false)}
                                    className="text-left px-3 py-2 bg-jarvis-bg/50 hover:bg-jarvis-bg border border-jarvis-border rounded-lg transition-colors text-sm text-jarvis-muted"
                                >
                                    I'll set the date manually below
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Service Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Netflix, Spotify"
                        />
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none"
                            >
                                <option value="">-- Select Category --</option>
                                {SERVICE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Login Email</label>
                            <input
                                list="email-suggestions"
                                name="loginEmail"
                                value={formData.loginEmail || ''}
                                onChange={handleChange}
                                type="email"
                                placeholder="email@example.com"
                                className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none placeholder:text-gray-500"
                            />
                            <datalist id="email-suggestions">
                                {emails.map(email => (
                                    <option key={email.id} value={email.address} />
                                ))}
                            </datalist>
                        </div>
                        <Input
                            label="Handle / Username (optional)"
                            name="handleOrUsername"
                            value={formData.handleOrUsername || ''}
                            onChange={handleChange}
                            placeholder="@username"
                        />
                    </div>

                    <Input
                        label="Website URL"
                        name="websiteUrl"
                        value={formData.websiteUrl || ''}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                websiteUrl: e.target.value,
                                loginUrl: e.target.value
                            }));
                        }}
                        type="url"
                        placeholder="https://..."
                    />

                    {/* Linked Profiles */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-jarvis-muted">Linked Profiles</label>
                        <div className="bg-jarvis-bg border border-jarvis-border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                            {sortedIdentities.map(identity => {
                                const isSelected = formData.ownerIdentityIds?.includes(identity.id);
                                const isCurrent = identity.id === currentProfileId;
                                return (
                                    <div
                                        key={identity.id}
                                        onClick={() => toggleOwner(identity.id)}
                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-jarvis-accent/20 text-white' : 'hover:bg-white/5 text-jarvis-muted'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-jarvis-accent bg-jarvis-accent' : 'border-jarvis-muted'
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3 text-black" />}
                                        </div>
                                        <span className="text-sm">
                                            {identity.name}
                                            {isCurrent && <span className="text-xs text-jarvis-accent ml-1">(current profile)</span>}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {(!formData.ownerIdentityIds || formData.ownerIdentityIds.length === 0) && (
                            <p className="text-xs text-amber-400">Please select at least one profile.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Cost"
                            name="cost.amount"
                            type="number"
                            value={formData.cost?.amount}
                            onChange={handleChange}
                            step="0.01"
                            placeholder="0.00"
                        />
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Currency</label>
                            <select
                                name="cost.currency"
                                value={formData.cost?.currency}
                                onChange={handleChange}
                                className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none"
                            >
                                <option value="GBP">GBP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Billing Cycle</label>
                            <select
                                name="billingCycle"
                                value={formData.billingCycle}
                                onChange={handleChange}
                                className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one-time">One-time</option>
                                <option value="none">Free/None</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Next Bill Due (optional)"
                        name="nextBillingDate"
                        type="date"
                        value={formData.nextBillingDate || ''}
                        onChange={handleChange}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-jarvis-muted">Status</label>
                        <div className="flex gap-4">
                            {['active', 'cancelled', 'trial', 'archived'].map(status => (
                                <label key={status} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${formData.status === status
                                        ? 'border-jarvis-accent bg-jarvis-accent'
                                        : 'border-jarvis-muted group-hover:border-jarvis-accent/50'
                                        }`}>
                                        {formData.status === status && <div className="w-2 h-2 rounded-full bg-black" />}
                                    </div>
                                    <span className={`capitalize text-sm ${formData.status === status ? 'text-white' : 'text-jarvis-muted group-hover:text-white'
                                        }`}>
                                        {status}
                                    </span>
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status}
                                        checked={formData.status === status}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-jarvis-muted">Additional Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none resize-none h-20"
                            placeholder="Any additional notes..."
                        />
                    </div>

                    <div className="pt-4 border-t border-jarvis-border flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (initialData ? 'Update Service' : 'Add Service')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
