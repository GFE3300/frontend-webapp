// 1. Imports
import React, { memo, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, Reorder } from 'framer-motion'; // Reorder for future use
import { Checkbox, Dropdown, InputField } from '../../../features/register/subcomponents'; // Ensure paths are correct
import Icon from '../../../components/common/Icon';
import AttributeOptionRow from './AttributeOptionRow'; // The refactored child component

/**
 * Builds and manages a group of editable product attributes.
 * Each group has a name, type (single/multi-select), requirement status, and a list of options.
 * Options themselves are managed by `AttributeOptionRow`.
 * Supports adding/removing options and removing the entire group.
 *
 * @component AttributeGroupBuilder
 * @param {Object} props - Component properties.
 * @param {Object} props.group - The attribute group data. (Required)
 * @param {string} props.group.id - Unique ID for the group.
 * @param {string} props.group.name - Name of the attribute group.
 * @param {('single_select'|'multi_select')} props.group.type - Type of attribute selection.
 * @param {boolean} [props.group.isRequired=false] - Whether this attribute group is required.
 * @param {Array<Object>} props.group.options - Array of option objects for this group.
 * @param {number} props.groupIndex - The index of this attribute group in a list of groups. (Required)
 * @param {function} props.onGroupChange - Callback when a group-level field (name, type, isRequired, or options array itself) changes. Receives `(groupIndex, fieldName, value)`. (Required)
 * @param {function} props.onRemoveGroup - Callback to remove this attribute group. Receives `(groupIndex)`. (Required)
 * @param {function} props.onOptionChange - Callback passed to `AttributeOptionRow` for option field changes. Receives `(groupIndex, optionIndex, fieldName, value)`. (Required)
 * @param {function} props.onAddOption - Callback to add a new option to this group. Receives `(groupIndex)`. (Required)
 * @param {function} props.onRemoveOption - Callback passed to `AttributeOptionRow` to remove an option. Receives `(groupIndex, optionIndex)`. (Required)
 * @param {function} [props.onReorderOptions] - Callback if reordering of options within a group is implemented. Receives `(groupIndex, reorderedOptionsArray)`.
 * @param {Object} [props.errors={}] - Validation errors for this group and its options. Expected structure: `{ name?: string, type?: string, isRequired?: string, options?: (string | Array<Object>) }`. If `options` is a string, it's an array-level error. If an array, it contains errors for individual options.
 * @param {string} [props.currencySymbol="$"] - Currency symbol for price adjustments in options.
 * @param {string} [props.themeColor="rose"] - Theme color for accents.
 */
const AttributeGroupBuilder = ({
    group,
    groupIndex,
    onGroupChange,
    onRemoveGroup,
    onOptionChange,
    onAddOption,
    onRemoveOption,
    onReorderOptions, // Prop for future reordering implementation
    errors = {},
    currencySymbol = "$",
    themeColor = "rose",
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const generatedIdBase = useId(); // Base for unique IDs within this component instance

    const THEME_CLASSES = {
        rose: {
            addOptionButtonText: 'text-rose-600 dark:text-rose-400',
            addOptionButtonHoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
            addOptionButtonBorder: 'border-rose-500/70 dark:border-rose-500/50',
            addOptionButtonFocusRing: 'focus-visible:ring-rose-500',
            removeGroupButtonBaseBg: 'bg-rose-50 dark:bg-rose-500/10 sm:bg-transparent sm:dark:bg-transparent',
            removeGroupButtonHoverBg: 'hover:bg-red-100 dark:hover:bg-red-500/20',
            removeGroupButtonFocusRing: 'focus-visible:ring-red-500',
        },
        // Add other themes if needed
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationVariants = {
        groupCard: {
            initial: { opacity: 0, y: 20, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } },
            transition: { type: "spring", stiffness: 260, damping: 22 }
        },
        optionsListError: {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
            exit: { opacity: 0, height: 0, transition: { duration: 0.15 } }
        }
    };

    const GROUP_TYPE_OPTIONS = [
        { value: 'single_select', label: 'Single Select (e.g., Radio buttons)' },
        { value: 'multi_select', label: 'Multi-Select (e.g., Checkboxes)' },
    ];

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleGroupFieldChange = useCallback((field, value) => {
        onGroupChange(groupIndex, field, value);
    }, [groupIndex, onGroupChange]);

    // Handles ensuring only one option is default for single_select type
    const handleOptionDefaultChange = useCallback((optionIndex, newCheckedState) => {
        const newOptions = group.options.map((opt, idx) => ({
            ...opt,
            isDefault: idx === optionIndex ? newCheckedState : (group.type === 'single_select' ? false : opt.isDefault),
        }));
        // Directly call onGroupChange to update the entire options array for the group
        onGroupChange(groupIndex, 'options', newOptions);
    }, [group.options, group.type, groupIndex, onGroupChange]);


    // Specific handler for `AttributeOptionRow`'s `onOptionChange`
    // This wrapper decides if special logic (like single default) needs to be applied
    const handleOptionRowChange = useCallback((groupIdx, optionIdx, field, value) => {
        if (field === 'isDefault') {
            handleOptionDefaultChange(optionIdx, value);
        } else {
            onOptionChange(groupIdx, optionIdx, field, value); // Pass through for other fields
        }
    }, [handleOptionDefaultChange, onOptionChange]);


    const handleRemoveGroupClick = useCallback(() => {
        onRemoveGroup(groupIndex);
    }, [groupIndex, onRemoveGroup]);

    const handleAddOptionClick = useCallback(() => {
        onAddOption(groupIndex);
    }, [groupIndex, onAddOption]);

    // ===========================================================================
    // Derived State / Calculations
    // ===========================================================================
    // Check for an array-level error message for the options list
    const optionsListError = (errors?.options && typeof errors.options === 'string') ? errors.options : null;

    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (!group || typeof group.id !== 'string' || typeof group.name === 'undefined' || !Array.isArray(group.options)) {
        console.error('AttributeGroupBuilder: Invalid `group` prop structure.');
        return <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">Error: Invalid attribute group data.</div>;
    }
    if (typeof groupIndex !== 'number') {
        console.error('AttributeGroupBuilder: `groupIndex` prop is required and must be a number.');
        return <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">Error: Missing group index.</div>;
    }
    // Check all required function props
    const requiredFunctions = { onGroupChange, onRemoveGroup, onOptionChange, onAddOption, onRemoveOption };
    for (const funcName in requiredFunctions) {
        if (typeof requiredFunctions[funcName] !== 'function') {
            console.error(`AttributeGroupBuilder: \`${funcName}\` prop is required and must be a function.`);
            return <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">Error: Missing critical handler: {funcName}.</div>;
        }
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <motion.div
            layout // Animate layout changes when groups are added/removed/reordered
            variants={animationVariants.groupCard}
            initial="initial"
            animate="animate"
            exit="exit"
            className="attribute-group-builder p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/70 shadow-lg space-y-4 sm:space-y-5"
            role="group" // Each group builder is a logical group of controls
            aria-labelledby={`${generatedIdBase}-group-name-label`} // Labelled by its name field
        >
            {/* Group Header: Name, Type, Required status, Remove button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto] gap-x-3 gap-y-4 items-end">
                {/* Group Name Input */}
                <div className="flex h-15 flex-col justify-end">
                    <InputField
                        id={`${generatedIdBase}-group-name`}
                        label="Attribute Group Name"
                        value={group.name}
                        onChange={(e) => handleGroupFieldChange('name', e.target.value)}
                        placeholder="e.g., Size, Milk Options"
                        required
                        error={errors?.name}
                        maxLength={50}
                        inputClassName="text-sm sm:text-base"
                        aria-label={`Name for attribute group ${groupIndex + 1}`}
                    />
                    {/* Hidden label for ARIA association for the whole group builder card */}
                    <label id={`${generatedIdBase}-group-name-label`} className="sr-only">
                        Attribute Group: {group.name || `Group ${groupIndex + 1}`}
                    </label>
                </div>

                {/* Attribute Type Dropdown */}
                <div className="flex h-15 flex-col justify-end">
                    <Dropdown
                        id={`${generatedIdBase}-group-type`}
                        label="Attribute Type"
                        value={group.type}
                        onChange={(value) => handleGroupFieldChange('type', value)}
                        options={GROUP_TYPE_OPTIONS}
                        error={errors?.type}
                        className="w-full" // Ensure dropdown takes full width of its grid cell
                        aria-label={`Type for attribute group ${groupIndex + 1}`}
                        errorClassName="absolute"
                    />
                </div>

                {/* Required Checkbox */}
                <div className="flex items-center justify-start sm:justify-center md:pb-[0.4rem]"> {/* Alignment adjustment */}
                    <Checkbox
                        id={`${generatedIdBase}-group-required`}
                        label="Required"
                        checked={!!group.isRequired}
                        onChange={(isChecked) => handleGroupFieldChange('isRequired', isChecked)}
                        error={errors?.isRequired} // Checkbox component should ideally handle its error display
                        labelClassName="text-xs sm:text-sm" // Pass to Checkbox if it supports styling label
                        aria-label={`Is attribute group ${groupIndex + 1} required`}
                    />
                </div>

                {/* Remove Group Button */}
                <button
                    type="button"
                    onClick={handleRemoveGroupClick}
                    className={`flex items-center justify-center p-2 rounded-lg sm:rounded-full
                                text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                                ${currentTheme.removeGroupButtonHoverBg}
                                transition-colors duration-150 sm:self-end focus:outline-none focus-visible:ring-2 
                                ${currentTheme.removeGroupButtonFocusRing}
                                focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-700/70
                                ${currentTheme.removeGroupButtonBaseBg}
                                w-full sm:w-10 sm:h-10`}
                    aria-label={`Remove attribute group ${group.name || `Group ${groupIndex + 1}`}`}
                >
                    <Icon name="delete" className="w-6 h-6 sm:w-6 sm:h-6" />
                    <span className="sm:hidden ml-2">Remove Group</span> {/* Text for mobile */}
                </button>
            </div>

            {/* Options Area */}
            <div className="options-area pl-0 sm:pl-1 mt-3 sm:mt-4 border-t border-neutral-200/70 dark:border-neutral-600/50 pt-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Options for "{group.name || 'this group'}"
                </h4>
                {/* Display array-level error for options, if any */}
                <AnimatePresence>
                    {optionsListError && (
                        <motion.p
                            className="mb-2 text-xs text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/30 rounded-md flex items-center gap-1"
                            role="alert"
                            variants={animationVariants.optionsListError}
                            initial="initial" animate="animate" exit="exit"
                        >
                            <Icon name="error_outline" className="w-3.5 h-3.5 flex-shrink-0" />
                            {optionsListError}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* List of AttributeOptionRow components */}
                <div className="flex flex-col gap-y-2.5">
                    {/* Using Reorder components for future drag-and-drop reordering of options */}
                    <Reorder.Group
                        axis="y"
                        values={group.options.map(opt => opt.id)} // Reorder based on option IDs
                        onReorder={(newOrderOptionIds) => {
                            if (onReorderOptions) {
                                const reorderedOptions = newOrderOptionIds.map(id => group.options.find(opt => opt.id === id)).filter(Boolean);
                                onReorderOptions(groupIndex, reorderedOptions);
                            }
                        }}
                        className="space-y-2.5" // Consistent spacing
                    >
                        <AnimatePresence initial={false}>
                            {group.options.map((option, optionIdx) => (
                                <Reorder.Item key={option.id} value={option.id} className="bg-transparent">
                                    <AttributeOptionRow
                                        option={option}
                                        groupIndex={groupIndex}
                                        optionIndex={optionIdx}
                                        onOptionChange={handleOptionRowChange} // Use the wrapped handler
                                        onRemoveOption={onRemoveOption} // Directly pass parent's handler
                                        isOnlyOption={group.options.length === 1}
                                        // Pass specific errors for each option's fields
                                        errorName={errors?.options?.[optionIdx]?.name}
                                        errorPriceAdjustment={errors?.options?.[optionIdx]?.priceAdjustment}
                                        currencySymbol={currencySymbol}
                                        themeColor={themeColor}
                                    // dragControls={/* Pass drag controls if custom handle needed */}
                                    />
                                </Reorder.Item>
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>
                </div>

                {/* Add Option Button */}
                <button
                    type="button"
                    onClick={handleAddOptionClick}
                    className={`mt-4 w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 
                                px-4 py-2.5 text-sm font-medium rounded-lg border 
                                transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 
                                dark:focus-visible:ring-offset-neutral-700/70
                                ${currentTheme.addOptionButtonText} ${currentTheme.addOptionButtonHoverBg} 
                                ${currentTheme.addOptionButtonBorder} ${currentTheme.addOptionButtonFocusRing}`}
                >
                    <Icon name="add_circle" className="w-6 h-6" /> Add Option
                </button>
            </div>
        </motion.div>
    );
};

AttributeGroupBuilder.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired, // Can be empty initially
        type: PropTypes.oneOf(['single_select', 'multi_select']).isRequired,
        isRequired: PropTypes.bool,
        options: PropTypes.arrayOf(PropTypes.object).isRequired, // AttributeOptionRow validates individual option structure
    }).isRequired,
    groupIndex: PropTypes.number.isRequired,
    onGroupChange: PropTypes.func.isRequired,
    onRemoveGroup: PropTypes.func.isRequired,
    onOptionChange: PropTypes.func.isRequired,
    onAddOption: PropTypes.func.isRequired,
    onRemoveOption: PropTypes.func.isRequired,
    onReorderOptions: PropTypes.func,
    errors: PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.string,
        isRequired: PropTypes.string,
        options: PropTypes.oneOfType([
            PropTypes.string, // For array-level errors like "at least one option required"
            PropTypes.arrayOf(PropTypes.object) // For item-level errors, structure matches option errors
        ]),
    }),
    currencySymbol: PropTypes.string,
    themeColor: PropTypes.oneOf(['rose' /* , add other themes here */]),
};

AttributeGroupBuilder.defaultProps = {
    errors: {},
    currencySymbol: "$",
    themeColor: "rose",
};

export default memo(AttributeGroupBuilder);