// frontend/src/features/menu_view/subcomponents/MenuDisplayLayout.jsx
// (Focusing on adding skeleton loaders and enhancing empty/error states)

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard';
import HorizontalScroll from './HorizontalScroll';
import Icon from '../../../components/common/Icon.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import SkeletonProductCard from '../../../components/loaders/SkeletonProductCard.jsx'; // Import skeleton

// Constants for desktop layout
const DESKTOP_VERTICAL_SPACING_BETWEEN_PAIRED_ITEMS = 'space-y-5';

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
    color_class: "bg-neutral-500 dark:bg-neutral-600",
    icon_name: "label",
    display_order: 9999,
    items: []
};

/**
 * Displays a list of products, categorized and sorted.
 *
 * @param {object} categorizedProducts - An object where keys are category IDs and values are
 *                                     category objects including an 'items' array of products.
 * @param {function} onOpenProductDetailModal - Callback function (product, imageRect) => void;
 * @param {boolean} isFiltered - True if filters/search are active.
 * @param {boolean} isFetchingWhileFiltered - True if data is being fetched due to filter/search changes.
 * @param {boolean} isLoadingProductsInitial - True if products are loading for the first time. NEW PROP
 */
function MenuDisplayLayout({
    categorizedProducts,
    onOpenProductDetailModal,
    isFiltered,
    isFetchingWhileFiltered,
    isLoadingProductsInitial // NEW PROP for initial loading state
}) {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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
    }, [categorizedProducts]);

    // TASK 2.3.1: Skeleton Loaders for MenuDisplayLayout.jsx
    if (isLoadingProductsInitial && !isFetchingWhileFiltered) { // Show skeletons only on initial load
        const skeletonCount = isDesktop ? 6 : 3; // Show more skeletons on desktop due to pairing
        const skeletonCategory = {
            id: 'skeleton-cat',
            name: 'Loading Cuisine...',
            color_class: 'bg-neutral-300 dark:bg-neutral-700',
            icon_name: 'restaurant_menu',
            items: Array(skeletonCount).fill(null) // Dummy items for skeleton cards
        };

        return (
            <motion.div
                key="menuDisplayLayoutSkeleton"
                initial="initial" animate="in" exit="out"
                variants={pageVariants}
                className="pb-16 lg:pb-6"
            >
                <motion.section
                    key={skeletonCategory.id}
                    className="mb-10 last:mb-0"
                    variants={categorySectionVariants}
                    initial="initial"
                    animate="animate" // animate directly without whileInView for initial load
                    aria-labelledby={`category-title-${skeletonCategory.id}`}
                >
                    <motion.div
                        variants={categoryHeaderVariants}
                        className="px-4 md:px-6 mb-3 sm:mb-4 flex items-center"
                    >
                        <span className={`mr-2.5 sm:mr-3 p-2 rounded-lg shadow-sm ${skeletonCategory.color_class} flex items-center justify-center animate-pulse`}>
                            <Icon name={skeletonCategory.icon_name} className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
                        </span>
                        <div className="h-7 w-1/2 bg-neutral-300 dark:bg-neutral-700 rounded animate-pulse"></div>
                    </motion.div>

                    <motion.div variants={itemsContainerVariants}>
                        <HorizontalScroll className="pl-4 pr-2 md:pl-6 md:pr-4">
                            {isDesktop ? (
                                chunkArray(skeletonCategory.items, 2).map((_, pairIndex) => (
                                    <div
                                        key={`skeleton-pair-${pairIndex}`}
                                        className={`flex flex-col ${DESKTOP_VERTICAL_SPACING_BETWEEN_PAIRED_ITEMS}`}
                                    >
                                        <SkeletonProductCard />
                                        <SkeletonProductCard />
                                    </div>
                                ))
                            ) : (
                                skeletonCategory.items.map((_, index) => (
                                    <SkeletonProductCard key={`skeleton-item-${index}`} />
                                ))
                            )}
                        </HorizontalScroll>
                    </motion.div>
                </motion.section>
            </motion.div>
        );
    }


    if (isFetchingWhileFiltered) {
        return (
            <div className="relative min-h-[calc(100vh-300px)]">
                <div className="absolute inset-0 bg-slate-100/50 dark:bg-neutral-900/50 z-10 backdrop-blur-sm transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    {/* Changed spinner message to be more generic */}
                    <Spinner size="lg" message="Loading..." />
                </div>
            </div>
        );
    }

    // TASK 2.3.3: Enhanced Empty/Error States
    if (sortedCategoriesToRender.length === 0) {
        const message = isFiltered
            ? "No menu items match your current selection."
            : "The menu is currently unavailable."; // Slightly more direct
        const iconName = isFiltered ? "search_off" : "sentiment_very_dissatisfied"; // Using "search_off" for no results
        const suggestionText = isFiltered
            ? "Try adjusting your search or filters, or explore all items."
            : "Please check back later or ask our staff for assistance.";

        return (
            <motion.div
                initial="initial" animate="in" exit="out"
                variants={pageVariants}
                className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[calc(100vh-350px)]" // Adjusted min-height slightly
                aria-live="polite"
            >
                <Icon name={iconName} className="w-20 h-20 md:w-24 md:h-24 text-neutral-400 dark:text-neutral-500 mb-6" />
                <h2 className="text-2xl md:text-3xl font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
                    {isFiltered ? "No Results Found" : "Menu Empty"}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-2 text-sm md:text-base">
                    {message}
                </p>
                <p className="text-neutral-400 dark:text-neutral-500 max-w-md text-xs md:text-sm">
                    {suggestionText}
                </p>
                {/* Optionally, a button to clear filters if isFiltered is true */}
                {isFiltered && (
                    <button
                        // onClick={() => { /* Add logic to clear filters via Userpage callback */ }}
                        className="mt-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-colors text-sm"
                    >
                        Clear Filters
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            key="menuDisplayLayout"
            initial="initial" animate="in" exit="out"
            variants={pageVariants}
            className="pb-16 lg:pb-6"
        >
            {sortedCategoriesToRender.map((categoryDetailsFull) => {
                const categoryDetails = { ...DEFAULT_CATEGORY_DETAILS, ...categoryDetailsFull };
                let iconTextColorClass = "text-white dark:text-white";
                const color = categoryDetails.color_class || "";
                const lightBgKeywords = ['-50', '-100', '-200', '-300', 'white', 'yellow', 'lime', 'amber', 'cyan', 'sky'];
                if (lightBgKeywords.some(keyword => color.includes(keyword)) && !color.includes('black') && !color.includes('gray-800')) {
                    iconTextColorClass = "text-neutral-700 dark:text-neutral-800";
                }

                return (
                    <motion.section
                        key={categoryDetails.id}
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
                                        >
                                            {itemPair.map(product => (
                                                <MenuItemCard
                                                    key={product.id}
                                                    product={product}
                                                    onOpenProductDetailModal={onOpenProductDetailModal} // Ensure this prop name matches what Userpage passes
                                                />
                                            ))}
                                            {itemPair.length === 1 && (
                                                <div
                                                    style={{ width: '240px', height: `${270 + 48}px` }}
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
                                            onOpenProductDetailModal={onOpenProductDetailModal} // Ensure this prop name matches
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