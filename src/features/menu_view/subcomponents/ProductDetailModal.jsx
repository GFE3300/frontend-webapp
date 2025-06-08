import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import NumberStepperfix from '../../../components/common/NumberStepperfix.jsx';
import Icon from '../../../components/common/Icon.jsx';
import { calculateItemPriceWithSelectedOptions } from '../utils/productUtils.js';
import { useCurrency } from '../../../hooks/useCurrency.js'; // MODIFIED: Import hook

// --- Styling Constants ---
const SINGLE_SELECT = 'single_select';
const MULTI_SELECT = 'multi_select';

const ROSE_PRIMARY_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600";
const ROSE_PRIMARY_TEXT_ON_ACCENT = "text-white";
const ROSE_ACCENT_TEXT = "text-rose-600 dark:text-rose-400";
const ROSE_ACCENT_RING_FOCUS = "focus-visible:ring-2 focus-visible:ring-rose-500";

const NEUTRAL_BG_MODAL_CARD = "bg-white dark:bg-neutral-800";
const NEUTRAL_BG_MODAL_FOOTER = "bg-neutral-50 dark:bg-neutral-700/60";
const NEUTRAL_BG_OPTION_LIGHT = "bg-neutral-100 dark:bg-neutral-700";
const NEUTRAL_BG_OPTION_HOVER_LIGHT = "hover:bg-neutral-200 dark:hover:bg-neutral-600";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-900 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_BORDER = "border-neutral-300 dark:border-neutral-600";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";

const ERROR_TEXT = "text-red-500 dark:text-red-400";
const ERROR_BORDER = "border-red-400 dark:border-red-500";
const ERROR_BG = "bg-red-50 dark:bg-red-900/20";

const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";

const MODAL_SHADOW = "shadow-2xl";
const MODAL_RADIUS = "rounded-2xl";
const OPTION_BUTTON_RADIUS = "rounded-lg";
const CHECKBOX_RADIUS = "rounded";

export default function ProductDetailModal({ isOpen, onClose, product, onConfirmWithOptions }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    const modalContentRef = useRef(null);
    const closeButtonRef = useRef(null);
    const groupErrorRefs = useRef({});

    const shouldReduceMotion = useReducedMotion();
    const isProductAvailable = product?.is_active !== false;
    const { formatCurrency } = useCurrency(); // MODIFIED: Use the currency hook

    const basePriceForOptions = useMemo(() => {
        if (!product) return 0;
        return parseFloat(product.selling_price_excl_tax) || 0;
    }, [product]);

    useEffect(() => {
        if (isOpen && product) {
            const initialSelections = {};
            groupErrorRefs.current = {};
            if (product.editable_attribute_groups) {
                product.editable_attribute_groups.forEach(group => {
                    groupErrorRefs.current[group.id] = React.createRef();
                    const sortedOptions = [...(group.options || [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
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
                        initialSelections[group.id] = sortedOptions.filter(opt => opt.is_default).map(opt => opt.id);
                    }
                });
            }
            setSelectedOptionsMap(initialSelections);
            setQuantity(1);
            setValidationErrors({});
            const timer = setTimeout(() => closeButtonRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, product]);

    const handleOptionChange = useCallback((groupId, optionId, groupType) => {
        setSelectedOptionsMap(prev => {
            const newSelections = { ...prev };
            if (groupType === SINGLE_SELECT) {
                newSelections[groupId] = optionId;
            } else if (groupType === MULTI_SELECT) {
                const currentGroupSelections = prev[groupId] || [];
                newSelections[groupId] = currentGroupSelections.includes(optionId)
                    ? currentGroupSelections.filter(id => id !== optionId)
                    : [...currentGroupSelections, optionId];
            }
            return newSelections;
        });
        if (validationErrors[groupId]) {
            setValidationErrors(prev => { const newErrors = { ...prev }; delete newErrors[groupId]; return newErrors; });
        }
    }, [validationErrors]);

    const { totalPriceForQuantity, detailedSelectedOptions, currentItemPriceWithOptionsMenu } = useMemo(() => {
        if (!product) return { totalPriceForQuantity: 0, detailedSelectedOptions: [], currentItemPriceWithOptionsMenu: 0 };
        const resolvedOptions = [];
        (product.editable_attribute_groups || []).forEach(group => {
            const selectionForGroup = selectedOptionsMap[group.id];
            if (group.type === SINGLE_SELECT && selectionForGroup) {
                const optDetail = group.options.find(opt => opt.id === selectionForGroup);
                if (optDetail) resolvedOptions.push({ ...optDetail, groupId: group.id });
            } else if (group.type === MULTI_SELECT && Array.isArray(selectionForGroup)) {
                selectionForGroup.forEach(optId => {
                    const optDetail = group.options.find(opt => opt.id === optId);
                    if (optDetail) resolvedOptions.push({ ...optDetail, groupId: group.id });
                });
            }
        });
        const itemPrice = calculateItemPriceWithSelectedOptions(basePriceForOptions, resolvedOptions);
        const totalForQty = itemPrice * quantity;
        return {
            currentItemPriceWithOptionsMenu: itemPrice,
            totalPriceForQuantity: Math.max(0, parseFloat(totalForQty.toFixed(2))),
            detailedSelectedOptions: resolvedOptions,
        };
    }, [product, selectedOptionsMap, quantity, basePriceForOptions]);

    const validateSelections = useCallback(() => {
        if (!product?.editable_attribute_groups) return true;
        const errors = {};
        let firstErrorKey = null;
        product.editable_attribute_groups
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .forEach(group => {
                if (group.is_required) {
                    const selection = selectedOptionsMap[group.id];
                    let isError = false;
                    if (group.type === SINGLE_SELECT && !selection) isError = true;
                    else if (group.type === MULTI_SELECT && (!Array.isArray(selection) || selection.length === 0)) isError = true;
                    if (isError) {
                        errors[group.id] = `Please make a selection for ${group.name}.`;
                        if (!firstErrorKey) firstErrorKey = group.id;
                    }
                }
            });

        setValidationErrors(errors);

        if (firstErrorKey && groupErrorRefs.current[firstErrorKey]?.current) {
            groupErrorRefs.current[firstErrorKey].current.scrollIntoView({ behavior: "smooth", block: "center" });
            const errorGroupElement = groupErrorRefs.current[firstErrorKey].current;
            const firstInteractiveInErrorGroup = errorGroupElement.querySelector('button, [type="checkbox"]');
            firstInteractiveInErrorGroup?.focus();
        }
        return Object.keys(errors).length === 0;
    }, [product, selectedOptionsMap]);

    const handleConfirm = () => {
        if (!isProductAvailable || !validateSelections()) return;
        onConfirmWithOptions(product, {
            quantity,
            selectedOptions: detailedSelectedOptions,
            finalPricePerItem: currentItemPriceWithOptionsMenu,
            totalPriceForQuantity,
        });
    };

    useEffect(() => {
        if (!isOpen) return;
        const modalElement = modalContentRef.current;
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            else if (event.key === 'Tab') {
                if (event.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };
        modalElement.addEventListener('keydown', handleKeyDown);
        return () => modalElement.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const modalTransitionConfig = shouldReduceMotion ? reducedMotionTransition : { type: "spring", stiffness: 320, damping: 28, duration: 0.3 };
    const backdropTransitionConfig = shouldReduceMotion ? reducedMotionTransition : { duration: 0.25, ease: "circOut" };

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="fixed inset-0 z-40 bg-black/60 dark:bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={backdropTransitionConfig} onClick={onClose} aria-hidden="true" />
                    <motion.div
                        ref={modalContentRef}
                        className={`fixed font-montserrat top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md ${FONT_INTER} ${NEUTRAL_BG_MODAL_CARD} ${MODAL_RADIUS} ${MODAL_SHADOW} z-50 flex flex-col overflow-hidden`}
                        style={{ maxHeight: 'calc(100vh - 40px)' }}
                        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={modalTransitionConfig}
                        role="dialog" aria-modal="true" aria-labelledby="product-options-title" aria-describedby={product.description ? "product-modal-description" : undefined}
                    >
                        <header className={`flex items-start justify-between p-4 sm:p-5 border-b ${NEUTRAL_BORDER_LIGHTER} shrink-0`}>
                            <div className="flex-1 min-w-0 pr-2">
                                <h2 id="product-options-title" className={`${FONT_MONTSERRAT} font-semibold text-xl ${NEUTRAL_TEXT_PRIMARY} truncate`} title={product.name}>{product.name || "Configure Item"}</h2>
                                {product.subtitle && <p className={`text-xs ${NEUTRAL_TEXT_MUTED} mt-0.5 truncate`} title={product.subtitle}>{product.subtitle}</p>}
                            </div>
                            <button ref={closeButtonRef} onClick={onClose} className={`p-1.5 w-8 h-8 rounded-full ${NEUTRAL_TEXT_MUTED} hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS} transition-colors`} aria-label="Close product options">
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </header>

                        <main className="flex-1 p-4 sm:p-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                            {!isProductAvailable && <div className={`p-3 mb-2 ${ERROR_BG} border ${ERROR_BORDER} ${MODAL_RADIUS} text-center`} role="alert"><p className={`font-medium text-sm ${ERROR_TEXT}`}>This item is currently unavailable.</p></div>}
                            {product.description && <div><h3 className={`text-sm font-semibold ${NEUTRAL_TEXT_SECONDARY} mb-1`}>Description</h3><p id="product-modal-description" className={`text-sm ${NEUTRAL_TEXT_MUTED} leading-relaxed`}>{product.description}</p></div>}

                            {(product.editable_attribute_groups || []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map(group => (
                                <fieldset key={group.id} id={`group-${group.id}`} ref={groupErrorRefs.current[group.id]} className={`p-3 rounded-lg transition-colors ${validationErrors[group.id] ? ERROR_BG : ''}`}>
                                    <legend className={`${FONT_MONTSERRAT} text-base sm:text-lg font-medium ${NEUTRAL_TEXT_SECONDARY} mb-2.5 flex items-center`}>
                                        {group.name}
                                        {group.is_required && <span className={`ml-2 text-xs font-normal ${validationErrors[group.id] ? ERROR_TEXT : NEUTRAL_TEXT_MUTED}`} aria-hidden="true">(Required)</span>}
                                    </legend>
                                    <div className={`flex ${group.type === SINGLE_SELECT ? 'flex-wrap gap-2' : 'flex-col space-y-2'}`} role={group.type === SINGLE_SELECT ? "radiogroup" : "group"} aria-required={group.is_required}>
                                        {(group.options || []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map(option => {
                                            const priceAdj = parseFloat(option.price_adjustment) || 0;
                                            const isSelected = group.type === SINGLE_SELECT ? selectedOptionsMap[group.id] === option.id : (selectedOptionsMap[group.id] || []).includes(option.id);
                                            const baseClasses = `border-2 text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 ${ROSE_ACCENT_RING_FOCUS}`;
                                            
                                            // MODIFIED: ARIA label and display now use formatCurrency
                                            const ariaLabel = `${option.name}${priceAdj !== 0 ? ` (${priceAdj > 0 ? '+' : ''}${formatCurrency(priceAdj)})` : ''}`;
                                            const displayPriceAdj = `(${priceAdj > 0 ? '+' : ''}${formatCurrency(priceAdj)})`;

                                            return group.type === SINGLE_SELECT ? (
                                                <button key={option.id} onClick={() => handleOptionChange(group.id, option.id, group.type)} className={`${baseClasses} px-3 py-1.5 ${OPTION_BUTTON_RADIUS} ${isSelected ? `bg-rose-100 dark:bg-rose-500/20 border-rose-500 dark:border-rose-400 ${ROSE_ACCENT_TEXT}` : `${NEUTRAL_BG_OPTION_LIGHT} ${NEUTRAL_BG_OPTION_HOVER_LIGHT} ${NEUTRAL_TEXT_SECONDARY} ${NEUTRAL_BORDER_LIGHTER} hover:border-rose-300 dark:hover:border-rose-400 hover:${ROSE_ACCENT_TEXT}`}`} role="radio" aria-checked={isSelected} aria-label={ariaLabel}>
                                                    {option.name}{priceAdj !== 0 && <span className={`ml-1.5 text-xs ${isSelected ? 'opacity-80' : NEUTRAL_TEXT_MUTED}`} aria-hidden="true">{displayPriceAdj}</span>}
                                                </button>
                                            ) : (
                                                <label key={option.id} htmlFor={`option-${group.id}-${option.id}`} className={`${baseClasses} flex items-center p-2.5 ${OPTION_BUTTON_RADIUS} cursor-pointer ${isSelected ? `bg-rose-50 dark:bg-rose-700/30 border-rose-500 dark:border-rose-400` : `${NEUTRAL_BG_OPTION_LIGHT} ${NEUTRAL_BORDER_LIGHTER} hover:border-rose-300 dark:hover:border-rose-400`}`}>
                                                    <input id={`option-${group.id}-${option.id}`} type="checkbox" checked={isSelected} onChange={() => handleOptionChange(group.id, option.id, group.type)} className={`h-4 w-4 ${CHECKBOX_RADIUS} ${NEUTRAL_BORDER} text-rose-600 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 shadow-sm cursor-pointer`} />
                                                    <span className={`ml-2.5 text-sm ${NEUTRAL_TEXT_SECONDARY} cursor-pointer`}>{option.name}</span>
                                                    {priceAdj !== 0 && <span className={`ml-auto text-sm ${NEUTRAL_TEXT_MUTED}`} aria-hidden="true">{displayPriceAdj}</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {validationErrors[group.id] && <p className={`text-xs ${ERROR_TEXT} mt-1.5 pl-1`} role="alert">{validationErrors[group.id]}</p>}
                                </fieldset>
                            ))}

                            {isProductAvailable && <NumberStepperfix id="productDetailQuantityModal" min={1} max={product?.max_quantity_per_order || 20} value={quantity} onChange={setQuantity} label="Item quantity" hideLabel={true} disabled={!isProductAvailable} />}
                        </main>

                        <footer className={`p-4 sm:p-5 border-t ${NEUTRAL_BORDER_LIGHTER} ${NEUTRAL_BG_MODAL_FOOTER} shrink-0`}>
                            <div className="flex justify-between items-center mb-3" aria-live="polite">
                                <span className={`${FONT_MONTSERRAT} text-lg font-medium ${NEUTRAL_TEXT_PRIMARY}`}>Total:</span>
                                {/* MODIFIED: Final total uses formatCurrency */}
                                <span className={`${FONT_MONTSERRAT} text-xl sm:text-2xl font-bold ${ROSE_ACCENT_TEXT}`}>{formatCurrency(totalPriceForQuantity)}</span>
                            </div>
                            <motion.button onClick={handleConfirm} className={`w-full ${FONT_INTER} font-semibold py-3 ${MODAL_RADIUS} shadow-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed ${!isProductAvailable || Object.keys(validationErrors).length > 0 || quantity <= 0 ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400' : `${ROSE_PRIMARY_BG} ${ROSE_PRIMARY_TEXT_ON_ACCENT} ${ROSE_ACCENT_RING_FOCUS}`}`} whileTap={isProductAvailable ? { scale: 0.98 } : {}} disabled={!isProductAvailable || Object.keys(validationErrors).length > 0 || quantity <= 0}>
                                {isProductAvailable ? `Add ${quantity} to Order` : "Unavailable"}
                            </motion.button>
                        </footer>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}