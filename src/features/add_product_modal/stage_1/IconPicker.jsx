import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon'; // Adjust path as needed
import scriptLines from '../utils/script_lines'; // Added import

/**
 * A component that displays a grid of selectable icons.
 * Allows users to choose an icon from a predefined list.
 *
 * @component IconPicker
 * @param {object} props - Component properties.
 * @param {Array<object>} props.availableIcons - An array of icon objects. Each object must have `name` (string, for Icon component) and `label` (string, for title/aria-label - this label should be pre-localized). (Required)
 * @param {string} [props.selectedIconName] - The name of the currently selected icon.
 * @param {function} props.onIconSelect - Callback function invoked with the name of the selected icon. (Required)
 * @param {string} [props.className=""] - Additional CSS classes for the root container of the icon grid.
 * @param {string} [props.iconContainerClassName="grid grid-cols-6 sm:grid-cols-8 gap-2"] - CSS classes for the icon grid container.
 * @param {string} [props.iconClassName="w-6 h-6"] - CSS classes for individual icon elements (passed to the Icon component).
 * @param {string} [props.buttonClassName="p-2 rounded-md flex items-center justify-center transition-all duration-150 focus:outline-none"] - Base CSS classes for each icon button.
 * @param {string} [props.selectedButtonClassName="bg-rose-100 dark:bg-rose-500/30 ring-2 ring-rose-500 dark:ring-rose-400"] - CSS classes applied to the selected icon button.
 * @param {string} [props.unselectedButtonClassName="hover:bg-neutral-100 dark:hover:bg-neutral-700/60 focus-visible:ring-2 focus-visible:ring-neutral-400"] - CSS classes for unselected icon buttons, including hover and focus-visible states.
 * @param {string} [props.selectedIconColor="text-rose-500 dark:text-rose-400"] - CSS class for the color of the selected icon.
 * @param {string} [props.unselectedIconColor="text-neutral-600 dark:text-neutral-300"] - CSS class for the color of unselected icons.
 */
const IconPicker = ({
    availableIcons,
    selectedIconName,
    onIconSelect,
    className = "",
    iconContainerClassName = "grid grid-cols-6 sm:grid-cols-8 gap-2",
    iconClassName = "w-6 h-6",
    buttonClassName = "p-2 rounded-md flex items-center justify-center transition-all duration-150 focus:outline-none",
    selectedButtonClassName = "bg-rose-100 dark:bg-rose-500/30 ring-2 ring-rose-500 dark:ring-rose-400",
    unselectedButtonClassName = "hover:bg-neutral-100 dark:hover:bg-neutral-700/60 focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-black",
    selectedIconColor = "text-rose-500 dark:text-rose-400",
    unselectedIconColor = "text-neutral-600 dark:text-neutral-300",
}) => {
    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleIconClick = useCallback((iconName) => {
        onIconSelect(iconName);
    }, [onIconSelect]);

    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (!Array.isArray(availableIcons) || availableIcons.length === 0) {
        console.error('IconPicker: `availableIcons` prop is required and must be a non-empty array.');
        // Localized fallback UI
        return <p className="text-sm text-red-600">{scriptLines.iconPickerErrorDataMissing || 'Icon data is missing or invalid.'}</p>;
    }
    if (typeof onIconSelect !== 'function') {
        console.error('IconPicker: `onIconSelect` prop is required and must be a function.');
        // Localized fallback UI
        return <p className="text-sm text-red-600">{scriptLines.iconPickerErrorhandlerMissing || 'Icon selection handler is missing.'}</p>;
    }
    if (availableIcons.some(icon => typeof icon.name !== 'string' || typeof icon.label !== 'string')) {
        console.error('IconPicker: Each item in `availableIcons` must have a `name` (string) and `label` (string).');
        // Localized fallback UI
        return <p className="text-sm text-red-600">{scriptLines.iconPickerErrorInvalidStructure || 'Invalid icon data structure.'}</p>;
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className={`icon-picker-root ${className}`}>
            {/* Grid container for icon buttons */}
            <div
                className={iconContainerClassName}
                role="radiogroup"
                // Localized aria-label
                aria-label={scriptLines.iconPickerAriaLabel || "Select an icon"}
            >
                {availableIcons.map((iconObj) => {
                    const isSelected = selectedIconName === iconObj.name;
                    return (
                        // Icon button element
                        <button
                            key={iconObj.name}
                            type="button"
                            onClick={() => handleIconClick(iconObj.name)}
                            title={iconObj.label} // Tooltip for mouse users (label should be pre-localized)
                            aria-label={iconObj.label} // Accessibility for screen readers (label should be pre-localized)
                            aria-pressed={isSelected} // Indicates selection state
                            role="radio" // Part of the radiogroup
                            aria-checked={isSelected}
                            className={`${buttonClassName} ${isSelected ? selectedButtonClassName : unselectedButtonClassName}`}
                        >
                            {/* Icon component rendering the actual SVG or font icon */}
                            <Icon
                                name={iconObj.name}
                                className={`${iconClassName} ${isSelected ? selectedIconColor : unselectedIconColor}`}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

IconPicker.propTypes = {
    availableIcons: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired, // This label should be provided pre-localized
    })).isRequired,
    selectedIconName: PropTypes.string,
    onIconSelect: PropTypes.func.isRequired,
    className: PropTypes.string,
    iconContainerClassName: PropTypes.string,
    iconClassName: PropTypes.string,
    buttonClassName: PropTypes.string,
    selectedButtonClassName: PropTypes.string,
    unselectedButtonClassName: PropTypes.string,
    selectedIconColor: PropTypes.string,
    unselectedIconColor: PropTypes.string,
};

IconPicker.defaultProps = {
    className: "",
    iconContainerClassName: "grid grid-cols-6 sm:grid-cols-8 gap-2",
    iconClassName: "w-6 h-6",
    buttonClassName: "p-2 rounded-md flex items-center justify-center transition-all duration-150 focus:outline-none",
    selectedButtonClassName: "bg-rose-100 dark:bg-rose-500/30 ring-2 ring-rose-500 dark:ring-rose-400",
    unselectedButtonClassName: "hover:bg-neutral-100 dark:hover:bg-neutral-700/60 focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-black",
    selectedIconColor: "text-rose-500 dark:text-rose-400",
    unselectedIconColor: "text-neutral-600 dark:text-neutral-300",
};

export default memo(IconPicker);