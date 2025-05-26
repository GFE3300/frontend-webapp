import React, { useState, useMemo, useEffect, useRef, memo, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { InputField, Dropdown } from '../../register/subcomponents';
import Icon from '../../../components/common/Icon';
import { categorizedUnits, convertToBaseUnit, formatCurrency, getBaseUnit, allUnitObjects } from '../utils/unitUtils';
import scriptLines from '../utils/script_lines'; // MODIFIED: Path to script_lines

/**
 * @component RecipeComponentRow
 * @description Renders a single row for a recipe component (ingredient).
 * Allows searching, selecting, or creating ingredients, and setting their quantity and unit.
 */
const RecipeComponentRow = ({
    component,
    index,
    onComponentChange,
    onRemoveComponent,
    availableInventoryItems,
    errors,
    onOpenCreateIngredientModal,
    isDragging = false,
    themeColor = "rose",
}) => {
    // ===========================================================================
    // Configuration & Hooks
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion();
    const generatedIdBase = useId();
    const sl = scriptLines.recipeComponentRow; // MODIFIED: Alias for shorter access

    const THEME_CLASSES = {
        rose: {
            suggestionHoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-700/20',
            createNewSuggestionText: 'text-rose-600 dark:text-rose-400',
            createNewSuggestionHoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
            removeButtonFocusRing: 'focus-visible:ring-red-500',
        },
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationVariants = {
        rowEnterExit: {
            initial: { opacity: 0, y: prefersReducedMotion ? 0 : -15, scale: prefersReducedMotion ? 1 : 0.97 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: prefersReducedMotion ? 0 : 15, scale: prefersReducedMotion ? 1 : 0.97, transition: { duration: 0.2 } },
            transition: { type: "spring", stiffness: 350, damping: 30 }
        },
        suggestionsList: {
            initial: { opacity: 0, y: prefersReducedMotion ? 0 : -10, maxHeight: 0 },
            animate: { opacity: 1, y: 0, maxHeight: '15rem', transition: { type: 'spring', stiffness: 400, damping: 30 } },
            exit: { opacity: 0, y: prefersReducedMotion ? 0 : -5, maxHeight: 0, transition: { duration: 0.15 } }
        },
        costDisplay: {
            initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 },
            transition: { duration: 0.25, ease: "circOut" }
        },
    };
    const MAX_SUGGESTIONS = 7;

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [ingredientSearchText, setIngredientSearchText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);
    const ingredientInputRef = useRef(null);
    const searchTextChangedByUserRef = useRef(false);

    // ===========================================================================
    // Memoized Values (Derived State)
    // ===========================================================================
    const selectedInventoryItem = useMemo(() =>
        availableInventoryItems.find(item => item.id === component.inventoryItemId)
        , [component.inventoryItemId, availableInventoryItems]);

    const filteredSuggestions = useMemo(() => {
        const searchTextLower = ingredientSearchText.trim().toLowerCase();
        if (!searchTextLower) {
            return availableInventoryItems
                .filter(item => !item.isDisabled)
                .slice(0, MAX_SUGGESTIONS)
                .map(item => ({ value: item.id, label: item.name, item }));
        }
        return availableInventoryItems
            .filter(item => !item.isDisabled && item.name.toLowerCase().includes(searchTextLower))
            .slice(0, MAX_SUGGESTIONS)
            .map(item => ({ value: item.id, label: item.name, item }));
    }, [ingredientSearchText, availableInventoryItems]);

    const exactMatchFound = useMemo(() =>
        availableInventoryItems.some(item => item.name.toLowerCase() === ingredientSearchText.trim().toLowerCase())
        , [ingredientSearchText, availableInventoryItems]);

    const unitOptionsForThisRow = useMemo(() => {
        const type = selectedInventoryItem?.measurement_type || selectedInventoryItem?.measurementType;
        if (type && categorizedUnits[type]) {
            return categorizedUnits[type].map(u => ({ value: u.value, label: u.label || u.value }));
        }
        return [{ value: '', label: sl.unitSelectIngredientFirst }, ...allUnitObjects.map(u => ({ value: u.value, label: u.label || u.value }))]; // MODIFIED
    }, [selectedInventoryItem, sl.unitSelectIngredientFirst]);

    const componentCost = useMemo(() => {
        if (!selectedInventoryItem ||
            !selectedInventoryItem.base_unit_for_cost ||
            !component.quantity || !component.unit || parseFloat(component.quantity) <= 0) {
            return null;
        }
        const costValue = selectedInventoryItem.cost_per_base_unit;
        const costUnit = selectedInventoryItem.base_unit_for_cost;
        const measurementType = selectedInventoryItem.measurement_type || selectedInventoryItem.measurementType;

        const quantityInBaseUnit = convertToBaseUnit(parseFloat(component.quantity), component.unit, measurementType);
        const itemExpectedBaseUnit = getBaseUnit(measurementType);

        if (quantityInBaseUnit === null || costUnit !== itemExpectedBaseUnit) {
            // MODIFIED: Using localized string with replacements
            const warnMsg = sl.warnCostCalculation
                .replace('{itemName}', selectedInventoryItem.name)
                .replace('{quantityInBaseUnit}', String(quantityInBaseUnit))
                .replace('{costUnit}', costUnit)
                .replace('{expectedBaseUnit}', itemExpectedBaseUnit);
            console.warn(warnMsg);
            return null;
        }
        return quantityInBaseUnit * costValue;
    }, [component.quantity, component.unit, selectedInventoryItem, sl.warnCostCalculation]);

    // ===========================================================================
    // Effects
    // ===========================================================================
    useEffect(() => {
        if (searchTextChangedByUserRef.current) {
            return;
        }
        let nameFromProps = '';
        if (component.inventoryItemId) {
            if (selectedInventoryItem) {
                nameFromProps = selectedInventoryItem.name;
            } else if (component.inventoryItemName) {
                nameFromProps = component.inventoryItemName;
            }
        }
        if (ingredientSearchText !== nameFromProps) {
            setIngredientSearchText(nameFromProps);
        }
    }, [component.inventoryItemId, component.inventoryItemName, selectedInventoryItem]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        if (showSuggestions) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSuggestions]);
    
    // ===========================================================================
    // Handlers
    // ===========================================================================
    const handleFieldChange = useCallback((field, value) => {
        onComponentChange(index, { [field]: value });
    }, [index, onComponentChange]);

    const handleIngredientSelect = useCallback((selectedItemObject) => {
        searchTextChangedByUserRef.current = true;
        setIngredientSearchText(selectedItemObject.label);
        const updatesToComponent = {
            inventoryItemId: selectedItemObject.value,
            inventoryItemName: selectedItemObject.label,
        };
        onComponentChange(index, updatesToComponent);
        setShowSuggestions(false);
        ingredientInputRef.current?.focus();
        setTimeout(() => { searchTextChangedByUserRef.current = false; }, 0);
    }, [index, onComponentChange]);

    const handleIngredientSearchChange = useCallback((e) => {
        const newSearchText = e.target.value;
        setIngredientSearchText(newSearchText);
        searchTextChangedByUserRef.current = true;
        setShowSuggestions(true);
        if (newSearchText === '' && component.inventoryItemId) {
            onComponentChange(index, {
                inventoryItemId: '',
                inventoryItemName: '',
                unit: '',
                quantity: ''
            });
        }
        setTimeout(() => { searchTextChangedByUserRef.current = false; }, 0);
    }, [component.inventoryItemId, index, onComponentChange]);

    const handleInputBlur = useCallback(() => {
        setTimeout(() => {
            if (wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
                setShowSuggestions(false);
            }
            searchTextChangedByUserRef.current = false;
        }, 150);
    }, []);

    const handleInputFocus = useCallback(() => {
        setShowSuggestions(true);
        searchTextChangedByUserRef.current = true;
    }, []);

    const handleCreateNew = useCallback(() => {
        setShowSuggestions(false);
        onOpenCreateIngredientModal(ingredientSearchText.trim(), (newItemFromBackend) => {
            if (newItemFromBackend && newItemFromBackend.id && newItemFromBackend.name) {
                searchTextChangedByUserRef.current = true;
                setIngredientSearchText(newItemFromBackend.name);
                const updatesToComponent = {
                    inventoryItemId: newItemFromBackend.id,
                    inventoryItemName: newItemFromBackend.name,
                };
                const unitToSet = newItemFromBackend.default_unit;
                if (unitToSet) {
                    updatesToComponent.unit = unitToSet;
                }
                onComponentChange(index, updatesToComponent);
                setTimeout(() => { searchTextChangedByUserRef.current = false; }, 0);
            } else {
                console.error(sl.errorInvalidNewItem, newItemFromBackend); // MODIFIED
            }
            ingredientInputRef.current?.focus();
        });
    }, [ingredientSearchText, index, onComponentChange, onOpenCreateIngredientModal, sl.errorInvalidNewItem]);

    const handleRemoveClick = useCallback(() => {
        onRemoveComponent(component.id);
    }, [component.id, onRemoveComponent]);

    const itemRowStyle = useMemo(() => (
        isDragging ? { zIndex: 100, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.1)", transform: 'scale(1.02)' } : {}
    ), [isDragging]);

    // ===========================================================================
    // Props Validation (Development Aid)
    // ===========================================================================
    if (import.meta.env.DEV) {
        if (!component || typeof component.id !== 'string') {
            console.error(sl.devErrorInvalidComponentProp, { component }); // MODIFIED
        }
        if (typeof index !== 'number') {
            console.error(sl.devErrorInvalidIndexProp, { index }); // MODIFIED
        }
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    const srIngredientLabel = `${sl.ingredientSrLabelPrefix} ${ingredientSearchText || `${sl.ingredientSrLabelItemInfix} ${index + 1}`}`;
    const quantityAriaLabel = `${sl.quantityAriaLabelPrefix} ${ingredientSearchText || `${sl.ingredientSrLabelItemInfix} ${index + 1}`}`;
    const unitAriaLabel = `${sl.unitAriaLabelPrefix} ${ingredientSearchText || `${sl.ingredientSrLabelItemInfix} ${index + 1}`}`;
    const removeButtonAriaLabel = `${sl.removeButtonAriaLabelPrefix} ${ingredientSearchText || `${sl.ingredientSrLabelItemInfix} ${index + 1}`}`;

    return (
        <motion.div
            layout
            variants={animationVariants.rowEnterExit}
            initial="initial"
            animate="animate"
            exit="exit"
            className="recipe-component-row flex flex-col gap-y-3 px-3 py-4 border border-neutral-200 dark:border-neutral-600/80 rounded-xl bg-white dark:bg-neutral-800/60 shadow-sm hover:shadow-lg transition-shadow duration-200"
            ref={wrapperRef}
            style={itemRowStyle}
            role="group"
            aria-labelledby={`${generatedIdBase}-ingredient-name-label`}
        >
            <div className="flex flex-col gap-y-3 sm:gap-y-2.5">
                <div className="relative h-15 flex flex-col justify-end">
                    <InputField
                        ref={ingredientInputRef}
                        id={`${generatedIdBase}-ingredient-search`}
                        label={sl.ingredientLabel} // MODIFIED
                        name={`recipeSearch_${component.id}`}
                        type="text"
                        value={ingredientSearchText}
                        onChange={handleIngredientSearchChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder={sl.ingredientPlaceholder} // MODIFIED
                        error={errors?.inventoryItemId}
                        required
                        hidelabel
                        classNameWrapper="mb-0"
                        inputClassName="text-sm sm:text-base"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestions}
                        aria-controls={`${generatedIdBase}-suggestions-list`}
                    />
                    <label id={`${generatedIdBase}-ingredient-name-label`} className="sr-only">
                        {srIngredientLabel} {/* MODIFIED */}
                    </label>
                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.ul
                                id={`${generatedIdBase}-suggestions-list`}
                                variants={animationVariants.suggestionsList}
                                initial="initial" animate="animate" exit="exit"
                                className="absolute top-full mt-1 z-30 w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1"
                                role="listbox"
                            >
                                {filteredSuggestions.map(itemSuggest => (
                                    <li key={itemSuggest.value}
                                        className={`px-3 py-2.5 ${currentTheme.suggestionHoverBg} cursor-pointer text-sm text-neutral-700 dark:text-neutral-200 flex justify-between items-center`}
                                        onMouseDown={(e) => { e.preventDefault(); handleIngredientSelect(itemSuggest); }}
                                        role="option"
                                        aria-selected={component.inventoryItemId === itemSuggest.value}
                                    >
                                        <span>{itemSuggest.label}</span>
                                        {(itemSuggest.item.measurement_type || itemSuggest.item.measurementType) &&
                                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                                ({itemSuggest.item.measurement_type || itemSuggest.item.measurementType})
                                            </span>
                                        }
                                    </li>
                                ))}
                                {!exactMatchFound && ingredientSearchText.trim().length > 0 && (
                                    <li className={`px-3 py-2.5 text-sm ${currentTheme.createNewSuggestionText} ${currentTheme.createNewSuggestionHoverBg} cursor-pointer border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5`}
                                        onMouseDown={(e) => { e.preventDefault(); handleCreateNew(); }}
                                        role="option"
                                    >
                                        <Icon name="add_circle" className="w-6 h-6" />
                                        {sl.suggestionCreateNewPrefix} "<strong>{ingredientSearchText.trim()}</strong>" {/* MODIFIED */}
                                    </li>
                                )}
                                {filteredSuggestions.length === 0 && ingredientSearchText.trim().length > 0 && !exactMatchFound && (
                                    <li className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 italic">{sl.suggestionNoMatch}</li> // MODIFIED
                                )}
                                {ingredientSearchText.trim().length === 0 && availableInventoryItems.length === 0 && (
                                    <li className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 italic">{sl.suggestionNoIngredients}</li> // MODIFIED
                                )}
                                {ingredientSearchText.trim().length > 0 && filteredSuggestions.length === 0 && exactMatchFound && (
                                    <li className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 italic">{sl.suggestionExactMatch}</li> // MODIFIED
                                )}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto] gap-x-2.5 gap-y-3 items-end">
                    <div className="col-span-1 h-15 flex flex-col justify-end">
                        <InputField
                            id={`${generatedIdBase}-quantity`}
                            label={sl.quantityLabel} // MODIFIED
                            name={`qty_${component.id}`}
                            type="number"
                            value={component.quantity || ''}
                            onChange={(e) => handleFieldChange('quantity', e.target.value)}
                            error={errors?.quantity}
                            placeholder={sl.quantityPlaceholder} // MODIFIED
                            min="0.000001"
                            step="any"
                            required
                            hidelabel
                            classNameWrapper="mb-0"
                            inputClassName="text-sm sm:text-base"
                            aria-label={quantityAriaLabel} // MODIFIED
                        />
                    </div>
                    <div className="col-span-1 h-15 flex flex-col justify-end">
                        <Dropdown
                            id={`${generatedIdBase}-unit`}
                            label={sl.unitLabel} // MODIFIED
                            name={`unit_${component.id}`}
                            options={[{ value: '', label: sl.unitSelectPlaceholder }, ...unitOptionsForThisRow]} // MODIFIED
                            value={component.unit || ''}
                            onChange={(val) => handleFieldChange('unit', val)}
                            error={errors?.unit}
                            required
                            disabled={!selectedInventoryItem}
                            hidelabel
                            classNameWrapper="mb-0"
                            aria-label={unitAriaLabel} // MODIFIED
                            errorClassName="absolute"
                        />
                    </div>
                    <div className="flex flex-col justify-end col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">{sl.estimatedCostLabel}</label> {/* MODIFIED */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={componentCost === null ? `no-cost-${component.id}` : `cost-${component.id}-${componentCost}`}
                                variants={animationVariants.costDisplay}
                                initial="initial" animate="animate" exit="exit"
                                className="h-9 flex items-center text-sm px-3 rounded-full bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-200 font-medium"
                            >
                                {componentCost !== null ? formatCurrency(componentCost) : sl.estimatedCostNA} {/* MODIFIED */}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
                        <button
                            type="button"
                            onClick={handleRemoveClick}
                            className={`w-full sm:w-auto flex items-center justify-center p-2 sm:h-9 sm:w-9 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-300 rounded-md sm:rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${currentTheme.removeButtonFocusRing} focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-600/50 bg-neutral-50 dark:bg-neutral-700/30 sm:bg-transparent sm:dark:bg-transparent mt-1 sm:mt-0 sm:self-end`}
                            aria-label={removeButtonAriaLabel} // MODIFIED
                        >
                            <Icon name="remove_circle_outline" className="w-6 h-6 sm:w-6 sm:h-6" />
                            <span className="sm:hidden ml-2 text-xs">{sl.removeButtonTextSmallScreen}</span> {/* MODIFIED */}
                        </button>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {(typeof errors === 'string' || errors?.general) && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 dark:text-red-400 mt-1.5 px-1 flex items-center gap-1"
                        role="alert"
                    >
                        <Icon name="error_outline" className="w-3.5 h-3.5 flex-shrink-0" />
                        {typeof errors === 'string' ? errors : errors.general}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

RecipeComponentRow.propTypes = {
    component: PropTypes.shape({
        id: PropTypes.string.isRequired,
        inventoryItemId: PropTypes.string,
        inventoryItemName: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        unit: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onComponentChange: PropTypes.func.isRequired,
    availableInventoryItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        default_unit: PropTypes.string,
        measurement_type: PropTypes.string,
        cost_per_base_unit: PropTypes.number,
        base_unit_for_cost: PropTypes.string,
        isDisabled: PropTypes.bool,
    })).isRequired,
    errors: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            inventoryItemId: PropTypes.string,
            quantity: PropTypes.string,
            unit: PropTypes.string,
            general: PropTypes.string,
        }),
    ]),
    onOpenCreateIngredientModal: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    themeColor: PropTypes.oneOf(['rose']),
};

RecipeComponentRow.defaultProps = {
    isDragging: false,
    themeColor: "rose",
    errors: null,
};

export default memo(RecipeComponentRow);