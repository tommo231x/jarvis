import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { api, Service, Email } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { clsx } from 'clsx';

// Type guard or default values help with Partial state
const defaultService: Partial<Service> = { name: '', category: '', subscription: 'none' };

export const ServicesList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>(defaultService);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sData, eData] = await Promise.all([
                api.services.list(),
                api.emails.list()
            ]);
            setServices(sData);
            setEmails(eData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.services.update(editingId, formData);
            } else {
                await api.services.create(formData as Omit<Service, 'id'>);
            }
            fetchData();
            setIsEditing(false);
            setEditingId(null);
            setFormData(defaultService);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await api.services.delete(id);
        fetchData();
    };

    const startEdit = (service: Service) => {
        setFormData(service);
        setEditingId(service.id);
        setIsEditing(true);
    };

    const getEmailAddress = (id?: string) => emails.find(e => e.id === id)?.address || 'Unknown';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Services & Logins</h2>
                <Button onClick={() => { setIsEditing(!isEditing); setEditingId(null); setFormData(defaultService); }}>
                    {isEditing ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Service</>}
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
                        <Input
                            label="Category"
                            value={formData.category || ''}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Used</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.emailId || ''}
                                onChange={e => setFormData({ ...formData, emailId: e.target.value })}
                            >
                                <option value="">Select Email...</option>
                                {emails.map(e => <option key={e.id} value={e.id}>{e.address} ({e.label})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Subscription</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                value={formData.subscription || 'none'}
                                onChange={e => setFormData({ ...formData, subscription: e.target.value as any })}
                            >
                                <option value="none">None / Free</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one-time">One-Time</option>
                            </select>
                        </div>
                        <Input
                            label="Login URL (Optional)"
                            value={formData.loginUrl || ''}
                            onChange={e => setFormData({ ...formData, loginUrl: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Save Service</Button>
                    </div>
                </form>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                    className="pl-10"
                    placeholder="Search services..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <div className="text-slate-500">Loading...</div> : filtered.map(service => (
                    <div key={service.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col group hover:border-blue-500/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-white">{service.name}</h3>
                                <span className="text-xs text-slate-500">{service.category}</span>
                            </div>
                            <div className="flex gap-2">
                                {service.loginUrl && (
                                    <a href={service.loginUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(service)} className="text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-2 text-sm">
                            <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                                <span className="text-slate-500">Email</span>
                                <span className="text-slate-300 truncate max-w-[150px]" title={getEmailAddress(service.emailId)}>
                                    {getEmailAddress(service.emailId)}
                                </span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                                <span className="text-slate-500">Plan</span>
                                <span className={clsx(
                                    "font-medium",
                                    service.subscription === 'none' ? 'text-slate-400' : 'text-emerald-400'
                                )}>
                                    {service.subscription}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
