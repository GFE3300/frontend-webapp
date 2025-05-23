import React, { memo, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Checkbox, Dropdown, InputField } from '../../../features/register/subcomponents'; // Ensure paths are correct
import Icon from '../../../components/common/Icon';
import AttributeOptionRow from './AttributeOptionRow';
import scriptLines from '../utils/script_lines'; 

/**
 * Builds and manages a group of editable product attributes.
 * ... (rest of the JSDoc comments) ...
 */
const AttributeGroupBuilder = ({
    group,
    groupIndex,
    onGroupChange,
    onRemoveGroup,
    onOptionChange,
    onAddOption,
    onRemoveOption,
    onReorderOptions,
    errors = {},
    currencySymbol = scriptLines.currencySymbol_USD, // Using scriptLines for default currency
    themeColor = "rose",
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const generatedIdBase = useId();

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
        { value: 'single_select', label: scriptLines.attributeGroup_type_singleSelectLabel },
        { value: 'multi_select', label: scriptLines.attributeGroup_type_multiSelectLabel },
    ];

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleGroupFieldChange = useCallback((field, value) => {
        onGroupChange(groupIndex, field, value);
    }, [groupIndex, onGroupChange]);

    const handleOptionDefaultChange = useCallback((optionIndex, newCheckedState) => {
        const newOptions = group.options.map((opt, idx) => ({
            ...opt,
            isDefault: idx === optionIndex ? newCheckedState : (group.type === 'single_select' ? false : opt.isDefault),
        }));
        onGroupChange(groupIndex, 'options', newOptions);
    }, [group.options, group.type, groupIndex, onGroupChange]);

    const handleOptionRowChange = useCallback((groupIdx, optionIdx, field, value) => {
        if (field === 'isDefault') {
            handleOptionDefaultChange(optionIdx, value);
        } else {
            onOptionChange(groupIdx, optionIdx, field, value);
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
    const optionsListError = (errors?.options && typeof errors.options === 'string') ? errors.options : null;
    const groupNumberForAria = groupIndex + 1;
    const groupNameOrNumberForAria = group.name || `Group ${groupNumberForAria}`;

    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (!group || typeof group.id !== 'string' || typeof group.name === 'undefined' || !Array.isArray(group.options)) {
        console.error('AttributeGroupBuilder: Invalid `group` prop structure.');
        return <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">{scriptLines.attributeGroup_error_invalidGroupData}</div>;
    }
    if (typeof groupIndex !== 'number') {
        console.error('AttributeGroupBuilder: `groupIndex` prop is required and must be a number.');
        return <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">{scriptLines.attributeGroup_error_missingGroupIndex}</div>;
    }
    const requiredFunctions = { onGroupChange, onRemoveGroup, onOptionChange, onAddOption, onRemoveOption };
    for (const funcName in requiredFunctions) {
        if (typeof requiredFunctions[funcName] !== 'function') {
            console.error(`AttributeGroupBuilder: \`${funcName}\` prop is required and must be a function.`);
            return <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">{scriptLines.attributeGroup_error_missingHandler.replace('{handlerName}', funcName)}</div>;
        }
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <motion.div
            layout
            variants={animationVariants.groupCard}
            initial="initial"
            animate="animate"
            exit="exit"
            className="attribute-group-builder p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/70 shadow-lg space-y-4 sm:space-y-5"
            role="group"
            aria-labelledby={`${generatedIdBase}-group-name-label`}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto] gap-x-3 gap-y-4 items-end">
                <div className="flex h-15 flex-col justify-end">
                    <InputField
                        id={`${generatedIdBase}-group-name`}
                        label={scriptLines.attributeGroup_groupNameLabel}
                        value={group.name}
                        onChange={(e) => handleGroupFieldChange('name', e.target.value)}
                        placeholder={scriptLines.attributeGroup_groupNamePlaceholder}
                        required
                        error={errors?.name}
                        maxLength={50}
                        inputClassName="text-sm sm:text-base"
                        aria-label={scriptLines.attributeGroup_groupName_ariaLabel.replace('{groupNumber}', groupNumberForAria.toString())}
                    />
                    <label id={`${generatedIdBase}-group-name-label`} className="sr-only">
                        {scriptLines.attributeGroup_groupName_srLabel.replace('{groupNameOrNumber}', groupNameOrNumberForAria)}
                    </label>
                </div>

                <div className="flex h-15 flex-col justify-end">
                    <Dropdown
                        id={`${generatedIdBase}-group-type`}
                        label={scriptLines.attributeGroup_typeLabel}
                        value={group.type}
                        onChange={(value) => handleGroupFieldChange('type', value)}
                        options={GROUP_TYPE_OPTIONS}
                        error={errors?.type}
                        className="w-full"
                        aria-label={scriptLines.attributeGroup_type_ariaLabel.replace('{groupNumber}', groupNumberForAria.toString())}
                        errorClassName="absolute"
                    />
                </div>

                <div className="flex items-center justify-start sm:justify-center md:pb-[0.4rem]">
                    <Checkbox
                        id={`${generatedIdBase}-group-required`}
                        label={scriptLines.attributeGroup_requiredLabel}
                        checked={!!group.isRequired}
                        onChange={(isChecked) => handleGroupFieldChange('isRequired', isChecked)}
                        error={errors?.isRequired}
                        labelClassName="text-xs sm:text-sm"
                        aria-label={scriptLines.attributeGroup_required_ariaLabel.replace('{groupNumber}', groupNumberForAria.toString())}
                    />
                </div>

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
                    aria-label={scriptLines.attributeGroup_removeGroupButton_ariaLabel.replace('{groupNameOrNumber}', groupNameOrNumberForAria)}
                >
                    <Icon name="delete" className="w-6 h-6 sm:w-6 sm:h-6" />
                    <span className="sm:hidden ml-2">{scriptLines.attributeGroup_removeGroupButton_mobileText}</span>
                </button>
            </div>

            <div className="options-area pl-0 sm:pl-1 mt-3 sm:mt-4 border-t border-neutral-200/70 dark:border-neutral-600/50 pt-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {group.name
                        ? scriptLines.attributeGroup_optionsForGroupTitle.replace('{groupName}', group.name)
                        : scriptLines.attributeGroup_optionsForThisGroupTitle
                    }
                </h4>
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

                <div className="flex flex-col gap-y-2.5">
                    <Reorder.Group
                        axis="y"
                        values={group.options.map(opt => opt.id)}
                        onReorder={(newOrderOptionIds) => {
                            if (onReorderOptions) {
                                const reorderedOptions = newOrderOptionIds.map(id => group.options.find(opt => opt.id === id)).filter(Boolean);
                                onReorderOptions(groupIndex, reorderedOptions);
                            }
                        }}
                        className="space-y-2.5"
                    >
                        <AnimatePresence initial={false}>
                            {group.options.map((option, optionIdx) => (
                                <Reorder.Item key={option.id} value={option.id} className="bg-transparent">
                                    <AttributeOptionRow
                                        option={option}
                                        groupIndex={groupIndex}
                                        optionIndex={optionIdx}
                                        onOptionChange={handleOptionRowChange}
                                        onRemoveOption={onRemoveOption}
                                        isOnlyOption={group.options.length === 1}
                                        errorName={errors?.options?.[optionIdx]?.name}
                                        errorPriceAdjustment={errors?.options?.[optionIdx]?.priceAdjustment}
                                        currencySymbol={currencySymbol}
                                        themeColor={themeColor}
                                    />
                                </Reorder.Item>
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>
                </div>

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
                    <Icon name="add_circle" className="w-6 h-6" /> {scriptLines.attributeGroup_addOptionButton}
                </button>
            </div>
        </motion.div>
    );
};

AttributeGroupBuilder.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['single_select', 'multi_select']).isRequired,
        isRequired: PropTypes.bool,
        options: PropTypes.arrayOf(PropTypes.object).isRequired,
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
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.object)
        ]),
    }),
    currencySymbol: PropTypes.string,
    themeColor: PropTypes.oneOf(['rose']),
};

AttributeGroupBuilder.defaultProps = {
    errors: {},
    currencySymbol: scriptLines.currencySymbol_USD, // Updated default prop
    themeColor: "rose",
};

export default memo(AttributeGroupBuilder);