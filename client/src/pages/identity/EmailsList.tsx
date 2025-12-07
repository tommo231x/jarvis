import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { api, Email } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export const EmailsList = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Simple form state (in a real app, use a modal or separate route)
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Email>>({ label: '', address: '', description: '' });

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const data = await api.emails.list();
            setEmails(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const filtered = emails.filter(e =>
        e.address.toLowerCase().includes(search.toLowerCase()) ||
        (e.label && e.label.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.address || !formData.label) return;

        try {
            if (editingId) {
                await api.emails.update(editingId, formData);
            } else {
                await api.emails.create(formData as Omit<Email, 'id'>);
            }
            fetchEmails();
            setIsEditing(false);
            setEditingId(null);
            setFormData({ label: '', address: '', description: '' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await api.emails.delete(id);
        fetchEmails();
    };

    const startEdit = (email: Email) => {
        setFormData(email);
        setEditingId(email.id);
        setIsEditing(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Email Accounts</h2>
                <Button onClick={() => { setIsEditing(!isEditing); setEditingId(null); setFormData({}); }}>
                    {isEditing ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Email</>}
                </Button>
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Label"
                            value={formData.label || ''}
                            onChange={e => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g. Personal, Work"
                        />
                        <Input
                            label="Address"
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="name@example.com"
                        />
                        <Input
                            label="Description"
                            className="md:col-span-2"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Purpose of this email..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Save Email</Button>
                    </div>
                </form>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                    className="pl-10"
                    placeholder="Search emails..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <div className="text-slate-500">Loading...</div> : filtered.map(email => (
                    <div key={email.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col justify-between group hover:border-blue-500/50 transition-colors">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400">
                                    {email.label || 'Unlabeled'}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(email)} className="text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(email.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="font-mono text-slate-200 mb-2 truncate" title={email.address}>{email.address}</div>
                            {email.description && <p className="text-sm text-slate-500">{email.description}</p>}
                        </div>
                    </div>
                ))}
                {!loading && filtered.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                        No emails found.
                    </div>
                )}
            </div>
        </div>
    );
};
