// frontend/src/features/menu_view/subcomponents/ProductOptionsPopup.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { getEffectiveDisplayPrice, calculateItemPriceWithSelectedOptions } from '../utils/productUtils.js';

const SINGLE_SELECT = 'single_select';
const MULTI_SELECT = 'multi_select';

// Design Guideline Colors & Styles (from design_guidelines.txt & phase instructions)
// Primary Action (Rose Theme)
const ROSE_PRIMARY_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500";
const ROSE_PRIMARY_TEXT = "text-white";
const ROSE_PRIMARY_RING_FOCUS = "focus:ring-rose-400 dark:focus:ring-rose-500"; // For buttons needing rose focus

// Neutral elements (borders, inactive states, text)
const NEUTRAL_BG_LIGHT = "bg-neutral-100 dark:bg-neutral-700"; // e.g., inactive option button
const NEUTRAL_BG_HOVER_LIGHT = "hover:bg-neutral-200 dark:hover:bg-neutral-600";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100"; // Main text on light/dark bg
const NEUTRAL_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200"; // Slightly less prominent
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";     // e.g., subtitles, placeholders
const NEUTRAL_BORDER = "border-neutral-300 dark:border-neutral-600";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700"; // For dividers
const NEUTRAL_RING_FOCUS = "focus:ring-neutral-400 dark:focus:ring-neutral-500"; // For neutral focusable elements

// Active Option State (Rose theme for selection indication)
const ACTIVE_OPTION_BG = "bg-rose-500 dark:bg-rose-600"; // Single-select active button
const ACTIVE_OPTION_TEXT = "text-white";
const ACTIVE_OPTION_BORDER = "border-rose-500 dark:border-rose-600";
const ACTIVE_OPTION_CHECKBOX_CONTAINER_BG = "bg-rose-50 dark:bg-rose-900/30"; // For multi-select checkbox container

// Checkbox Styling (Guidelines 6.9)
const CHECKBOX_CLASSES = `h-4 w-4 rounded ${NEUTRAL_BORDER} text-rose-600 dark:text-rose-500 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 shadow-sm`;
const CHECKBOX_LABEL_TEXT = `ml-3 text-sm ${NEUTRAL_TEXT_SECONDARY}`; // Checkbox label text

// Typography (Guidelines 2.2)
const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";


export default function ProductOptionsPopup({ isOpen, onClose, product, onConfirmWithOptions }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const firstErrorRef = useRef(null); // To scroll to the first error

    const basePriceForOptions = useMemo(() => {
        if (!product) return 0;
        return getEffectiveDisplayPrice(product).displayPrice;
    }, [product]);

    useEffect(() => {
        if (isOpen && product && product.editable_attribute_groups) {
            const initialSelections = {};
            product.editable_attribute_groups.forEach(group => {
                if (group.options && group.options.length > 0) {
                    const sortedOptions = [...group.options].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                    if (group.type === SINGLE_SELECT) {
                        const defaultOption = sortedOptions.find(opt => opt.is_default);
                        if (defaultOption) {
                            initialSelections[group.id] = defaultOption.id;
                        } else if (group.is_required && sortedOptions.length > 0) {
                            initialSelections[group.id] = sortedOptions[0].id;
                        } else {
                            initialSelections[group.id] = null;
                        }
                    } else if (group.type === MULTI_SELECT) {
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
        if (validationErrors[groupId]) {
            setValidationErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[groupId];
                return newErrors;
            });
        }
    }, [validationErrors]);

    const { currentItemPriceWithOptionsMenu, totalPriceForQuantity, detailedSelectedOptions } = useMemo(() => {
        if (!product) return { currentItemPriceWithOptionsMenu: 0, totalPriceForQuantity: 0, detailedSelectedOptions: [] };
        const resolvedOptions = [];
        if (product.editable_attribute_groups) {
            product.editable_attribute_groups.forEach(group => {
                const selectionForGroup = selectedOptionsMap[group.id];
                if (group.options && group.options.length > 0) {
                    if (group.type === SINGLE_SELECT && selectionForGroup) {
                        const optDetail = group.options.find(opt => opt.id === selectionForGroup);
                        if (optDetail) resolvedOptions.push({ ...optDetail, price_adjustment: parseFloat(optDetail.price_adjustment) || 0, groupId: group.id, groupName: group.name, groupType: group.type });
                    } else if (group.type === MULTI_SELECT && Array.isArray(selectionForGroup) && selectionForGroup.length > 0) {
                        selectionForGroup.forEach(optId => {
                            const optDetail = group.options.find(opt => opt.id === optId);
                            if (optDetail) resolvedOptions.push({ ...optDetail, price_adjustment: parseFloat(optDetail.price_adjustment) || 0, groupId: group.id, groupName: group.name, groupType: group.type });
                        });
                    }
                }
            });
        }
        const itemPriceWithOptions = calculateItemPriceWithSelectedOptions(basePriceForOptions, resolvedOptions);
        const totalForQty = itemPriceWithOptions * quantity;
        return {
            currentItemPriceWithOptionsMenu: itemPriceWithOptions,
            totalPriceForQuantity: totalForQty < 0 ? 0 : parseFloat(totalForQty.toFixed(2)),
            detailedSelectedOptions: resolvedOptions,
        };
    }, [product, selectedOptionsMap, quantity, basePriceForOptions]);

    const validateSelections = useCallback(() => {
        if (!product || !product.editable_attribute_groups) return true;
        const errors = {};
        let firstErrorKey = null;
        product.editable_attribute_groups.forEach(group => {
            if (group.is_required) {
                const selection = selectedOptionsMap[group.id];
                let hasError = false;
                if (group.type === SINGLE_SELECT && (selection === null || selection === undefined || selection === '')) {
                    errors[group.id] = `Please make a selection for ${group.name}.`;
                    hasError = true;
                } else if (group.type === MULTI_SELECT && (!selection || selection.length === 0)) {
                    errors[group.id] = `Please select at least one option for ${group.name}.`;
                    hasError = true;
                }
                if (hasError && !firstErrorKey) firstErrorKey = group.id;
            }
        });
        setValidationErrors(errors);
        if (firstErrorKey) {
            // Find the DOM element for the first error and store its ref if needed for scrolling.
            // Direct DOM manipulation for scroll is fine here for simplicity.
            const errorElement = document.getElementById(`group-title-${firstErrorKey}`);
            errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return Object.keys(errors).length === 0;
    }, [product, selectedOptionsMap]);

    const handleConfirm = () => {
        if (!validateSelections()) return;
        const payloadSelectedOptions = detailedSelectedOptions.map(opt => ({
            groupId: opt.groupId, groupName: opt.groupName, groupType: opt.groupType,
            optionId: opt.id, optionName: opt.name, priceAdjustment: opt.price_adjustment,
        }));
        onConfirmWithOptions(product, {
            quantity, selectedOptions: payloadSelectedOptions,
            finalPricePerItem: currentItemPriceWithOptionsMenu, totalPriceForQuantity: totalPriceForQuantity,
        });
    };

    if (!product) return null;

    const popupWidth = "w-[90vw] sm:w-full max-w-md"; // Responsive width for modal

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop (Guidelines 6.4 Modals) */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "circOut" }}
                        onClick={onClose} aria-hidden="true"
                    />
                    {/* Modal Dialog (Guidelines 6.4 Modals, 2.6 Corner Radii, 2.5 Shadows) */}
                    <motion.div
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${popupWidth} ${FONT_INTER} bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }} // Ensure modal is not taller than viewport
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        role="dialog" aria-modal="true" aria-labelledby="product-options-title"
                    >
                        {/* Header (Guidelines: H4 Montserrat Medium 20px) */}
                        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${NEUTRAL_BORDER_LIGHTER} shrink-0`}>
                            <div className="flex-1 min-w-0">
                                <h2 id="product-options-title" className={`${FONT_MONTSERRAT} font-medium text-xl ${NEUTRAL_TEXT_PRIMARY} truncate pr-2`} title={product.name}>
                                    {product.name || "Configure Item"}
                                </h2>
                                {product.subtitle && <p className={`text-xs ${NEUTRAL_TEXT_MUTED} mt-0.5 truncate`} title={product.subtitle}>{product.subtitle}</p>}
                            </div>
                            {/* Close Button (Guidelines 6.1 Buttons - IconButton Small/Medium, Neutral) */}
                            <button
                                onClick={onClose}
                                className={`p-1.5 rounded-full ${NEUTRAL_BG_LIGHT} ${NEUTRAL_BG_HOVER_LIGHT} ${NEUTRAL_TEXT_SECONDARY} focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800 ${ROSE_PRIMARY_RING_FOCUS} transition-colors`}
                                aria-label="Close options popup"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area (Guidelines 2.4 Spacing Scale - space-y-5 implies 20px) */}
                        <div className="flex-1 p-4 sm:p-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                            {product.editable_attribute_groups && product.editable_attribute_groups
                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                .map(group => (
                                    <div key={group.id} id={`group-${group.id}`}>
                                        {/* Group Title (Guidelines: Body Large - Inter SemiBold 18px, or Body Medium - Inter SemiBold 16px) */}
                                        <h3 id={`group-title-${group.id}`} className={`${FONT_INTER} text-base sm:text-lg font-semibold ${NEUTRAL_TEXT_SECONDARY} mb-2.5 flex items-center`}>
                                            {group.name}
                                            {group.is_required && <span className="ml-2 text-xs font-normal text-red-500 dark:text-red-400">(Required)</span>}
                                        </h3>
                                        {/* Options Container */}
                                        <div className={`flex ${group.type === SINGLE_SELECT ? 'flex-wrap gap-2.5' : 'flex-col space-y-2'}`}>
                                            {group.options && group.options
                                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                                .map(option => {
                                                    const priceAdjustmentNum = parseFloat(option.price_adjustment) || 0;
                                                    const isSelected = group.type === SINGLE_SELECT
                                                        ? selectedOptionsMap[group.id] === option.id
                                                        : (selectedOptionsMap[group.id] || []).includes(option.id);

                                                    return group.type === SINGLE_SELECT ? (
                                                        // Single-Select Buttons (Guidelines 6.1 Buttons - Small, or Segmented Control 6.8 like)
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleOptionChange(group.id, option.id, group.type)}
                                                            className={`px-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800
                                                                ${isSelected
                                                                    ? `${ACTIVE_OPTION_BG} ${ACTIVE_OPTION_TEXT} ${ACTIVE_OPTION_BORDER} ${ROSE_PRIMARY_RING_FOCUS}`
                                                                    : `${NEUTRAL_BG_LIGHT} ${NEUTRAL_BG_HOVER_LIGHT} ${NEUTRAL_TEXT_SECONDARY} ${NEUTRAL_BORDER_LIGHTER} hover:${ACTIVE_OPTION_BORDER} dark:hover:${ACTIVE_OPTION_BORDER} hover:${NEUTRAL_TEXT_PRIMARY} dark:hover:${NEUTRAL_TEXT_PRIMARY} ${NEUTRAL_RING_FOCUS}`
                                                                }`}
                                                            aria-pressed={isSelected}
                                                        >
                                                            {option.name}
                                                            {priceAdjustmentNum !== 0 &&
                                                                <span className={`ml-1.5 text-xs ${isSelected ? 'opacity-80' : 'opacity-70'}`}>
                                                                    ({priceAdjustmentNum > 0 ? '+' : ''}${priceAdjustmentNum.toFixed(2)})
                                                                </span>}
                                                        </button>
                                                    ) : ( // Multi-Select Checkboxes (Guidelines 6.9 Toggles & Checkboxes)
                                                        <label key={option.id}
                                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border-2
                                                            ${isSelected
                                                                ? `${ACTIVE_OPTION_CHECKBOX_CONTAINER_BG} ${ACTIVE_OPTION_BORDER}`
                                                                : `${NEUTRAL_BG_LIGHT} ${NEUTRAL_BORDER_LIGHTER} hover:border-rose-300 dark:hover:border-rose-400` // Subtle hover for checkbox container
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleOptionChange(group.id, option.id, group.type)}
                                                                className={CHECKBOX_CLASSES}
                                                            />
                                                            <span className={CHECKBOX_LABEL_TEXT}>{option.name}</span>
                                                            {priceAdjustmentNum !== 0 && (
                                                                <span className={`ml-auto text-sm ${NEUTRAL_TEXT_MUTED}`}>
                                                                    {priceAdjustmentNum > 0 ? '+' : ''}${priceAdjustmentNum.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                        {validationErrors[group.id] && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 pl-1" role="alert">{validationErrors[group.id]}</p>}
                                    </div>
                                ))}

                            {/* Quantity Stepper (Guidelines 6.2 Input Fields, 6.1 Small Buttons) */}
                            <div>
                                <h3 className={`${FONT_INTER} text-base sm:text-lg font-semibold ${NEUTRAL_TEXT_SECONDARY} mb-2.5`}>Quantity</h3>
                                <NumberStepperfix
                                    min={1}
                                    max={product?.max_quantity_per_order || 20}
                                    value={quantity}
                                    onChange={setQuantity}
                                    label="Quantity" hideLabel={true} // Assuming visual label is above
                                    inputClassName={`text-center h-10 sm:h-11 w-12 sm:w-14 rounded-md border ${NEUTRAL_BORDER} bg-white dark:bg-neutral-700 ${NEUTRAL_TEXT_SECONDARY} focus:ring-2 ${ROSE_PRIMARY_RING_FOCUS} shadow-sm`}
                                    buttonClassName={`w-10 h-10 sm:w-11 sm:h-11 rounded-md ${NEUTRAL_BG_LIGHT} ${NEUTRAL_BG_HOVER_LIGHT} ${NEUTRAL_TEXT_SECONDARY} focus:ring-2 ${NEUTRAL_RING_FOCUS} shadow-sm`}
                                    containerClassName="flex justify-center items-center space-x-2 sm:space-x-3"
                                />
                            </div>
                        </div>

                        {/* Footer (Guidelines 6.1 Buttons - Primary Button) */}
                        <div className={`p-4 sm:p-5 border-t ${NEUTRAL_BORDER_LIGHTER} bg-neutral-50 dark:bg-neutral-800/70 shrink-0`}>
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <span className={`text-lg font-semibold ${NEUTRAL_TEXT_PRIMARY}`}>Total:</span>
                                <span className={`${FONT_MONTSERRAT} text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400`}>
                                    ${totalPriceForQuantity.toFixed(2)}
                                </span>
                            </div>
                            <motion.button
                                onClick={handleConfirm}
                                className={`w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed
                                            ${ROSE_PRIMARY_BG} ${ROSE_PRIMARY_TEXT} ${ROSE_PRIMARY_RING_FOCUS}`} // Primary Button styles
                                whileTap={{ scale: 0.98 }}
                                disabled={Object.keys(validationErrors).length > 0 || quantity <= 0}
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