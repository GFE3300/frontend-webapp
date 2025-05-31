// frontend/src/features/menu_view/subcomponents/ProductOptionsPopup.jsx
// (Path from your frontend.txt)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx'; // REVIEW: Ensure this path is correct.
import Icon from '../../../components/common/Icon.jsx'; // REVIEW: Ensure this path is correct.
// REVIEW: Ensure this path is correct and utilities are functioning as expected.
import { getEffectiveDisplayPrice, calculateItemPriceWithSelectedOptions } from '../utils/productUtils.js';

const SINGLE_SELECT = 'single_select'; // Constant for group type
const MULTI_SELECT = 'multi_select';   // Constant for group type

/**
 * A modal popup for configuring product options before adding to an order.
 */
export default function ProductOptionsPopup({ isOpen, onClose, product, onConfirmWithOptions }) {
    const [quantity, setQuantity] = useState(1);
    // Stores selected option IDs: { [groupId]: optionId (for single) or [optionId1, optionId2] (for multi) }
    const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    // Base price for the product, considering product-level discounts. Attribute options adjust from this.
    // CRITICAL: Relies on `getEffectiveDisplayPrice` and `product` prop.
    const basePriceForOptions = useMemo(() => {
        if (!product) return 0;
        return getEffectiveDisplayPrice(product).displayPrice;
    }, [product]);

    // Initialize/reset state when popup opens or product changes
    // CRITICAL: This effect sets up initial selections based on `is_default` and `is_required`.
    useEffect(() => {
        if (isOpen && product && product.editable_attribute_groups) {
            const initialSelections = {};
            product.editable_attribute_groups.forEach(group => {
                if (group.options && group.options.length > 0) {
                    // Sort options by display_order before determining defaults or first required.
                    const sortedOptions = [...group.options].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

                    if (group.type === SINGLE_SELECT) {
                        const defaultOption = sortedOptions.find(opt => opt.is_default);
                        if (defaultOption) {
                            initialSelections[group.id] = defaultOption.id;
                        } else if (group.is_required && sortedOptions.length > 0) {
                            // Auto-select first option if group is required and no explicit default is set.
                            initialSelections[group.id] = sortedOptions[0].id;
                        } else {
                            initialSelections[group.id] = null; // No pre-selection if not required and no default
                        }
                    } else if (group.type === MULTI_SELECT) {
                        // Pre-select all default options for multi-select groups.
                        initialSelections[group.id] = sortedOptions
                            .filter(opt => opt.is_default)
                            .map(opt => opt.id);
                    }
                }
            });
            setSelectedOptionsMap(initialSelections);
            setQuantity(1);
            setValidationErrors({});
        }
        // No explicit else to clear state when closing, as Userpage.jsx sets `currentItemForOptions` to null,
        // which should trigger a re-render if ProductOptionsPopup is still mounted (it shouldn't be if isOpen is false).
        // If `product` prop changes while `isOpen` is true (e.g. quick switch), this effect re-initializes.
    }, [isOpen, product]); // Dependency array includes `product`

    const handleOptionChange = useCallback((groupId, optionId, groupType) => {
        setSelectedOptionsMap(prev => { /* ... (logic seems fine for single/multi select) ... */
            const newSelections = { ...prev };
            if (groupType === SINGLE_SELECT) {
                newSelections[groupId] = optionId;
            } else if (groupType === MULTI_SELECT) {
                const currentGroupSelections = prev[groupId] || [];
                if (currentGroupSelections.includes(optionId)) {
                    newSelections[groupId] = currentGroupSelections.filter(id => id !== optionId);
                } else {
                    newSelections[groupId] = [...currentGroupSelections, optionId];
                }
            }
            return newSelections;
        });
        // Clear validation error for this group on change.
        if (validationErrors[groupId]) {
            setValidationErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[groupId];
                return newErrors;
            });
        }
    }, [validationErrors]); // validationErrors is a dependency

    // Calculate current price and derive detailed selected options
    // CRITICAL: This memo calculates the price based on selections.
    const { currentItemPriceWithOptionsMenu, totalPriceForQuantity, detailedSelectedOptions } = useMemo(() => {
        if (!product) {
            return { currentItemPriceWithOptionsMenu: 0, totalPriceForQuantity: 0, detailedSelectedOptions: [] };
        }

        const resolvedOptions = []; // This will store the full option objects that are selected
        if (product.editable_attribute_groups) {
            product.editable_attribute_groups.forEach(group => {
                const selectionForGroup = selectedOptionsMap[group.id]; // Can be single ID or array of IDs
                if (group.options && group.options.length > 0) { // Ensure group has options
                    if (group.type === SINGLE_SELECT && selectionForGroup) { // selectionForGroup is a single ID
                        const optionDetail = group.options.find(opt => opt.id === selectionForGroup);
                        if (optionDetail) {
                            resolvedOptions.push({
                                ...optionDetail, // Includes original option id, name, display_order etc.
                                price_adjustment: parseFloat(optionDetail.price_adjustment) || 0,
                                groupId: group.id, // Add group info for context
                                groupName: group.name,
                                groupType: group.type,
                            });
                        }
                    } else if (group.type === MULTI_SELECT && selectionForGroup && selectionForGroup.length > 0) { // selectionForGroup is an array of IDs
                        selectionForGroup.forEach(optId => {
                            const optionDetail = group.options.find(opt => opt.id === optId);
                            if (optionDetail) {
                                resolvedOptions.push({
                                    ...optionDetail,
                                    price_adjustment: parseFloat(optionDetail.price_adjustment) || 0,
                                    groupId: group.id,
                                    groupName: group.name,
                                    groupType: group.type,
                                });
                            }
                        });
                    }
                }
            });
        }

        const itemPriceWithOptions = calculateItemPriceWithSelectedOptions(basePriceForOptions, resolvedOptions);
        const totalForQty = itemPriceWithOptions * quantity;

        return {
            currentItemPriceWithOptionsMenu: itemPriceWithOptions,
            totalPriceForQuantity: totalForQty < 0 ? 0 : parseFloat(totalForQty.toFixed(2)), // Ensure not negative
            detailedSelectedOptions: resolvedOptions, // This array is passed in the payload
        };
    }, [product, selectedOptionsMap, quantity, basePriceForOptions]);

    // CRITICAL: Validation logic for required groups.
    const validateSelections = useCallback(() => {
        if (!product || !product.editable_attribute_groups) return true;
        const errors = {};
        product.editable_attribute_groups.forEach(group => {
            if (group.is_required) {
                const selection = selectedOptionsMap[group.id];
                if (group.type === SINGLE_SELECT && (selection === null || selection === undefined || selection === '')) {
                    errors[group.id] = `Please make a selection for ${group.name}.`;
                } else if (group.type === MULTI_SELECT && (!selection || selection.length === 0)) {
                    errors[group.id] = `Please select at least one option for ${group.name}.`;
                }
            }
        });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [product, selectedOptionsMap]);

    const handleConfirm = () => {
        if (!validateSelections()) {
            // Optionally scroll to the first error if desired.
            const firstErrorKey = Object.keys(validationErrors)[0]; // validationErrors is updated by validateSelections
            if (firstErrorKey) {
                const errorElement = document.getElementById(`group-${firstErrorKey}`);
                errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        // Prepare payload for onConfirmWithOptions
        const payloadSelectedOptions = detailedSelectedOptions.map(opt => ({
            groupId: opt.groupId,
            groupName: opt.groupName,
            groupType: opt.groupType,
            optionId: opt.id, // The original option ID from the backend
            optionName: opt.name,
            priceAdjustment: opt.price_adjustment, // Already a number
        }));

        const configuredItemDetailsPayload = {
            quantity,
            selectedOptions: payloadSelectedOptions, // Pass the detailed array
            finalPricePerItem: currentItemPriceWithOptionsMenu,
            totalPriceForQuantity: totalPriceForQuantity,
        };
        onConfirmWithOptions(product, configuredItemDetailsPayload); // `product` here is the original product object
        // Parent (`Userpage.jsx`) is responsible for closing the popup via `onClose` through `setIsOptionsPopupOpen(false)`.
    };

    if (!product) return null; // Should be handled by `isOpen` in parent.

    // REVIEW: Popup width classes.
    const popupWidth = "w-[90vw] max-w-md";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-neutral-500/30 dark:bg-neutral-900/40 backdrop-blur-sm"
                        // REVIEW: Overlay animation and styling.
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose} // Allow closing by clicking overlay
                        aria-hidden="true"
                    />
                    {/* Popup Content */}
                    <motion.div
                        // REVIEW: Popup positioning, width, background, rounding, shadow, z-index, max-height for scrollability.
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${popupWidth} bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }}
                        // REVIEW: Popup entry/exit animation.
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-options-title"
                    >
                        {/* Header */}
                        {/* REVIEW: Header padding, border, text styling, close button. */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                            <div className="flex-1 min-w-0"> {/* For truncation */}
                                <h2 id="product-options-title" className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 truncate pr-2" title={product.name}>
                                    {product.name}
                                </h2>
                                {product.subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate" title={product.subtitle}>{product.subtitle}</p>}
                            </div>
                            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500" aria-label="Close options popup">
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Options Body: Scrollable area */}
                        {/* REVIEW: Body padding, spacing, scrollbar styling. */}
                        <div className="flex-1 p-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                            {/* CRITICAL: Rendering attribute groups. Depends on `product.editable_attribute_groups`. */}
                            {product.editable_attribute_groups && product.editable_attribute_groups
                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) // Sort groups
                                .map(group => (
                                    <div key={group.id} id={`group-${group.id}`}> {/* ID for scrolling to error */}
                                        {/* REVIEW: Group title styling. "(Required)" text. */}
                                        <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-2 flex items-center">
                                            {group.name}
                                            {group.is_required && <span className="ml-1.5 text-xs text-red-500 dark:text-red-400">(Required)</span>}
                                        </h3>
                                        {/* REVIEW: Layout for single-select (flex-wrap) vs multi-select (flex-col). */}
                                        <div className={`flex ${group.type === SINGLE_SELECT ? 'flex-wrap gap-2' : 'flex-col space-y-1.5'}`}>
                                            {group.options && group.options
                                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) // Sort options
                                                .map(option => {
                                                    const priceAdjustmentNum = parseFloat(option.price_adjustment) || 0;
                                                    const isSelected = group.type === SINGLE_SELECT
                                                        ? selectedOptionsMap[group.id] === option.id
                                                        : (selectedOptionsMap[group.id] || []).includes(option.id);

                                                    return group.type === SINGLE_SELECT ? (
                                                        // REVIEW: Single-select button styling (padding, rounding, border, active/inactive colors, focus).
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleOptionChange(group.id, option.id, group.type)}
                                                            className={`px-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800
                                                        ${isSelected
                                                                    ? 'bg-rose-500 text-white border-rose-500 ring-rose-400 dark:ring-rose-500'
                                                                    : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-600 hover:border-rose-400 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-300'
                                                                }`}
                                                            aria-pressed={isSelected}
                                                        >
                                                            {option.name}
                                                            {/* REVIEW: Price adjustment display styling. */}
                                                            {priceAdjustmentNum !== 0 &&
                                                                <span className="ml-1 text-xs opacity-80">
                                                                    ({priceAdjustmentNum > 0 ? '+' : ''}${priceAdjustmentNum.toFixed(2)})
                                                                </span>}
                                                        </button>
                                                    ) : ( // MULTI_SELECT
                                                        // REVIEW: Multi-select checkbox label styling (padding, rounding, hover, border, active state).
                                                        <label key={option.id} className={`flex items-center p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/60 cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-600 has-[:checked]:border-rose-400 dark:has-[:checked]:border-rose-500 ${isSelected ? 'bg-rose-50 dark:bg-rose-900/40 border-rose-300 dark:border-rose-600' : ''}`}>
                                                            {/* REVIEW: Checkbox input styling. */}
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleOptionChange(group.id, option.id, group.type)}
                                                                className="h-4 w-4 text-rose-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-rose-500 dark:focus:ring-rose-600 bg-white dark:bg-neutral-600 checked:bg-rose-600 dark:checked:bg-rose-500"
                                                            />
                                                            <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-200 flex-grow">{option.name}</span>
                                                            {priceAdjustmentNum !== 0 && (
                                                                <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                                                                    {priceAdjustmentNum > 0 ? '+' : ''}${priceAdjustmentNum.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                        {/* REVIEW: Validation error message styling. */}
                                        {validationErrors[group.id] && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5" role="alert">{validationErrors[group.id]}</p>}
                                    </div>
                                ))}

                            {/* Quantity Stepper */}
                            <div>
                                <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Quantity</h3>
                                {/* REVIEW: NumberStepperfix styling and props. Max quantity can come from product. */}
                                <NumberStepperfix
                                    min={1}
                                    max={product?.max_quantity_per_order || 20} // Use product-specific max if available
                                    value={quantity}
                                    onChange={setQuantity}
                                    label="Quantity"
                                    hideLabel={true} // Visually hidden for SRs
                                    inputClassName="text-center dark:bg-neutral-700 dark:text-neutral-100 h-10 w-12"
                                    buttonClassName="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-10 h-10 rounded-md"
                                    containerClassName="flex justify-center items-center space-x-2"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        {/* REVIEW: Footer padding, border, background. */}
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                {/* REVIEW: Total price display styling. */}
                                <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Total:</span>
                                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                    ${totalPriceForQuantity.toFixed(2)}
                                </span>
                            </div>
                            {/* REVIEW: Confirm button styling (colors, font, padding, focus, disabled state). */}
                            <motion.button
                                onClick={handleConfirm}
                                className="w-full bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 text-white font-semibold py-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
                                whileTap={{ scale: 0.98 }}
                                disabled={Object.keys(validationErrors).length > 0} // Disable if there are any validation errors
                            >
                                Add {quantity} to Order
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}