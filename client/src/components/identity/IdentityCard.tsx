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
        <Link to={`/identities/${identity.id}`} className="block h-full">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:bg-[#161616] hover:border-white/10 transition-all duration-300 group h-full flex flex-col shadow-lg">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/5 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                        {identity.avatarUrl ? (
                            <img src={identity.avatarUrl} alt={identity.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            getIcon()
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-800 rounded-full px-2 py-1">{identity.type}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{identity.name}</h3>

                {identity.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed flex-1">
                        {identity.description}
                    </p>
                )}

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <span>Updated {new Date(identity.updatedAt).toLocaleDateString()}</span>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
            </div>
        </Link>
    );
};

export default IdentityCard;
