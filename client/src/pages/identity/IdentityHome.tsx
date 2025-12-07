import { useIdentity } from '../../context/IdentityContext';
import IdentityCard from '../../components/identity/IdentityCard';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const IdentityHome = () => {
    const { identities } = useIdentity();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        Identity Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Manage your personal, business, and project identities.
                    </p>
                </div>

                <Link
                    to="/identities/create"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/25"
                >
                    <Plus size={20} />
                    <span>New Identity</span>
                </Link>
            </div>

            {identities.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-700">
                    <p className="text-gray-500 mb-4">No identities found.</p>
                    <Link to="/identities/create" className="text-blue-400 hover:text-blue-300">Create your first identity</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {identities.map((identity) => (
                        <IdentityCard key={identity.id} identity={identity} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IdentityHome;
