import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import HorizontalScroll from './HorizontalScroll';

const CategoryChip = React.memo(({ category, isActive, onSelect }) => {
    const chipVariants = {
        tap: { scale: 0.97 } // Subtle tap effect
    };

    // Styling based on design_guidelines.txt
    // Active: Rose-500 bg, white text, shadow-md
    // Inactive: Neutral-100/Dark:Neutral-700 bg, Neutral-700/Dark:Neutral-300 text
    // Hover (Inactive): Rose-50/Dark:Rose-500/10 bg, Rose-600/Dark:Rose-400 text
    const baseClasses = "group flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";
    
    let activeStateClasses = "";
    let inactiveStateClasses = "";
    let iconColorClass = "";

    if (isActive) {
        activeStateClasses = "bg-rose-500 text-white shadow-md focus-visible:ring-rose-300 dark:focus-visible:ring-rose-600";
        iconColorClass = "text-white"; // Icon color for active state
    } else {
        inactiveStateClasses = "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500";
        iconColorClass = "text-neutral-500 dark:text-neutral-400 group-hover:text-rose-500 dark:group-hover:text-rose-300"; // Icon color for inactive state
    }

    return (
        <motion.button
            variants={chipVariants}
            whileTap="tap"
            onClick={() => onSelect(category.id)} // category.id will be null for "All"
            className={`${baseClasses} ${isActive ? activeStateClasses : inactiveStateClasses}`}
            role="tab"
            aria-selected={isActive}
            title={category.name || "Category"}
        >
            {category.icon_name && (
                // Icon Size Small (Guidelines 6.7) - w-4 h-4 is 1rem
                <Icon name={category.icon_name} className={`w-4 h-4 mr-2 transition-colors duration-150 ${iconColorClass}`} />
            )}
            {/* Typography: Body Small (Inter Medium, 14px) */}
            <span className="font-inter font-medium text-sm whitespace-nowrap transition-colors duration-150">
                {category.name}
            </span>
        </motion.button>
    );
});
CategoryChip.displayName = 'CategoryChip';


/**
 * A horizontally scrollable bar of category filter chips.
 * @param {object} props
 * @param {Array<object>} props.categoriesData - Array of category objects { id, name, icon_name, display_order, color_class? }.
 * @param {string|null} props.activeCategoryId - The ID of the currently active category.
 * @param {function} props.onSelectCategory - Callback (categoryId: string | null) => void.
 */
function CategoryFilterBar({ categoriesData = [], activeCategoryId, onSelectCategory }) {
    if (!categoriesData || categoriesData.length === 0) {
        // Render nothing or a subtle placeholder if no categories are available.
        // For now, returning null as Userpage will show spinner/error for data loading.
        return null;
    }

    // "All" category is always first. Its ID is `null` to signify no specific category filter.
    const allCategory = { id: null, name: 'All', icon_name: 'apps' }; // Using 'apps' or 'category' for "All"

    // Combine "All" with sorted categoriesData. Userpage.jsx should provide sorted categories.
    const displayCategories = [
        allCategory,
        ...categoriesData // Assuming categoriesData is already sorted by Userpage.jsx
    ];

    // Animation variants for the container and individual chips
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05, // Stagger animation for each chip
                delayChildren: 0.1,   // Small delay before starting stagger
            }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
    };


    return (
        // py-2 for vertical padding around the HorizontalScroll component itself
        <div className="py-2">
            <HorizontalScroll className="pb-2"> {/* pb-2 for some space below scroll track if needed */}
                <motion.div
                    className="flex items-center space-x-2.5 px-4" // px-4 for start/end padding, space-x for inter-chip spacing
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="tablist" // Appropriate role for a set of filter tabs
                    aria-label="Filter by category"
                >
                    {displayCategories.map(category => (
                        <motion.div key={category.id === null ? 'all-categories-filter' : category.id} variants={itemVariants}>
                             <CategoryChip
                                category={category}
                                isActive={activeCategoryId === category.id} // `null === null` will correctly activate "All"
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