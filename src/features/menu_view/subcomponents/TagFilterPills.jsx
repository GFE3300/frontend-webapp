// src/features/menu_view/subcomponents/TagFilterPills.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import HorizontalScroll from './HorizontalScroll';

const TagPill = React.memo(({ tag, isActive, onToggle }) => {
    const pillVariants = {
        tap: { scale: 0.96 } // Subtle tap effect
    };

    // Styling based on "6.10. Tags & Pills" from design_guidelines.txt (interpreted)
    const baseClasses = "group flex items-center justify-center px-3 py-1 rounded-full cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";

    let stateSpecificClasses = "";
    let iconColorClass = "";

    if (isActive) {
        // Active State: Rose-500 bg, white text
        stateSpecificClasses = "bg-rose-500 text-white focus-visible:ring-rose-300 dark:focus-visible:ring-rose-600";
        iconColorClass = "text-white"; // Icon color for active state
    } else {
        // Inactive State: Neutral-200/Dark:Neutral-700 bg, Neutral-700/Dark:Neutral-300 text
        // Hover (Inactive): Neutral-300/Dark:Neutral-600 bg
        stateSpecificClasses = "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500";
        // Icon color for inactive state - ensure group-hover affects icon if needed
        iconColorClass = "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200";
    }

    return (
        <motion.button
            variants={pillVariants}
            whileTap="tap"
            onClick={() => onToggle(tag.id)}
            className={`${baseClasses} ${stateSpecificClasses}`}
            role="checkbox" // Correct role for a toggleable filter item
            aria-checked={isActive} // Communicates the selected state
            title={tag.name || "Tag"} // Tooltip for clarity
        >
            {tag.icon_name && (
                // Icon Size X-Small (Guidelines 6.7) - w-3.5 h-3.5 is 0.875rem (14px)
                <Icon name={tag.icon_name} className={`w-3.5 h-3.5 mr-1.5 transition-colors duration-150 ${iconColorClass}`} />
            )}
            {/* Typography: Body Extra Small (Inter Medium, 12px) */}
            <span className={`font-inter font-medium text-xs whitespace-nowrap transition-colors duration-150`}>
                {tag.name}
            </span>
        </motion.button>
    );
});
TagPill.displayName = 'TagPill';

/**
 * A horizontally scrollable list of tag filter pills.
 * @param {object} props
 * @param {Array<object>} props.tagsData - Array of tag objects { id, name, icon_name?, display_order? }.
 *                                        Should be the already contextually filtered tags if applicable.
 * @param {Array<string>} props.activeTagIds - Array of IDs of currently active tags.
 * @param {function} props.onToggleTag - Callback (tagId: string) => void.
 */
function TagFilterPills({ tagsData = [], activeTagIds = [], onToggleTag }) {
    if (!tagsData || tagsData.length === 0) {
        return null; // No tags to display
    }

    // Assuming tagsData is already sorted as needed by Userpage.jsx
    // If not, sorting logic would go here:
    // const sortedTags = [...tagsData].sort((a, b) => { /* sort logic */ });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.05,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 8, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 110 } }
    };

    return (
        // py-2 for vertical padding around the HorizontalScroll component itself
        // This matches the CategoryFilterBar wrapper for consistent spacing
        <div className="py-2"> 
            <HorizontalScroll className="pb-2"> {/* pb-2 for some space below scroll track, matching CategoryFilterBar */}
                <motion.div
                    className="flex items-center space-x-2 px-4" // px-4 for start/end padding, space-x for inter-pill spacing
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="toolbar" // Or "group" - "toolbar" implies a set of controls
                    aria-label="Filter by tags"
                >
                    {tagsData.map(tag => ( // Use tagsData directly, assuming sorted by Userpage
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