import React, { createContext, useContext, useState, useCallback } from 'react';

interface DataRefreshContextType {
    refreshKey: number;
    triggerRefresh: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType>({
    refreshKey: 0,
    triggerRefresh: () => {}
});

export const DataRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </DataRefreshContext.Provider>
    );
};

export const useDataRefresh = () => useContext(DataRefreshContext);
