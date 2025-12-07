import { useEffect, useState } from 'react';
import { Plus, Mail, Trash2, Edit2, Shield, Briefcase, User, Flame } from 'lucide-react';
import { api, Email } from '../../api';
import { EmailForm } from '../../components/identity/EmailForm';

export const EmailList = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmail, setEditingEmail] = useState<Email | undefined>(undefined);

    const fetchEmails = async () => {
        try {
            const data = await api.emails.list();
            setEmails(data);
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleCreate = async (data: Omit<Email, 'id'>) => {
        try {
            await api.emails.create(data);
            await fetchEmails();
        } catch (error) {
            console.error('Failed to create email:', error);
        }
    };

    const handleUpdate = async (data: Omit<Email, 'id'>) => {
        if (!editingEmail) return;
        try {
            await api.emails.update(editingEmail.id, data);
            await fetchEmails();
            setEditingEmail(undefined);
        } catch (error) {
            console.error('Failed to update email:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this email?')) return;
        try {
            await api.emails.delete(id);
            await fetchEmails();
        } catch (error) {
            console.error('Failed to delete email:', error);
        }
    };

    const openCreateModal = () => {
        setEditingEmail(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (email: Email) => {
        setEditingEmail(email);
        setIsModalOpen(true);
    };

    const getProviderIcon = (_provider: string) => {
        // You can add specific icons for providers here if needed
        return <Mail size={20} />;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'work': return <Briefcase size={14} />;
            case 'burner': return <Flame size={14} />;
            case 'project': return <Shield size={14} />;
            default: return <User size={14} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'work': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'burner': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'project': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    if (isLoading) {
        return <div className="text-slate-400 p-8 text-center">Loading emails...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Email Accounts</h2>
                    <p className="text-slate-400">Manage your digital communication identities.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    <span>Add Email</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emails.map((email) => (
                    <div key={email.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors group relative">
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEditModal(email)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(email.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400">
                                    {getProviderIcon(email.provider)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{email.label}</h3>
                                    <p className="text-sm text-slate-400">{email.provider}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-slate-200 font-mono text-sm bg-slate-900/50 p-2 rounded border border-slate-700/50 break-all">
                                {email.address}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(email.type)}`}>
                                {getTypeIcon(email.type)}
                                <span className="capitalize">{email.type}</span>
                            </span>
                        </div>

                        {email.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500 line-clamp-2">{email.notes}</p>
                            </div>
                        )}
                    </div>
                ))}

                {emails.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-400">No emails added yet</h3>
                        <p className="text-slate-500 text-sm mt-1">Add your first email account to get started.</p>
                    </div>
                )}
            </div>

            <EmailForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingEmail ? handleUpdate : handleCreate}
                initialData={editingEmail}
            />
        </div>
    );
};
