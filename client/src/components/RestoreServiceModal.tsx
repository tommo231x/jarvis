import React, { useState } from 'react';
import { Button } from './Button';
import { RefreshCw } from 'lucide-react';
import { Identity, Service } from '../api';

interface RestoreServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (identityIds: string[]) => void;
    service: Service;
    identities: Identity[];
}

type RestoreOption = 'original' | 'different' | 'none';

export const RestoreServiceModal: React.FC<RestoreServiceModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    service,
    identities
}) => {
    const [restoreOption, setRestoreOption] = useState<RestoreOption>('original');
    const [selectedIdentityId, setSelectedIdentityId] = useState<string>('');

    if (!isOpen) return null;

    const originalIdentityIds = service.ownerIdentityIds || (service.identityId ? [service.identityId] : []);
    const originalIdentityNames = originalIdentityIds
        .map(id => identities.find(i => i.id === id)?.name)
        .filter(Boolean)
        .join(', ');

    const handleConfirm = () => {
        let identityIds: string[] = [];
        
        if (restoreOption === 'original') {
            identityIds = originalIdentityIds;
        } else if (restoreOption === 'different' && selectedIdentityId) {
            identityIds = [selectedIdentityId];
        }
        
        onConfirm(identityIds);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0A0A0A] border border-jarvis-border/50 rounded-xl shadow-2xl transform transition-all scale-100 p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-jarvis-accent/10 text-jarvis-accent">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">Restore Service</h3>
                        <p className="text-sm text-jarvis-muted mt-1">
                            Where would you like to restore "{service.name}"?
                        </p>
                    </div>
                </div>

                <div className="space-y-3 mt-4">
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-jarvis-border/50 hover:border-jarvis-accent/50 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name="restoreOption"
                            value="original"
                            checked={restoreOption === 'original'}
                            onChange={() => setRestoreOption('original')}
                            className="mt-1 accent-jarvis-accent"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-white">Original Identity</span>
                            <p className="text-xs text-jarvis-muted mt-0.5">
                                {originalIdentityNames || 'No original identity assigned'}
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-jarvis-border/50 hover:border-jarvis-accent/50 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name="restoreOption"
                            value="different"
                            checked={restoreOption === 'different'}
                            onChange={() => setRestoreOption('different')}
                            className="mt-1 accent-jarvis-accent"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-white">Different Identity</span>
                            <p className="text-xs text-jarvis-muted mt-0.5">
                                Choose a new identity for this service
                            </p>
                            {restoreOption === 'different' && (
                                <select
                                    className="mt-2 w-full h-9 px-3 rounded-md bg-jarvis-bg/50 border border-jarvis-border/50 text-sm text-white focus:border-jarvis-accent outline-none"
                                    value={selectedIdentityId}
                                    onChange={(e) => setSelectedIdentityId(e.target.value)}
                                >
                                    <option value="">Select an identity...</option>
                                    {identities.map(i => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-jarvis-border/50 hover:border-jarvis-accent/50 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name="restoreOption"
                            value="none"
                            checked={restoreOption === 'none'}
                            onChange={() => setRestoreOption('none')}
                            className="mt-1 accent-jarvis-accent"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-white">No Identity</span>
                            <p className="text-xs text-jarvis-muted mt-0.5">
                                Restore without assigning to any identity
                            </p>
                        </div>
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={onClose} className="text-jarvis-muted hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={restoreOption === 'different' && !selectedIdentityId}
                    >
                        Restore
                    </Button>
                </div>
            </div>
        </div>
    );
};
