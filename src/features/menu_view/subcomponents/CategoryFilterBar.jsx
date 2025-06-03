// frontend/src/features/menu_view/subcomponents/CategoryFilterBar.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import HorizontalScroll from './HorizontalScroll';

// Color Palette (Guideline 2.1)
const CHIP_ACTIVE_BG = "bg-rose-500"; // Primary accent for active
const CHIP_ACTIVE_TEXT = "text-white";
const CHIP_ACTIVE_RING_FOCUS = "focus-visible:ring-rose-300 dark:focus-visible:ring-rose-600"; // Darker rose for dark mode focus

const CHIP_INACTIVE_BG = "bg-neutral-100 dark:bg-neutral-700";
const CHIP_INACTIVE_TEXT = "text-neutral-700 dark:text-neutral-300";
const CHIP_INACTIVE_HOVER_BG = "hover:bg-rose-50 dark:hover:bg-rose-500/10"; // Light rose for hover
const CHIP_INACTIVE_HOVER_TEXT = "hover:text-rose-600 dark:hover:text-rose-400";
const CHIP_INACTIVE_RING_FOCUS = "focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500";

const ICON_INACTIVE_COLOR = "text-neutral-500 dark:text-neutral-400";
const ICON_INACTIVE_HOVER_COLOR = "group-hover:text-rose-500 dark:group-hover:text-rose-300";
const ICON_ACTIVE_COLOR = "text-white"; // Icon color on active chip

const SKELETON_BG = "bg-neutral-200 dark:bg-neutral-700";
const SKELETON_ELEMENT_BG = "bg-neutral-300 dark:bg-neutral-600";

const BODY_TEXT_SMALL = "text-sm";

const ERROR_TEXT_COLOR = "text-red-500 dark:text-red-400"; // Semantic error color

// Typography (Guideline 2.2)
const FONT_INTER = "font-inter";
const CHIP_TEXT_SIZE = "text-sm"; // Body Medium (14px)
const CHIP_FONT_WEIGHT = "font-medium"; // Inter Medium

// Iconography (Guideline 2.3)
const ICON_SIZE_CHIP = "w-4 h-4"; // Small icon

// Shadows & Elevation (Guideline 2.5)
const CHIP_ACTIVE_SHADOW = "shadow-md";
const CHIP_INACTIVE_SHADOW = "shadow-sm";

// Borders & Corner Radii (Guideline 2.6)
const CHIP_RADIUS = "rounded-lg"; // Standard radius for button-like elements

// Spacing (Guideline 3.2) - Based on Tailwind
const CHIP_PADDING_Y = "py-2"; // 8px
const CHIP_PADDING_X = "px-4"; // 16px
const ICON_MARGIN_RIGHT = "mr-2"; // 8px

const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";


// Skeleton Chip component
const SkeletonCategoryChip = () => (
    <div className={`flex items-center justify-center ${CHIP_PADDING_Y} ${CHIP_PADDING_X} ${CHIP_RADIUS} ${SKELETON_BG} animate-pulse`}>
        <div className={`w-4 h-4 ${ICON_MARGIN_RIGHT} ${SKELETON_ELEMENT_BG} rounded-full`}></div>
        <div className={`h-4 w-16 ${SKELETON_ELEMENT_BG} rounded`}></div>
    </div>
);

const CategoryChip = React.memo(({ category, isActive, onSelect }) => {
    const chipVariants = { // Animation Guideline 4.2 Microinteractions
        tap: { scale: 0.97 }
    };
    const baseClasses = `group flex items-center justify-center ${CHIP_PADDING_Y} ${CHIP_PADDING_X} ${CHIP_RADIUS} cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${FONT_INTER} ${CHIP_TEXT_SIZE} ${CHIP_FONT_WEIGHT}`;
    
    let stateSpecificClasses = "";
    let iconColorClass = "";

    if (isActive) {
        stateSpecificClasses = `${CHIP_ACTIVE_BG} ${CHIP_ACTIVE_TEXT} ${CHIP_ACTIVE_SHADOW} ${CHIP_ACTIVE_RING_FOCUS}`;
        iconColorClass = ICON_ACTIVE_COLOR;
    } else {
        stateSpecificClasses = `${CHIP_INACTIVE_BG} ${CHIP_INACTIVE_TEXT} ${CHIP_INACTIVE_SHADOW} ${CHIP_INACTIVE_HOVER_BG} ${CHIP_INACTIVE_HOVER_TEXT} ${CHIP_INACTIVE_RING_FOCUS}`;
        iconColorClass = `${ICON_INACTIVE_COLOR} ${ICON_INACTIVE_HOVER_COLOR}`;
    }

    return (
        <motion.button
            variants={chipVariants}
            whileTap="tap"
            onClick={() => onSelect(category.id)}
            className={`${baseClasses} ${stateSpecificClasses}`}
            role="tab" // Guideline 7: ARIA for tab-like interface
            aria-selected={isActive}
            aria-controls={isActive ? "category-content-panel" : undefined} // Assuming a content panel it controls
            id={`category-tab-${category.id === null ? 'all' : category.id}`}
            title={category.name || "Category"}
        >
            {category.icon_name && (
                <Icon name={category.icon_name} className={`${ICON_SIZE_CHIP} ${ICON_MARGIN_RIGHT} transition-colors duration-150 ${iconColorClass}`} />
            )}
            <span className="whitespace-nowrap transition-colors duration-150">
                {category.name}
            </span>
        </motion.button>
    );
});
CategoryChip.displayName = 'CategoryChip';


function CategoryFilterBar({ 
    categoriesData = [], 
    activeCategoryId, 
    onSelectCategory,
    isLoading,
    isError,
    error
}) {
    const allCategory = { id: null, name: 'All', icon_name: 'apps' }; // Guideline 2.3 for default icon

    const displayCategories = isLoading || isError || !categoriesData || categoriesData.length === 0
        ? []
        : [allCategory, ...categoriesData];

    // Animation Variants (Guideline 4.1, 4.3)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
    };

    // Skeleton state and inline error (Guideline 4.5 Feedback)
    if (isLoading) {
        const skeletonCount = 5;
        return (
            <div className="py-2"> {/* Consistent padding with content state */}
                <HorizontalScroll className="pb-2">
                    <div className="flex items-center space-x-2.5 px-4" aria-label="Loading categories..." role="toolbar"> {/* Spacing Guideline 3.2 (10px) */}
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
                <p className={`${BODY_TEXT_SMALL} ${ERROR_TEXT_COLOR} flex items-center justify-center`}>
                    <Icon name="error_outline" className="w-4 h-4 mr-1.5" /> {/* Guideline 2.3 Small icon */}
                    Could not load categories. {error?.message ? `(${error.message.substring(0,50)}${error.message.length > 50 ? '...' : ''})` : ''}
                </p>
            </div>
        );
    }

    if (!categoriesData || categoriesData.length === 0) {
        return (
            <div className="py-2 px-4 text-center">
                <p className={`${BODY_TEXT_SMALL} ${NEUTRAL_TEXT_MUTED}`}>
                    No categories available.
                </p>
            </div>
        );
    }

    return (
        <div className="py-2"> {/* Standard vertical padding */}
            <HorizontalScroll className="pb-2"> {/* Padding for scrollbar visibility if needed */}
                <motion.div
                    className="flex items-center space-x-2.5 px-4" // Guideline 3.2 Spacing (10px between chips)
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="tablist" // Guideline 7: ARIA for tab-like interface
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