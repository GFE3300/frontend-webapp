/**
 * Formats a numeric amount into a locale-aware currency string.
 * This standalone utility is preferred over a hook for simple formatting tasks
 * as it doesn't require being in a React component context.
 *
 * @param {number | string} amount - The numeric value to format.
 * @param {string} [currencyCode='USD'] - The 3-letter ISO currency code (e.g., 'USD', 'EUR').
 * @param {string} [locale=navigator.language] - The locale string (e.g., 'en-US', 'de-DE'). Defaults to the browser's language.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = navigator.language) => {
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    if (isNaN(numericAmount)) {
        console.warn(`Invalid 'amount' passed to formatCurrency: ${amount}. Defaulting to 0.`);
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
        }).format(0);
    }

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
        }).format(numericAmount);
    } catch (error) {
        console.error(`Error formatting currency for code '${currencyCode}':`, error);
        // Fallback for invalid currency codes to prevent app crashes
        return `$${numericAmount.toFixed(2)}`;
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