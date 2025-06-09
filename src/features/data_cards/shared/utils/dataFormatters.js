import { format } from 'date-fns';

// Currency formatting (USD)
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

// Date formatting by mode
export const formatDate = (date, mode) => {
    switch (mode) {
        case 'day':
            return format(date, 'HH:mm'); // 14:30
        case 'week':
            return format(date, 'MMM dd'); // Apr 15
        case 'month':
            return format(date, 'MMM yyyy'); // Apr 2024
        default:
            return format(date, 'yyyy-MM-dd');
    }
};