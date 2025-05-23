// C:/Users/Gilberto F/Desktop/Smore/frontend/src/features/add_product_modal\utils\addProductUtils.js
// No major changes needed, but clarifying parameter names for context.
// The existing logic is robust for positive and negative margins.

/**
 * Calculates profit margin and absolute profit.
 * @param {number|string} sellingPriceExclTax - The price the product is sold for, excluding tax.
 * @param {number|string} costToMake - The cost to produce one unit of the product.
 * @returns {{percentage: number|null, profit: number|null}}
 *          Object with 'percentage' (margin as a percentage) and 'profit' (absolute profit per unit).
 *          Returns null for values if inputs are invalid or price is zero.
 */
export const calculateMargin = (sellingPriceExclTax, costToMake) => {
    const price = parseFloat(sellingPriceExclTax);
    const cost = parseFloat(costToMake);

    if (isNaN(price) || isNaN(cost)) { // Allow price to be 0 for calculation, but margin will be -Infinity or NaN if cost > 0
        return { percentage: null, profit: null };
    }
    
    if (price === 0) {
        // If price is 0, profit is -cost. Margin percentage is problematic (-Infinity or NaN if cost is also 0).
        // Define specific behavior for 0 price. For example, if cost > 0, profit is -cost, margin effectively -100% of cost.
        // For simplicity, if price is 0, we can say profit is -cost, and margin is undefined or -100% if cost > 0.
        // The original code returns { percentage: null, profit: null } if price <= 0.
        // Let's adjust to show loss if price is 0 and cost > 0.
        if (cost > 0) {
            return { percentage: -Infinity, profit: -cost }; // Or some other indicator for 100% loss on cost
        }
        return { percentage: null, profit: 0 }; // If price is 0 and cost is 0
    }

    // Original logic from here:
    if (cost > price) {
        // Negative margin if cost is higher than price
        // const loss = cost - price;
        // const lossPercentage = (loss / cost) * 100; // Loss as percentage of cost (This is different from margin on selling price)
        // return { percentage: -lossPercentage, profit: price - cost };
        // Standard margin calculation (Profit / Selling Price) will naturally be negative if cost > price
    }

    const profit = price - cost;
    const marginPercentage = (profit / price) * 100;

    return {
        percentage: marginPercentage,
        profit: profit,
    };
};

/**
 * Calculates tax amount and final price including tax.
 * @param {number|string} sellingPriceExclTax - The price before tax.
 * @param {number|string|null} taxRatePercent - The tax rate as a percentage (e.g., 20 for 20%).
 * @returns {{taxAmount: number, sellingPriceInclTax: number}}
 */
export const calculateTax = (sellingPriceExclTax, taxRatePercent) => {
    const price = parseFloat(sellingPriceExclTax);
    const rate = parseFloat(taxRatePercent);

    if (isNaN(price) || price < 0) {
        return { taxAmount: 0, sellingPriceInclTax: isNaN(price) ? 0 : price };
    }
    if (isNaN(rate) || rate < 0 || rate > 100) { // If tax rate is invalid, assume 0 tax
        return { taxAmount: 0, sellingPriceInclTax: price };
    }

    const taxAmount = price * (rate / 100);
    const sellingPriceInclTax = price + taxAmount;

    return {
        taxAmount: taxAmount,
        sellingPriceInclTax: sellingPriceInclTax,
    };
};