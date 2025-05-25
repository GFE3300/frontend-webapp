import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../../components/common/Icon';

const TagPills = ({ tags, pillClassName, maxVisibleTags = Infinity }) => {
    if (!tags || tags.length === 0) {
        return null; // Or a placeholder like '-'
    }

    // console.log("Rendering TagPills with tags:", tags);

    const visibleTags = tags.slice(0, maxVisibleTags);
    const hiddenTagsCount = tags.length - maxVisibleTags;

    const defaultPillClass = "px-2 py-0.5 text-xs font-medium text-sky-700 bg-sky-100 rounded-full dark:bg-sky-700 dark:text-sky-200";

    return (
        <div className="flex flex-row flex-wrap items-center gap-1 font-montserrat text-xs">
            {visibleTags.map((tag, index) => (
                <span
                    key={index}
                    className={`flex flex-row items-center gap-1 ${pillClassName || defaultPillClass}`}
                    title={typeof tag === 'object' ? tag.name : tag} // Show full tag name on hover if it's an object
                >
                    <div className='flex items-center justify-center w-4 h-4'>
                        <Icon name={tag.icon_name} className="w-3 h-3 flex-shrink-0" style={{ fontSize: '0.75rem' }}/>
                    </div>
                    {typeof tag === 'object' ? tag.name : tag}
                </span>
            ))}
            {hiddenTagsCount > 0 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                    +{hiddenTagsCount} more
                </span>
            )}
        </div>
    );
};

TagPills.propTypes = {
    tags: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({ name: PropTypes.string.isRequired })
        ])
    ).isRequired,
    pillClassName: PropTypes.string, // Optional custom class for pills
    maxVisibleTags: PropTypes.number,
};

export default TagPills;