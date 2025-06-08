import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import { useCurrency } from '../../../hooks/useCurrency';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION
import { interpolate } from '../utils/script_lines.js'; // LOCALIZATION

// --- THEMING CONSTANTS ---
const NEUTRAL_BG_ITEM = "bg-white dark:bg-neutral-800";
const NEUTRAL_BG_ITEM_PREVIEW = "bg-neutral-50 dark:bg-neutral-700/70";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_BORDER = "border-neutral-200 dark:border-neutral-700";
const DISCOUNT_BADGE_BG = "bg-green-100 dark:bg-green-800/50";
const DISCOUNT_BADGE_TEXT = "text-green-700 dark:text-green-300";
const DISCOUNT_PRICE_TEXT = "text-green-600 dark:text-green-400";
const FONT_INTER = "font-inter";
const ITEM_NAME_TEXT_SIZE = "text-sm sm:text-base";
const ITEM_OPTIONS_TEXT_SIZE = "text-xs";
const ITEM_PRICE_UNIT_TEXT_SIZE = "text-xs";
const ITEM_TOTAL_PRICE_TEXT_SIZE = "text-sm sm:text-base";
const STEPPER_TEXT_SIZE = "text-sm";
const DISCOUNT_BADGE_TEXT_SIZE = "text-[11px]";
const CARD_PADDING = "p-3 sm:p-4";
const CARD_MARGIN_Y = "my-2";
const IMAGE_ICON_CONTAINER_SIZE = "w-16 h-16 sm:w-20 sm:h-20";
const IMAGE_ICON_MARGIN_RIGHT = "mr-3 sm:mr-4";
const ITEM_CARD_RADIUS = "rounded-xl";
const IMAGE_ICON_RADIUS = "rounded-full";
const STEPPER_BUTTON_RADIUS = "rounded-md";
const ITEM_CARD_SHADOW_BASE = "shadow-md";
const ITEM_CARD_SHADOW_HOVER = "hover:shadow-lg";
const ITEM_CARD_HOVER_EFFECT = "hover:scale-[1.01]";
const ITEM_CARD_TRANSITION = "transition-all duration-200 ease-in-out";
const FALLBACK_ICON_BG = "bg-neutral-100 dark:bg-neutral-700";
const FALLBACK_ICON_COLOR = "text-neutral-400 dark:text-neutral-500";
const FALLBACK_ICON_NAME = "inventory_2";
const FALLBACK_ICON_SIZE_CLASS = "w-8 h-8 sm:w-10 sm:h-10";
const STEPPER_BUTTON_BG = "bg-neutral-200/70 dark:bg-neutral-700";
const STEPPER_BUTTON_BG_HOVER = "hover:bg-neutral-300/80 dark:hover:bg-neutral-600";
const STEPPER_BUTTON_TEXT = "text-neutral-700 dark:text-neutral-200";
const STEPPER_RING_FOCUS = "focus-visible:ring-2 focus-visible:ring-rose-500";
const STEPPER_BUTTON_SIZE = "w-7 h-7";
const STEPPER_BUTTON_ICON_SIZE = "w-4 h-4";
const DISCOUNT_BADGE_PADDING = "px-2 py-0.5";
const DISCOUNT_BADGE_FONT_WEIGHT = "font-medium";
const DISCOUNT_BADGE_ICON_SIZE = "w-3 h-3";

function OrderItem({
    item,
    onUpdateQuantity,
    isPreviewMode = false,
    appliedItemDiscountDetails
}) {
    const [imageLoadError, setImageLoadError] = useState(false);
    const { formatCurrency } = useCurrency(); // LOCALIZATION: Use the currency hook

    useEffect(() => {
        setImageLoadError(false);
    }, [item.imageUrl]);

    const handleIncrement = () => onUpdateQuantity(item.id, item.quantity + 1);
    const handleDecrement = () => { if (item.quantity > 0) onUpdateQuantity(item.id, item.quantity - 1); };

    const itemBasePricePerUnit = parseFloat(String(item.price)) || 0;
    const originalLineTotal = itemBasePricePerUnit * item.quantity;
    const { displayLineTotal, showDiscountedPrice, discountDescriptionToShow } = useMemo(() => {
        if (appliedItemDiscountDetails?.amount > 0) {
            const baseTotal = appliedItemDiscountDetails.originalItemTotal ?? originalLineTotal;
            const finalTotal = Math.max(0, baseTotal - appliedItemDiscountDetails.amount);
            return {
                displayLineTotal: finalTotal,
                showDiscountedPrice: true,
                discountDescriptionToShow: appliedItemDiscountDetails.description
            };
        }
        return {
            displayLineTotal: originalLineTotal,
            showDiscountedPrice: false,
            discountDescriptionToShow: null
        };
    }, [appliedItemDiscountDetails, originalLineTotal]);

    const itemVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
        exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
    };

    const itemBgClass = isPreviewMode ? NEUTRAL_BG_ITEM_PREVIEW : NEUTRAL_BG_ITEM;
    const itemName = item.name || (sl.orderItem.unnamedItem || "Unnamed Item");

    const ariaLabel = useMemo(() => {
        const base = interpolate(sl.orderItem.ariaLabel.base, {
            itemName,
            quantity: item.quantity,
            finalPrice: formatCurrency(displayLineTotal)
        }) || `${itemName}, quantity ${item.quantity}, final price ${formatCurrency(displayLineTotal)}`;

        const discount = showDiscountedPrice
            ? interpolate(sl.orderItem.ariaLabel.discounted, {
                originalPrice: formatCurrency(originalLineTotal),
                discountDescription: discountDescriptionToShow || 'special discount'
            }) || ` (discounted from ${formatCurrency(originalLineTotal)}, ${discountDescriptionToShow || 'special discount'})`
            : '';

        return `${base}${discount}`.trim().replace(/\s+/g, ' ');
    }, [itemName, item.quantity, displayLineTotal, originalLineTotal, showDiscountedPrice, discountDescriptionToShow, formatCurrency]);


    if (!item || typeof item.id === 'undefined') return null;

    return (
        <motion.div
            layout
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start ${itemBgClass} ${CARD_PADDING} ${ITEM_CARD_RADIUS} ${ITEM_CARD_SHADOW_BASE} ${ITEM_CARD_HOVER_EFFECT} ${ITEM_CARD_TRANSITION} ${CARD_MARGIN_Y} ${FONT_INTER}`}
            role="listitem"
            aria-label={ariaLabel}
        >
            <div className={`${IMAGE_ICON_CONTAINER_SIZE} ${IMAGE_ICON_RADIUS} ${IMAGE_ICON_MARGIN_RIGHT} flex-shrink-0 border ${NEUTRAL_BORDER} flex items-center justify-center overflow-hidden ${(!item.imageUrl || imageLoadError) ? FALLBACK_ICON_BG : ''}`}>
                {item.imageUrl && !imageLoadError ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImageLoadError(true)} loading="lazy" />
                ) : (
                    <Icon name={FALLBACK_ICON_NAME} className={`${FALLBACK_ICON_SIZE_CLASS} ${FALLBACK_ICON_COLOR}`} aria-hidden="true" />
                )}
            </div>

            <div className="flex-grow min-w-0">
                <h4 className={`font-semibold ${ITEM_NAME_TEXT_SIZE} leading-tight ${NEUTRAL_TEXT_PRIMARY} truncate`} title={itemName}>{itemName}</h4>
                {item.selectedOptionsSummary && <p className={`${ITEM_OPTIONS_TEXT_SIZE} ${NEUTRAL_TEXT_MUTED} mt-0.5 truncate`} title={item.selectedOptionsSummary}>{item.selectedOptionsSummary}</p>}
                <p className={`${ITEM_PRICE_UNIT_TEXT_SIZE} ${NEUTRAL_TEXT_SECONDARY} mt-1`}>{formatCurrency(itemBasePricePerUnit)} {sl.orderItem.unitPrice || "/ unit"}</p>
                {showDiscountedPrice && discountDescriptionToShow && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }} className="mt-1.5 inline-flex items-center">
                        <span className={`${DISCOUNT_BADGE_BG} ${DISCOUNT_BADGE_TEXT} ${DISCOUNT_BADGE_TEXT_SIZE} ${DISCOUNT_BADGE_FONT_WEIGHT} ${DISCOUNT_BADGE_PADDING} rounded-full flex items-center`}>
                            <Icon name="local_offer" className={`${DISCOUNT_BADGE_ICON_SIZE} mr-1`} style={{ fontSize: '0.8rem' }} aria-hidden="true" />
                            {discountDescriptionToShow}
                        </span>
                    </motion.div>
                )}
            </div>

            <div className="flex flex-col items-end space-y-2 ml-2 flex-shrink-0 w-[8.5rem] text-right">
                <div className="flex items-center space-x-2">
                    <motion.button onClick={handleDecrement} disabled={isPreviewMode} className={`disabled:opacity-50 disabled:cursor-not-allowed ${STEPPER_BUTTON_BG} ${STEPPER_BUTTON_TEXT} ${STEPPER_BUTTON_SIZE} ${STEPPER_BUTTON_RADIUS} flex items-center justify-center transition-colors ${STEPPER_BUTTON_BG_HOVER} focus:outline-none ${STEPPER_RING_FOCUS}`} whileTap={{ scale: 0.9 }} aria-label={interpolate(sl.orderItem.decreaseQuantityAriaLabel, { itemName }) || `Decrease quantity of ${itemName}`}>
                        <Icon name="remove" className={STEPPER_BUTTON_ICON_SIZE} style={{ fontSize: '1rem' }} />
                    </motion.button>
                    <span className={`${STEPPER_TEXT_SIZE} font-medium ${NEUTRAL_TEXT_PRIMARY} w-6 text-center tabular-nums`} aria-live="polite" aria-atomic="true">{item.quantity}</span>
                    <motion.button onClick={handleIncrement} disabled={isPreviewMode} className={`disabled:opacity-50 disabled:cursor-not-allowed ${STEPPER_BUTTON_BG} ${STEPPER_BUTTON_TEXT} ${STEPPER_BUTTON_SIZE} ${STEPPER_BUTTON_RADIUS} flex items-center justify-center transition-colors ${STEPPER_BUTTON_BG_HOVER} focus:outline-none ${STEPPER_RING_FOCUS}`} whileTap={{ scale: 0.9 }} aria-label={interpolate(sl.orderItem.increaseQuantityAriaLabel, { itemName }) || `Increase quantity of ${itemName}`}>
                        <Icon name="add" className={STEPPER_BUTTON_ICON_SIZE} style={{ fontSize: '1rem' }} />
                    </motion.button>
                </div>
                <div>
                    {showDiscountedPrice && <del className={`${ITEM_OPTIONS_TEXT_SIZE} ${NEUTRAL_TEXT_MUTED}`} aria-label={interpolate(sl.orderItem.ariaLabelPrice.original, { price: formatCurrency(originalLineTotal) }) || `Original price ${formatCurrency(originalLineTotal)}`}>{formatCurrency(originalLineTotal)}</del>}
                    <p className={`${ITEM_TOTAL_PRICE_TEXT_SIZE} font-bold ${showDiscountedPrice ? DISCOUNT_PRICE_TEXT : NEUTRAL_TEXT_PRIMARY}`} aria-label={interpolate(sl.orderItem.ariaLabelPrice.final, { price: formatCurrency(displayLineTotal) }) || `Current total price ${formatCurrency(displayLineTotal)}`}>{formatCurrency(displayLineTotal)}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default OrderItem;