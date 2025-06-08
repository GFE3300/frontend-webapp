import { useCurrency } from '../hooks/useCurrency';

/**
 * A helper function component that provides a ready-to-use currency formatting function.
 * This is useful for components that need to format numbers without directly using the hook.
 *
 * @example
 * const { formatAsCurrency } = useCurrencyFormatter();
 * <span>{formatAsCurrency(123.45)}</span> // Renders "€123.45" or "$123.45"
 */
export const useBusinessCurrencyFormatter = () => {
    const { currency } = useCurrency();

    const formatAsCurrency = (amount) => {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
        if (isNaN(numericAmount)) {
            return ''; // Return empty for invalid numbers
        }

        return new Intl.NumberFormat('de-DE', { // 'de-DE' is good for comma/dot convention
            style: 'currency',
            currency: currency,
        }).format(numericAmount);
    };

    return { formatAsCurrency };
};

/**
 * Formats a numeric amount into a locale-aware currency string.
 * @param {number} amount - The numeric value to format.
 * @param {string} [currencyCode='USD'] - The 3-letter ISO currency code (e.g., 'USD', 'EUR').
 * @param {string} [locale=navigator.language] - The locale string (e.g., 'en-US', 'de-DE'). Defaults to the browser's language.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = navigator.language) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        console.warn(`Invalid 'amount' passed to formatCurrency: ${amount}`);
        amount = 0; // Default to 0 if invalid
    }
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        console.error(`Error formatting currency for code '${currencyCode}':`, error);
        // Fallback for invalid currency codes to prevent app crashes
        return `$${amount.toFixed(2)}`;
    }
};