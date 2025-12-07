import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { api, Project, Service, Email } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { clsx } from 'clsx';

export const ProjectsList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Project>>({ name: '', status: 'active', serviceIds: [] });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pData, eData, sData] = await Promise.all([
                api.projects.list(),
                api.emails.list(),
                api.services.list()
            ]);
            setProjects(pData);
            setEmails(eData);
            setServices(sData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.projects.update(editingId, formData);
            } else {
                await api.projects.create(formData as Omit<Project, 'id'>);
            }
            fetchData();
            setIsEditing(false);
            setEditingId(null);
            setFormData({ name: '', status: 'active', serviceIds: [] });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await api.projects.delete(id);
        fetchData();
    };

    const startEdit = (project: Project) => {
        setFormData(project);
        setEditingId(project.id);
        setIsEditing(true);
    };

    const toggleService = (serviceId: string) => {
        const current = formData.serviceIds || [];
        if (current.includes(serviceId)) {
            setFormData({ ...formData, serviceIds: current.filter(id => id !== serviceId) });
        } else {
            setFormData({ ...formData, serviceIds: [...current, serviceId] });
        }
    };

    const getEmailAddress = (id?: string) => emails.find(e => e.id === id)?.address;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Projects</h2>
                <Button onClick={() => { setIsEditing(!isEditing); setEditingId(null); setFormData({ serviceIds: [] }); }}>
                    {isEditing ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Project</>}
                </Button>
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Primary Email</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.primaryEmailId || ''}
                                onChange={e => setFormData({ ...formData, primaryEmailId: e.target.value })}
                            >
                                <option value="">None / Select...</option>
                                {emails.map(e => <option key={e.id} value={e.id}>{e.address}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Connected Services</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-900 rounded-lg border border-slate-700">
                                {services.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleService(s.id)}
                                        className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                                            formData.serviceIds?.includes(s.id)
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Save Project</Button>
                    </div>
                </form>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                    className="pl-10"
                    placeholder="Search projects..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? <div className="text-slate-500">Loading...</div> : filtered.map(project => (
                    <div key={project.id} className="bg-slate-800 rounded-lg p-5 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-500/50 transition-colors">
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-white">{project.name}</h3>
                                <span className={clsx(
                                    "px-2 py-0.5 rounded text-xs uppercase font-bold",
                                    project.status === 'active' && "bg-emerald-500/20 text-emerald-400",
                                    project.status === 'paused' && "bg-amber-500/20 text-amber-400",
                                    project.status === 'archived' && "bg-slate-500/20 text-slate-400",
                                )}>
                                    {project.status}
                                </span>
                            </div>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                {getEmailAddress(project.primaryEmailId) && (
                                    <span>{getEmailAddress(project.primaryEmailId)}</span>
                                )}
                            </div>
                            {project.serviceIds && project.serviceIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {project.serviceIds.map(sid => {
                                        const s = services.find(x => x.id === sid);
                                        if (!s) return null;
                                        return (
                                            <span key={sid} className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded">
                                                {s.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="sm" onClick={() => startEdit(project)}><Edit2 size={16} /></Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(project.id)}><Trash2 size={16} /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
