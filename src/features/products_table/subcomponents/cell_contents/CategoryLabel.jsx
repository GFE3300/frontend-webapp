import React from 'react';
import PropTypes from 'prop-types';

const CategoryLabel = ({ category }) => {
    
    if (!category || !category.name) {
        return null;
    }

    const colorIsTailwindClass = category.color_class && category.color_class.startsWith('bg-');

    return (
        <div className="flex items-center space-x-2 font-montserrat font-semibold text-sm bg-neutral-100 dark:bg-neutral-600 px-2 py-1 rounded-lg">
            {category.color_class && (
                <span
                    className={`inline-block w-4 h-4 rounded-md ${colorIsTailwindClass ? category.color_class : ''
                        }`}
                    style={!colorIsTailwindClass ? { backgroundColor: category.color_class } : {}}
                    aria-hidden="true"
                ></span>
            )}
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{category.name}</span>
        </div>
    );
};

CategoryLabel.propTypes = {
    category: PropTypes.shape({
        name: PropTypes.string.isRequired,
        color: PropTypes.string, // Can be a hex code, rgb, or a Tailwind bg class
    }),
};

export const CategoryBadge = ({ category }) => {
    if (!category || !category.name) {
        return null;
    }

    let textColor = 'text-gray-800 dark:text-gray-200';
    let bgColor = 'bg-gray-100 dark:bg-gray-700';
    let inlineStyle = {};

    if (category.color_class) {
        if (category.color_class.startsWith('bg-')) {
            bgColor = category.color_class;
            // Basic contrast inference (can be improved)
            if (/(?:700|800|900)/.test(category.color_class) && !category.color_class.includes('dark:')) { // Check for dark shades in light mode
                textColor = 'text-white';
            } else if (category.color_class.includes('dark:') && /(?:100|200|300|400|500)/.test(category.color_class)) { // Check for light shades in dark mode
                textColor = 'text-neutral-800'; // Ensure good contrast for light bg in dark mode
            }
        } else if (/^#([0-9A-F]{3}){1,2}$/i.test(category.color_class) || category.color_class.startsWith('rgb')) {
            // For hex or rgb, set inline style and attempt to determine text color
            inlineStyle = { backgroundColor: category.color_class };
            bgColor = ''; // Clear Tailwind bg class
            // Basic brightness check for text contrast (this is a simplified heuristic)
            // A more robust solution would parse the color and calculate luminance
            try {
                let r, g, b;
                if (category.color_class.startsWith('#')) {
                    const hex = category.color_class.replace('#', '');
                    const bigint = parseInt(hex, 16);
                    r = (bigint >> 16) & 255;
                    g = (bigint >> 8) & 255;
                    b = bigint & 255;
                } else { // rgb(a) - very basic parsing
                    const match = category.color_class.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (match) {
                        r = parseInt(match[1]);
                        g = parseInt(match[2]);
                        b = parseInt(match[3]);
                    }
                }
                if (r !== undefined && g !== undefined && b !== undefined) {
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    textColor = brightness > 125 ? 'text-neutral-800' : 'text-white';
                } else {
                    textColor = 'text-white'; // Default for unknown background
                }
            } catch (e) {
                textColor = 'text-white'; // Fallback
            }
        }
        // Add more mappings for color names (e.g., 'green' -> bg-green-100 text-green-800) if needed
    }

    return (
        <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full inline-block ${textColor} ${bgColor}`}
            style={inlineStyle}
        >
            {category.name}
        </span>
    );
};

CategoryBadge.propTypes = {
    category: PropTypes.shape({
        name: PropTypes.string.isRequired,
        color: PropTypes.string,
    }),
};

export default CategoryLabel; // Default export