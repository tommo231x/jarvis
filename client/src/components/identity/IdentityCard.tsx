import React from 'react';
import { Identity } from '../../types/identity';
import { Link } from 'react-router-dom';
import { User, Briefcase, Folder, Link as LinkIcon } from 'lucide-react';

interface IdentityCardProps {
    identity: Identity;
}

const IdentityCard: React.FC<IdentityCardProps> = ({ identity }) => {
    const getIcon = () => {
        switch (identity.type) {
            case 'personal': return <User className="text-blue-400" size={24} />;
            case 'business': return <Briefcase className="text-purple-400" size={24} />;
            case 'project': return <Folder className="text-green-400" size={24} />;
            default: return <LinkIcon className="text-gray-400" size={24} />;
        }
    };

    return (
        <Link to={`/identities/${identity.id}`} className="block">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/80 hover:border-gray-600 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg group-hover:scale-105 transition-transform duration-300">
                        {identity.avatarUrl ? (
                            <img src={identity.avatarUrl} alt={identity.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            getIcon()
                        )}
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{identity.type}</span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{identity.name}</h3>

                {identity.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                        {identity.description}
                    </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-700/30 flex items-center justify-between text-xs text-gray-500">
                    <span>Updated {new Date(identity.updatedAt).toLocaleDateString()}</span>
                    <span className="group-hover:text-blue-400 transition-colors">Open Dashboard →</span>
                </div>
            </div>
        </Link>
    );
};

export default IdentityCard;
