import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

// A map to get symbols from ISO codes. Can be expanded.
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    // Add other currencies as needed
};

/**
 * A hook to provide currency information based on the user's active business context.
 * It efficiently reads data from the AuthContext without making a separate API call.
 *
 * @returns {{
 *  currency: string, // e.g., 'USD', 'EUR'
 *  symbol: string,   // e.g., '$', '€'
 *  isLoading: boolean // True while auth context is loading
 * }}
 */
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

import { useContext } from 'react';
import { VenueContext } from '../contexts/VenueDataContext';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatCurrency.js';

/**
 * A hook to access the current business's currency information and a formatting function.
 * @returns {{currencyCode: string, formatCurrency: (amount: number) => string}}
 */
export const useCurrency  = () => {
    const venueContext = useContext(VenueContext);
    const currencyCode = venueContext?.businessCurrency || 'USD';

    const formatCurrency = (amount) => {
        return formatCurrencyUtil(amount, currencyCode);
    };

    return { currencyCode, formatCurrency };
};