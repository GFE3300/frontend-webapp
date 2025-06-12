import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatCurrency';

// A map to get common symbols from ISO codes. Can be expanded.
// This is used for cases where ONLY the symbol is needed.
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    // Add other common currencies as needed
};

/**
 * The primary hook for accessing currency information and formatting utilities
 * throughout the application. It derives the active currency from the user's
 * auth context, ensuring all financial data is displayed correctly.
 *
 * @returns {{
 *  currencyCode: string, // The 3-letter ISO code (e.g., 'USD')
 *  currencySymbol: string, // The common symbol (e.g., '$')
 *  formatCurrency: (amount: number) => string // A function to format a number into a currency string
 * }}
 */
export const useCurrency = () => {
    const { user } = useAuth();

    // The currency code is derived from the authenticated user's active business.
    // Fallback to 'USD' ensures stability during initial load or for edge cases.
    const currencyCode = useMemo(() => user?.activeBusinessCurrency || 'USD', [user]);

    // The symbol is derived from our map for simple display needs.
    const currencySymbol = useMemo(() => currencySymbols[currencyCode] || '$', [currencyCode]);

    // The format function is memoized to prevent re-creation on every render.
    // It's pre-configured with the correct currency code.
    const formatCurrency = useMemo(() => {
        return (amount) => formatCurrencyUtil(amount, currencyCode);
    }, [currencyCode]);

    return { currencyCode, currencySymbol, formatCurrency };
};


export const useBusinessCurrency = () => {
    const { user, isLoading } = useAuth();

    const currencyCode = useMemo(() => {
        return user?.activeBusinessCurrency || 'USD'; // Sensible fallback
    }, [user]);

    const currencySymbol = useMemo(() => {
        return currencySymbols[currencyCode] || '$'; // Fallback to '$'
    }, [currencyCode]);

    return {
        currency: currencyCode,
        symbol: currencySymbol,
        isLoading: isLoading,
    };
};
