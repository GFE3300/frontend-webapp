/**
 * A centralized utility to extract a user-friendly error message from various
 * error formats, commonly returned by APIs like Django REST Framework.
 *
 * It intelligently checks for different error structures in a prioritized order.
 *
 * @param {any} error - The error object, typically from a catch block or a react-query `error` property.
 * @param {string} [defaultMessage='An unexpected error occurred. Please try again.'] - A fallback message if no specific error can be parsed.
 * @returns {string} A single, user-friendly error message.
 */
export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred. Please try again.') => {
    // If there's no error object, return the default message immediately.
    if (!error) {
        return defaultMessage;
    }

    // 1. Check for Axios-style error with a `response` object.
    if (error.response?.data) {
        const data = error.response.data;

        // Pattern A: Django REST Framework's `detail` key for general errors.
        // e.g., { "detail": "Authentication credentials were not provided." }
        if (typeof data.detail === 'string') {
            return data.detail;
        }

        // Pattern B: Django REST Framework's `non_field_errors`.
        // e.g., { "non_field_errors": ["Invalid username or password."] }
        if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
            return data.non_field_errors[0];
        }

        // Pattern C: Field-specific errors as a dictionary of arrays.
        // e.g., { "email": ["Enter a valid email address."], "password": ["This field may not be blank."] }
        // We'll return the first error message found for simplicity in UI toasts.
        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.length > 0) {
                const firstErrorKey = keys[0];
                const errorMessages = data[firstErrorKey];
                if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                    // Prepend the field name for context, e.g., "Email: Enter a valid email address."
                    const fieldName = firstErrorKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return `${fieldName}: ${errorMessages[0]}`;
                }
            }
        }

        // Pattern D: The entire response data is just a single error string.
        if (typeof data === 'string') {
            return data;
        }
    }

    // 2. Check for standard JavaScript Error object message.
    // This handles network errors (`error.message` will be "Network Error") or client-side errors.
    if (error.message) {
        return error.message;
    }

    // 3. Fallback to the default message if no specific message could be parsed.
    return defaultMessage;
};