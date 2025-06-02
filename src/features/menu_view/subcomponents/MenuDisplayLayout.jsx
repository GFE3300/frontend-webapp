// frontend/src/features/menu_view/subcomponents/MenuDisplayLayout.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard';
import HorizontalScroll from './HorizontalScroll';
import Icon from '../../../components/common/Icon.jsx';
import Spinner from '../../../components/common/Spinner.jsx'; // Added for loading state

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
    display_order: 9999,
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
        return Object.values(categorizedProducts).filter(cat => cat.items && cat.items.length > 0);
        // Userpage.jsx now handles the primary sorting and creation of categorizedProducts object
        // Here we just convert to array and ensure items exist for rendering the category.
    }, [categorizedProducts]);


    if (isFetchingWhileFiltered) {
        return (
            <div className="relative min-h-[calc(100vh-300px)]"> {/* Ensure it takes up space */}
                {/* Dimming overlay */}
                <div className="absolute inset-0 bg-slate-100/50 dark:bg-neutral-900/50 z-10 backdrop-blur-sm"></div>
                {/* Centered Spinner */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Spinner size="lg" message="Updating menu..." />
                </div>
                 {/* Optionally, render a faint version of the current content below the spinner if desired */}
            </div>
        );
    }

    if (sortedCategoriesToRender.length === 0) {
        const message = isFiltered
            ? "No menu items match your current selection."
            : "Menu Not Available";
        const iconName = isFiltered ? "search_off" : "sentiment_very_dissatisfied";

        return (
            <motion.div
                initial="initial" animate="in" exit="out"
                variants={pageVariants}
                className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[calc(100vh-300px)]" // Adjusted min-height
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
            key="menuDisplayLayout"
            initial="initial" animate="in" exit="out"
            variants={pageVariants}
            className="pb-16 lg:pb-6" // Padding for BottomNav on mobile
        >
            {sortedCategoriesToRender.map((categoryDetailsFull) => {
                const categoryDetails = { ...DEFAULT_CATEGORY_DETAILS, ...categoryDetailsFull };

                // Determine icon text color based on category background for contrast
                // This is a simplified heuristic. For perfect contrast, a more robust solution
                // (like calculating luminance) or pre-defined text colors per bg color might be needed.
                let iconTextColorClass = "text-white dark:text-white"; // Default for dark backgrounds
                const color = categoryDetails.color_class || "";
                // Check for light background keywords (Tailwind intensity levels 50-300 usually light)
                if (/\b(white|gray-50|slate-50|neutral-50|stone-50|red-50|orange-50|amber-50|yellow-50|lime-50|green-50|emerald-50|teal-50|cyan-50|sky-50|blue-50|indigo-50|violet-50|purple-50|fuchsia-50|pink-50|rose-50)\b/.test(color) ||
                    /\b(gray-100|slate-100|neutral-100|stone-100|red-100|orange-100|amber-100|yellow-100|lime-100|green-100|emerald-100|teal-100|cyan-100|sky-100|blue-100|indigo-100|violet-100|purple-100|fuchsia-100|pink-100|rose-100)\b/.test(color) ||
                    /\b(gray-200|slate-200|neutral-200|stone-200|red-200|orange-200|amber-200|yellow-200|lime-200|green-200|emerald-200|teal-200|cyan-200|sky-200|blue-200|indigo-200|violet-200|purple-200|fuchsia-200|pink-200|rose-200)\b/.test(color) ||
                    /\b(gray-300|slate-300|neutral-300|stone-300|red-300|orange-300|amber-300|yellow-300|lime-300|green-300|emerald-300|teal-300|cyan-300|sky-300|blue-300|indigo-300|violet-300|purple-300|fuchsia-300|pink-300|rose-300)\b/.test(color)
                ) {
                    iconTextColorClass = "text-neutral-700 dark:text-neutral-800"; // Dark text for light backgrounds
                }


                return (
                    <motion.section
                        key={categoryDetails.id}
                        className="mb-10 last:mb-0"
                        variants={categorySectionVariants}
                        initial="initial"
                        whileInView="animate" // Animate when section comes into view
                        viewport={{ once: true, amount: 0.1 }} // Trigger animation once, when 10% visible
                        aria-labelledby={`category-title-${categoryDetails.id}`}
                    >
                        <motion.div
                            variants={categoryHeaderVariants} // Apply header animation
                            className="px-4 md:px-6 mb-3 sm:mb-4 flex items-center"
                        >
                            {/* Icon Background and Icon - Guidelines: Iconography (size Medium w-5/h-5 or w-6/h-6) */}
                            <span className={`mr-2.5 sm:mr-3 p-2 rounded-lg shadow-sm ${categoryDetails.color_class} flex items-center justify-center`}>
                                <Icon name={categoryDetails.icon_name} className={`w-5 h-5 sm:w-6 sm:h-6 ${iconTextColorClass}`} aria-hidden="true" />
                            </span>
                            {/* Category Title - Guidelines: Typography (H3 Montserrat SemiBold 24px) */}
                            <h3
                                id={`category-title-${categoryDetails.id}`}
                                className="font-montserrat font-semibold text-2xl text-neutral-800 dark:text-neutral-100"
                            >
                                {categoryDetails.name}
                            </h3>
                        </motion.div>

                        <motion.div variants={itemsContainerVariants}> {/* Apply container animation for item staggering */}
                            <HorizontalScroll className="pl-4 pr-2 md:pl-6 md:pr-4">
                                {isDesktop ? (
                                    chunkArray(categoryDetails.items, 2).map((itemPair, pairIndex) => (
                                        <div
                                            key={`pair-${pairIndex}-${categoryDetails.id}`}
                                            className={`flex flex-col ${DESKTOP_VERTICAL_SPACING_BETWEEN_PAIRED_ITEMS}`}
                                            // style={{ minWidth: `${DESKTOP_CARD_CONTENT_WIDTH_APPROX}px` }} // MenuItemCard controls its own width now
                                        >
                                            {itemPair.map(product => (
                                                <MenuItemCard
                                                    key={product.id} // Each card has a unique product ID
                                                    product={product}
                                                    onOpenOptionsPopup={onOpenOptionsPopup}
                                                />
                                            ))}
                                            {/* Placeholder for consistent layout if last pair has one item */}
                                            {itemPair.length === 1 && (
                                                <div
                                                    // style={{
                                                    //     width: `${DESKTOP_CARD_CONTENT_WIDTH_APPROX}px`,
                                                    //     height: `${DESKTOP_CARD_TOTAL_HEIGHT_APPROX}px`,
                                                    // }} // Placeholder matches MenuItemCard dimensions
                                                    className="opacity-0 pointer-events-none"
                                                    aria-hidden="true"
                                                >
                                                    {/* Render an invisible structure similar to MenuItemCard if exact height matching is critical */}
                                                </div>
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