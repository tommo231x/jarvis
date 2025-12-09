import React, { useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { ExchangeRates } from '../utils/currency';

interface ExchangeRateIndicatorProps {
    rates: ExchangeRates | null;
    baseCurrency: string;
    foreignCurrencies: string[];
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export const ExchangeRateIndicator: React.FC<ExchangeRateIndicatorProps> = ({
    rates,
    baseCurrency,
    foreignCurrencies,
    onRefresh,
    isRefreshing = false
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (foreignCurrencies.length === 0 || !rates) {
        return null;
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1 text-xs text-jarvis-muted hover:text-jarvis-accent transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                title="Currency conversion active"
            >
                <TrendingUp className="w-3 h-3" />
                <span>{foreignCurrencies.length} currency converted</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-jarvis-card border border-jarvis-border rounded-lg shadow-xl animate-fade-in">
                        <div className="p-3 border-b border-jarvis-border/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-white">Exchange Rates</h4>
                                {onRefresh && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRefresh();
                                        }}
                                        disabled={isRefreshing}
                                        className="p-1 rounded hover:bg-white/10 text-jarvis-muted hover:text-white transition-colors disabled:opacity-50"
                                        title="Refresh rates"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-jarvis-muted mt-1">
                                Base: {baseCurrency} | Updated: {rates.date}
                            </p>
                        </div>

                        <div className="p-2 space-y-1">
                            {foreignCurrencies.map(currency => {
                                const rate = rates.rates[currency];
                                if (!rate) return null;

                                const inverseRate = (1 / rate).toFixed(4);

                                return (
                                    <div
                                        key={currency}
                                        className="flex items-center justify-between px-2 py-1.5 rounded bg-white/5"
                                    >
                                        <span className="text-sm text-white font-medium">{currency}</span>
                                        <span className="text-xs text-jarvis-muted">
                                            1 {currency} = {inverseRate} {baseCurrency}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-2 border-t border-jarvis-border/50">
                            <p className="text-[10px] text-jarvis-muted text-center">
                                Rates from Frankfurter API
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
