import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Email } from '../../api';

interface EmailFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Email, 'id'>) => Promise<void>;
    initialData?: Email;
    identityId: string;
}

const PROVIDERS = ['gmail', 'outlook', 'yahoo', 'proton', 'icloud', 'aws', 'other'] as const;

export const EmailForm = ({ isOpen, onClose, onSubmit, initialData, identityId }: EmailFormProps) => {
    const [formData, setFormData] = useState<Omit<Email, 'id'>>({
        label: '',
        address: '',
        provider: 'gmail',
        identityId: identityId,
        isPrimary: false,
        description: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                label: initialData.label,
                address: initialData.address,
                provider: initialData.provider,
                identityId: initialData.identityId,
                isPrimary: false,
                description: initialData.description || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                label: '',
                address: '',
                provider: 'gmail',
                identityId: identityId,
                isPrimary: false,
                description: '',
                notes: ''
            });
        }
    }, [initialData, isOpen, identityId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            console.error('Failed to save email:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-jarvis-card rounded-xl border border-jarvis-border p-6 w-full max-w-lg relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-jarvis-muted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Email Account' : 'Add Email Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-jarvis-muted">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:outline-none focus:border-jarvis-accent"
                            placeholder="address@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Provider</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as any }))}
                                className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:outline-none focus:border-jarvis-accent"
                            >
                                {PROVIDERS.map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Reason / Label</label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:outline-none focus:border-jarvis-accent"
                                placeholder="e.g. Work, Personal, Billing"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-jarvis-muted">Description (optional)</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:outline-none focus:border-jarvis-accent"
                            placeholder="Brief description of what this email is used for..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-jarvis-muted">Notes (optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:outline-none focus:border-jarvis-accent h-20 resize-none"
                            placeholder="Additional private notes..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-jarvis-muted hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-jarvis-accent hover:bg-jarvis-accent/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Email' : 'Add Email')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
