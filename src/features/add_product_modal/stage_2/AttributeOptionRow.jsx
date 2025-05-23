import React, { memo, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, useReducedMotion } from 'framer-motion';
import { InputField } from '../../../features/register/subcomponents'; // Assuming path, ensure this InputField is robust
import Icon from '../../../components/common/Icon'; // Assuming path
import scriptLines from '../utils/script_lines'; // Added import

/**
 * Renders a single row for an attribute option within the AttributeGroupBuilder.
 * It includes fields for the option's name, price adjustment, and a toggle for marking it as default.
 * It also provides a button to remove the option.
 *
 * @component AttributeOptionRow
 * @param {Object} props - Component properties.
 * @param {Object} props.option - The attribute option data. (Required)
 * @param {string} props.option.id - Unique ID for the option.
 * @param {string} props.option.name - Name of the option.
 * @param {number} [props.option.priceAdjustment=0] - Price adjustment for this option.
 * @param {boolean} [props.option.isDefault=false] - Whether this option is the default.
 * @param {number} props.groupIndex - The index of the parent attribute group. (Required)
 * @param {number} props.optionIndex - The index of this option within its group. (Required)
 * @param {function} props.onOptionChange - Callback when any field in the option changes. Receives `(groupIndex, optionIndex, fieldName, value)`. (Required)
 * @param {function} props.onRemoveOption - Callback to remove this option. Receives `(groupIndex, optionIndex)`. (Required)
 * @param {boolean} [props.isOnlyOption=false] - True if this is the only option in the group, disabling the remove button.
 * @param {string} [props.errorName] - Validation error message for the option name.
 * @param {string} [props.errorPriceAdjustment] - Validation error message for the price adjustment.
 * @param {string} [props.currencySymbol] - The currency symbol to display.
 * @param {string} [props.themeColor="rose"] - Theme color for accents.
 */
const AttributeOptionRow = ({
    option,
    groupIndex,
    optionIndex,
    onOptionChange,
    onRemoveOption,
    isOnlyOption = false,
    errorName,
    errorPriceAdjustment,
    currencySymbol = scriptLines.currencySymbolDefault || "$", // Localized default currency symbol
    themeColor = "rose",   // Default theme
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();
    const generatedIdBase = useId(); // Unique base for IDs within this row

    const THEME_CLASSES = {
        rose: {
            checkboxText: 'text-rose-600 dark:text-rose-400',
            checkboxRing: 'focus:ring-rose-500 dark:focus:ring-rose-400',
            checkboxCheckedBg: 'dark:checked:bg-rose-500 dark:checked:border-rose-500',
            removeButtonRing: 'focus-visible:ring-red-500',
        },
        // Add other themes if needed
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationVariants = {
        rowEnterExit: {
            initial: { opacity: 0, y: prefersReducedMotion ? 0 : -10, scale: prefersReducedMotion ? 1 : 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: prefersReducedMotion ? 0 : 10, scale: prefersReducedMotion ? 1 : 0.98, transition: { duration: 0.2 } },
            transition: { type: "spring", stiffness: 300, damping: 25 }
        }
    };

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleFieldChange = useCallback((field, value) => {
        if (field === 'priceAdjustment') {
            const parsedValue = parseFloat(value);
            onOptionChange(groupIndex, optionIndex, field, isNaN(parsedValue) ? (value === '' ? null : 0) : parsedValue);
        } else {
            onOptionChange(groupIndex, optionIndex, field, value);
        }
    }, [groupIndex, optionIndex, onOptionChange]);

    const handleRemoveClick = useCallback(() => {
        onRemoveOption(groupIndex, optionIndex);
    }, [groupIndex, optionIndex, onRemoveOption]);

    // ===========================================================================
    // Validation Logic (Props Validation) - User-facing errors are localized
    // ===========================================================================
    if (!option || typeof option.id !== 'string' || typeof option.name === 'undefined') {
        console.error('AttributeOptionRow: Invalid `option` prop. Must be an object with at least `id` and `name`.');
        return <div className="p-2 text-xs text-red-500 bg-red-100 rounded">{scriptLines.attributeOptionRowErrorInvalidData || 'Error: Invalid option data.'}</div>;
    }
    if (typeof groupIndex !== 'number' || typeof optionIndex !== 'number') {
        console.error('AttributeOptionRow: `groupIndex` and `optionIndex` props are required and must be numbers.');
        return <div className="p-2 text-xs text-red-500 bg-red-100 rounded">{scriptLines.attributeOptionRowErrorMissingIndex || 'Error: Missing index props.'}</div>;
    }
    if (typeof onOptionChange !== 'function' || typeof onRemoveOption !== 'function') {
        console.error('AttributeOptionRow: `onOptionChange` and `onRemoveOption` props are required functions.');
        return <div className="p-2 text-xs text-red-500 bg-red-100 rounded">{scriptLines.attributeOptionRowErrorMissingCallbacks || 'Error: Missing callback functions.'}</div>;
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    const optionDisplayName = option.name || (scriptLines.attributeOptionRowDefaultOptionNamePattern || 'Option {index}').replace('{index}', optionIndex + 1);
    const optionNameAriaLabel = (scriptLines.attributeOptionRowNameAriaLabelPattern || "Name for option {index}").replace('{index}', optionIndex + 1);
    const priceAdjustmentAriaLabel = (scriptLines.attributeOptionRowPriceAriaLabelPattern || "Price adjustment for option {index}").replace('{index}', optionIndex + 1);
    const removeOptionAriaLabel = (scriptLines.attributeOptionRowRemoveAriaLabelPattern || "Remove option {optionName}").replace('{optionName}', optionDisplayName);
    const groupAriaLabelBase = (scriptLines.attributeOptionRowGroupAriaLabelBase || "Attribute Option: {optionName}").replace('{optionName}', optionDisplayName);


    return (
        <motion.div
            layout
            variants={animationVariants.rowEnterExit}
            initial="initial"
            animate="animate"
            exit="exit"
            className="attribute-option-row flex flex-col sm:flex-row sm:items-end gap-y-3 sm:gap-x-3 px-3 py-3.5 border border-neutral-200 dark:border-neutral-600/80 rounded-lg bg-white dark:bg-neutral-700/50 shadow-sm hover:shadow-md transition-shadow duration-200"
            role="group"
            aria-labelledby={`${generatedIdBase}-option-name-label`}
        >
            {/* Option Name Input */}
            <div className="flex flex-col justify-end h-15 w-full sm:flex-grow">
                <InputField
                    id={`${generatedIdBase}-option-name`}
                    label={scriptLines.attributeOptionRowNameLabel || "Option Name"}
                    value={option.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder={scriptLines.attributeOptionRowNamePlaceholder || "e.g., Small, Almond Milk"}
                    required
                    error={errorName}
                    maxLength={50}
                    hidelabel
                    classNameWrapper="mb-0"
                    inputClassName="text-sm sm:text-base"
                    aria-label={optionNameAriaLabel}
                />
                <label id={`${generatedIdBase}-option-name-label`} className="sr-only">
                    {groupAriaLabelBase}
                </label>
            </div>

            {/* Price Adjustment Input */}
            <div className="flex flex-col justify-end h-15 sm:w-36 flex-shrink-0">
                <InputField
                    id={`${generatedIdBase}-price-adj`}
                    label={(scriptLines.attributeOptionRowPriceLabelPattern || "Price Adj. ({currencySymbol})").replace('{currencySymbol}', currencySymbol)}
                    type="number"
                    value={option.priceAdjustment === null || typeof option.priceAdjustment === 'undefined' ? '' : option.priceAdjustment}
                    onChange={(e) => handleFieldChange('priceAdjustment', e.target.value)}
                    placeholder={scriptLines.attributeOptionRowPricePlaceholder || "e.g., +0.50"}
                    step="0.01"
                    error={errorPriceAdjustment}
                    hidelabel
                    classNameWrapper="mb-0"
                    inputClassName="text-sm sm:text-base text-right pr-8"
                    suffix={currencySymbol}
                    aria-label={priceAdjustmentAriaLabel}
                />
            </div>

            {/* Default Toggle Checkbox */}
            <div className="flex items-center justify-start sm:justify-center sm:pb-[0.4rem] sm:pt-0 pt-1">
                <input
                    type="checkbox"
                    id={`${generatedIdBase}-default-option`}
                    checked={!!option.isDefault}
                    onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
                    className={`h-4 w-4 sm:h-5 sm:w-5 rounded border-neutral-300 dark:border-neutral-500
                                ${currentTheme.checkboxText} ${currentTheme.checkboxRing} ${currentTheme.checkboxCheckedBg}
                                focus:ring-offset-2 dark:focus:ring-offset-neutral-700/50
                                transition-colors duration-150`}
                    aria-labelledby={`${generatedIdBase}-default-label`}
                />
                <label
                    id={`${generatedIdBase}-default-label`}
                    htmlFor={`${generatedIdBase}-default-option`}
                    className="ml-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer"
                >
                    {scriptLines.attributeOptionRowDefaultLabel || "Default"}
                </label>
            </div>

            {/* Remove Option Button */}
            <button
                type="button"
                onClick={handleRemoveClick}
                disabled={isOnlyOption}
                className={`w-full sm:w-auto flex items-center justify-center p-2 sm:h-9 sm:w-9
                            text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-300 
                            rounded-md sm:rounded-full 
                            transition-colors duration-150 focus:outline-none focus-visible:ring-2 
                            ${currentTheme.removeButtonRing}
                            focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-700/50
                            disabled:opacity-40 disabled:hover:text-neutral-500 disabled:cursor-not-allowed
                            hover:bg-neutral-100 dark:hover:bg-neutral-600/50
                            bg-neutral-50 dark:bg-neutral-700/30 sm:bg-transparent sm:dark:bg-transparent
                            mt-2 sm:mt-0 sm:self-end`}
                aria-label={removeOptionAriaLabel}
            >
                <Icon name="remove_circle_outline" className="w-6 h-6" />
            </button>
        </motion.div>
    );
};

AttributeOptionRow.propTypes = {
    option: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        priceAdjustment: PropTypes.number,
        isDefault: PropTypes.bool,
    }).isRequired,
    groupIndex: PropTypes.number.isRequired,
    optionIndex: PropTypes.number.isRequired,
    onOptionChange: PropTypes.func.isRequired,
    onRemoveOption: PropTypes.func.isRequired,
    isOnlyOption: PropTypes.bool,
    errorName: PropTypes.string,
    errorPriceAdjustment: PropTypes.string,
    currencySymbol: PropTypes.string,
    themeColor: PropTypes.oneOf(['rose' /* , add other themes here */]),
};

AttributeOptionRow.defaultProps = {
    isOnlyOption: false,
    currencySymbol: scriptLines.currencySymbolDefault || "$", // Use localized default
    themeColor: "rose",
};

export default memo(AttributeOptionRow);