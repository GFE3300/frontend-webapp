// src/features/Userpage/SubComponents/ProductOptionsPopup.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
import Icon from '../../../components/common/Icon.jsx'; // For close button or other icons
import { calculateItemPriceWithSelectedOptions, getEffectiveDisplayPrice } from '../utils/productUtils.js'; // Import new utility

// Constants
const SINGLE_SELECT = 'single_select';
const MULTI_SELECT = 'multi_select';

export default function ProductOptionsPopup({ isOpen, onClose, product, onConfirmWithOptions }) {
    const [quantity, setQuantity] = useState(1);
    // Stores selected option IDs: { [groupId]: optionId } for single_select, { [groupId]: [optionId1, optionId2] } for multi_select
    const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    // Memoize the base price calculation (after product-level discounts)
    const { displayPrice: baseProductPrice } = useMemo(() => {
        if (!product) return { displayPrice: 0 };
        return getEffectiveDisplayPrice(product);
    }, [product]);

    // Effect to initialize/reset state when the product changes or popup opens/closes
    useEffect(() => {
        if (isOpen && product && product.editable_attribute_groups) {
            const initialSelections = {};
            product.editable_attribute_groups.forEach(group => {
                if (group.type === SINGLE_SELECT) {
                    const defaultOption = group.options.find(opt => opt.is_default);
                    initialSelections[group.id] = defaultOption ? defaultOption.id : (group.options.length > 0 ? group.options[0].id : null); // Select first if no default for single
                } else if (group.type === MULTI_SELECT) {
                    initialSelections[group.id] = group.options.filter(opt => opt.is_default).map(opt => opt.id);
                }
            });
            setSelectedOptionsMap(initialSelections);
            setQuantity(1);
            setValidationErrors({});
        } else if (!isOpen) {
            // Optionally reset when closing, or keep state if reopening for same item might be desired.
            // For now, let's reset to ensure fresh state.
            setSelectedOptionsMap({});
            setQuantity(1);
            setValidationErrors({});
        }
    }, [isOpen, product]);


    const handleOptionChange = useCallback((groupId, optionId, groupType) => {
        setSelectedOptionsMap(prev => {
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
        // Clear specific validation error if user interacts
        if (validationErrors[groupId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[groupId];
                return newErrors;
            });
        }
    }, [validationErrors]);

    // Memoize the calculation of selected option details and total price
    const { currentItemPriceWithOptionsMenu, totalPriceForQuantity, detailedSelectedOptions } = useMemo(() => {
        if (!product || !product.editable_attribute_groups) {
            return { currentItemPriceWithOptionsMenu: baseProductPrice, totalPriceForQuantity: baseProductPrice * quantity, detailedSelectedOptions: [] };
        }

        const allSelectedOptionDetails = [];
        product.editable_attribute_groups.forEach(group => {
            const selectionForGroup = selectedOptionsMap[group.id];
            if (group.type === SINGLE_SELECT && selectionForGroup) {
                const optionDetail = group.options.find(opt => opt.id === selectionForGroup);
                if (optionDetail) {
                    allSelectedOptionDetails.push({ ...optionDetail, groupId: group.id, groupName: group.name, groupType: group.type });
                }
            } else if (group.type === MULTI_SELECT && selectionForGroup && selectionForGroup.length > 0) {
                selectionForGroup.forEach(optionId => {
                    const optionDetail = group.options.find(opt => opt.id === optionId);
                    if (optionDetail) {
                        allSelectedOptionDetails.push({ ...optionDetail, groupId: group.id, groupName: group.name, groupType: group.type });
                    }
                });
            }
        });

        const itemPriceWithOptions = calculateItemPriceWithSelectedOptions(baseProductPrice, allSelectedOptionDetails);
        const totalForQty = itemPriceWithOptions * quantity;

        return {
            currentItemPriceWithOptionsMenu: itemPriceWithOptions,
            totalPriceForQuantity: totalForQty,
            detailedSelectedOptions: allSelectedOptionDetails
        };
    }, [product, selectedOptionsMap, quantity, baseProductPrice]);


    const validateSelections = useCallback(() => {
        if (!product || !product.editable_attribute_groups) return true;
        const errors = {};
        product.editable_attribute_groups.forEach(group => {
            if (group.is_required) {
                const selection = selectedOptionsMap[group.id];
                if (group.type === SINGLE_SELECT && !selection) {
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
        if (!validateSelections()) return;

        const optionsPayload = {
            quantity,
            selectedOptions: detailedSelectedOptions.map(opt => ({ // Map to the required payload structure
                groupId: opt.groupId,
                groupName: opt.groupName,
                optionId: opt.id,
                optionName: opt.name,
                priceAdjustment: parseFloat(opt.price_adjustment) || 0,
            })),
            finalPricePerItem: currentItemPriceWithOptionsMenu,
            totalPriceForQuantity: totalPriceForQuantity,
        };
        // Pass the original product object (from props) and the new payload
        onConfirmWithOptions(product, optionsPayload);
        // onClose(); // Popup closure will be handled by parent if successful, or can be here.
    };

    if (!product) return null; // Should not happen if isOpen is true and product is passed

    const popupWidth = "w-[90vw] max-w-md";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-neutral-500/30 dark:bg-neutral-900/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose} // Allow closing by clicking overlay
                        aria-hidden="true"
                    />
                    <motion.div
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${popupWidth} bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }} // Max height to prevent overflow
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-options-title"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                            <div className="flex-1 min-w-0">
                                <h2 id="product-options-title" className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 truncate pr-2">
                                    {product.name}
                                </h2>
                                {product.subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{product.subtitle}</p>}
                            </div>
                            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-full">
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Options Area - Scrollable */}
                        <div className="flex-1 p-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                            {product.editable_attribute_groups && product.editable_attribute_groups.map(group => (
                                <div key={group.id}>
                                    <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-2 flex items-center">
                                        {group.name}
                                        {group.is_required && <span className="ml-1.5 text-xs text-red-500 dark:text-red-400">(Required)</span>}
                                    </h3>
                                    <div className={`flex ${group.type === SINGLE_SELECT ? 'flex-wrap gap-2' : 'flex-col space-y-1.5'}`}>
                                        {group.options.map(option => (
                                            group.type === SINGLE_SELECT ? (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionChange(group.id, option.id, group.type)}
                                                    className={`px-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800
                                                        ${selectedOptionsMap[group.id] === option.id
                                                            ? 'bg-rose-500 text-white border-rose-500 ring-rose-400 dark:ring-rose-500'
                                                            : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-600 hover:border-rose-400 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-300'
                                                        }`}
                                                >
                                                    {option.name}
                                                    {option.price_adjustment != 0 &&
                                                        <span className="ml-1 text-xs opacity-80">
                                                            ({option.price_adjustment > 0 ? '+' : ''}${parseFloat(option.price_adjustment).toFixed(2)})
                                                        </span>}
                                                </button>
                                            ) : ( // MULTI_SELECT
                                                <label key={option.id} className="flex items-center p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/60 cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-600 has-[:checked]:bg-rose-50 dark:has-[:checked]:bg-rose-700/30 has-[:checked]:border-rose-300 dark:has-[:checked]:border-rose-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={(selectedOptionsMap[group.id] || []).includes(option.id)}
                                                        onChange={() => handleOptionChange(group.id, option.id, group.type)}
                                                        className="h-4 w-4 text-rose-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-rose-500 dark:focus:ring-rose-600 bg-white dark:bg-neutral-600 checked:bg-rose-600 dark:checked:bg-rose-500"
                                                    />
                                                    <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-200 flex-grow">{option.name}</span>
                                                    {option.price_adjustment != 0 && (
                                                        <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                                                            {option.price_adjustment > 0 ? '+' : ''}${parseFloat(option.price_adjustment).toFixed(2)}
                                                        </span>
                                                    )}
                                                </label>
                                            )
                                        ))}
                                    </div>
                                    {validationErrors[group.id] && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{validationErrors[group.id]}</p>}
                                </div>
                            ))}

                            <div>
                                <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Quantity</h3>
                                <NumberStepperfix
                                    min={1}
                                    max={20} // Configurable max quantity
                                    value={quantity}
                                    onChange={setQuantity}
                                    label="" // No visible label needed if context is clear
                                    inputClassName="text-center dark:bg-neutral-700 dark:text-neutral-100 h-10 w-12"
                                    buttonClassName="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-10 h-10 rounded-md"
                                    containerClassName="flex justify-center items-center space-x-2"
                                />
                            </div>
                        </div>

                        {/* Footer: Price and Confirm Button */}
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Total:</span>
                                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                    ${totalPriceForQuantity.toFixed(2)}
                                </span>
                            </div>
                            <motion.button
                                onClick={handleConfirm}
                                className="w-full bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 text-white font-semibold py-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 focus:ring-opacity-75"
                                whileTap={{ scale: 0.98 }}
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