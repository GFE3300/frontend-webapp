/**
 * Calculates the effective display price for a product, considering active product-level discounts.
 *
 * @param {object} product - The product object from the backend.
 *                           Expected to have `selling_price_excl_tax` (string or number) and
 *                           `active_applied_product_discounts` (array of objects or null/undefined).
 *                           Each discount in `active_applied_product_discounts` should have:
 *                           - `discount_master_code_name` (string)
 *                           - `discount_master_type` (string: 'percentage' or 'fixed_amount')
 *                           - `effective_discount_value` (string or number: if type is 'percentage', this is the rate like "10.00" for 10%; if type is 'fixed_amount', this is the monetary value like "5.00")
 *                           - `discount_percentage_override` (string, number, or null)
 *                           - `discount_master_default_value` (string or number, original value of the discount master, e.g., "20" for 20% or "5.00" for $5.00)
 * @returns {{
 *  originalPrice: number, // The product.selling_price_excl_tax as a number
 *  displayPrice: number,  // The price after the best product-level discount is applied
 *  bestDiscountApplied: {
 *    codeName: string,
 *    type: string, // 'percentage' or 'fixed_amount'
 *    originalValue: number, // The master discount value (e.g., 20 for 20% or 5 for $5)
 *    overrideValue: number | null, // The override percentage if applicable for percentage type
 *    discountAmount: number, // The actual monetary amount discounted for one unit
 *    description: string // e.g., "SUMMER20: 20% OFF"
 *  } | null
 * }}
 */
export function getEffectiveDisplayPrice(product) {
    if (!product || product.selling_price_excl_tax === undefined || product.selling_price_excl_tax === null) {
        console.error("Invalid product data or missing selling_price_excl_tax for getEffectiveDisplayPrice. Product:", product);
        return {
            originalPrice: 0,
            displayPrice: 0,
            bestDiscountApplied: null,
        };
    }

    const originalPrice = parseFloat(product.selling_price_excl_tax);
    if (isNaN(originalPrice)) {
        console.error("selling_price_excl_tax is not a valid number for product:", product.name, "Value:", product.selling_price_excl_tax);
        return { originalPrice: 0, displayPrice: 0, bestDiscountApplied: null };
    }

    let displayPrice = originalPrice;
    let bestDiscountInfo = null;
    let maxMonetaryDiscount = 0;

    if (product.active_applied_product_discounts && Array.isArray(product.active_applied_product_discounts) && product.active_applied_product_discounts.length > 0) {
        product.active_applied_product_discounts.forEach(discount => {
            if (!discount || discount.effective_discount_value === undefined || discount.effective_discount_value === null || !discount.discount_master_type) {
                console.warn("Skipping discount due to missing critical fields (effective_discount_value or discount_master_type):", discount);
                return;
            }

            let currentMonetaryDiscount = 0;
            const masterType = discount.discount_master_type;
            const effectiveValue = parseFloat(discount.effective_discount_value);
            const overrideValueStr = discount.discount_percentage_override;
            const overrideRate = (overrideValueStr !== null && overrideValueStr !== undefined) ? parseFloat(overrideValueStr) : null;
            const masterDefaultValueStr = discount.discount_master_default_value;
            const masterDefaultValue = (masterDefaultValueStr !== null && masterDefaultValueStr !== undefined) ? parseFloat(masterDefaultValueStr) : null;


            if (isNaN(effectiveValue)) {
                console.warn("Invalid effective_discount_value for discount:", discount.discount_master_code_name, "Value:", discount.effective_discount_value);
                return;
            }
            if (overrideRate !== null && isNaN(overrideRate)) {
                console.warn("Invalid discount_percentage_override for discount:", discount.discount_master_code_name, "Value:", overrideValueStr);
                // Do not use override if invalid
            }
            if (masterDefaultValue !== null && isNaN(masterDefaultValue)) {
                console.warn("Invalid discount_master_default_value for discount:", discount.discount_master_code_name, "Value:", masterDefaultValueStr);
                // Do not use masterDefaultValue if invalid
            }


            if (masterType === 'percentage') {
                const rateToApply = (overrideRate !== null && !isNaN(overrideRate)) ? overrideRate : effectiveValue;
                if (isNaN(rateToApply)) {
                    console.warn("Percentage rate to apply is NaN for discount:", discount.discount_master_code_name);
                    return;
                }
                currentMonetaryDiscount = originalPrice * (rateToApply / 100);
            } else if (masterType === 'fixed_amount') {
                currentMonetaryDiscount = effectiveValue; // For fixed_amount, effective_discount_value is the monetary amount
            } else {
                console.warn("Unknown discount_master_type:", masterType, "for discount:", discount.discount_master_code_name);
                return;
            }

            currentMonetaryDiscount = parseFloat(currentMonetaryDiscount.toFixed(2)); // Ensure precision

            if (currentMonetaryDiscount > maxMonetaryDiscount) {
                maxMonetaryDiscount = currentMonetaryDiscount;

                const codeName = discount.discount_master_code_name || "Discount";

                let description = "";
                if (masterType === 'percentage') {
                    const percentageToShow = (overrideRate !== null && !isNaN(overrideRate))
                        ? overrideRate
                        : (!isNaN(masterDefaultValue) ? masterDefaultValue : effectiveValue);
                    description = `${codeName}: ${percentageToShow.toFixed(0)}% OFF`;
                } else if (masterType === 'fixed_amount') {
                    const amountToShow = (!isNaN(masterDefaultValue) ? masterDefaultValue : effectiveValue);
                    description = `${codeName}: $${amountToShow.toFixed(2)} OFF`;
                } else {
                    description = `${codeName}: Value $${currentMonetaryDiscount.toFixed(2)}`;
                }

                bestDiscountInfo = {
                    codeName: codeName,
                    type: masterType,
                    originalValue: (!isNaN(masterDefaultValue) ? masterDefaultValue : 0),
                    overrideValue: (overrideRate !== null && !isNaN(overrideRate)) ? overrideRate : null,
                    discountAmount: currentMonetaryDiscount,
                    description: description,
                };
            }
        });

        if (bestDiscountInfo) {
            displayPrice = originalPrice - bestDiscountInfo.discountAmount;
            if (displayPrice < 0) displayPrice = 0; // Price cannot be negative
        }
    }

    return {
        originalPrice: parseFloat(originalPrice.toFixed(2)),
        displayPrice: parseFloat(displayPrice.toFixed(2)),
        bestDiscountApplied: bestDiscountInfo,
    };
}

/**
 * Calculates the total price of one unit of an item including selected attribute options adjustments.
 *
 * @param {number} baseItemPrice - The base price of one unit of the item (e.g., after product-level discounts).
 * @param {Array<object>} detailedSelectedOptions - Array of selected option objects. Each object is expected
 *                                        to have a `price_adjustment` property (string or number).
 *                                        Example: [{ id: 'opt1', name: 'Large', price_adjustment: "1.50" }, ...]
 * @returns {number} The total price for one unit of the item with selected options.
 */
export function calculateItemPriceWithSelectedOptions(baseItemPrice, detailedSelectedOptions) {
    if (typeof baseItemPrice !== 'number' || isNaN(baseItemPrice)) {
        console.error("Invalid baseItemPrice for calculateItemPriceWithSelectedOptions. Value:", baseItemPrice);
        return 0;
    }

    let totalAdjustment = 0;
    if (detailedSelectedOptions && Array.isArray(detailedSelectedOptions)) {
        detailedSelectedOptions.forEach(option => {
            if (option && (option.price_adjustment !== undefined && option.price_adjustment !== null)) {
                const adjustment = parseFloat(option.price_adjustment);
                if (!isNaN(adjustment)) {
                    totalAdjustment += adjustment;
                } else {
                    console.warn("Invalid price_adjustment in option:", option.name, "Value:", option.price_adjustment);
                }
            }
        });
    }

    const finalPrice = baseItemPrice + totalAdjustment;
    return finalPrice < 0 ? 0 : parseFloat(finalPrice.toFixed(2)); // Ensure precision and not negative
}

/**
 * Gets the initially selected options for attribute groups based on their `is_default` property.
 * This is useful for pre-selecting options when ProductOptionsPopup opens.
 *
 * @param {Array<object> | null | undefined} attributeGroups - The product's `editable_attribute_groups`.
 *                                           Each group should have `id` (string), `name` (string), `type` (string),
 *                                           and `options` (array of option objects).
 *                                           Each option should have `id` (string), `name` (string),
 *                                           `price_adjustment` (string or number), `is_default` (boolean).
 * @returns {Array<object>} An array of default option objects, augmented with `groupId`, `groupName`, `groupType`.
 *                          Example: [{ id: 'opt_uuid', name: 'Default Option', price_adjustment: 0.00, is_default: true,
 *                                      groupId: 'group_uuid', groupName: 'Size', groupType: 'single_select' }, ...]
 */
export function getInitialSelectedOptions(attributeGroups) {
    const initialSelections = [];
    if (!attributeGroups || !Array.isArray(attributeGroups)) {
        return initialSelections;
    }

    attributeGroups.forEach(group => {
        if (group && group.options && Array.isArray(group.options)) {
            // For single-select, only one default should ideally be true. If multiple, take the first.
            if (group.type === 'single_select') {
                const defaultOption = group.options.find(option => option && option.is_default);
                if (defaultOption) {
                    const priceAdjustment = parseFloat(defaultOption.price_adjustment);
                    initialSelections.push({
                        ...defaultOption, // Spread all original option properties
                        price_adjustment: isNaN(priceAdjustment) ? 0 : priceAdjustment,
                        groupId: group.id,
                        groupName: group.name,
                        groupType: group.type,
                    });
                }
            } else if (group.type === 'multi_select') {
                group.options.forEach(option => {
                    if (option && option.is_default) {
                        const priceAdjustment = parseFloat(option.price_adjustment);
                        initialSelections.push({
                            ...option,
                            price_adjustment: isNaN(priceAdjustment) ? 0 : priceAdjustment,
                            groupId: group.id,
                            groupName: group.name,
                            groupType: group.type,
                        });
                    }
                });
            }
        }
    });
    return initialSelections;
}