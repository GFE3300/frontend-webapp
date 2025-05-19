import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const CategoryTagsCell = memo(({ category, tags }) => {
    const [showAllTags, setShowAllTags] = useState(false);
    const maxVisibleTags = 1; // Show category + 1 tag, or 2 tags if no category

    const displayedTags = tags.slice(0, category ? maxVisibleTags : maxVisibleTags + 1);
    const hiddenTagsCount = tags.length - displayedTags.length;

    const Pill = ({ text, colorClass = "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200" }) => (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
            {text}
        </span>
    );

    return (
        <div className="flex flex-wrap items-center gap-1.5 relative">
            {category && <Pill text={category} colorClass="bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300" />}
            {displayedTags.map(tag => <Pill key={tag} text={tag} />)}
            {hiddenTagsCount > 0 && (
                <>
                    <button
                        onClick={() => setShowAllTags(prev => !prev)}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-100 hover:bg-neutral-400 dark:hover:bg-neutral-500"
                        aria-expanded={showAllTags}
                        aria-label={`Show ${hiddenTagsCount} more tags`}
                    >
                        +{hiddenTagsCount}
                    </button>
                    <AnimatePresence>
                        {showAllTags && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute z-10 top-full left-0 mt-1 p-2 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-1.5 max-w-xs"
                            >
                                {tags.slice(category ? maxVisibleTags : maxVisibleTags + 1).map(tag => (
                                    <Pill key={`full-${tag}`} text={tag} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
});

CategoryTagsCell.propTypes = {
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CategoryTagsCell;