import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModuleDataStore } from '../types/moduleData';

interface ModuleDataContextType {
    data: ModuleDataStore;

    // Generic helper to get data safety
    getModuleData: <T>(identityId: string, moduleKey: keyof ModuleDataStore[string]) => T[];

    // Generic CRUD helpers
    addItem: (identityId: string, moduleKey: keyof ModuleDataStore[string], item: any) => void;
    updateItem: (identityId: string, moduleKey: keyof ModuleDataStore[string], itemId: string, updates: any) => void;
    removeItem: (identityId: string, moduleKey: keyof ModuleDataStore[string], itemId: string) => void;
}

const ModuleDataContext = createContext<ModuleDataContextType | undefined>(undefined);

export const useModuleData = () => {
    const context = useContext(ModuleDataContext);
    if (!context) {
        throw new Error('useModuleData must be used within a ModuleDataProvider');
    }
    return context;
};

interface ModuleDataProviderProps {
    children: ReactNode;
}

export const ModuleDataProvider: React.FC<ModuleDataProviderProps> = ({ children }) => {
    const [data, setData] = useState<ModuleDataStore>({});

    // Load from localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('jarvis_module_data');
        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch (e) {
                console.error("Failed to parse module data", e);
            }
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (Object.keys(data).length > 0) {
            localStorage.setItem('jarvis_module_data', JSON.stringify(data));
        }
    }, [data]);

    const getModuleData = <T,>(identityId: string, moduleKey: keyof ModuleDataStore[string]): T[] => {
        if (!data[identityId]) return [];
        // @ts-ignore
        return (data[identityId][moduleKey] || []) as T[];
    };

    const addItem = (identityId: string, moduleKey: keyof ModuleDataStore[string], item: any) => {
        setData(prev => {
            const identityData = prev[identityId] || { email: [], services: [], subscriptions: [], tasks: [], adminLinks: [] };
            return {
                ...prev,
                [identityId]: {
                    ...identityData,
                    [moduleKey]: [...(identityData[moduleKey] || []), item]
                }
            };
        });
    };

    const updateItem = (identityId: string, moduleKey: keyof ModuleDataStore[string], itemId: string, updates: any) => {
        setData(prev => {
            const identityData = prev[identityId];
            if (!identityData) return prev;

            const list = identityData[moduleKey] || [];
            // @ts-ignore
            const newList = list.map(item => item.id === itemId ? { ...item, ...updates } : item);

            return {
                ...prev,
                [identityId]: {
                    ...identityData,
                    [moduleKey]: newList
                }
            };
        });
    };

    const removeItem = (identityId: string, moduleKey: keyof ModuleDataStore[string], itemId: string) => {
        setData(prev => {
            const identityData = prev[identityId];
            if (!identityData) return prev;

            const list = identityData[moduleKey] || [];
            // @ts-ignore
            const newList = list.filter(item => item.id !== itemId);

            return {
                ...prev,
                [identityId]: {
                    ...identityData,
                    [moduleKey]: newList
                }
            };
        });
    };

    return (
        <ModuleDataContext.Provider value={{ data, getModuleData, addItem, updateItem, removeItem }}>
            {children}
        </ModuleDataContext.Provider>
    );
};
