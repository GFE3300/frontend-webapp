// frontend/src/features/menu_view/subcomponents/MenuItemCard.jsx

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from '../../../components/common/Icon.jsx';
import WavingBackground from "../../../components/animations/WavingLine.jsx";
import { getEffectiveDisplayPrice } from "../utils/productUtils.js";
import { useTheme } from "../../../utils/ThemeProvider.jsx";

// Constants for card layout (kept from original, assumed to be deliberate design choices)
const CARD_CONTENT_WIDTH_PX = 240;
const CARD_CONTENT_HEIGHT_PX = 270;
const IMAGE_DIAMETER_PX = 128;
const IMAGE_PROTRUSION_PX = 48; // results in image top being -48px relative to card content top
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX = (IMAGE_DIAMETER_PX - IMAGE_PROTRUSION_PX) + 12; // 80 + 12 = 92px

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&q=60';

/**
 * Displays a single menu item card.
 * @param {object} product - The product object.
 * @param {function} onOpenProductDetailModal - Callback: (product, imageRect) => void;
 */
export default function MenuItemCard({ product, onOpenProductDetailModal }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const imageAnimationStartRef = useRef(null);
    const { theme } = useTheme();

    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const isProductAvailable = product?.is_active !== false;

    const handleCardClick = () => {
        if (!isProductAvailable) return;

        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200); // Duration of waving effect

        const imageRect = imageAnimationStartRef.current
            ? imageAnimationStartRef.current.getBoundingClientRect()
            : null;

        onOpenProductDetailModal(product, imageRect);
    };

    const name = product?.name || "Unnamed Product";
    const subtitle = product?.subtitle;
    const description = product?.description && product.description.trim() !== "" ? product.description.trim() : null;
    const imageUrl = product?.image_url || FALLBACK_IMAGE_URL;

    const publicTags = useMemo(() =>
        (Array.isArray(product?.product_tags_details) ? product.product_tags_details : [])
            .filter(tag => tag.is_publicly_visible === true)
            .slice(0, 3),
        [product?.product_tags_details]
    );

    const totalComponentHeight = CARD_CONTENT_HEIGHT_PX + IMAGE_PROTRUSION_PX;

    // Card Animation Variants (Guideline 4.1, 4.2)
    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.97 },
        animate: {
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
        },
        hover: isProductAvailable ? {
            scale: 1.03, y: -6,
            boxShadow: "0px 14px 28px rgba(0,0,0,0.12), 0px 8px 12px rgba(0,0,0,0.08)", // Retained custom shadow
            transition: { type: "spring", stiffness: 350, damping: 18 }
        } : {},
    };

    const imageVariants = {
        hover: isProductAvailable ? { scale: 1.08, transition: { type: "spring", stiffness: 350, damping: 15 } } : {}
    };

    const contentBoxVariants = {
        hover: isProductAvailable ? { y: -3, transition: { type: "spring", stiffness: 350, damping: 18 } } : {}
    };

    const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;

    // Colors for Waving Background (Guideline 1: Engaging, 2.1: Rose Theme)
    const wavingBgColors = {
        light: ['#F43F5E', '#FDA4AF', '#FECDD3'], // rose-500, rose-300, rose-200
        dark: ['#E11D48', '#FB7185', '#FECDD3']   // rose-600, rose-400, rose-200 (using rose-400 for dark mode primary accent)
    };
    const currentWaveColors = theme === 'dark' ? wavingBgColors.dark : wavingBgColors.light;

    // Focus state styling (Guideline 4.4, 7)
    const focusClasses = "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";

    // Unavailable state styling (Guideline 4.4, Task 3.3)
    const unavailableCardClasses = !isProductAvailable ? "opacity-60 filter grayscale cursor-not-allowed" : "cursor-pointer";
    const unavailableButtonText = "Unavailable";
    // Disabled button state bg (Guideline 4.4 using neutral-400/500 range)
    const unavailableButtonBg = "bg-neutral-300 dark:bg-neutral-600";
    const unavailableButtonTextCol = "text-neutral-500 dark:text-neutral-400";

    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            className={`relative flex-shrink-0 select-none group font-inter ${unavailableCardClasses} ${isProductAvailable ? focusClasses : ''}`}
            style={{
                width: `${CARD_CONTENT_WIDTH_PX}px`,
                height: `${totalComponentHeight}px`,
            }}
            aria-label={`Menu item: ${name}, price ${displayPrice.toFixed(2)}. ${isProductAvailable ? (hasOptions ? 'Tap to view details and configure options.' : 'Tap to view details.') : 'This item is currently unavailable.'}`}
            onClick={isProductAvailable ? handleCardClick : undefined}
            role="button"
            tabIndex={isProductAvailable ? 0 : -1}
            onKeyPress={(e) => isProductAvailable && (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
            id={`product-card-${product?.id}`}
        >
            <AnimatePresence>
                {isEffectActive && isProductAvailable && (
                    <motion.div
                        className="absolute rounded-2xl overflow-hidden pointer-events-none"
                        style={{
                            left: 0, right: 0,
                            top: `${IMAGE_PROTRUSION_PX}px`,
                            height: `${CARD_CONTENT_HEIGHT_PX}px`,
                            width: `${CARD_CONTENT_WIDTH_PX}px`,
                            zIndex: 5,
                        }}
                        initial={{ opacity: 0, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.8 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        <WavingBackground colors={currentWaveColors} waveOpacity={0.6} />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="absolute left-0 right-0"
                style={{
                    top: 0,
                    width: `${CARD_CONTENT_WIDTH_PX}px`,
                    height: `${totalComponentHeight}px`,
                    zIndex: 10,
                }}
                animate={isProductAvailable && isEffectActive ? { y: -8, scale: 1.015 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
                {/* Product Image (Guideline 2.4, 2.6) */}
                <motion.div
                    ref={imageAnimationStartRef}
                    variants={imageVariants}
                    className={`absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden border-4 ${isProductAvailable ? 'border-white dark:border-neutral-750 group-hover:border-rose-200 dark:group-hover:border-rose-400' : 'border-neutral-300 dark:border-neutral-600'} transition-colors duration-200`}
                    style={{
                        width: `${IMAGE_DIAMETER_PX}px`,
                        height: `${IMAGE_DIAMETER_PX}px`,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={name} // Guideline 7
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
                        loading="lazy"
                    />
                </motion.div>

                {/* Content Box (Guideline 2.1, 2.5, 2.6, 3.2) */}
                <motion.div
                    variants={contentBoxVariants}
                    className={`absolute left-0 right-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex flex-col p-4 ring-1 ${isProductAvailable ? 'ring-neutral-200/70 dark:ring-neutral-700/70 group-hover:ring-rose-300 dark:group-hover:ring-rose-500' : 'ring-neutral-300 dark:ring-neutral-600'} transition-shadow,ring duration-200`}
                    style={{
                        top: `${IMAGE_PROTRUSION_PX}px`,
                        height: `${CARD_CONTENT_HEIGHT_PX}px`,
                        width: `${CARD_CONTENT_WIDTH_PX}px`,
                    }}
                >
                    <div
                        className="w-full flex flex-col items-center text-center flex-1 min-h-0"
                        style={{ paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX}px` }} // Spacing from guideline 3.2 (92px)
                    >
                        {/* Product Name (Guideline 2.2 Typography - H4: Montserrat Medium, 20px, Line Height 1.4) */}
                        <h4 className="font-montserrat font-medium text-xl text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug truncate w-full" title={name}>
                            {name}
                        </h4>

                        {/* Subtitle (Guideline 2.2 Typography - Body Small: Inter Regular, 14px, Line Height 1.4) */}
                        {subtitle && (
                            <p className="font-inter text-sm text-neutral-700 dark:text-neutral-300 leading-snug mt-0.5 mb-1 truncate w-full" title={subtitle}>
                                {subtitle}
                            </p>
                        )}

                        {/* Description (Guideline 2.2 Typography - Body Small: Inter Regular, 14px, Line Height 1.4. Using text-xs for compactness) */}
                        {description ? (
                            <p
                                className="font-inter text-xs text-neutral-500 dark:text-neutral-400 leading-snug w-full my-1.5 flex-grow" // text-xs (12px), leading-snug (~1.375)
                                style={{
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    minHeight: 'calc(1.375rem * 2 * 0.75)', // Approx height for 2 lines of text-xs
                                    maxHeight: 'calc(1.375rem * 2 * 0.75)',
                                }}
                                title={description}
                            >
                                {description}
                            </p>
                        ) : (
                            <div className="flex-grow min-h-[calc(1.375rem*2*0.75)] my-1.5" aria-hidden="true"></div>
                        )}

                        {/* Tags (Guideline 2.2 Typography - Body Extra Small: Inter Medium, 12px, LH 1.3; 2.3 Icons; 2.6 Radii; 6.10 Pills) */}
                        {publicTags.length > 0 && (
                            <div className="flex flex-wrap justify-center items-center gap-1 my-1.5 max-h-10 overflow-hidden flex-shrink-0"> {/* max-h-10 (40px) from spacing scale */}
                                {publicTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`font-inter font-medium text-xs bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap leading-tight`} // rounded-md (6px), leading-tight (1.25)
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className="w-3 h-3" />} {/* Icon size 12px */}
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer: Price & Action Button (Guideline 3.2 Spacing, 2.2 Typography, 6.1 Buttons) */}
                    <div className={`w-full flex items-end justify-between pt-2 border-t ${isProductAvailable ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-300 dark:border-neutral-600'} mt-auto flex-shrink-0`}>
                        {/* Price (Guideline 2.2 Typography) */}
                        <div className="flex flex-col items-start text-left">
                            {bestDiscountApplied && isProductAvailable ? (
                                <>
                                    {/* Original Price: Body Extra Small, Inter Regular */}
                                    <span className="font-inter text-xs line-through text-neutral-400 dark:text-neutral-500">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                    {/* Discounted Price: Montserrat Bold, 18px, Semantic Color Red */}
                                    <span className="font-montserrat text-lg font-bold text-red-500 dark:text-red-400 leading-tight">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                /* Normal Price: Montserrat Bold, 18px */
                                <span className="font-montserrat text-lg font-bold text-neutral-700 dark:text-neutral-200 leading-tight">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Action Button (Guideline 6.1 Buttons, 2.3 Iconography) */}
                        <div // This is a div styled like a button because card is clickable
                            className={`flex items-center justify-center gap-1.5 shadow-md font-inter font-semibold text-xs py-1.5 px-2.5 rounded-lg pointer-events-none transition-colors duration-150
                                ${isProductAvailable
                                    ? (hasOptions
                                        ? 'bg-sky-500 group-hover:bg-sky-600 dark:bg-sky-600 dark:group-hover:bg-sky-500 text-white' // Sky-500 for "Options"
                                        : 'bg-rose-500 group-hover:bg-rose-600 dark:bg-rose-600 dark:group-hover:bg-rose-500 text-white' // Rose-500 for "View" (Primary Action)
                                    )
                                    : `${unavailableButtonBg} ${unavailableButtonTextCol}` // Disabled styles
                                }`}
                        >
                            <Icon
                                name={isProductAvailable ? (hasOptions ? "tune" : "visibility") : "block"} // Icon for state
                                className="w-4 h-4" // Small icon (16px)
                                // Guideline 2.3: Outlined preferred, Filled for active. Here, it's more about action type.
                                // Default icon component behavior (likely outlined) should be fine.
                                variations={isProductAvailable ? { fill: 1, weight: 500 } : {}} // For Material Symbols if filled variant is desired.
                            />
                            {/* Button Text (Guideline 2.2 Typography - Inter Semibold, text-xs) */}
                            <span>{isProductAvailable ? (hasOptions ? "Options" : "View") : unavailableButtonText}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}