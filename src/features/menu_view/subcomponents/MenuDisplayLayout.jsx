// frontend/src/features/menu_view/subcomponents/MenuDisplayLayout.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard';
import HorizontalScroll from './HorizontalScroll';
import Icon from '../../../components/common/Icon.jsx';
import Spinner from '../../../components/common/Spinner.jsx';

// Constants for desktop layout (if needed, though MenuItemCard defines its own size)
// const DESKTOP_CARD_CONTENT_WIDTH_APPROX = 240; // From MenuItemCard.jsx
// const DESKTOP_CARD_TOTAL_HEIGHT_APPROX = 270 + 48; // CARD_CONTENT_HEIGHT_PX + IMAGE_PROTRUSION_PX from MenuItemCard.jsx
const DESKTOP_VERTICAL_SPACING_BETWEEN_PAIRED_ITEMS = 'space-y-5'; // Tailwind class for vertical spacing (approx 20px)

// Helper to chunk array for desktop layout (2 items per "column" in horizontal scroll)
const chunkArray = (array, chunkSize) => {
    const chunks = [];
    if (!array || !Array.isArray(array) || chunkSize <= 0) return chunks;
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] } },
    out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] } },
};

const categorySectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const categoryHeaderVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.4, ease: "easeOut" } },
};

const itemsContainerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15, duration: 0.4, ease: "easeOut" } },
};

const DEFAULT_CATEGORY_DETAILS = {
    name: "Uncategorized",
    color_class: "bg-neutral-500 dark:bg-neutral-600", // Neutral default
    icon_name: "label", // A generic icon
    display_order: 9999, // Ensure it appears last if mixed with sorted categories
    items: []
};

/**
 * Displays a list of products, categorized and sorted.
 *
 * @param {object} categorizedProducts - An object where keys are category IDs and values are
 *                                     category objects including an 'items' array of products.
 * @param {function} onOpenOptionsPopup - Callback function (product, imageRect) => void;
 * @param {boolean} isFiltered - True if filters/search are active resulting in the current product list.
 * @param {boolean} isFetchingWhileFiltered - True if data is being fetched due to filter/search changes (not initial load).
 */
function MenuDisplayLayout({ categorizedProducts, onOpenOptionsPopup, isFiltered, isFetchingWhileFiltered }) {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024); // lg breakpoint

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sortedCategoriesToRender = useMemo(() => {
        if (!categorizedProducts || typeof categorizedProducts !== 'object' || Object.keys(categorizedProducts).length === 0) {
            return [];
        }
        // The Userpage.jsx already sorts categories based on their original display_order.
        // Here, we just filter out categories that ended up with no items after all product filtering.
        return Object.values(categorizedProducts).filter(cat => cat.items && cat.items.length > 0);
    }, [categorizedProducts]);


    if (isFetchingWhileFiltered) {
        return (
            <div className="relative min-h-[calc(100vh-300px)]"> {/* Ensure it takes up space */}
                {/* Dimming overlay */}
                <div className="absolute inset-0 bg-slate-100/50 dark:bg-neutral-900/50 z-10 backdrop-blur-sm transition-opacity duration-300"></div>
                {/* Centered Spinner */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Spinner size="lg" message="Updating menu..." />
                </div>
                 {/* Render a faint version of the current content below the spinner if desired */}
                 {/* This might be complex to implement if sortedCategoriesToRender is also changing */}
                 {/* For now, just the spinner over a blurred background */}
            </div>
        );
    }

    if (sortedCategoriesToRender.length === 0) {
        const message = isFiltered
            ? "No menu items match your current selection."
            : "Menu Not Available"; // This case should ideally be rare if the business has products.
        const iconName = isFiltered ? "search_off" : "sentiment_very_dissatisfied";

        return (
            <motion.div
                initial="initial" animate="in" exit="out"
                variants={pageVariants}
                className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[calc(100vh-300px)]" // Adjusted min-height to allow space for header/filters
                aria-live="polite"
            >
                <Icon name={iconName} className="w-20 h-20 text-neutral-400 dark:text-neutral-500 mb-5" />
                <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    {isFiltered ? "No Results" : "Menu Empty"}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
                    {message}
                    {isFiltered && " Try adjusting your search or filters."}
                    {!isFiltered && " It seems there are no items on the menu at this moment. Please check back later or ask our staff for assistance."}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="menuDisplayLayout" // Added key for consistent animation if layout itself changes structure drastically
            initial="initial" animate="in" exit="out"
            variants={pageVariants}
            className="pb-16 lg:pb-6" // Padding for BottomNav on mobile
        >
            {sortedCategoriesToRender.map((categoryDetailsFull) => {
                // Ensure defaults are applied if categoryDetailsFull is missing some properties
                const categoryDetails = { ...DEFAULT_CATEGORY_DETAILS, ...categoryDetailsFull };

                let iconTextColorClass = "text-white dark:text-white";
                const color = categoryDetails.color_class || "";
                
                // Simplified check: if color_class includes a low Tailwind intensity or common light color names
                const lightBgKeywords = ['-50', '-100', '-200', '-300', 'white', 'yellow', 'lime', 'amber', 'cyan', 'sky'];
                if (lightBgKeywords.some(keyword => color.includes(keyword)) && !color.includes('black') && !color.includes('gray-800')) { // Avoid matching 'text-white' itself as a light bg
                    iconTextColorClass = "text-neutral-700 dark:text-neutral-800";
                }


                return (
                    <motion.section
                        key={categoryDetails.id} // Use the actual category ID as key
                        className="mb-10 last:mb-0"
                        variants={categorySectionVariants}
                        initial="initial"
                        whileInView="animate" 
                        viewport={{ once: true, amount: 0.1 }} 
                        aria-labelledby={`category-title-${categoryDetails.id}`}
                    >
                        <motion.div
                            variants={categoryHeaderVariants} 
                            className="px-4 md:px-6 mb-3 sm:mb-4 flex items-center"
                        >
                            <span className={`mr-2.5 sm:mr-3 p-2 rounded-lg shadow-sm ${categoryDetails.color_class} flex items-center justify-center`}>
                                <Icon name={categoryDetails.icon_name} className={`w-5 h-5 sm:w-6 sm:h-6 ${iconTextColorClass}`} aria-hidden="true" />
                            </span>
                            <h3
                                id={`category-title-${categoryDetails.id}`}
                                className="font-montserrat font-semibold text-2xl text-neutral-800 dark:text-neutral-100"
                            >
                                {categoryDetails.name}
                            </h3>
                        </motion.div>

                        <motion.div variants={itemsContainerVariants}>
                            <HorizontalScroll className="pl-4 pr-2 md:pl-6 md:pr-4">
                                {isDesktop ? (
                                    chunkArray(categoryDetails.items, 2).map((itemPair, pairIndex) => (
                                        <div
                                            key={`pair-${pairIndex}-${categoryDetails.id}`}
                                            className={`flex flex-col ${DESKTOP_VERTICAL_SPACING_BETWEEN_PAIRED_ITEMS}`}
                                            // MenuItemCard itself defines its width. This container just arranges them.
                                        >
                                            {itemPair.map(product => (
                                                <MenuItemCard
                                                    key={product.id} 
                                                    product={product}
                                                    onOpenOptionsPopup={onOpenOptionsPopup}
                                                />
                                            ))}
                                            {itemPair.length === 1 && (
                                                // Maintain layout consistency for the last item in a pair
                                                // Render an invisible placeholder that occupies the same space as a MenuItemCard
                                                // The MenuItemCard width is CARD_CONTENT_WIDTH_PX, height is totalComponentHeight
                                                // We need to ensure this placeholder does not interfere with interactions.
                                                <div
                                                    style={{
                                                        width: '240px', // From MenuItemCard constant
                                                        height: `${270 + 48}px`, // From MenuItemCard constants
                                                    }}
                                                    className="opacity-0 pointer-events-none flex-shrink-0"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    categoryDetails.items.map((product) => (
                                        <MenuItemCard
                                            key={product.id}
                                            product={product}
                                            onOpenOptionsPopup={onOpenOptionsPopup}
                                        />
                                    ))
                                )}
                            </HorizontalScroll>
                        </motion.div>
                    </motion.section>
                );
            })}
        </motion.div>
    );
}

export default MenuDisplayLayout;