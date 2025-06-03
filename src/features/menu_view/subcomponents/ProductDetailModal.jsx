// frontend/src/features/menu_view/subcomponents/ProductDetailModal.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { getEffectiveDisplayPrice, calculateItemPriceWithSelectedOptions } from '../utils/productUtils.js';

// Styling Constants (as per prompt)
const SINGLE_SELECT = 'single_select';
const MULTI_SELECT = 'multi_select';

const ROSE_PRIMARY_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500";
const ROSE_PRIMARY_TEXT = "text-white";
const ROSE_PRIMARY_RING_FOCUS = "focus:ring-rose-400 dark:focus:ring-rose-500";

const NEUTRAL_BG_LIGHT = "bg-neutral-100 dark:bg-neutral-700";
const NEUTRAL_BG_HOVER_LIGHT = "hover:bg-neutral-200 dark:hover:bg-neutral-600";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_BORDER = "border-neutral-300 dark:border-neutral-600";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";
const NEUTRAL_RING_FOCUS = "focus:ring-neutral-400 dark:focus:ring-neutral-500";

const ACTIVE_OPTION_BG = "bg-rose-500 dark:bg-rose-600";
const ACTIVE_OPTION_TEXT = "text-white";
const ACTIVE_OPTION_BORDER = "border-rose-500 dark:border-rose-600";
const ACTIVE_OPTION_CHECKBOX_CONTAINER_BG = "bg-rose-50 dark:bg-rose-900/40";

const CHECKBOX_CLASSES = `h-4 w-4 rounded ${NEUTRAL_BORDER} text-rose-600 dark:text-rose-500 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 shadow-sm cursor-pointer`;
const CHECKBOX_LABEL_TEXT = `ml-3 text-sm ${NEUTRAL_TEXT_SECONDARY} cursor-pointer`;

const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";

const FALLBACK_PRODUCT_IMAGE_MODAL = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80';


export default function ProductDetailModal({ isOpen, onClose, product, onConfirmWithOptions }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    const modalContentRef = useRef(null);
    const confirmButtonRef = useRef(null);
    const closeButtonRef = useRef(null);
    const groupErrorRefs = useRef({}); // To store refs for each group title for scrolling

    const basePriceForOptions = useMemo(() => {
        if (!product) return 0;
        return getEffectiveDisplayPrice(product).displayPrice;
    }, [product]);

    useEffect(() => {
        if (isOpen && product) {
            const initialSelections = {};
            if (product.editable_attribute_groups) {
                product.editable_attribute_groups.forEach(group => {
                    groupErrorRefs.current[group.id] = React.createRef(); // Initialize refs for error scrolling
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
            }
            setSelectedOptionsMap(initialSelections);
            setQuantity(1);
            setValidationErrors({});
            setTimeout(() => closeButtonRef.current?.focus(), 100);
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

        const resolvedOptionsFromMap = [];
        if (product.editable_attribute_groups) {
            product.editable_attribute_groups.forEach(group => {
                const selectionForGroup = selectedOptionsMap[group.id];
                if (group.options && Array.isArray(group.options)) {
                    if (group.type === SINGLE_SELECT && selectionForGroup) {
                        const optDetail = group.options.find(opt => opt.id === selectionForGroup);
                        if (optDetail) resolvedOptionsFromMap.push({ ...optDetail, groupId: group.id, groupName: group.name, groupType: group.type });
                    } else if (group.type === MULTI_SELECT && Array.isArray(selectionForGroup)) {
                        selectionForGroup.forEach(optId => {
                            const optDetail = group.options.find(opt => opt.id === optId);
                            if (optDetail) resolvedOptionsFromMap.push({ ...optDetail, groupId: group.id, groupName: group.name, groupType: group.type });
                        });
                    }
                }
            });
        }

        const itemPriceWithOptions = calculateItemPriceWithSelectedOptions(basePriceForOptions, resolvedOptionsFromMap);
        const totalForQty = itemPriceWithOptions * quantity;

        return {
            currentItemPriceWithOptionsMenu: itemPriceWithOptions,
            totalPriceForQuantity: totalForQty < 0 ? 0 : parseFloat(totalForQty.toFixed(2)),
            detailedSelectedOptions: resolvedOptionsFromMap.map(opt => ({
                ...opt, // Spread all original option properties
                price_adjustment: parseFloat(opt.price_adjustment) || 0 // Ensure price_adjustment is a number
            })),
        };
    }, [product, selectedOptionsMap, quantity, basePriceForOptions]);

    const validateSelections = useCallback(() => {
        if (!product || !product.editable_attribute_groups) return true;
        const errors = {};
        let firstErrorKey = null;

        const sortedGroups = [...product.editable_attribute_groups].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        for (const group of sortedGroups) {
            if (group.is_required) {
                const selection = selectedOptionsMap[group.id];
                let hasError = false;
                if (group.type === SINGLE_SELECT && (selection === null || selection === undefined || selection === '')) {
                    errors[group.id] = `Please make a selection for ${group.name}.`;
                    hasError = true;
                } else if (group.type === MULTI_SELECT && (!Array.isArray(selection) || selection.length === 0)) {
                    errors[group.id] = `Please select at least one option for ${group.name}.`;
                    hasError = true;
                }
                if (hasError && !firstErrorKey) firstErrorKey = group.id;
            }
        }
        setValidationErrors(errors);

        if (firstErrorKey && groupErrorRefs.current[firstErrorKey]?.current) {
            groupErrorRefs.current[firstErrorKey].current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return Object.keys(errors).length === 0;
    }, [product, selectedOptionsMap]);

    const handleConfirm = () => {
        if (!validateSelections()) return;
        onConfirmWithOptions(product, {
            quantity, selectedOptions: detailedSelectedOptions,
            finalPricePerItem: currentItemPriceWithOptionsMenu, totalPriceForQuantity: totalPriceForQuantity,
        });
        onClose(); // Close modal after confirming
    };

    // Focus trap logic
    useEffect(() => {
        if (!isOpen) return;

        const focusableElements = modalContentRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            } else if (event.key === 'Escape') {
                onClose();
            }
        };

        const currentModalContent = modalContentRef.current;
        currentModalContent?.addEventListener('keydown', handleKeyDown);
        return () => currentModalContent?.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


    if (!product) return null;

    const popupWidth = "w-[90vw] sm:w-full max-w-md"; // As per requirements
    const imageUrl = product.image_url || FALLBACK_PRODUCT_IMAGE_MODAL;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "circOut" }}
                        onClick={onClose} aria-hidden="true"
                    />
                    <motion.div
                        ref={modalContentRef}
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${popupWidth} ${FONT_INTER} bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        role="dialog" aria-modal="true" aria-labelledby="product-options-title"
                    >
                        {/* Header */}
                        <div className={`flex items-start justify-between p-4 sm:p-5 border-b ${NEUTRAL_BORDER_LIGHTER} shrink-0`}>
                            <div className="flex-1 min-w-0">
                                <h2 id="product-options-title" className={`${FONT_MONTSERRAT} font-medium text-xl ${NEUTRAL_TEXT_PRIMARY} truncate pr-2`} title={product.name}>
                                    {product.name || "Configure Item"}
                                </h2>
                                {product.subtitle && <p className={`text-xs ${NEUTRAL_TEXT_MUTED} mt-0.5 truncate`} title={product.subtitle}>{product.subtitle}</p>}
                            </div>
                            <button
                                ref={closeButtonRef}
                                onClick={onClose}
                                className={`p-1.5 rounded-full ${NEUTRAL_TEXT_SECONDARY} hover:${NEUTRAL_BG_HOVER_LIGHT} focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800 ${ROSE_PRIMARY_RING_FOCUS} transition-colors`}
                                aria-label="Close options popup"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-4 sm:p-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                            {/* Product Image */}
                            <div className="w-full aspect-[3/2] rounded-lg overflow-hidden mb-4 bg-neutral-100 dark:bg-neutral-700">
                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_PRODUCT_IMAGE_MODAL; }} />
                            </div>

                            {/* Product Description */}
                            {product.description && (
                                <div className="mb-4">
                                    <h3 className={`text-sm font-semibold ${NEUTRAL_TEXT_SECONDARY} mb-1`}>Description</h3>
                                    <p className={`text-sm ${NEUTRAL_TEXT_MUTED} leading-relaxed`}>{product.description}</p>
                                </div>
                            )}

                            {/* Attribute Groups */}
                            {product.editable_attribute_groups && product.editable_attribute_groups
                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                .map((group) => (
                                    <div key={group.id} id={`group-${group.id}`} ref={groupErrorRefs.current[group.id]}>
                                        <h3 className={`${FONT_INTER} text-base sm:text-lg font-semibold ${NEUTRAL_TEXT_SECONDARY} mb-2.5 flex items-center`}>
                                            {group.name}
                                            {group.is_required && <span className="ml-2 text-xs font-normal text-red-500 dark:text-red-400">(Required)</span>}
                                        </h3>
                                        <div className={`flex ${group.type === SINGLE_SELECT ? 'flex-wrap gap-2.5' : 'flex-col space-y-2'}`}>
                                            {group.options && group.options
                                                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                                .map(option => {
                                                    const priceAdjustmentNum = parseFloat(option.price_adjustment) || 0;
                                                    const isSelected = group.type === SINGLE_SELECT
                                                        ? selectedOptionsMap[group.id] === option.id
                                                        : (selectedOptionsMap[group.id] || []).includes(option.id);

                                                    return group.type === SINGLE_SELECT ? (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleOptionChange(group.id, option.id, group.type)}
                                                            className={`px-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800
                                                            ${isSelected
                                                                    ? `${ACTIVE_OPTION_BG} ${ACTIVE_OPTION_TEXT} ${ACTIVE_OPTION_BORDER} ${ROSE_PRIMARY_RING_FOCUS}`
                                                                    : `${NEUTRAL_BG_LIGHT} ${NEUTRAL_BG_HOVER_LIGHT} ${NEUTRAL_TEXT_SECONDARY} ${NEUTRAL_BORDER_LIGHTER} hover:${ACTIVE_OPTION_BORDER} dark:hover:${ACTIVE_OPTION_BORDER} hover:${NEUTRAL_TEXT_PRIMARY} dark:hover:${NEUTRAL_TEXT_PRIMARY} ${NEUTRAL_RING_FOCUS}`
                                                                }`}
                                                            aria-pressed={isSelected}
                                                            title={`${option.name}${priceAdjustmentNum !== 0 ? ` (${priceAdjustmentNum > 0 ? '+' : ''}${priceAdjustmentNum.toFixed(2)})` : ''}`}
                                                        >
                                                            {option.name}
                                                            {priceAdjustmentNum !== 0 &&
                                                                <span className={`ml-1.5 text-xs ${isSelected ? 'opacity-80' : 'opacity-70'}`}>
                                                                    ({priceAdjustmentNum > 0 ? '+' : ''}{priceAdjustmentNum.toFixed(2)})
                                                                </span>}
                                                        </button>
                                                    ) : (
                                                        <label key={option.id} htmlFor={`option-${group.id}-${option.id}`}
                                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border-2
                                                        ${isSelected
                                                                    ? `${ACTIVE_OPTION_CHECKBOX_CONTAINER_BG} ${ACTIVE_OPTION_BORDER}`
                                                                    : `${NEUTRAL_BG_LIGHT} ${NEUTRAL_BORDER_LIGHTER} hover:border-rose-300 dark:hover:border-rose-400`
                                                                }`}
                                                        >
                                                            <input
                                                                id={`option-${group.id}-${option.id}`}
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleOptionChange(group.id, option.id, group.type)}
                                                                className={CHECKBOX_CLASSES}
                                                            />
                                                            <span className={CHECKBOX_LABEL_TEXT}>{option.name}</span>
                                                            {priceAdjustmentNum !== 0 && (
                                                                <span className={`ml-auto text-sm ${NEUTRAL_TEXT_MUTED}`}>
                                                                    {priceAdjustmentNum > 0 ? '+' : ''}{priceAdjustmentNum.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                        {validationErrors[group.id] && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 pl-1" role="alert">{validationErrors[group.id]}</p>}
                                    </div>
                                ))}

                            {/* Quantity Selector */}
                            <div>
                                <h3 className={`${FONT_INTER} text-base sm:text-lg font-semibold ${NEUTRAL_TEXT_SECONDARY} mb-2.5`}>Quantity</h3>
                                <NumberStepperfix
                                    id="productDetailQuantity"
                                    min={1}
                                    max={product?.max_quantity_per_order || 20}
                                    value={quantity}
                                    onChange={setQuantity}
                                    label="Item quantity"
                                    hideLabel={true}
                                    inputClassName={`text-center h-10 sm:h-11 w-12 sm:w-14 rounded-md border ${NEUTRAL_BORDER} bg-white dark:bg-neutral-700 ${NEUTRAL_TEXT_SECONDARY} focus:ring-2 ${ROSE_PRIMARY_RING_FOCUS} shadow-sm`}
                                    buttonClassName={`w-10 h-10 sm:w-11 sm:h-11 rounded-md ${NEUTRAL_BG_LIGHT} ${NEUTRAL_BG_HOVER_LIGHT} ${NEUTRAL_TEXT_SECONDARY} focus:ring-2 ${NEUTRAL_RING_FOCUS} shadow-sm`}
                                    containerClassName="flex justify-center items-center space-x-2 sm:space-x-3"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`p-4 sm:p-5 border-t ${NEUTRAL_BORDER_LIGHTER} bg-neutral-50 dark:bg-neutral-800/70 shrink-0`}>
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <span className={`text-lg font-semibold ${NEUTRAL_TEXT_PRIMARY}`}>Total:</span>
                                <span className={`${FONT_MONTSERRAT} text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400`}>
                                    ${totalPriceForQuantity.toFixed(2)}
                                </span>
                            </div>
                            <motion.button
                                ref={confirmButtonRef}
                                onClick={handleConfirm}
                                className={`w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed
                                            ${ROSE_PRIMARY_BG} ${ROSE_PRIMARY_TEXT} ${ROSE_PRIMARY_RING_FOCUS}`}
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