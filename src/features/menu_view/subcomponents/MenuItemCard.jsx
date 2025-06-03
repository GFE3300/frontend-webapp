// frontend/src/features/menu_view/subcomponents/MenuItemCard.jsx
// (Focusing on changes to trigger ProductDetailModal)

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from '../../../components/common/Icon.jsx';
import WavingBackground from "../../../components/animations/WavingLine.jsx";
import { getEffectiveDisplayPrice } from "../utils/productUtils.js";
import { useTheme } from "../../../utils/ThemeProvider.jsx";

// Constants for card layout
const CARD_CONTENT_WIDTH_PX = 240;
const CARD_CONTENT_HEIGHT_PX = 270;
const IMAGE_DIAMETER_PX = 128;
const IMAGE_PROTRUSION_PX = 48;
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX = (IMAGE_DIAMETER_PX - IMAGE_PROTRUSION_PX) + 12;

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&q=60';

/**
 * Displays a single menu item card.
 * @param {object} product - The product object.
 * @param {function} onOpenProductDetailModal - Callback: (product, imageRect) => void; Renamed from onOpenOptionsPopup
 */
export default function MenuItemCard({ product, onOpenProductDetailModal }) { // Prop renamed
    const [isEffectActive, setIsEffectActive] = useState(false);
    const imageAnimationStartRef = useRef(null);
    const { theme } = useTheme();

    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const handleCardClick = () => {
        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200);

        // The imageRect is kept here in case a future animation needs it.
        // For now, ProductDetailModal doesn't use it for its opening animation.
        const imageRect = imageAnimationStartRef.current 
            ? imageAnimationStartRef.current.getBoundingClientRect() 
            : null;
            
        // Call the new handler to open ProductDetailModal
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

    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.97 },
        animate: {
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
        },
        hover: {
            scale: 1.03, y: -6,
            boxShadow: "0px 14px 28px rgba(0,0,0,0.12), 0px 8px 12px rgba(0,0,0,0.08)",
            transition: { type: "spring", stiffness: 350, damping: 18 }
        }
    };

    const imageVariants = {
        hover: { scale: 1.08, transition: { type: "spring", stiffness: 350, damping: 15 } }
    };

    const contentBoxVariants = {
        hover: { y: -3, transition: { type: "spring", stiffness: 350, damping: 18 } }
    };

    // Determine if the product has configurable options to adjust button text/icon
    // The modal will handle all configuration, but the button text can reflect this.
    const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;

    const wavingBgColors = {
        light: ['#F43F5E', '#FDA4AF', '#FECDD3'],
        dark: ['#E11D48', '#F472B6', '#FDA4AF']
    };
    const currentWaveColors = theme === 'dark' ? wavingBgColors.dark : wavingBgColors.light;


    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative flex-shrink-0 select-none cursor-pointer group font-inter"
            style={{
                width: `${CARD_CONTENT_WIDTH_PX}px`,
                height: `${totalComponentHeight}px`,
            }}
            aria-label={`Menu item: ${name}, price ${displayPrice.toFixed(2)}. Tap to view details${hasOptions ? ' and configure options.' : '.'}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
            id={`product-card-${product?.id}`}
        >
            <AnimatePresence>
                {isEffectActive && (
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
                animate={isEffectActive ? { y: -8, scale: 1.015 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
                <motion.div
                    ref={imageAnimationStartRef}
                    variants={imageVariants}
                    className="absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-750 group-hover:border-rose-200 dark:group-hover:border-rose-600 transition-colors duration-200"
                    style={{
                        width: `${IMAGE_DIAMETER_PX}px`,
                        height: `${IMAGE_DIAMETER_PX}px`,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
                        loading="lazy"
                    />
                </motion.div>

                <motion.div
                    variants={contentBoxVariants}
                    className="absolute left-0 right-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex flex-col p-4 ring-1 ring-neutral-200/60 dark:ring-neutral-700/60 group-hover:ring-rose-300 dark:group-hover:ring-rose-500 transition-shadow,ring duration-200"
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
                        <h4 className="font-montserrat font-medium text-xl text-neutral-800 dark:text-white tracking-tight leading-tight truncate w-full" title={name}>
                            {name}
                        </h4>

                        {subtitle && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug mt-0.5 mb-1 truncate w-full" title={subtitle}>
                                {subtitle}
                            </p>
                        )}

                        {description ? (
                            <p
                                className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug w-full my-1.5 flex-grow"
                                style={{
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    minHeight: 'calc(1.4em * 2)', 
                                    maxHeight: 'calc(1.4em * 2)',
                                }}
                                title={description}
                            >
                                {description}
                            </p>
                        ) : (
                            <div className="flex-grow min-h-[calc(1.4em*2)] my-1.5" aria-hidden="true"></div>
                        )}

                        {publicTags.length > 0 && (
                            <div className="flex flex-wrap justify-center items-center gap-1 my-1.5 max-h-[46px] overflow-hidden flex-shrink-0">
                                {publicTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className="font-medium text-[10px] bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap"
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className="w-2.5 h-2.5" />}
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full flex items-end justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-auto flex-shrink-0">
                        <div className="flex flex-col items-start text-left">
                            {bestDiscountApplied ? (
                                <>
                                    <span className="font-montserrat text-xs line-through text-neutral-400 dark:text-neutral-500">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                    <span className="font-montserrat text-lg font-bold text-red-600 dark:text-red-400 leading-tight">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="font-montserrat text-lg font-bold text-neutral-700 dark:text-neutral-200">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        
                        {/* Button text indicates if options are available or if it's a direct "Add" action (though now all go to modal) */}
                        <div
                            className={`flex items-center justify-center gap-1.5 shadow-md text-white font-montserrat font-semibold text-xs py-1.5 px-2.5 rounded-lg pointer-events-none transition-colors duration-150
                                ${hasOptions 
                                    ? 'bg-sky-500 group-hover:bg-sky-600 dark:bg-sky-600 dark:group-hover:bg-sky-500' // Sky for "Options"
                                    : 'bg-rose-500 group-hover:bg-rose-600 dark:bg-rose-600 dark:group-hover:bg-rose-500' // Rose for "View" or "Add"
                                }`}
                        >
                            <Icon
                                name={hasOptions ? "tune" : "visibility"} // Changed to "visibility" if no options, indicating "View Details"
                                className="w-3.5 h-3.5" 
                                variations={{ fill: 1, weight: 500 }}
                            />
                            {/* Button text changed to "View" if no options, "Options" if options exist */}
                            <span>{hasOptions ? "Options" : "View"}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}