import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence for potential future use
import MenuItemCard from './MenuItemCard';
import HorizontalScroll from './HorizontalScroll';
import Icon from '../../../components/common/Icon'; // Path from frontend.txt structure

// Constants for desktop layout (if different from MenuItemCard's own constants)
const DESKTOP_CARD_CONTENT_WIDTH_APPROX = 240; // Approximate width of MenuItemCard for chunking logic

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
    animate: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2, duration: 0.4, ease: "easeOut" } },
};


// Default category details if any are missing from the backend/data processing
const DEFAULT_CATEGORY_DETAILS = {
    name: "Uncategorized",
    color_class: "bg-neutral-500 dark:bg-neutral-600", // Neutral fallback color
    icon_name: "label", // Default icon
    display_order: 999, // Default to last
};

/**
 * Displays a list of products, categorized and sorted.
 * Handles different layouts for mobile (horizontal scroll per category)
 * and desktop (chunked horizontal scroll per category).
 *
 * @param {object} categorizedProducts - An object where keys are category IDs and values are
 *                                     category objects including an 'items' array of products.
 *                                     Example: { cat_uuid: { id, name, color_class, icon_name, display_order, items: [product1, product2] } }
 * @param {function} onOpenOptionsPopup - Callback function (product, imageRect) => void;
 * @param {string} [pageTitle] - Optional title for the menu page.
 */
function MenuDisplayLayout({ categorizedProducts, onOpenOptionsPopup, pageTitle = "Our Menu" }) {
    // Determine if running on desktop based on window width.
    // This could also be passed as a prop or determined via a context for better SSR/testing.
    const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 1024); // lg breakpoint

    React.useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!categorizedProducts || Object.keys(categorizedProducts).length === 0) {
        return (
            <motion.div
                initial="initial" animate="in" exit="out"
                variants={pageVariants}
                className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[calc(100vh-250px)]" // Adjusted min-height
                aria-live="polite"
            >
                <Icon name="sentiment_very_dissatisfied" className="w-20 h-20 text-neutral-400 dark:text-neutral-500 mb-5" />
                <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Menu Not Available
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
                    It seems there are no items on the menu at this moment. Please check back later or ask our staff for assistance.
                </p>
            </motion.div>
        );
    }

    // Sort categories by their display_order before rendering
    const sortedCategoriesToRender = Object.values(categorizedProducts)
        .map(cat => ({ ...DEFAULT_CATEGORY_DETAILS, ...cat })) // Ensure all categories have default fields
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    return (
        <motion.div
            key="menuDisplayLayout" // Key for AnimatePresence if used in parent
            initial="initial" animate="in" exit="out"
            variants={pageVariants}
            // Padding: pt-0 as Userpage provides top padding. pb-16 for mobile (BottomNav space), lg:pb-6 for desktop
            className="pb-16 lg:pb-6"
        >
            {/* Page title can be part of Userpage.jsx's header, or passed here if needed */}
            {/* <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 text-center px-4 font-montserrat">
                {pageTitle}
            </h1> */}

            {sortedCategoriesToRender.map((categoryDetails) => {
                if (!categoryDetails.items || categoryDetails.items.length === 0) {
                    return null; // Skip rendering categories with no items
                }

                // Items within a category are assumed to be pre-sorted by `categorizedProducts` memo in Userpage.jsx

                // Determine icon text color based on background for accessibility
                let iconTextColorClass = "text-white dark:text-white"; // Default for darker backgrounds
                const color = categoryDetails.color_class || "";
                if (color.includes("-50") || color.includes("-100") || color.includes("-200") ||
                    color.includes("yellow") || color.includes("lime") || color.includes("amber") ||
                    color.includes("white") || color.includes("slate-50") || color.includes("gray-50")) {
                    iconTextColorClass = "text-neutral-700 dark:text-neutral-800"; // For very light backgrounds
                } else if (color.includes("-300") || color.includes("-400")) {
                     // For mid-range light backgrounds, might need dark text
                    iconTextColorClass = "text-neutral-800 dark:text-neutral-100";
                }


                return (
                    <motion.section
                        key={categoryDetails.id}
                        className="mb-10 last:mb-0"
                        variants={categorySectionVariants}
                        initial="initial"
                        whileInView="animate" // Animate when section scrolls into view
                        viewport={{ once: true, amount: 0.1 }} // Trigger animation once, when 10% visible
                        aria-labelledby={`category-title-${categoryDetails.id}`}
                    >
                        <motion.div
                            variants={categoryHeaderVariants}
                            className="px-4 md:px-6 mb-3 sm:mb-4 flex items-center"
                        >
                            <span className={`mr-2.5 sm:mr-3 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-sm ${categoryDetails.color_class} flex items-center justify-center`}>
                                <Icon name={categoryDetails.icon_name} className={`w-4 h-4 sm:w-5 sm:h-5 ${iconTextColorClass}`} aria-hidden="true" />
                            </span>
                            <h2
                                id={`category-title-${categoryDetails.id}`}
                                className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-100"
                            >
                                {categoryDetails.name}
                            </h2>
                        </motion.div>

                        <motion.div variants={itemsContainerVariants}>
                            <HorizontalScroll className="pl-4 pr-2 md:pl-6 md:pr-4">
                                {isDesktop ? (
                                    chunkArray(categoryDetails.items, 2).map((itemPair, pairIndex) => (
                                        <div key={`pair-${pairIndex}-${categoryDetails.id}`} className="flex flex-col space-y-5">
                                            {itemPair.map(product => (
                                                <MenuItemCard
                                                    key={product.id}
                                                    product={product}
                                                    onOpenOptionsPopup={onOpenOptionsPopup}
                                                />
                                            ))}
                                            {/* Placeholder to maintain layout if last pair has only one item */}
                                            {itemPair.length === 1 && (
                                                <div style={{ width: DESKTOP_CARD_CONTENT_WIDTH_APPROX, height: 1 }} aria-hidden="true" className="opacity-0 pointer-events-none"></div>
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