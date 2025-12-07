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
        <div className="min-h-screen bg-[#050505] text-gray-200 p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="relative mb-12">
                    <Link to="/identities" className="absolute -top-12 left-0 inline-flex items-center text-gray-500 hover:text-white transition-colors group">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Identities
                    </Link>

                    <div className="flex flex-col md:flex-row items-starts md:items-center justify-between gap-6 bg-gray-900/20 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center text-3xl font-bold text-gray-600 border border-white/10 shadow-xl overflow-hidden">
                                {identity.avatarUrl ? <img src={identity.avatarUrl} alt={identity.name} className="w-full h-full object-cover" /> : identity.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold text-white tracking-tight">{identity.name}</h1>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-widest">
                                        {identity.type}
                                    </span>
                                </div>
                                <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">{identity.description || "No description provided."}</p>
                            </div>
                        </div>

                        <button className="self-start md:self-center p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {activeModules.map((module) => (
                        <ModuleCard key={module.id} module={module} identityId={identity.id} />
                    ))}
                    {activeModules.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-gray-400">No active modules found for this identity.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdentityDashboard;
