// frontend/src/components/common/Spinner.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({
    size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
    // This color prop is for the active part of the spinner's border.
    // It expects a Tailwind class string (e.g., "text-rose-500" or "border-rose-500").
    color = 'text-rose-500 dark:text-rose-400', // Default to a theme color
    // For the static part of the spinner's border (the track)
    trackColor = 'border-neutral-200 dark:border-neutral-600',
    // Thickness of the spinner border
    thickness = 'border-2', // e.g., 'border-2', 'border-4'
    className = '', // For additional custom classes
}) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    const spinnerSizeClass = sizeClasses[size] || sizeClasses.md;

    // Convert the passed 'color' (which might be a text-color) to a border-top-color.
    // This makes it compatible with how SimpleToggle was passing the color.
    let activeBorderSegmentColor = color;
    if (color.startsWith('text-')) {
        activeBorderSegmentColor = color.replace(/^text-/, 'border-t-');
    } else if (color.startsWith('border-') && !color.startsWith('border-t-')) {
        // If a full border color is passed (e.g., "border-rose-500"),
        // convert it to specify only the top segment for the active color.
        activeBorderSegmentColor = color.replace(/^border-/, 'border-t-');
    }
    // If it's already "border-t-something", it will be used as is.

    return (
        <div
            className={`
                ${spinnerSizeClass} 
                ${thickness}
                ${trackColor}                // Base border color for the track (all sides)
                ${activeBorderSegmentColor}  // Active color for the top segment (overrides top border)
                rounded-full 
                animate-spin 
                ${className}
            `}
            role="status"
            aria-live="polite"
            aria-label="Loading..." // More descriptive default label
        >
            {/* This div itself is the spinner. No child elements needed for this style. */}
        </div>
    );
};

Spinner.propTypes = {
    /**
     * Defines the width and height of the spinner.
     */
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    /**
     * Tailwind CSS class string for the color of the active, spinning segment of the spinner.
     * Can be a text color (e.g., "text-rose-500") or a border color (e.g., "border-rose-500", "border-t-rose-500").
     */
    color: PropTypes.string,
    /**
     * Tailwind CSS class string for the color of the static track of the spinner.
     */
    trackColor: PropTypes.string,
    /**
     * Tailwind CSS class string for the thickness of the spinner's border (e.g., "border-2", "border-4").
     */
    thickness: PropTypes.string,
    /**
     * Additional CSS classes to apply to the spinner element.
     */
    className: PropTypes.string,
};

export default Spinner;