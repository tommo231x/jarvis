import React, { useState } from 'react';
import { useModuleData } from '../../../context/ModuleDataContext';
import { EmailRecord } from '../../../types/moduleData';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X } from 'lucide-react';

interface EmailModuleProps {
    identityId: string;
}

const EmailModule: React.FC<EmailModuleProps> = ({ identityId }) => {
    const { getModuleData, addItem } = useModuleData();
    const emails = getModuleData<EmailRecord>(identityId, 'email');
    const [isAdding, setIsAdding] = useState(false);
    const [newEmail, setNewEmail] = useState({ sender: '', subject: '', preview: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addItem(identityId, 'email', {
            id: uuidv4(),
            ...newEmail,
            date: new Date().toISOString(),
            read: false
        });
        setNewEmail({ sender: '', subject: '', preview: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-400">Recent Messages ({emails.length})</h4>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 rounded hover:bg-gray-800 text-blue-400"
                >
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 space-y-2 mb-4">
                    <input
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                        placeholder="Sender"
                        value={newEmail.sender}
                        onChange={e => setNewEmail({ ...newEmail, sender: e.target.value })}
                        required
                    />
                    <input
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                        placeholder="Subject"
                        value={newEmail.subject}
                        onChange={e => setNewEmail({ ...newEmail, subject: e.target.value })}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-1 rounded">
                        Add Mock Email
                    </button>
                </form>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {emails.map(email => (
                    <div key={email.id} className="bg-gray-900/30 p-3 rounded-lg border border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-white">{email.sender}</span>
                            <span className="text-xs text-gray-500">{new Date(email.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-300 truncate">{email.subject}</p>
                    </div>
                ))}
                {emails.length === 0 && !isAdding && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No emails yet.</p>
                )}
            </div>
        </div>
    );
};

export default EmailModule;
