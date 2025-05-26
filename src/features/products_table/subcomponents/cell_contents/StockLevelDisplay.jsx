import React from 'react';
import PropTypes from 'prop-types';

const StockLevelDisplay = ({
    quantity,
    lowStockThreshold = 10, // Default low stock threshold
    outOfStockText = "Out of Stock",
    lowStockText = "Low Stock",
    inStockText = "In Stock" // Added for clarity when quantity > lowStockThreshold
}) => {
    let displayQuantity = quantity;
    if (quantity === null || quantity === undefined) {
        displayQuantity = 0; // Treat null/undefined as 0 for display logic
    }

    let statusText;
    let textColor;
    let quantityDisplay = `${displayQuantity}`;

    if (displayQuantity <= 0) {
        statusText = outOfStockText;
        textColor = 'text-red-600 dark:text-red-400';
    } else if (displayQuantity <= lowStockThreshold) {
        statusText = `${quantityDisplay} (${lowStockText})`;
        textColor = 'text-yellow-600 dark:text-yellow-500'; // Changed from orange for better distinction
    } else {
        statusText = `${quantityDisplay} (${inStockText})`;
        textColor = 'text-green-600 dark:text-green-400';
    }

    return (
        <span className={`text-sm font-medium ${textColor}`}>
            {statusText}
        </span>
    );
};

StockLevelDisplay.propTypes = {
    quantity: PropTypes.number,
    lowStockThreshold: PropTypes.number,
    outOfStockText: PropTypes.string,
    lowStockText: PropTypes.string,
    inStockText: PropTypes.string,
};

export default StockLevelDisplay;