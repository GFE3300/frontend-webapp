// src/features/add_product_modal/subcomponents/ColorPalette.jsx

// 1. Imports
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon'; // Assuming Icon component path

/**
 * @component ColorPalette
 * @description A component that displays a palette of selectable colors.
 * Each color can be a Tailwind CSS background class string or a hex color string.
 * Selected colors are visually distinguished with a ring and a checkmark icon.
 *
 * @param {Object} props - Component properties.
 * @param {Array<string|Object>} props.availableColors - An array of color definitions.
 *   Each item can be a string (Tailwind class like 'bg-red-500' or a hex code like '#FF0000')
 *   or an object with `value` (string, required: Tailwind class or hex code) and `name` (string, optional: for aria-label and title).
 * @param {string} [props.selectedColorValue] - The value of the currently selected color.
 * @param {Function} props.onColorSelect - Callback function invoked when a color is selected.
 *   It receives the `colorValue` (string) as an argument.
 * @param {string} [props.className=""] - Additional CSS classes for the main container div.
 * @param {string} [props.containerBgLight="bg-neutral-50"] - The Tailwind background class of the light mode container
 *   this palette sits on. Used to calculate the `ring-offset-color`.
 * @param {string} [props.containerBgDark="dark:bg-neutral-800"] - The Tailwind background class of the dark mode container
 *   this palette sits on. Used to calculate the `ring-offset-color` for dark mode.
 */
const ColorPalette = ({
    availableColors,
    selectedColorValue,
    onColorSelect,
    className,
    containerBgLight,
    containerBgDark,
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================

    // Derive ring offset classes from container background props.
    // These classes ensure the focus/selection ring has a contrasting offset
    // against the component's container background.
    const ringOffsetLightClass = containerBgLight.replace('bg-', 'ring-offset-');
    const ringOffsetDarkClass = containerBgDark.replace('dark:bg-', 'dark:ring-offset-');

    // Icon properties for the selected state
    const selectedIconConfig = {
        name: "check",
        className: "w-3.5 h-3.5 text-white pointer-events-none", // pointer-events-none for icon inside button
        style: { fontSize: '0.9rem' },
        variations: { fill: 1, weight: 600, grade: 0, opsz: 18 },
    };

    // ===========================================================================
    // Validation
    // ===========================================================================

    // PropType validation handles most structural checks.
    // If availableColors is empty, the component will render an empty div, which is acceptable.
    // No specific runtime validation beyond PropTypes is deemed critical for this component's core rendering.
    // For instance, if `availableColors` was required to have at least one item to render anything meaningful,
    // a check like `if (!availableColors || availableColors.length === 0) return null;` could be added here.

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className={`flex flex-wrap gap-2.5 py-1 ${className}`}>
            {availableColors.map((color) => {
                // Determine color value and display name
                const colorValue = typeof color === 'string' ? color : color.value;
                const colorName = typeof color === 'string' ? colorValue : color.name || colorValue;
                const isSelected = selectedColorValue === colorValue;

                // Determine if the colorValue is a hex code or a Tailwind class
                const isHexColor = colorValue.startsWith('#');

                // Base classes for each color button
                const baseButtonClasses = `w-6 h-6 rounded-full flex items-center justify-center 
                                         transition-all duration-200 ease-out transform
                                         focus:outline-none focus:ring-2 ${ringOffsetLightClass} ${ringOffsetDarkClass} focus:ring-rose-500`;

                // Apply Tailwind background class directly if it's not a hex color
                const backgroundClass = isHexColor ? '' : colorValue;

                // Conditional classes for selected vs. non-selected state
                const stateClasses = isSelected
                    ? `ring-2 ring-rose-500 dark:ring-rose-400 ${ringOffsetLightClass} ${ringOffsetDarkClass} scale-110 shadow-md`
                    : `hover:scale-110 hover:shadow-sm border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600`;

                return (
                    <button
                        key={colorValue}
                        type="button"
                        onClick={() => onColorSelect(colorValue)}
                        className={`${baseButtonClasses} ${backgroundClass} ${stateClasses}`}
                        style={isHexColor ? { backgroundColor: colorValue } : {}}
                        aria-label={`Select color: ${colorName}`}
                        title={colorName}
                        aria-pressed={isSelected}
                    >
                        {/* Checkmark Icon for selected color */}
                        {isSelected && (
                            <Icon
                                name={selectedIconConfig.name}
                                className={selectedIconConfig.className}
                                style={selectedIconConfig.style}
                                variations={selectedIconConfig.variations}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

ColorPalette.propTypes = {
    availableColors: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.string.isRequired,
                name: PropTypes.string
            })
        ])
    ).isRequired,
    selectedColorValue: PropTypes.string,
    onColorSelect: PropTypes.func.isRequired,
    className: PropTypes.string,
    containerBgLight: PropTypes.string,
    containerBgDark: PropTypes.string,
};

ColorPalette.defaultProps = {
    selectedColorValue: null,
    className: "",
    containerBgLight: 'bg-neutral-50', // Default for light mode form backgrounds
    containerBgDark: 'dark:bg-neutral-800', // Default for dark mode form backgrounds
};

export default memo(ColorPalette);