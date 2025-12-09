import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentity } from '../../context/IdentityContext';
import { IdentityType } from '../../types/identity';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateIdentity = () => {
    const navigate = useNavigate();
    const { addIdentity } = useIdentity();

    const [formData, setFormData] = useState({
        name: '',
        type: 'personal' as IdentityType,
        description: '',
        avatarUrl: ''
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        addIdentity(formData);
        navigate('/identities');
    };

    const types: { id: IdentityType; label: string }[] = [
        { id: 'personal', label: 'Personal' },
        { id: 'business', label: 'Business' },
        { id: 'project', label: 'Project' },
        { id: 'other', label: 'Other' }
    ];

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link to="/identities" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
            </Link>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <h1 className="text-2xl font-bold text-white mb-6">Create New Identity</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Identity Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="e.g. John Doe, Acme Corp, Secret Project"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {types.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                    className={`
                    px-4 py-3 rounded-lg text-sm font-medium border transition-all
                    ${formData.type === type.id
                                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                            : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700'}
                  `}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Avatar URL (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="https://..."
                            value={formData.avatarUrl}
                            onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                        <textarea
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors h-24 resize-none"
                            placeholder="Brief description of this identity context..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-8"
                    >
                        <Check size={20} />
                        Create Identity
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateIdentity;
