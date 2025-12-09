import React, { createContext, useContext, useState, useCallback } from 'react';
import { clearExchangeRateCache } from '../utils/currency';

interface DataRefreshContextType {
    refreshKey: number;
    triggerRefresh: (options?: { refreshExchangeRates?: boolean }) => void;
}

const DataRefreshContext = createContext<DataRefreshContextType>({
    refreshKey: 0,
    triggerRefresh: () => {}
});

export const DataRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback((options?: { refreshExchangeRates?: boolean }) => {
        if (options?.refreshExchangeRates) {
            clearExchangeRateCache();
        }
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </DataRefreshContext.Provider>
    );
};

export const useDataRefresh = () => useContext(DataRefreshContext);
