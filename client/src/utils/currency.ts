const FRANKFURTER_API = 'https://api.frankfurter.app';

export interface ExchangeRates {
    base: string;
    date: string;
    rates: Record<string, number>;
}

interface CachedRates {
    rates: ExchangeRates;
    timestamp: number;
}

const CACHE_KEY = 'jarvis_exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function detectBaseCurrency(services: Array<{ cost?: { currency: string } }>): string {
    const currencyCounts: Record<string, number> = {};
    
    services.forEach(service => {
        if (service.cost?.currency) {
            const currency = service.cost.currency.toUpperCase();
            currencyCounts[currency] = (currencyCounts[currency] || 0) + 1;
        }
    });

    let baseCurrency = 'GBP';
    let maxCount = 0;

    Object.entries(currencyCounts).forEach(([currency, count]) => {
        if (count > maxCount) {
            maxCount = count;
            baseCurrency = currency;
        }
    });

    return baseCurrency;
}

export function detectForeignCurrencies(
    services: Array<{ cost?: { currency: string } }>,
    baseCurrency: string
): string[] {
    const foreignCurrencies = new Set<string>();

    services.forEach(service => {
        if (service.cost?.currency) {
            const currency = service.cost.currency.toUpperCase();
            if (currency !== baseCurrency) {
                foreignCurrencies.add(currency);
            }
        }
    });

    return Array.from(foreignCurrencies);
}

export function hasForeignCurrencies(
    services: Array<{ cost?: { currency: string } }>,
    baseCurrency: string
): boolean {
    return detectForeignCurrencies(services, baseCurrency).length > 0;
}

function getCachedRates(): CachedRates | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsed: CachedRates = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function setCachedRates(rates: ExchangeRates): void {
    const cacheEntry: CachedRates = {
        rates,
        timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
}

export async function fetchExchangeRates(
    baseCurrency: string,
    targetCurrencies: string[],
    forceRefresh = false
): Promise<ExchangeRates | null> {
    if (targetCurrencies.length === 0) {
        return null;
    }

    if (!forceRefresh) {
        const cached = getCachedRates();
        if (cached && cached.rates.base === baseCurrency) {
            const hasAllCurrencies = targetCurrencies.every(
                c => c in cached.rates.rates || c === baseCurrency
            );
            if (hasAllCurrencies) {
                return cached.rates;
            }
        }
    }

    try {
        const symbols = targetCurrencies.filter(c => c !== baseCurrency).join(',');
        if (!symbols) return null;

        const response = await fetch(
            `${FRANKFURTER_API}/latest?from=${baseCurrency}&to=${symbols}`
        );

        if (!response.ok) {
            console.error('Failed to fetch exchange rates:', response.statusText);
            return getCachedRates()?.rates || null;
        }

        const data: ExchangeRates = await response.json();
        setCachedRates(data);
        return data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return getCachedRates()?.rates || null;
    }
}

export function convertToBaseCurrency(
    amount: number,
    fromCurrency: string,
    baseCurrency: string,
    rates: ExchangeRates | null
): number {
    if (!rates || fromCurrency === baseCurrency) {
        return amount;
    }

    const fromUpper = fromCurrency.toUpperCase();

    if (rates.base === baseCurrency && rates.rates[fromUpper]) {
        return amount / rates.rates[fromUpper];
    }

    if (rates.base === fromUpper) {
        const targetRate = rates.rates[baseCurrency];
        if (targetRate) {
            return amount * targetRate;
        }
    }

    return amount;
}

export function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

export function clearExchangeRateCache(): void {
    localStorage.removeItem(CACHE_KEY);
}
