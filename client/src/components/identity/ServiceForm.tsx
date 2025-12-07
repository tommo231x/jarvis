import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { api, Service, EmailIdentity } from '../../api';
import { Input } from '../Input';
import { Button } from '../Button';
import { X } from 'lucide-react';

interface ServiceFormProps {
    initialData?: Service;
    emails: EmailIdentity[];
    onClose: () => void;
    onSubmit: () => void;
}

const defaultService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    category: '',
    description: '',
    loginUrl: '',
    username: '',
    password: '',
    emailId: '',
    cost: {
        amount: 0,
        currency: 'USD',
        period: 'monthly'
    },
    billingCycle: 'monthly',
    renewalDate: '',
    status: 'active',
    icon: ''
};

export const ServiceForm = ({ initialData, emails, onClose, onSubmit }: ServiceFormProps) => {
    const [formData, setFormData] = useState<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>(defaultService);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                description: initialData.description || '',
                loginUrl: initialData.loginUrl || '',
                username: initialData.username || '',
                password: initialData.password || '',
                emailId: initialData.emailId || '',
                cost: initialData.cost || { amount: 0, currency: 'USD', period: 'monthly' },
                billingCycle: initialData.billingCycle || 'monthly',
                renewalDate: initialData.renewalDate || '',
                status: initialData.status,
                icon: initialData.icon || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                        <div className="p-3 bg-jarvis-danger/10 border border-jarvis-danger/20 text-jarvis-danger rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Service Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Input
                        label="Login URL"
                        name="loginUrl"
                        value={formData.loginUrl}
                        onChange={handleChange}
                        type="url"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <Input
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            type="password"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-jarvis-muted">Associated Email</label>
                        <select
                            name="emailId"
                            value={formData.emailId}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-jarvis-border rounded-lg px-4 py-2 text-jarvis-text focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none"
                        >
                            <option value="">-- Select Email --</option>
                            {emails.map(email => (
                                <option key={email.id} value={email.id}>
                                    {email.address}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Cost"
                            name="cost.amount"
                            type="number"
                            value={formData.cost?.amount}
                            onChange={handleChange}
                            step="0.01"
                        />
                        <Input
                            label="Currency"
                            name="cost.currency"
                            value={formData.cost?.currency}
                            onChange={handleChange}
                        />
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Billing Cycle</label>
                            <select
                                name="billingCycle"
                                value={formData.billingCycle}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-jarvis-bg/50 border border-jarvis-border rounded-lg text-sm text-white focus:outline-none focus:border-jarvis-accent/50 focus:ring-1 focus:ring-jarvis-accent/50 transition-all duration-200"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one-time">One-time</option>
                                <option value="none">Free/None</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-jarvis-muted">Status</label>
                        <div className="flex gap-4">
                            {['active', 'cancelled', 'paused'].map(status => (
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
