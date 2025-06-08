import React from 'react';
import PropTypes from 'prop-types';

import { scriptLines_ProductsTable as scriptLines } from '../../utils/script_lines.js';

const StockLevelDisplay = ({
    quantity,
    lowStockThreshold = 10,

}) => {
    let displayQuantity = quantity;
    if (quantity === null || quantity === undefined) {
        displayQuantity = 0;
    }

    let statusText;
    let textColor;
    let quantityDisplay = `${displayQuantity}`;

    if (displayQuantity <= 0) {
        statusText = scriptLines.stockLevelDisplay.outOfStock;
        textColor = 'text-red-600 dark:text-red-400';
    } else if (displayQuantity <= lowStockThreshold) {

        statusText = scriptLines.stockLevelDisplay.lowStock
            .replace('{quantity}', quantityDisplay)
            .replace('{status}', scriptLines.stockLevelDisplay.lowStockStatus);
        textColor = 'text-yellow-600 dark:text-yellow-500';
    } else {
        statusText = scriptLines.stockLevelDisplay.inStock
            .replace('{quantity}', quantityDisplay)
            .replace('{status}', scriptLines.stockLevelDisplay.inStockStatus);
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
};

export default StockLevelDisplay;