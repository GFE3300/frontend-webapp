// frontend/src/features/menu_view/subcomponents/TagFilterPills.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import HorizontalScroll from './HorizontalScroll';

// Color Palette (Guideline 2.1, 6.10 Tags & Pills)
// Pills often use a lighter accent or neutral background.
// Using sky-100/sky-700 for inactive from example, rose for active.
const PILL_ACTIVE_BG = "bg-rose-500"; // Primary accent for active
const PILL_ACTIVE_TEXT = "text-white";
const PILL_ACTIVE_RING_FOCUS = "focus-visible:ring-rose-300 dark:focus-visible:ring-rose-600";

const PILL_INACTIVE_BG = "bg-sky-100 dark:bg-neutral-700"; // Example from guideline 6.10 (bg-sky-100)
const PILL_INACTIVE_TEXT = "text-sky-700 dark:text-neutral-300"; // Example (text-sky-700)
const PILL_INACTIVE_HOVER_BG = "hover:bg-sky-200 dark:hover:bg-neutral-600";
const PILL_INACTIVE_HOVER_TEXT = "hover:text-sky-800 dark:hover:text-neutral-200";
const PILL_INACTIVE_RING_FOCUS = "focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"; // Sky accent for focus

const ICON_INACTIVE_COLOR = "text-sky-600 dark:text-neutral-400"; // Matches text color
const ICON_INACTIVE_HOVER_COLOR = "group-hover:text-sky-700 dark:group-hover:text-neutral-200";
const ICON_ACTIVE_COLOR = "text-white"; // Icon color on active pill

const SKELETON_BG_PILL = "bg-neutral-200 dark:bg-neutral-700"; // Same as CategoryFilterBar
const SKELETON_ELEMENT_BG_PILL = "bg-neutral-300 dark:bg-neutral-600";

const ERROR_TEXT_COLOR = "text-red-500 dark:text-red-400";

// Typography (Guideline 2.2, 6.10 Tags & Pills)
const FONT_INTER = "font-inter";
const PILL_TEXT_SIZE = "text-xs"; // Body Extra Small (12px)
const PILL_FONT_WEIGHT = "font-medium"; // Inter Medium

// Iconography (Guideline 2.3)
const ICON_SIZE_PILL = "w-3.5 h-3.5"; // Slightly smaller for pills (14px or 12px if text-xs)

// Borders & Corner Radii (Guideline 2.6, 6.10 Tags & Pills)
const PILL_RADIUS = "rounded-full"; // Pills are fully rounded

// Spacing (Guideline 3.2, 6.10 Tags & Pills)
const PILL_PADDING_Y = "py-1";    // 4px (px-2 py-0.5 in guideline, using py-1 for slightly more height)
const PILL_PADDING_X = "px-2.5";  // 10px (guideline has px-2, using 2.5 for better balance with icon)
const ICON_MARGIN_RIGHT_PILL = "mr-1.5"; // 6px

// Skeleton Pill component
const SkeletonTagPill = () => (
    <div className={`flex items-center justify-center ${PILL_PADDING_Y} ${PILL_PADDING_X} ${PILL_RADIUS} ${SKELETON_BG_PILL} animate-pulse`}>
        <div className={`w-3 h-3 ${ICON_MARGIN_RIGHT_PILL} ${SKELETON_ELEMENT_BG_PILL} rounded-full`}></div>
        <div className={`h-3 w-12 ${SKELETON_ELEMENT_BG_PILL} rounded`}></div>
    </div>
);


const TagPill = React.memo(({ tag, isActive, onToggle }) => {
    const pillVariants = { // Animation Guideline 4.2 Microinteractions
        tap: { scale: 0.96 }
    };
    const baseClasses = `group flex items-center justify-center ${PILL_PADDING_Y} ${PILL_PADDING_X} ${PILL_RADIUS} cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${FONT_INTER} ${PILL_TEXT_SIZE} ${PILL_FONT_WEIGHT}`;
    
    let stateSpecificClasses = "";
    let iconColorClass = "";

    if (isActive) {
        stateSpecificClasses = `${PILL_ACTIVE_BG} ${PILL_ACTIVE_TEXT} shadow-sm ${PILL_ACTIVE_RING_FOCUS}`; // Active pills have subtle shadow-sm
        iconColorClass = ICON_ACTIVE_COLOR;
    } else {
        stateSpecificClasses = `${PILL_INACTIVE_BG} ${PILL_INACTIVE_TEXT} ${PILL_INACTIVE_HOVER_BG} ${PILL_INACTIVE_HOVER_TEXT} ${PILL_INACTIVE_RING_FOCUS}`;
        iconColorClass = `${ICON_INACTIVE_COLOR} ${ICON_INACTIVE_HOVER_COLOR}`;
    }

    return (
        <motion.button
            variants={pillVariants}
            whileTap="tap"
            onClick={() => onToggle(tag.id)}
            className={`${baseClasses} ${stateSpecificClasses}`}
            role="checkbox" // Guideline 7: ARIA (checkbox for toggleable filter)
            aria-checked={isActive}
            id={`tag-filter-${tag.id}`}
            title={tag.name || "Tag"}
        >
            {tag.icon_name && (
                <Icon name={tag.icon_name} className={`${ICON_SIZE_PILL} ${ICON_MARGIN_RIGHT_PILL} transition-colors duration-150 ${iconColorClass}`} />
            )}
            <span className="whitespace-nowrap transition-colors duration-150">
                {tag.name}
            </span>
        </motion.button>
    );
});
TagPill.displayName = 'TagPill';

function TagFilterPills({ 
    tagsData = [], 
    activeTagIds = [], 
    onToggleTag,
    isLoading,
    isError,
    error
}) {
    // Animation Variants (Guideline 4.1, 4.3)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { y: 8, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 110 } }
    };
    
    // Skeleton state and inline error (Guideline 4.5 Feedback)
    if (isLoading) {
        const skeletonCount = 4;
        return (
            <div className="py-2"> {/* Consistent padding with content state */}
                <HorizontalScroll className="pb-2">
                    <div className="flex items-center space-x-2 px-4" aria-label="Loading tags..." role="toolbar"> {/* Spacing Guideline 3.2 (8px) */}
                        {Array.from({ length: skeletonCount }).map((_, index) => (
                            <SkeletonTagPill key={`skeleton-tag-${index}`} />
                        ))}
                    </div>
                </HorizontalScroll>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-2 px-4 text-center">
                <p className={`${PILL_TEXT_SIZE} ${ERROR_TEXT_COLOR} flex items-center justify-center`}>
                    <Icon name="error_outline" className="w-4 h-4 mr-1.5" /> {/* Guideline 2.3 Small icon */}
                    Could not load tags. {error?.message ? `(${error.message.substring(0,50)}${error.message.length > 50 ? '...' : ''})` : ''}
                </p>
            </div>
        );
    }
    
    if (!tagsData || tagsData.length === 0) {
        return null; // Render nothing if no tags, consistent with previous behavior
    }

    return (
        <div className="py-2"> {/* Standard vertical padding */}
            <HorizontalScroll className="pb-2">
                <motion.div
                    className="flex items-center space-x-2 px-4" // Guideline 3.2 Spacing (8px between pills)
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="toolbar" // Guideline 7: ARIA (toolbar for a set of toggle buttons)
                    aria-label="Filter by tags"
                >
                    {tagsData.map(tag => (
                        <motion.div key={tag.id} variants={itemVariants}>
                            <TagPill
                                tag={tag}
                                isActive={activeTagIds.includes(tag.id)}
                                onToggle={onToggleTag}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </HorizontalScroll>
        </div>
    );
}

export default TagFilterPills;