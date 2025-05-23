import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon'; // Assuming Icon component path
import scriptLines from '../utils/script_lines'; // Import the localization object

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

    const ringOffsetLightClass = containerBgLight.replace('bg-', 'ring-offset-');
    const ringOffsetDarkClass = containerBgDark.replace('dark:bg-', 'dark:ring-offset-');

    const selectedIconConfig = {
        name: "check",
        className: "w-3.5 h-3.5 text-white pointer-events-none",
        style: { fontSize: '0.9rem' },
        variations: { fill: 1, weight: 600, grade: 0, opsz: 18 },
    };

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className={`flex flex-wrap gap-2.5 py-1 ${className}`}>
            {availableColors.map((color) => {
                const colorValue = typeof color === 'string' ? color : color.value;
                const colorName = typeof color === 'string' ? colorValue : color.name || colorValue;
                const isSelected = selectedColorValue === colorValue;
                const isHexColor = colorValue.startsWith('#');

                const baseButtonClasses = `w-6 h-6 rounded-full flex items-center justify-center 
                                         transition-all duration-200 ease-out transform
                                         focus:outline-none focus:ring-2 ${ringOffsetLightClass} ${ringOffsetDarkClass} focus:ring-rose-500`;
                
                const backgroundClass = isHexColor ? '' : colorValue;

                const stateClasses = isSelected
                    ? `ring-2 ring-rose-500 dark:ring-rose-400 ${ringOffsetLightClass} ${ringOffsetDarkClass} scale-110 shadow-md`
                    : `hover:scale-110 hover:shadow-sm border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600`;

                // Construct aria-label using localized prefix
                const ariaLabel = `${scriptLines.colorPalette.selectColorPrefix} ${colorName}`;

                return (
                    <button
                        key={colorValue}
                        type="button"
                        onClick={() => onColorSelect(colorValue)}
                        className={`${baseButtonClasses} ${backgroundClass} ${stateClasses}`}
                        style={isHexColor ? { backgroundColor: colorValue } : {}}
                        aria-label={ariaLabel} // MODIFIED: Uses localized string
                        title={colorName}
                        aria-pressed={isSelected}
                    >
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
    containerBgLight: 'bg-neutral-50',
    containerBgDark: 'dark:bg-neutral-800',
};

export default memo(ColorPalette);