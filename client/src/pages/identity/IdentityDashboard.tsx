import { useParams, Link } from 'react-router-dom';
import { useIdentity } from '../../context/IdentityContext';
import { ArrowLeft, Settings } from 'lucide-react';
import ModuleCard from '../../components/identity/ModuleCard';

const IdentityDashboard = () => {
    const { id } = useParams<{ id: string }>();
    const { getIdentity } = useIdentity();
    const identity = id ? getIdentity(id) : undefined;

    if (!identity) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl text-red-400 mb-4">Identity not found</h2>
                <Link to="/identities" className="text-blue-400">Return to Dashboard</Link>
            </div>
        );
    }

    const activeModules = identity.modules ? [...identity.modules].sort((a, b) => a.order - b.order) : [];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 pb-8 border-b border-gray-800">
                <Link to="/identities" className="inline-flex items-center text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to list
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 border border-gray-700 overflow-hidden">
                            {identity.avatarUrl ? <img src={identity.avatarUrl} alt={identity.name} className="w-full h-full object-cover" /> : identity.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-white">{identity.name}</h1>
                                <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400 uppercase tracking-wide">
                                    {identity.type}
                                </span>
                            </div>
                            <p className="text-gray-400 max-w-xl">{identity.description || "No description provided."}</p>
                        </div>
                    </div>

                    <button className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Dynamic Module Grid */}
            <h2 className="text-xl font-semibold text-white mb-6">Active Modules</h2>

            {activeModules.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/20">
                    <p className="text-gray-500">No modules configured for this identity. Core modules will see appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeModules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IdentityDashboard;
