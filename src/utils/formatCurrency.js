import { getErrorMessage } from './getErrorMessage';

/**
 * Formats a number as a currency string using the browser's Intl API.
 * Gracefully handles non-numeric inputs and invalid currency codes.
 *
 * @param {number | null | undefined} amount - The numeric value to format.
 * @param {string} currencyCode - The 3-letter ISO currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @returns {string} The formatted currency string (e.g., "$1,234.56", "€1.234,56").
 */

export const formatCurrency = (amount, currencyCode = 'USD') => {
    const safeAmount = typeof amount === 'number' && isFinite(amount) ? amount : 0;
    const safeCurrencyCode = currencyCode || 'USD';

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: safeCurrencyCode,
            currencyDisplay: 'symbol', // Use 'narrowSymbol' for potentially more compact symbols like '$' instead of 'US$'
        }).format(safeAmount);
    } catch (error) {
        // This catches invalid currency codes passed to Intl.NumberFormat
        console.error(`Currency formatting error for code '${safeCurrencyCode}':`, getErrorMessage(error));
        // Fallback to a simple USD format on error
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(safeAmount);
    }
};
/**
 * Formats a duration in seconds into a human-readable string (e.g., 95 -> "1m 35s").
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string} The formatted duration string.
 */
export const formatDuration = (totalSeconds) => {
    if (totalSeconds < 0 || totalSeconds === null || totalSeconds === undefined) {
        return 'N/A';
    }
    if (totalSeconds < 60) {
        return `${Math.round(totalSeconds)}s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${minutes}m ${seconds}s`;
};