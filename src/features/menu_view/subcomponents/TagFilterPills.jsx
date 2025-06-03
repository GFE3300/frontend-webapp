// frontend/src/features/menu_view/subcomponents/TagFilterPills.jsx
// (Focusing on adding skeleton state and inline error handling)

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import HorizontalScroll from './HorizontalScroll';

const TagPill = React.memo(({ tag, isActive, onToggle }) => {
    const pillVariants = {
        tap: { scale: 0.96 }
    };
    const baseClasses = "group flex items-center justify-center px-3 py-1 rounded-full cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";
    let stateSpecificClasses = "";
    let iconColorClass = "";

    if (isActive) {
        stateSpecificClasses = "bg-rose-500 text-white focus-visible:ring-rose-300 dark:focus-visible:ring-rose-600";
        iconColorClass = "text-white";
    } else {
        stateSpecificClasses = "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500";
        iconColorClass = "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200";
    }

    return (
        <motion.button
            variants={pillVariants}
            whileTap="tap"
            onClick={() => onToggle(tag.id)}
            className={`${baseClasses} ${stateSpecificClasses}`}
            role="checkbox"
            aria-checked={isActive}
            title={tag.name || "Tag"}
        >
            {tag.icon_name && (
                <Icon name={tag.icon_name} className={`w-3.5 h-3.5 mr-1.5 transition-colors duration-150 ${iconColorClass}`} />
            )}
            <span className={`font-inter font-medium text-xs whitespace-nowrap transition-colors duration-150`}>
                {tag.name}
            </span>
        </motion.button>
    );
});
TagPill.displayName = 'TagPill';

// NEW: Skeleton Pill component for Tags
const SkeletonTagPill = () => (
    <div className="flex items-center justify-center px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse">
        <div className="w-3 h-3 mr-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
        <div className="h-3 w-12 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
    </div>
);

/**
 * A horizontally scrollable list of tag filter pills.
 * @param {object} props
 * @param {Array<object>} props.tagsData - Array of tag objects.
 * @param {Array<string>} props.activeTagIds - Array of IDs of currently active tags.
 * @param {function} props.onToggleTag - Callback (tagId: string) => void.
 * @param {boolean} props.isLoading - NEW: True if tags are loading.
 * @param {boolean} props.isError - NEW: True if there was an error loading tags.
 * @param {object|null} props.error - NEW: The error object if isError is true.
 */
function TagFilterPills({
    tagsData = [],
    activeTagIds = [],
    onToggleTag,
    isLoading,      // NEW PROP
    isError,        // NEW PROP
    error           // NEW PROP
}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { y: 8, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 110 } }
    };

    // TASK 2.3.2 & 2.3.4: Skeleton state and inline error for Tags
    if (isLoading) {
        const skeletonCount = 4; // Display a few smaller skeleton pills for tags
        return (
            <div className="py-2">
                <HorizontalScroll className="pb-2">
                    <div className="flex items-center space-x-2 px-4" aria-label="Loading tags...">
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
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center justify-center">
                    <Icon name="error_outline" className="w-4 h-4 mr-1.5" />
                    Could not load tags. {error?.message ? `(${error.message.substring(0, 50)}${error.message.length > 50 ? '...' : ''})` : ''}
                </p>
            </div>
        );
    }

    if (!tagsData || tagsData.length === 0) {
        // If not loading and no error, but no tags, render nothing or a very subtle message.
        // Usually, if there are products, there might be some tags, or this section can be gracefully hidden.
        return null; // Or a very subtle <p className="text-xs ...">No specific tags to filter by.</p>
    }

    // Assuming tagsData is already sorted as needed by Userpage.jsx
    return (
        <div className="py-2">
            <HorizontalScroll className="pb-2">
                <motion.div
                    className="flex items-center space-x-2 px-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="toolbar"
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