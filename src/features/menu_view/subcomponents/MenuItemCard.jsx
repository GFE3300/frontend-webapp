// frontend/src/features/menu_view/subcomponents/MenuItemCard.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"; // Added useReducedMotion
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

// Fallback image for MenuItemCard (if primary is missing or fails to load)
// This is different from ProductDetailModal's, as it's smaller and less prominent.
const FALLBACK_PLACEHOLDER_ICON_NAME = "image_not_supported"; // Or "restaurant_menu" / "fastfood"

// Tag Styling Constants (from requirements)
const TAG_PILL_STYLES = "px-1.5 py-0.5 text-xs rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
const TAG_ICON_STYLES = "w-3 h-3 mr-1";
const TAG_CONTAINER_STYLES = "flex flex-wrap items-center justify-center gap-1 my-1.5 max-h-10 overflow-hidden"; // max-h-10 (40px) allows for roughly 2 lines of small tags.
const PLUS_N_MORE_TAG_PILL_STYLES = "px-1.5 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-300 font-medium";


export default function MenuItemCard({ product, onOpenProductDetailModal }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false); // New state for image loading errors
    const imageAnimationStartRef = useRef(null);
    const { theme } = useTheme();
    const shouldReduceMotion = useReducedMotion();

    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const isProductAvailable = product?.is_active !== false;
    const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;

    // Reset imageLoadError when product prop changes
    useEffect(() => {
        setImageLoadError(false);
    }, [product?.image_url, product?.id]); // Reset if image_url or product itself changes

    const handleCardClick = () => {
        if (!isProductAvailable) return;

        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200); 

        const imageRect = imageAnimationStartRef.current
            ? imageAnimationStartRef.current.getBoundingClientRect()
            : null;

        // If no options and product is available, signal quick add intent
        if (!hasOptions && isProductAvailable) {
            onOpenProductDetailModal(product, imageRect, true); // Pass true for quickAddIfNoOptions
        } else {
            onOpenProductDetailModal(product, imageRect, false); // Pass false or undefined otherwise
        }
    };

    const name = product?.name || "Unnamed Product";
    const subtitle = product?.subtitle;
    const description = product?.description && product.description.trim() !== "" ? product.description.trim() : null;
    const effectiveImageUrl = product?.image_url; // Use actual image_url

    const publicTagsToDisplay = useMemo(() =>
        (Array.isArray(product?.product_tags_details) ? product.product_tags_details : [])
            .filter(tag => tag.is_publicly_visible === true)
            .slice(0, 3),
        [product?.product_tags_details]
    );
    
    const totalPublicTagsCount = useMemo(() =>
        (Array.isArray(product?.product_tags_details) ? product.product_tags_details : [])
            .filter(tag => tag.is_publicly_visible === true).length,
        [product?.product_tags_details]
    );
    
    const remainingTagsCount = totalPublicTagsCount - publicTagsToDisplay.length;

    const totalComponentHeight = CARD_CONTENT_HEIGHT_PX + IMAGE_PROTRUSION_PX;

    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.97 },
        animate: {
            opacity: 1, y: 0, scale: 1,
            transition: shouldReduceMotion ? { duration: 0.01 } : { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
        },
        hover: (isProductAvailable && !shouldReduceMotion) ? {
            scale: 1.03, y: -6,
            boxShadow: "0px 14px 28px rgba(0,0,0,0.12), 0px 8px 12px rgba(0,0,0,0.08)",
            transition: { type: "spring", stiffness: 350, damping: 18 }
        } : {},
    };

    const imageVariants = {
        hover: (isProductAvailable && !shouldReduceMotion) ? { scale: 1.08, transition: { type: "spring", stiffness: 350, damping: 15 } } : {}
    };

    const contentBoxVariants = {
        hover: (isProductAvailable && !shouldReduceMotion) ? { y: -3, transition: { type: "spring", stiffness: 350, damping: 18 } } : {}
    };
    
    const unavailableButtonText = "Unavailable";
    const actionButtonText = isProductAvailable ? (hasOptions ? "Options" : "Add") : unavailableButtonText;
    const actionButtonIcon = isProductAvailable ? (hasOptions ? "tune" : "add_shopping_cart") : "block";

    const wavingBgColors = {
        light: ['#F43F5E', '#FDA4AF', '#FECDD3'], 
        dark: ['#E11D48', '#FB7185', '#FECDD3']   
    };
    const currentWaveColors = theme === 'dark' ? wavingBgColors.dark : wavingBgColors.light;

    const focusClasses = "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";
    const unavailableCardClasses = !isProductAvailable ? "opacity-60 filter grayscale cursor-not-allowed" : "cursor-pointer";
    const unavailableButtonBg = "bg-neutral-300 dark:bg-neutral-600";
    const unavailableButtonTextCol = "text-neutral-500 dark:text-neutral-400";

    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover" // Framer Motion will skip animation if transition duration is 0 or variant is empty
            initial="initial" // Apply initial variant
            animate="animate" // Apply animate variant
            className={`relative flex-shrink-0 select-none group font-inter ${unavailableCardClasses} ${isProductAvailable ? focusClasses : ''}`}
            style={{
                width: `${CARD_CONTENT_WIDTH_PX}px`,
                height: `${totalComponentHeight}px`,
            }}
            aria-label={`Menu item: ${name}, price ${displayPrice.toFixed(2)}. ${isProductAvailable ? (hasOptions ? 'Tap to view details and configure options.' : 'Tap to add to order.') : 'This item is currently unavailable.'}`}
            onClick={isProductAvailable ? handleCardClick : undefined}
            role="button"
            tabIndex={isProductAvailable ? 0 : -1}
            onKeyPress={(e) => isProductAvailable && (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
            id={`product-card-${product?.id}`}
        >
            {!shouldReduceMotion && ( // Conditional rendering for WavingBackground
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
            )}

            <motion.div
                className="absolute left-0 right-0"
                style={{
                    top: 0,
                    width: `${CARD_CONTENT_WIDTH_PX}px`,
                    height: `${totalComponentHeight}px`,
                    zIndex: 10,
                }}
                animate={isProductAvailable && isEffectActive && !shouldReduceMotion ? { y: -8, scale: 1.015 } : { y: 0, scale: 1 }}
                transition={shouldReduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 280, damping: 22 }}
            >
                <motion.div
                    ref={imageAnimationStartRef}
                    variants={imageVariants}
                    className={`absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden border-4 ${isProductAvailable ? 'border-white dark:border-neutral-750 group-hover:border-rose-200 dark:group-hover:border-rose-400' : 'border-neutral-300 dark:border-neutral-600'} transition-colors duration-200`}
                    style={{
                        width: `${IMAGE_DIAMETER_PX}px`,
                        height: `${IMAGE_DIAMETER_PX}px`,
                    }}
                >
                    {effectiveImageUrl && !imageLoadError ? (
                        <img
                            src={effectiveImageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={() => setImageLoadError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-600">
                            <Icon name={FALLBACK_PLACEHOLDER_ICON_NAME} className="w-1/2 h-1/2 text-neutral-400 dark:text-neutral-500" />
                        </div>
                    )}
                </motion.div>

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
                        style={{ paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX}px` }}
                    >
                        <h4 className="font-montserrat font-medium text-xl text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug truncate w-full" title={name}>
                            {name}
                        </h4>

                        {subtitle && (
                            <p className="font-inter text-sm text-neutral-700 dark:text-neutral-300 leading-snug mt-0.5 mb-1 truncate w-full" title={subtitle}>
                                {subtitle}
                            </p>
                        )}
                        
                        {description ? (
                            <p
                                className="font-inter text-xs text-neutral-500 dark:text-neutral-400 leading-snug w-full my-1.5 flex-grow"
                                style={{
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    minHeight: 'calc(1.375rem * 2 * 0.75)', 
                                    maxHeight: 'calc(1.375rem * 2 * 0.75)',
                                }}
                                title={description}
                            >
                                {description}
                            </p>
                        ) : (
                            <div className="flex-grow min-h-[calc(1.375rem*2*0.75)] my-1.5" aria-hidden="true"></div>
                        )}

                        {/* Tags Display */}
                        {totalPublicTagsCount > 0 && (
                            <div className={TAG_CONTAINER_STYLES}>
                                {publicTagsToDisplay.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={TAG_PILL_STYLES}
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className={TAG_ICON_STYLES} />}
                                        {tag.name}
                                    </span>
                                ))}
                                {remainingTagsCount > 0 && (
                                    <span
                                        className={PLUS_N_MORE_TAG_PILL_STYLES}
                                        aria-label={`+${remainingTagsCount} more tags`}
                                        title={`+${remainingTagsCount} more tags`}
                                    >
                                        +{remainingTagsCount}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`w-full flex items-end justify-between pt-2 border-t ${isProductAvailable ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-300 dark:border-neutral-600'} mt-auto flex-shrink-0`}>
                        <div className="flex flex-col items-start text-left">
                            {bestDiscountApplied && isProductAvailable ? (
                                <>
                                    <span className="font-inter text-xs line-through text-neutral-400 dark:text-neutral-500">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                    <span className="font-montserrat text-lg font-bold text-red-500 dark:text-red-400 leading-tight">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="font-montserrat text-lg font-bold text-neutral-700 dark:text-neutral-200 leading-tight">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        
                        <div 
                            className={`flex items-center justify-center gap-1.5 shadow-md font-inter font-semibold text-xs py-1.5 px-2.5 rounded-lg pointer-events-none transition-colors duration-150
                                ${isProductAvailable
                                    ? (hasOptions
                                        ? 'bg-sky-500 group-hover:bg-sky-600 dark:bg-sky-600 dark:group-hover:bg-sky-500 text-white' 
                                        : 'bg-rose-500 group-hover:bg-rose-600 dark:bg-rose-600 dark:group-hover:bg-rose-500 text-white' 
                                    )
                                    : `${unavailableButtonBg} ${unavailableButtonTextCol}`
                                }`}
                        >
                            <Icon
                                name={actionButtonIcon}
                                className="w-4 h-4"
                                variations={isProductAvailable ? { fill: 1, weight: 500 } : {}}
                            />
                            <span>{actionButtonText}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}