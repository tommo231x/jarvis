import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project, Email, Service } from '../../api';

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Project, 'id'>) => Promise<void>;
    initialData?: Project;
    emails: Email[];
    services: Service[];
}

const STATUSES = ['active', 'planning', 'completed', 'archived'] as const;

export const ProjectForm = ({ isOpen, onClose, onSubmit, initialData, emails, services }: ProjectFormProps) => {
    const [formData, setFormData] = useState<Omit<Project, 'id'>>({
        name: '',
        status: 'planning',
        primaryEmailId: '',
        serviceIds: [],
        startDate: '',
        endDate: '',
        description: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                status: initialData.status,
                primaryEmailId: initialData.primaryEmailId || '',
                serviceIds: initialData.serviceIds || [],
                startDate: initialData.startDate || '',
                endDate: initialData.endDate || '',
                description: initialData.description || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                name: '',
                status: 'planning',
                primaryEmailId: emails.length > 0 ? emails[0].id : '',
                serviceIds: [],
                startDate: '',
                endDate: '',
                description: '',
                notes: ''
            });
        }
    }, [initialData, isOpen, emails]);

    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => {
            if (prev.serviceIds.includes(serviceId)) {
                return { ...prev, serviceIds: prev.serviceIds.filter(id => id !== serviceId) };
            } else {
                return { ...prev, serviceIds: [...prev.serviceIds, serviceId] };
            }
        });
    };

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
                    {initialData ? 'Edit Project' : 'New Project'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Project Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Side Hustle"
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
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Primary Email Identity</label>
                        <select
                            value={formData.primaryEmailId}
                            onChange={(e) => setFormData(prev => ({ ...prev, primaryEmailId: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">-- No Specific Identity --</option>
                            {emails.map(email => (
                                <option key={email.id} value={email.id}>
                                    {email.label} ({email.address})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Associated Services</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-700 rounded-lg bg-slate-800/50">
                            {services.map(service => (
                                <label key={service.id} className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer hover:bg-slate-700/50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={formData.serviceIds.includes(service.id)}
                                        onChange={() => handleServiceToggle(service.id)}
                                        className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="truncate">{service.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="text-sm font-medium text-slate-300">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="Brief description..."
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
                            {initialData ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
