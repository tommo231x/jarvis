import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Service, Email } from '../../api';

interface ServiceFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Service, 'id'>) => Promise<void>;
    initialData?: Service;
    emails: Email[];
}

const BILLING_CYCLES = ['monthly', 'yearly', 'one-time', 'none'] as const;
const STATUSES = ['active', 'cancelled', 'trial', 'past_due'] as const;

export const ServiceForm = ({ isOpen, onClose, onSubmit, initialData, emails }: ServiceFormProps) => {
    const [formData, setFormData] = useState<Omit<Service, 'id'>>({
        name: '',
        category: '',
        emailId: '',
        billingCycle: 'monthly',
        cost: { amount: 0, currency: 'USD' },
        startDate: '',
        renewalDate: '',
        status: 'active',
        loginUrl: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                emailId: initialData.emailId,
                billingCycle: initialData.billingCycle,
                cost: initialData.cost || { amount: 0, currency: 'USD' },
                startDate: initialData.startDate || '',
                renewalDate: initialData.renewalDate || '',
                status: initialData.status,
                loginUrl: initialData.loginUrl || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                name: '',
                category: '',
                emailId: emails.length > 0 ? emails[0].id : '',
                billingCycle: 'monthly',
                cost: { amount: 0, currency: 'USD' },
                startDate: '',
                renewalDate: '',
                status: 'active',
                loginUrl: '',
                notes: ''
            });
        }
    }, [initialData, isOpen, emails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 w-full max-w-2xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Service' : 'Add New Service'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Service Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Netflix"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <input
                                type="text"
                                required
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Entertainment"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Linked Email</label>
                        <select
                            value={formData.emailId}
                            onChange={(e) => setFormData(prev => ({ ...prev, emailId: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">-- Select Email --</option>
                            {emails.map(email => (
                                <option key={email.id} value={email.id}>
                                    {email.label} ({email.address})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Billing Cycle</label>
                            <select
                                value={formData.billingCycle}
                                onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                {BILLING_CYCLES.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Cost</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.cost?.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, cost: { ...prev.cost!, amount: parseFloat(e.target.value) || 0 } }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Currency</label>
                            <input
                                type="text"
                                value={formData.cost?.currency}
                                onChange={(e) => setFormData(prev => ({ ...prev, cost: { ...prev.cost!, currency: e.target.value } }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Renewal Date</label>
                            <input
                                type="date"
                                value={formData.renewalDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                {STATUSES.map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Login URL</label>
                        <input
                            type="url"
                            value={formData.loginUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, loginUrl: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Notes (Markdown)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                            placeholder="Additional private notes..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            {initialData ? 'Update Service' : 'Add Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
