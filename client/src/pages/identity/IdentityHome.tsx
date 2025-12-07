
import { useIdentity } from '../../context/IdentityContext';
import IdentityCard from '../../components/identity/IdentityCard';
import { Plus, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const IdentityHome = () => {
    const { identities } = useIdentity();

    return (
        <div className="min-h-screen bg-[#050505] p-8 text-gray-200">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-blue-500 mb-2">
                            <Shield size={24} />
                            <span className="text-sm font-bold tracking-widest uppercase">Identity System</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white tracking-tight">
                            Identity Hub
                        </h1>
                        <p className="text-gray-400 max-w-lg text-lg">
                            Manage your digital personas, business entities, and project contexts in one unified dashboard.
                        </p>
                    </div>

                    <Link
                        to="/identities/create"
                        className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>New Identity</span>
                    </Link>
                </div>

                {identities.length === 0 ? (
                    <div className="text-center py-32 bg-gray-900/20 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 text-xl mb-6">No identities configured.</p>
                        <Link to="/identities/create" className="text-blue-400 hover:text-blue-300 font-medium text-lg underline decoration-blue-500/30 underline-offset-4">Create your first identity</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {identities.map((identity) => (
                            <IdentityCard key={identity.id} identity={identity} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdentityHome;
