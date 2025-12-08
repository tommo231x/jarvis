import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, User, Mail, Briefcase, Building2, Code, ChevronDown, ChevronRight } from 'lucide-react';
import { api, Email, Identity, Message } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { BackButton } from '../../components/BackButton';

export const EmailsList = () => {
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedIdentities, setExpandedIdentities] = useState<Set<string>>(new Set());

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Email>>({ 
        label: '', 
        address: '', 
        description: '',
        identityId: '',
        provider: 'gmail',
        isPrimary: false
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [identitiesData, emailsData, messagesData] = await Promise.all([
                api.identities.list(),
                api.emails.list(),
                api.messages.list()
            ]);
            setIdentities(identitiesData);
            setEmails(emailsData);
            setMessages(messagesData);
            setExpandedIdentities(new Set(identitiesData.map(i => i.id)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getEmailsForIdentity = (identityId: string) => {
        return emails.filter(e => e.identityId === identityId);
    };

    const getMessagesForEmail = (emailId: string) => {
        return messages.filter(m => m.emailId === emailId && m.isRelevant);
    };

    const toggleIdentity = (identityId: string) => {
        const newSet = new Set(expandedIdentities);
        if (newSet.has(identityId)) {
            newSet.delete(identityId);
        } else {
            newSet.add(identityId);
        }
        setExpandedIdentities(newSet);
    };

    const getIdentityIcon = (category: string) => {
        switch (category) {
            case 'work': return <Briefcase className="w-5 h-5" />;
            case 'business': return <Building2 className="w-5 h-5" />;
            case 'project': return <Code className="w-5 h-5" />;
            default: return <User className="w-5 h-5" />;
        }
    };

    const getIdentityColor = (category: string) => {
        switch (category) {
            case 'work': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'business': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'project': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
        }
    };

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'gmail': return 'bg-red-500/10 text-red-400';
            case 'outlook': return 'bg-blue-500/10 text-blue-400';
            case 'icloud': return 'bg-slate-500/10 text-slate-300';
            case 'proton': return 'bg-purple-500/10 text-purple-400';
            default: return 'bg-jarvis-accent/10 text-jarvis-accent';
        }
    };

    const filteredIdentities = identities.filter(identity => {
        if (!search) return true;
        const identityEmails = getEmailsForIdentity(identity.id);
        return identityEmails.some(e => 
            e.address.toLowerCase().includes(search.toLowerCase()) ||
            (e.label && e.label.toLowerCase().includes(search.toLowerCase()))
        ) || identity.name.toLowerCase().includes(search.toLowerCase());
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.address || !formData.label || !formData.identityId) return;

        try {
            if (editingId) {
                await api.emails.update(editingId, formData);
            } else {
                await api.emails.create(formData as Omit<Email, 'id'>);
            }
            fetchData();
            setIsEditing(false);
            setEditingId(null);
            setFormData({ label: '', address: '', description: '', identityId: '', provider: 'gmail', isPrimary: false });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this email account?')) return;
        await api.emails.delete(id);
        fetchData();
    };

    const startEdit = (email: Email) => {
        setFormData(email);
        setEditingId(email.id);
        setIsEditing(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <BackButton to="/" label="Back to Dashboard" />
            
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Email Accounts</h2>
                    <p className="text-sm md:text-base text-jarvis-muted mt-0.5 md:mt-1">Manage email addresses grouped by identity</p>
                </div>
                <Button 
                    onClick={() => { setIsEditing(!isEditing); setEditingId(null); setFormData({ identityId: identities[0]?.id || '', provider: 'gmail', isPrimary: false }); }}
                    className="w-full md:w-auto justify-center"
                >
                    {isEditing ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Email</>}
                </Button>
            </div>

            {isEditing && (
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Email Account' : 'Add New Email Account'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-jarvis-muted mb-2">Identity</label>
                                <select
                                    value={formData.identityId || ''}
                                    onChange={e => setFormData({ ...formData, identityId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:ring-2 focus:ring-jarvis-accent focus:border-transparent"
                                >
                                    <option value="">Select Identity</option>
                                    {identities.map(identity => (
                                        <option key={identity.id} value={identity.id}>{identity.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-jarvis-muted mb-2">Provider</label>
                                <select
                                    value={formData.provider || 'gmail'}
                                    onChange={e => setFormData({ ...formData, provider: e.target.value as Email['provider'] })}
                                    className="w-full px-4 py-2.5 bg-jarvis-bg border border-jarvis-border rounded-lg text-white focus:ring-2 focus:ring-jarvis-accent focus:border-transparent"
                                >
                                    <option value="gmail">Gmail</option>
                                    <option value="outlook">Outlook</option>
                                    <option value="icloud">iCloud</option>
                                    <option value="proton">ProtonMail</option>
                                    <option value="yahoo">Yahoo</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Input
                                label="Label"
                                value={formData.label || ''}
                                onChange={e => setFormData({ ...formData, label: e.target.value })}
                                placeholder="e.g. Primary Gmail, Work"
                            />
                            <Input
                                label="Email Address"
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="name@example.com"
                            />
                            <Input
                                label="Description"
                                className="md:col-span-2"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Purpose of this email account..."
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPrimary"
                                    checked={formData.isPrimary || false}
                                    onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                                    className="w-4 h-4 rounded border-jarvis-border bg-jarvis-bg text-jarvis-accent focus:ring-jarvis-accent"
                                />
                                <label htmlFor="isPrimary" className="text-sm text-jarvis-muted">Primary email for this identity</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit">Save Email</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-jarvis-muted" size={18} />
                <Input
                    className="pl-10"
                    placeholder="Search emails or identities..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-jarvis-muted text-center py-8">Loading...</div>
            ) : filteredIdentities.length === 0 ? (
                <Card className="p-8 text-center">
                    <User className="w-12 h-12 mx-auto mb-3 text-jarvis-muted opacity-50" />
                    <p className="text-jarvis-muted">No identities found</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredIdentities.map(identity => {
                        const identityEmails = getEmailsForIdentity(identity.id);
                        const isExpanded = expandedIdentities.has(identity.id);
                        
                        return (
                            <Card key={identity.id} className={`overflow-hidden border ${getIdentityColor(identity.category).split(' ')[2]}`}>
                                <div 
                                    className="flex items-center justify-between cursor-pointer p-3 md:p-4 -m-5 mb-0 hover:bg-jarvis-border/10 active:bg-jarvis-border/20 transition"
                                    onClick={() => toggleIdentity(identity.id)}
                                >
                                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIdentityColor(identity.category).split(' ').slice(0, 2).join(' ')}`}>
                                            {getIdentityIcon(identity.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-white font-semibold text-sm md:text-base truncate">{identity.name}</h3>
                                            <p className="text-xs text-jarvis-muted truncate">{identity.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-2">
                                        <Badge variant="outline" className="text-[10px] md:text-xs">
                                            <Mail className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                                            <span className="hidden sm:inline">{identityEmails.length} emails</span>
                                            <span className="sm:hidden">{identityEmails.length}</span>
                                        </Badge>
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-jarvis-muted" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-jarvis-muted" />
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-jarvis-border space-y-3">
                                        {identityEmails.length === 0 ? (
                                            <p className="text-jarvis-muted text-sm text-center py-4">No email accounts linked to this identity</p>
                                        ) : (
                                            identityEmails.map(email => {
                                                const emailMessages = getMessagesForEmail(email.id);
                                                return (
                                                    <div key={email.id} className="bg-jarvis-bg/50 rounded-lg p-3 md:p-4 group">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                                                <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${getProviderColor(email.provider)}`}>
                                                                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                                                        <span className="font-medium text-white text-sm truncate">{email.label}</span>
                                                                        {email.isPrimary && (
                                                                            <Badge variant="success" className="text-[10px] md:text-xs">Primary</Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs md:text-sm text-jarvis-muted font-mono truncate">{email.address}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                                                                <Badge variant="outline" className="text-[10px] md:text-xs capitalize hidden sm:flex">{email.provider}</Badge>
                                                                <div className="flex gap-0.5 md:gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => startEdit(email)} className="p-2 md:p-1.5 text-jarvis-muted hover:text-white rounded hover:bg-jarvis-border/50 active:bg-jarvis-border/70">
                                                                        <Edit2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                                                    </button>
                                                                    <button onClick={() => handleDelete(email.id)} className="p-2 md:p-1.5 text-jarvis-muted hover:text-red-400 rounded hover:bg-jarvis-border/50 active:bg-jarvis-border/70">
                                                                        <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {email.description && (
                                                            <p className="text-xs text-jarvis-muted mt-2 ml-11">{email.description}</p>
                                                        )}
                                                        
                                                        {emailMessages.length > 0 && (
                                                            <div className="mt-3 ml-11 space-y-2">
                                                                <p className="text-xs text-jarvis-muted font-medium">Recent relevant messages:</p>
                                                                {emailMessages.slice(0, 3).map(msg => (
                                                                    <div key={msg.id} className={`text-xs p-2 rounded bg-jarvis-border/20 flex justify-between ${!msg.read ? 'border-l-2 border-jarvis-accent' : ''}`}>
                                                                        <span className="text-white truncate flex-1">{msg.subject}</span>
                                                                        <span className="text-jarvis-muted ml-2">{formatDate(msg.date)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
