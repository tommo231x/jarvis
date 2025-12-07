import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { Project, Service, Identity, api } from '../../api';
import { Button } from '../Button';
import { Input } from '../Input';
import { X, Search } from 'lucide-react';

interface ProjectFormProps {
    initialData?: Project;
    services: Service[];
    identities: Identity[];
    onClose: () => void;
    onSubmit: () => void;
}

const defaultProject: Omit<Project, 'id'> = {
    name: '',
    description: '',
    status: 'active',
    serviceIds: [],
    identityId: ''
};

export const ProjectForm = ({ initialData, services, identities, onClose, onSubmit }: ProjectFormProps) => {
    const [formData, setFormData] = useState<Omit<Project, 'id'>>(defaultProject);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || '',
                status: initialData.status,
                serviceIds: initialData.serviceIds || [],
                identityId: initialData.identityId || '',
                startDate: initialData.startDate,
                endDate: initialData.endDate,
                notes: initialData.notes
            });
        }
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleService = (serviceId: string) => {
        setFormData(prev => {
            const currentIds = prev.serviceIds || [];
            if (currentIds.includes(serviceId)) {
                return { ...prev, serviceIds: currentIds.filter(id => id !== serviceId) };
            } else {
                return { ...prev, serviceIds: [...currentIds, serviceId] };
            }
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (initialData) {
                await api.projects.update(initialData.id, formData);
            } else {
                await api.projects.create(formData);
            }
            onSubmit();
        } catch (err: any) {
            setError(err.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        s.category.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-jarvis-card border border-jarvis-border rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-jarvis-border flex items-center justify-between bg-jarvis-bg/50 shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button onClick={onClose} className="text-jarvis-muted hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Project Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Jarvis Dashboard"
                                required
                            />
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-jarvis-muted">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="planning">Planning</option>
                                    <option value="completed">Completed</option>
                                    <option value="paused">Paused</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-sm text-white focus:outline-none focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent transition-all min-h-[80px] resize-none"
                                placeholder="Brief description of the project..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-jarvis-muted">Identity</label>
                            <select
                                name="identityId"
                                value={formData.identityId || ''}
                                onChange={handleChange}
                                className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-2.5 text-white focus:border-jarvis-accent focus:ring-1 focus:ring-jarvis-accent outline-none"
                            >
                                <option value="">-- Select Identity --</option>
                                {identities.map(identity => (
                                    <option key={identity.id} value={identity.id}>
                                        {identity.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-jarvis-muted">Linked Services</label>
                            <div className="border border-jarvis-border rounded-lg bg-jarvis-bg/50 p-4">
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jarvis-muted" />
                                    <input
                                        type="text"
                                        placeholder="Filter services..."
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        className="w-full bg-jarvis-bg border border-jarvis-border rounded-md pl-9 pr-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-jarvis-accent outline-none"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                                    {filteredServices.map(service => {
                                        const isSelected = formData.serviceIds?.includes(service.id);
                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                onClick={() => toggleService(service.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${isSelected
                                                    ? 'bg-jarvis-accent text-jarvis-bg border-jarvis-accent'
                                                    : 'bg-jarvis-card text-jarvis-muted border-jarvis-border hover:border-jarvis-accent/50 hover:text-white'
                                                    }`}
                                            >
                                                {isSelected && <X className="w-3 h-3" />}
                                                {service.name}
                                            </button>
                                        );
                                    })}
                                    {filteredServices.length === 0 && (
                                        <p className="text-xs text-jarvis-muted w-full text-center py-2">No services found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-jarvis-border flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
