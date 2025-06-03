// frontend/src/features/menu_view/subcomponents/CategoryFilterBar.jsx
// (Focusing on adding skeleton state and inline error handling)

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import HorizontalScroll from './HorizontalScroll';
// No Spinner needed here as it's a very light skeleton.

const CategoryChip = React.memo(({ category, isActive, onSelect }) => {
    const chipVariants = {
        tap: { scale: 0.97 }
    };
    const baseClasses = "group flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";

    let activeStateClasses = "";
    let inactiveStateClasses = "";
    let iconColorClass = "";

    if (isActive) {
        activeStateClasses = "bg-rose-500 text-white shadow-md focus-visible:ring-rose-300 dark:focus-visible:ring-rose-600";
        iconColorClass = "text-white";
    } else {
        inactiveStateClasses = "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500";
        iconColorClass = "text-neutral-500 dark:text-neutral-400 group-hover:text-rose-500 dark:group-hover:text-rose-300";
    }

    return (
        <motion.button
            variants={chipVariants}
            whileTap="tap"
            onClick={() => onSelect(category.id)}
            className={`${baseClasses} ${isActive ? activeStateClasses : inactiveStateClasses}`}
            role="tab"
            aria-selected={isActive}
            title={category.name || "Category"}
        >
            {category.icon_name && (
                <Icon name={category.icon_name} className={`w-4 h-4 mr-2 transition-colors duration-150 ${iconColorClass}`} />
            )}
            <span className="font-inter font-medium text-sm whitespace-nowrap transition-colors duration-150">
                {category.name}
            </span>
        </motion.button>
    );
});
CategoryChip.displayName = 'CategoryChip';

// NEW: Skeleton Chip component
const SkeletonCategoryChip = () => (
    <div className="flex items-center justify-center py-2 px-4 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse">
        <div className="w-4 h-4 mr-2 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
        <div className="h-4 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
    </div>
);


/**
 * A horizontally scrollable bar of category filter chips.
 * @param {object} props
 * @param {Array<object>} props.categoriesData - Array of category objects.
 * @param {string|null} props.activeCategoryId - The ID of the currently active category.
 * @param {function} props.onSelectCategory - Callback (categoryId: string | null) => void.
 * @param {boolean} props.isLoading - NEW: True if categories are loading.
 * @param {boolean} props.isError - NEW: True if there was an error loading categories.
 * @param {object|null} props.error - NEW: The error object if isError is true.
 */
function CategoryFilterBar({
    categoriesData = [],
    activeCategoryId,
    onSelectCategory,
    isLoading,      // NEW PROP
    isError,        // NEW PROP
    error           // NEW PROP
}) {
    // "All" category is always first.
    const allCategory = { id: null, name: 'All', icon_name: 'apps' };

    const displayCategories = isLoading || isError || !categoriesData || categoriesData.length === 0
        ? [] // Don't compute if loading/error or no data
        : [allCategory, ...categoriesData]; // Assuming categoriesData is already sorted

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
    };

    // TASK 2.3.2 & 2.3.4: Skeleton state and inline error
    if (isLoading) {
        const skeletonCount = 5; // Display a few skeleton chips
        return (
            <div className="py-2">
                <HorizontalScroll className="pb-2">
                    <div className="flex items-center space-x-2.5 px-4" aria-label="Loading categories...">
                        {Array.from({ length: skeletonCount }).map((_, index) => (
                            <SkeletonCategoryChip key={`skeleton-cat-${index}`} />
                        ))}
                    </div>
                </HorizontalScroll>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-2 px-4 text-center">
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center justify-center">
                    <Icon name="error_outline" className="w-4 h-4 mr-1.5" />
                    Could not load categories. {error?.message ? `(${error.message.substring(0, 50)}${error.message.length > 50 ? '...' : ''})` : ''}
                </p>
            </div>
        );
    }

    if (!categoriesData || categoriesData.length === 0) {
        // Render nothing or a subtle placeholder if no categories are available and not loading/error.
        // This implies an empty successful fetch. Userpage handles broader "menu empty" states.
        return (
            <div className="py-2 px-4 text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    No categories available.
                </p>
            </div>
        );
    }

    return (
        <div className="py-2">
            <HorizontalScroll className="pb-2">
                <motion.div
                    className="flex items-center space-x-2.5 px-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="tablist"
                    aria-label="Filter by category"
                >
                    {displayCategories.map(category => (
                        <motion.div key={category.id === null ? 'all-categories-filter' : category.id} variants={itemVariants}>
                            <CategoryChip
                                category={category}
                                isActive={activeCategoryId === category.id}
                                onSelect={onSelectCategory}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </HorizontalScroll>
        </div>
    );
}

export default CategoryFilterBar;