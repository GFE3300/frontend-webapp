/**
 * Calculates the effective display price for a product, considering active product-level discounts.
 * This function assumes that if multiple discounts are "active" for a product,
 * the one providing the largest monetary reduction is applied. Discounts are not assumed to be cumulative
 * at this display level unless the backend `effective_discount_value` already reflects that.
 *
 * @param {object} product - The product object from the backend.
 *                           Expected to have `selling_price_excl_tax` (string or number) and
 *                           `active_applied_product_discounts` (array of objects or null/undefined).
 *                           Each discount in `active_applied_product_discounts` should have:
 *                           - `discount_master_code_name` (string)
 *                           - `discount_master_type` (string: 'percentage' or 'fixed_amount')
 *                           - `effective_discount_value` (string or number, the monetary value of the discount for one unit)
 *                           - `discount_percentage_override` (string, number, or null)
 *                           - `discount_master_default_value` (string or number, original value of the discount master, e.g., 20 for 20% or 5 for $5)
 * @returns {{
 *  originalPrice: number, // The product.selling_price_excl_tax as a number
 *  displayPrice: number,  // The price after the best product-level discount is applied
 *  bestDiscountApplied: {
 *    codeName: string,
 *    type: string, // 'percentage' or 'fixed_amount'
 *    originalValue: number, // The master discount value (e.g., 20 for 20% or 5 for $5)
 *    overrideValue: number | null, // The override percentage if applicable for percentage type
 *    discountAmount: number, // The actual monetary amount discounted for one unit
 *    description: string // e.g., "20% OFF" or "$5.00 OFF"
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

    if (product.active_applied_product_discounts && Array.isArray(product.active_applied_product_discounts) && product.active_applied_product_discounts.length > 0) {
        let maxMonetaryDiscount = 0; // Stores the highest monetary discount found

        product.active_applied_product_discounts.forEach(discount => {
            if (!discount || discount.effective_discount_value === undefined || discount.effective_discount_value === null) {
                console.warn("Skipping discount due to missing effective_discount_value:", discount);
                return;
            }
            const currentEffectiveDiscountValue = parseFloat(discount.effective_discount_value);
            if (isNaN(currentEffectiveDiscountValue)) {
                console.warn("Invalid effective_discount_value for discount:", discount.discount_master_code_name, "Value:", discount.effective_discount_value);
                return; // Skip this discount
            }

            if (currentEffectiveDiscountValue > maxMonetaryDiscount) {
                maxMonetaryDiscount = currentEffectiveDiscountValue;

                let description = "";
                const masterType = discount.discount_master_type;
                const masterDefaultValue = parseFloat(discount.discount_master_default_value); // Original value (e.g. 20 for 20% or 5 for $5)

                const overrideValueStr = discount.discount_percentage_override;
                const overrideValueNum = (overrideValueStr !== null && overrideValueStr !== undefined)
                    ? parseFloat(overrideValueStr)
                    : null;

                if (masterType === 'percentage') {
                    const percentageToShow = (overrideValueNum !== null && !isNaN(overrideValueNum)) ? overrideValueNum : masterDefaultValue;
                    description = `${percentageToShow.toFixed(0)}% OFF`;
                } else if (masterType === 'fixed_amount') {
                    // For fixed amount, the effective_discount_value is typically the masterDefaultValue unless complex rules apply
                    description = `$${masterDefaultValue.toFixed(2)} OFF`;
                } else {
                    // Fallback description if type is unknown or doesn't fit common patterns
                    description = `Discount Applied: $${currentEffectiveDiscountValue.toFixed(2)}`;
                }

                bestDiscountInfo = {
                    codeName: discount.discount_master_code_name,
                    type: masterType,
                    originalValue: masterDefaultValue, // e.g. 20 or 5
                    overrideValue: (overrideValueNum !== null && !isNaN(overrideValueNum)) ? overrideValueNum : null,
                    discountAmount: currentEffectiveDiscountValue, // Monetary value of the discount
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
        originalPrice,
        displayPrice,
        bestDiscountApplied: bestDiscountInfo,
    };
}


/**
 * Calculates the total price of one unit of an item including selected attribute options adjustments.
 *
 * @param {number} baseItemPrice - The base price of one unit of the item (e.g., after product-level discounts).
 * @param {Array<object>} selectedOptions - Array of selected option objects. Each object is expected
 *                                        to have a `price_adjustment` property (string or number).
 *                                        Example: [{ id: 'opt1', name: 'Large', price_adjustment: "1.50" }, ...]
 * @returns {number} The total price for one unit of the item with selected options.
 */
export function calculateItemPriceWithSelectedOptions(baseItemPrice, selectedOptions) {
    if (typeof baseItemPrice !== 'number' || isNaN(baseItemPrice)) {
        console.error("Invalid baseItemPrice for calculateItemPriceWithSelectedOptions. Value:", baseItemPrice);
        return 0;
    }

    let totalAdjustment = 0;
    if (selectedOptions && Array.isArray(selectedOptions)) {
        selectedOptions.forEach(option => {
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
    return finalPrice < 0 ? 0 : finalPrice; // Price cannot be negative
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
 *                          Example: [{ id: 'opt_uuid', name: 'Default Option', price_adjustment: "0.00", is_default: true,
 *                                      groupId: 'group_uuid', groupName: 'Size', groupType: 'single_select' }, ...]
 */
export function getInitialSelectedOptions(attributeGroups) {
    const initialSelections = [];
    if (!attributeGroups || !Array.isArray(attributeGroups)) {
        return initialSelections;
    }

    attributeGroups.forEach(group => {
        if (group && group.options && Array.isArray(group.options)) {
            group.options.forEach(option => {
                if (option && option.is_default) {
                    initialSelections.push({
                        ...option, // Spread all original option properties
                        groupId: group.id,
                        groupName: group.name,
                        groupType: group.type,
                    });
                }
            });
        }
    });
    return initialSelections;
}