import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Identity } from '../types/identity';
import { v4 as uuidv4 } from 'uuid';

interface IdentityContextType {
    identities: Identity[];
    addIdentity: (identity: Omit<Identity, 'id' | 'createdAt' | 'updatedAt' | 'modules'>) => void;
    getIdentity: (id: string) => Identity | undefined;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const useIdentity = () => {
    const context = useContext(IdentityContext);
    if (!context) {
        throw new Error('useIdentity must be used within an IdentityProvider');
    }
    return context;
};

interface IdentityProviderProps {
    children: ReactNode;
}

export const IdentityProvider: React.FC<IdentityProviderProps> = ({ children }) => {
    const [identities, setIdentities] = useState<Identity[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const storedIdentities = localStorage.getItem('jarvis_identities');
        if (storedIdentities) {
            try {
                setIdentities(JSON.parse(storedIdentities));
            } catch (e) {
                console.error("Failed to parse identities from localStorage", e);
            }
        } else {
            // Add a default identity if none exists for testing
            const defaultIdentity: Identity = {
                id: uuidv4(),
                name: 'Personal',
                type: 'personal',
                description: 'My personal identity space',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                modules: []
            };
            setIdentities([defaultIdentity]);
            localStorage.setItem('jarvis_identities', JSON.stringify([defaultIdentity]));
        }
    }, []);

    // Save to localStorage whenever identities change
    useEffect(() => {
        if (identities.length > 0) {
            localStorage.setItem('jarvis_identities', JSON.stringify(identities));
        }
    }, [identities]);

    const addIdentity = (newIdentityData: Omit<Identity, 'id' | 'createdAt' | 'updatedAt' | 'modules'>) => {
        const newIdentity: Identity = {
            ...newIdentityData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            modules: [],
        };
        setIdentities((prev) => [...prev, newIdentity]);
    };

    const getIdentity = (id: string) => {
        return identities.find((identity) => identity.id === id);
    };

    return (
        <IdentityContext.Provider value={{ identities, addIdentity, getIdentity }}>
            {children}
        </IdentityContext.Provider>
    );
};
