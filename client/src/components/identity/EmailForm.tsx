import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Email } from '../../api';

interface EmailFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Email, 'id'>) => Promise<void>;
    initialData?: Email;
}

const PROVIDERS = ['gmail', 'outlook', 'yahoo', 'proton', 'icloud', 'aws', 'other'] as const;
const TYPES = ['personal', 'work', 'burner', 'project'] as const;

export const EmailForm = ({ isOpen, onClose, onSubmit, initialData }: EmailFormProps) => {
    const [formData, setFormData] = useState<Omit<Email, 'id'>>({
        label: '',
        address: '',
        provider: 'gmail',
        type: 'personal',
        description: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                label: initialData.label,
                address: initialData.address,
                provider: initialData.provider,
                type: initialData.type,
                description: initialData.description || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                label: '',
                address: '',
                provider: 'gmail',
                type: 'personal',
                description: '',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 w-full max-w-lg relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Email' : 'Add New Email'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Label</label>
                            <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Primary Gmail"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Address</label>
                            <input
                                type="email"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="address@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Provider</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as any }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                {PROVIDERS.map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                {TYPES.map(t => (
                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="Brief description of usage..."
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
                            {initialData ? 'Update Email' : 'Add Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
