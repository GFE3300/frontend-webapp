import React, { useState, useEffect, useMemo, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Icon from '../../../components/common/Icon.jsx';
import WavingBackground from "../../../components/animations/WavingLine.jsx";
import { getEffectiveDisplayPrice } from "../utils/productUtils.js";
import { useTheme } from "../../../utils/ThemeProvider.jsx";
import { useCurrency as useCurrency } from "../../../hooks/useCurrency.js"; // Import the new hook

const CARD_CONTENT_WIDTH_PX = 240;
const CARD_CONTENT_HEIGHT_PX = 270;
const IMAGE_DIAMETER_PX = 128;
const IMAGE_PROTRUSION_PX = 48;
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX = (IMAGE_DIAMETER_PX - IMAGE_PROTRUSION_PX) + 12;

const FALLBACK_PLACEHOLDER_ICON_NAME = "image_not_supported";

const TAG_PILL_STYLES = "px-1.5 py-0.5 text-xs rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
const TAG_ICON_STYLES = "w-3 h-3 mr-1";
const TAG_CONTAINER_STYLES = "flex flex-wrap items-center justify-center gap-1 my-1.5 max-h-10 overflow-hidden";
const PLUS_N_MORE_TAG_PILL_STYLES = "px-1.5 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-300 font-medium";

const FOCUS_CLASSES = "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 rounded-2xl";


export default function MenuItemCard({ product, onOpenProductDetailModal }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);
    const imageAnimationStartRef = useRef(null);
    const { theme } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const { formatCurrency } = useCurrency(); // Use the hook here

    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const isProductAvailable = product?.is_active !== false;
    const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;

    useEffect(() => {
        setImageLoadError(false);
    }, [product?.image_url, product?.id]);

    const handleCardClick = () => {
        if (!isProductAvailable) return;
        if (!shouldReduceMotion) { // Only run animation if motion is not reduced
            setIsEffectActive(true);
            setTimeout(() => setIsEffectActive(false), 1200);
        }
        const imageRect = imageAnimationStartRef.current?.getBoundingClientRect() || null;
        onOpenProductDetailModal(product, imageRect, !hasOptions && isProductAvailable);
    };

    const name = product?.name || "Unnamed Product";
    const subtitle = product?.subtitle;
    const description = product?.description?.trim() || null;
    const effectiveImageUrl = product?.image_url;

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
            transition: { type: "spring", stiffness: 350, damping: 18 }
        } : {},
        tap: (isProductAvailable && !shouldReduceMotion) ? { scale: 0.985, y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } } : {},
    };

    const imageVariants = {
        hover: (isProductAvailable && !shouldReduceMotion) ? { scale: 1.08, transition: { type: "spring", stiffness: 350, damping: 15 } } : {}
    };

    const contentBoxVariants = {
        hover: (isProductAvailable && !shouldReduceMotion) ? { y: -3, transition: { type: "spring", stiffness: 350, damping: 18 } } : {}
    };

    const unavailableButtonText = "Unavailable";
    const actionButtonText = isProductAvailable ? (hasOptions ? "View" : "Add") : unavailableButtonText; // Changed for clarity
    const actionButtonIcon = isProductAvailable ? (hasOptions ? "tune" : "add_shopping_cart") : "block";

    const wavingBgColors = theme === 'dark' ? ['#E11D48', '#FB7185', '#FECDD3'] : ['#F43F5E', '#FDA4AF', '#FECDD3'];

    const unavailableCardClasses = !isProductAvailable ? "opacity-60 filter grayscale cursor-not-allowed" : "cursor-pointer";
    const unavailableButtonBg = "bg-neutral-300 dark:bg-neutral-600";
    const unavailableButtonTextCol = "text-neutral-500 dark:text-neutral-400";

    // ARIA Label construction
    let ariaLabel = `
        ${name}, price ${formatCurrency(displayPrice)}. 
        ${!isProductAvailable ? "This item is currently unavailable." : (hasOptions ? "Tap to view details and configure options." : "Tap to add to order.")}
    `.trim().replace(/\s+/g, ' ');

    if (!isProductAvailable) {
        ariaLabel += " This item is currently unavailable.";
    } else if (hasOptions) {
        ariaLabel += " Tap to view details and configure options.";
    } else {
        ariaLabel += " Tap to add to order.";
    }

    return (
        <motion.div
            key={product?.id || 'menu-item-card-fallback'} // Ensure key is present
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap" // Added whileTap for click feedback
            initial="initial"
            animate="animate"
            className={`relative flex-shrink-0 select-none group font-inter ${unavailableCardClasses} ${isProductAvailable ? FOCUS_CLASSES : ''}`}
            style={{
                width: `${CARD_CONTENT_WIDTH_PX}px`,
                height: `${totalComponentHeight}px`,
            }}
            role="button" // ARIA: Role is button as the whole card is clickable
            tabIndex={isProductAvailable ? 0 : -1} // ARIA: Focusable if available, otherwise not
            aria-label={ariaLabel} // ARIA: Comprehensive label
            aria-disabled={!isProductAvailable} // ARIA: Disabled state
            onClick={isProductAvailable ? handleCardClick : undefined}
            onKeyPress={(e) => { // ARIA: Keyboard actionable
                if (isProductAvailable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault(); // Prevent space from scrolling page
                    handleCardClick();
                }
            }}
            id={`product-card-${product?.id}`}
        >
            {!shouldReduceMotion && (
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
                            aria-hidden="true" // Decorative animation
                        >
                            <WavingBackground colors={wavingBgColors} waveOpacity={0.6} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <motion.div
                className="absolute left-0 right-0 overflow-visible"
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
                    aria-hidden="true" // Image is described by the main aria-label
                >
                    {effectiveImageUrl && !imageLoadError ? (
                        <img
                            src={effectiveImageUrl}
                            alt="" // ARIA: Decorative, main card has aria-label
                            className="w-full h-full object-cover"
                            onError={() => setImageLoadError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-600">
                            <Icon name={FALLBACK_PLACEHOLDER_ICON_NAME} className="flex items-center justify-center text-neutral-400 dark:text-neutral-500" style={{ fontSize: '2rem' }} />
                        </div>
                    )}
                </motion.div>

                <motion.div
                    variants={contentBoxVariants}
                    className={`absolute left-0 right-0 bg-white dark:bg-neutral-800 rounded-3xl shadow-lg flex flex-col p-4 ring-1 ${isProductAvailable ? 'ring-neutral-200/70 dark:ring-neutral-700/70 group-hover:ring-rose-300 dark:group-hover:ring-rose-500' : 'ring-neutral-300 dark:ring-neutral-600'} transition-shadow,ring duration-200`}
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
                        {/* Use h4 for product name as it's likely within a section (h3 for category) */}
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

                        {totalPublicTagsCount > 0 && (
                            <div className={TAG_CONTAINER_STYLES} aria-label="Product tags">
                                {publicTagsToDisplay.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={TAG_PILL_STYLES}
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className={TAG_ICON_STYLES} aria-hidden="true" />}
                                        {tag.name}
                                    </span>
                                ))}
                                {remainingTagsCount > 0 && (
                                    <span
                                        className={PLUS_N_MORE_TAG_PILL_STYLES}
                                        aria-label={`and ${remainingTagsCount} more tags`}
                                        title={`+${remainingTagsCount} more tags`}
                                    >
                                        +{remainingTagsCount}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`w-full font-montserrat flex items-end justify-between py-2  mt-auto flex-shrink-0`}>
                        <div className="flex flex-col items-start text-left">
                            {bestDiscountApplied && isProductAvailable ? (
                                <>
                                    <span className="font-inter text-xs line-through text-neutral-400 dark:text-neutral-500" aria-label={`Original price ${formatCurrency(originalPrice)}`}>
                                        {formatCurrency(originalPrice)}
                                    </span>
                                    <span className="font-montserrat text-lg font-bold text-red-500 dark:text-red-400 leading-tight" aria-label={`Discounted price ${formatCurrency(displayPrice)}`}>
                                        {formatCurrency(displayPrice)}
                                    </span>
                                </>
                            ) : (
                                <span className="font-montserrat text-lg font-bold text-neutral-700 dark:text-neutral-200 leading-tight" aria-label={`Price ${formatCurrency(originalPrice)}`}>
                                    {formatCurrency(originalPrice)}
                                </span>
                            )}
                        </div>

                        <div
                            className={`flex items-center justify-center gap-1.5 shadow-md font-inter font-semibold text-xs py-1.5 px-3 rounded-full pointer-events-none transition-colors duration-150
                                ${isProductAvailable
                                    ? (hasOptions
                                        ? 'bg-sky-500 group-hover:bg-sky-600 dark:bg-sky-600 dark:group-hover:bg-sky-500 text-white'
                                        : 'bg-rose-500 group-hover:bg-rose-600 dark:bg-rose-600 dark:group-hover:bg-rose-500 text-white'
                                    )
                                    : `${unavailableButtonBg} ${unavailableButtonTextCol}`
                                }`}
                            aria-hidden="true"
                        >
                            <Icon
                                name={actionButtonIcon}
                                className="w-4 h-4"
                                variations={isProductAvailable ? { fill: 1, weight: 400, grade: 0, opsz: 24 } : {}}
                                style={{ fontSize: '1rem' }}
                            />
                            <span>{actionButtonText}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}