export const getErrorMessage = (error) => {
    if (error.response) {
        // Django REST Framework error format
        if (error.response.data?.detail) {
            return error.response.data.detail;
        }

        // Form validation errors
        if (error.response.data) {
            return Object.values(error.response.data)
                .flat()
                .join(', ');
        }
    }

    return error.message || 'An unexpected error occurred. Please try again.';
};