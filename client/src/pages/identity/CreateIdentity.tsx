import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, Identity } from '../../api';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type IdentityCategory = 'personal' | 'work' | 'business' | 'project' | 'alias';

const CreateIdentity = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [formData, setFormData] = useState({
        name: '',
        category: 'personal' as IdentityCategory,
        description: '',
        avatar: ''
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchIdentity = async () => {
                try {
                    const identity = await api.identities.get(id);
                    setFormData({
                        name: identity.name || '',
                        category: (identity.category || 'personal') as IdentityCategory,
                        description: identity.description || '',
                        avatar: identity.avatar || ''
                    });
                } catch (error) {
                    console.error('Failed to fetch identity:', error);
                } finally {
                    setIsFetching(false);
                }
            };
            fetchIdentity();
        }
    }, [id, isEditMode]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditMode && id) {
                await api.identities.update(id, formData);
            } else {
                await api.identities.create(formData as Omit<Identity, 'id'>);
            }
            navigate('/identities');
        } catch (error) {
            console.error('Failed to save identity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories: { id: IdentityCategory; label: string }[] = [
        { id: 'personal', label: 'Personal' },
        { id: 'work', label: 'Work' },
        { id: 'business', label: 'Business' },
        { id: 'project', label: 'Project' },
        { id: 'alias', label: 'Alias' }
    ];

    if (isFetching) {
        return (
            <div className="p-8 max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-jarvis-accent" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link to="/identities" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Profiles
            </Link>

            <div className="bg-jarvis-card border border-jarvis-border rounded-2xl p-8">
                <h1 className="text-2xl font-bold text-white mb-6">
                    {isEditMode ? 'Edit Profile' : 'Create New Profile'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Profile Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                            placeholder="e.g. John Doe, Acme Corp, Secret Project"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`
                                        px-4 py-3 rounded-lg text-sm font-medium border transition-all
                                        ${formData.category === cat.id
                                            ? 'bg-jarvis-accent/10 border-jarvis-accent/50 text-jarvis-accent'
                                            : 'bg-jarvis-bg border-jarvis-border text-gray-500 hover:border-gray-600'}
                                    `}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Avatar URL (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-jarvis-accent/50 transition-colors"
                            placeholder="https://..."
                            value={formData.avatar}
                            onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                        <textarea
                            className="w-full bg-jarvis-bg border border-jarvis-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-jarvis-accent/50 transition-colors h-24 resize-none"
                            placeholder="Brief description of this profile context..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-jarvis-accent hover:bg-jarvis-accent/80 disabled:opacity-50 text-white font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-8"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Check size={20} />
                                {isEditMode ? 'Save Changes' : 'Create Profile'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateIdentity;
