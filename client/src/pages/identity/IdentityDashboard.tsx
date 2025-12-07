import { useParams, Link } from 'react-router-dom';
import { useIdentity } from '../../context/IdentityContext';
import { ArrowLeft, Settings, LayoutGrid, Mail, Calendar } from 'lucide-react';

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

            {/* Placeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Placeholder Module Blocks */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 p-8 rounded-2xl border border-dashed border-gray-800 bg-gray-900/20 min-h-[300px] flex flex-col items-center justify-center text-gray-600">
                    <LayoutGrid size={48} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Main Activity Feed</h3>
                    <p className="text-sm">Future module injection point</p>
                </div>

                <div className="p-8 rounded-2xl border border-dashed border-gray-800 bg-gray-900/20 min-h-[200px] flex flex-col items-center justify-center text-gray-600">
                    <Mail size={32} className="mb-3 opacity-50" />
                    <h3 className="text-base font-medium">Messages / Email</h3>
                    <p className="text-xs mt-1">Future module</p>
                </div>

                <div className="p-8 rounded-2xl border border-dashed border-gray-800 bg-gray-900/20 min-h-[200px] flex flex-col items-center justify-center text-gray-600">
                    <Calendar size={32} className="mb-3 opacity-50" />
                    <h3 className="text-base font-medium">Calendar / Tasks</h3>
                    <p className="text-xs mt-1">Future module</p>
                </div>

            </div>
        </div>
    );
};

export default IdentityDashboard;
