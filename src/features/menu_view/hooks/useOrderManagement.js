import { useState, useMemo, useCallback } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION
import { interpolate } from '../utils/script_lines.js'; // LOCALIZATION
import { useCurrency } from '../../../hooks/useCurrency.js'; // LOCALIZATION

export const useOrderManagement = (promoValidationResult = null) => {
    const [orderItems, setOrderItems] = useState([]);
    const [flyingItem, setFlyingItem] = useState(null);
    const { addToast } = useToast();
    const { formatCurrency } = useCurrency(); // LOCALIZATION: Get formatCurrency for discount strings

    const addToOrder = useCallback((itemToAdd, itemImageRect, flyingImageTargetRef) => {
        setOrderItems(prevOrderItems => {
            const existingItemIndex = prevOrderItems.findIndex(item => item.id === itemToAdd.id);
            if (existingItemIndex > -1) {
                return prevOrderItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + itemToAdd.quantity }
                        : item
                );
            }
            return [...prevOrderItems, itemToAdd];
        });

        if (itemImageRect && itemToAdd.imageUrl && flyingImageTargetRef?.current) {
            setFlyingItem({
                id: Date.now(),
                imageUrl: itemToAdd.imageUrl,
                startRect: itemImageRect,
                endRect: flyingImageTargetRef.current.getBoundingClientRect(),
            });
        }

        const itemName = itemToAdd.name || (sl.orderManagement.itemFallbackName || 'Item');
        addToast(interpolate(sl.orderManagement.itemAddedToast, { itemName }) || `"${itemName}" added to order!`, "success", 3000);

    }, [addToast]);

    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        setOrderItems(prevItems => {
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.id !== itemId);
            }
            return prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
        });
    }, []);

    const clearOrder = useCallback(() => {
        setOrderItems([]);
    }, []);

    const { subtotal, totalDiscountAmount, finalTotal, appliedPromoUIDetails, itemLevelDiscountsMap } = useMemo(() => {
        const currentSubtotal = orderItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);

        let calculatedOverallDiscount = 0;
        let uiPromoDetailsForDisplay = null;
        const tempItemDiscountsMap = new Map();

        if (promoValidationResult && promoValidationResult.valid === true && !promoValidationResult.error) {
            const {
                type: promoType,
                value: promoValueStr,
                applicability,
                minimum_order_value_for_order_discount,
                public_display_name,
                code_name
            } = promoValidationResult;
            const promoValue = parseFloat(promoValueStr);

            if (!isNaN(promoValue)) {
                let meetsMinOrderValueForOrderDiscount = true;
                if ((promoType === "ORDER_TOTAL_PERCENTAGE" || promoType === "ORDER_TOTAL_FIXED_AMOUNT") && minimum_order_value_for_order_discount) {
                    const minOrderValue = parseFloat(minimum_order_value_for_order_discount);
                    if (!isNaN(minOrderValue) && currentSubtotal < minOrderValue) {
                        meetsMinOrderValueForOrderDiscount = false;
                    }
                }

                if (meetsMinOrderValueForOrderDiscount) {
                    if (promoType === "ORDER_TOTAL_PERCENTAGE") {
                        calculatedOverallDiscount = currentSubtotal * (promoValue / 100);
                        if (calculatedOverallDiscount > 0) uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || (interpolate(sl.orderManagement.orderDiscountPercentage, { value: promoValue }) || `${promoValue}% Off Order`), type: promoType };
                    } else if (promoType === "ORDER_TOTAL_FIXED_AMOUNT") {
                        calculatedOverallDiscount = promoValue;
                        if (calculatedOverallDiscount > 0) uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || (interpolate(sl.orderManagement.orderDiscountFixed, { value: formatCurrency(promoValue) }) || `${formatCurrency(promoValue)} Off Order`), type: promoType };
                    } else if (promoType === "percentage" || promoType === "fixed_amount_product") {
                        const applicableProductUUIDs = new Set(applicability?.applicable_target_product_uuids || []);
                        let sumOfItemDiscounts = 0;

                        orderItems.forEach(orderItem => {
                            if (orderItem.originalId && applicableProductUUIDs.has(orderItem.originalId)) {
                                const itemPriceBeforeOptions = parseFloat(orderItem.price) || 0;
                                const itemQuantity = parseInt(orderItem.quantity, 10) || 0;
                                const originalItemLineTotal = itemPriceBeforeOptions * itemQuantity;
                                let discountAmountForThisLineItem = 0;

                                if (promoType === "percentage") {
                                    discountAmountForThisLineItem = originalItemLineTotal * (promoValue / 100);
                                } else {
                                    const discountPerUnit = Math.min(promoValue, itemPriceBeforeOptions);
                                    discountAmountForThisLineItem = discountPerUnit * itemQuantity;
                                }

                                discountAmountForThisLineItem = parseFloat(discountAmountForThisLineItem.toFixed(2));

                                if (discountAmountForThisLineItem > 0) {
                                    sumOfItemDiscounts += discountAmountForThisLineItem;
                                    tempItemDiscountsMap.set(orderItem.id, {
                                        amount: discountAmountForThisLineItem,
                                        description: public_display_name || (promoType === "percentage" ? (interpolate(sl.orderManagement.itemDiscountPercentage, { value: promoValue }) || `${promoValue}% off`) : (interpolate(sl.orderManagement.itemDiscountFixed, { value: formatCurrency(promoValue) }) || `${formatCurrency(promoValue)} off`)),
                                        originalItemTotal: parseFloat(originalItemLineTotal.toFixed(2)),
                                    });
                                }
                            }
                        });
                        calculatedOverallDiscount = sumOfItemDiscounts;
                        if (calculatedOverallDiscount > 0 && !uiPromoDetailsForDisplay) {
                            uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || (sl.orderManagement.itemDiscountsApplied || "Item Discounts Applied"), type: "ITEM_SPECIFIC_AGGREGATE" };
                        }
                    }
                }
            }
        }

        calculatedOverallDiscount = Math.min(calculatedOverallDiscount, currentSubtotal > 0 ? currentSubtotal : 0);
        if (currentSubtotal === 0) calculatedOverallDiscount = 0;

        const currentTotal = currentSubtotal - calculatedOverallDiscount;

        return {
            subtotal: parseFloat(currentSubtotal.toFixed(2)),
            totalDiscountAmount: parseFloat(calculatedOverallDiscount.toFixed(2)),
            finalTotal: Math.max(0, parseFloat(currentTotal.toFixed(2))),
            appliedPromoUIDetails: uiPromoDetailsForDisplay,
            itemLevelDiscountsMap: tempItemDiscountsMap,
        };
    }, [orderItems, promoValidationResult, formatCurrency]);

    return {
        orderItems,
        setOrderItems,
        flyingItem,
        setFlyingItem,
        addToOrder,
        handleUpdateQuantity,
        clearOrder,
        subtotal,
        totalDiscountAmount,
        finalTotal,
        appliedPromoUIDetails,
        itemLevelDiscountsMap,
    };
};