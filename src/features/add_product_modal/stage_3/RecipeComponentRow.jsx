// frontend/src/features/add_product_modal/stage_3/RecipeComponentRow.jsx
import React, { useState, useMemo, useEffect, useRef, memo, useCallback, useId } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { InputField, Dropdown } from '../../register/subcomponents';
import Icon from '../../../components/common/Icon';
import { categorizedUnits, convertToBaseUnit, formatCurrency, getBaseUnit, allUnitObjects } from '../utils/unitUtils';

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
    const wrapperRef = useRef(null); // For click-outside detection
    const ingredientInputRef = useRef(null); // For focusing the input field

    // Ref to manage whether the last update to `ingredientSearchText` was from
    // user interaction (typing, selection) or a prop-driven effect.
    // This helps prevent the prop-driven effect from overwriting fresh user input.
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
        const type = selectedInventoryItem?.measurement_type || selectedInventoryItem?.measurementType; // Prefer backend, fallback to frontend
        if (type && categorizedUnits[type]) {
            return categorizedUnits[type].map(u => ({ value: u.value, label: u.label || u.value }));
        }
        return [{ value: '', label: 'Select ingredient first' }, ...allUnitObjects.map(u => ({ value: u.value, label: u.label || u.value }))];
    }, [selectedInventoryItem]);

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
            console.warn(`RecipeComponentRow Cost calc issue for ${selectedInventoryItem.name}: QIB ${quantityInBaseUnit}, Cost unit ${costUnit}, Expected base unit ${itemExpectedBaseUnit}`);
            return null;
        }
        return quantityInBaseUnit * costValue;
    }, [component.quantity, component.unit, selectedInventoryItem]);

    // ===========================================================================
    // Effects
    // ===========================================================================

    // Effect to synchronize `ingredientSearchText` with external changes to the component's data
    // (e.g., when an item is selected programmatically, a template is loaded, or the component is cleared).
    useEffect(() => {
        // If `searchTextChangedByUserRef` is true, it means the user is currently typing or just made a selection.
        // In this case, we don't want this effect to override their input or selection.
        // The flag will be reset by the input handlers or selection handlers.
        if (searchTextChangedByUserRef.current) {
            return;
        }

        let nameFromProps = '';
        if (component.inventoryItemId) { // If an item is actually selected
            if (selectedInventoryItem) { // And it's found in the current list
                nameFromProps = selectedInventoryItem.name;
            } else if (component.inventoryItemName) { // Or if a name is directly on the component (e.g., after creation before list refresh)
                nameFromProps = component.inventoryItemName;
            }
        }
        // If nameFromProps is different from current searchText, update searchText.
        // This ensures that if the parent component clears inventoryItemId, the input also clears.
        if (ingredientSearchText !== nameFromProps) {
            setIngredientSearchText(nameFromProps);
        }
    }, [component.inventoryItemId, component.inventoryItemName, selectedInventoryItem]);
    // Note: ingredientSearchText is NOT a dependency here to prevent loops with user typing.

    // Effect to handle clicks outside the suggestions dropdown to close it.
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

    // Generic handler to update a field in the parent component's state.
    const handleFieldChange = useCallback((field, value) => {
        onComponentChange(index, { [field]: value }); // Calls parent with (index, { object })
    }, [index, onComponentChange]);

    // Handler for when an ingredient is selected from the autocomplete list.
    const handleIngredientSelect = useCallback((selectedItemObject) => {
        searchTextChangedByUserRef.current = true; // Mark that this change is from direct user interaction
        setIngredientSearchText(selectedItemObject.label); // Update the input field text immediately

        // Prepare all updates together
        const updatesToComponent = {
            inventoryItemId: selectedItemObject.value,
            inventoryItemName: selectedItemObject.label,
        };

        onComponentChange(index, updatesToComponent); // Pass the object of updates

        setShowSuggestions(false);
        ingredientInputRef.current?.focus();

        setTimeout(() => { searchTextChangedByUserRef.current = false; }, 0);
    }, [index, onComponentChange]);

    // Handler for when the user types in the ingredient search input.
    const handleIngredientSearchChange = useCallback((e) => {
        const newSearchText = e.target.value;
        setIngredientSearchText(newSearchText);
        searchTextChangedByUserRef.current = true; // User is actively typing
        setShowSuggestions(true);

        if (newSearchText === '' && component.inventoryItemId) {
            // If user clears the text, clear the selected item and related fields.
            onComponentChange(index, { // Send as a batch
                inventoryItemId: '',
                inventoryItemName: '',
                unit: '',
                quantity: '' // Clear quantity as well
            });
        }
        setTimeout(() => { searchTextChangedByUserRef.current = false; }, 0);
    }, [component.inventoryItemId, index, onComponentChange]);

    // Handler for when the ingredient search input loses focus.
    const handleInputBlur = useCallback(() => {
        // Delay hiding suggestions to allow `onMouseDown` on a suggestion to fire first.
        setTimeout(() => {
            if (wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
                setShowSuggestions(false);
            }
            // If focus truly left without a selection, reset the user interaction flag.
            searchTextChangedByUserRef.current = false;
        }, 150);
    }, []);

    // Handler for when the ingredient search input gains focus.
    const handleInputFocus = useCallback(() => {
        setShowSuggestions(true);
        searchTextChangedByUserRef.current = true; // User is now interacting with this input
    }, []);

    // Handler for creating a new ingredient via the modal.
    const handleCreateNew = useCallback(() => {
        setShowSuggestions(false);
        onOpenCreateIngredientModal(ingredientSearchText.trim(), (newItemFromBackend) => {
            if (newItemFromBackend && newItemFromBackend.id && newItemFromBackend.name) {
                searchTextChangedByUserRef.current = true;
                setIngredientSearchText(newItemFromBackend.name);

                // Prepare batch update
                const updatesToComponent = {
                    inventoryItemId: newItemFromBackend.id,
                    inventoryItemName: newItemFromBackend.name,
                    // Let RecipeBuilder handle default unit setting
                };
                // Check for default unit from backend (consistent naming: default_unit)
                const unitToSet = newItemFromBackend.default_unit;
                if (unitToSet) {
                    updatesToComponent.unit = unitToSet;
                }
                onComponentChange(index, updatesToComponent);

                setTimeout(() => { searchTextChangedByUserRef.current = false; }, 0);
            } else {
                console.error("RecipeComponentRow: newItemFromBackend received from creation modal is invalid.", newItemFromBackend);
            }
            ingredientInputRef.current?.focus();
        });
    }, [ingredientSearchText, index, onComponentChange, onOpenCreateIngredientModal]);

    // Handler for removing this recipe component.
    const handleRemoveClick = useCallback(() => {
        onRemoveComponent(component.id);
    }, [component.id, onRemoveComponent]);

    // Style for when the row is being dragged (for reordering).
    const itemRowStyle = useMemo(() => (
        isDragging ? { zIndex: 100, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.1)", transform: 'scale(1.02)' } : {}
    ), [isDragging]);

    // ===========================================================================
    // Props Validation (Development Aid)
    // ===========================================================================
    if (import.meta.env.DEV) { // Using Vite's specific env variable for development checks
        if (!component || typeof component.id !== 'string') {
            console.error('RecipeComponentRow Dev Error: Invalid `component` prop.', { component });
        }
        if (typeof index !== 'number') {
            console.error('RecipeComponentRow Dev Error: `index` prop is required and must be a number.', { index });
        }
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
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
                {/* Row 1: Ingredient Search Input & Suggestions */}
                <div className="relative h-15 flex flex-col justify-end">
                    <InputField
                        ref={ingredientInputRef}
                        id={`${generatedIdBase}-ingredient-search`}
                        label="Ingredient"
                        name={`recipeSearch_${component.id}`}
                        type="text"
                        value={ingredientSearchText}
                        onChange={handleIngredientSearchChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search or create ingredient..."
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
                        Recipe Ingredient: {ingredientSearchText || `Item ${index + 1}`}
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
                                        Create new: "<strong>{ingredientSearchText.trim()}</strong>"
                                    </li>
                                )}
                                {/* UI Hints for search results */}
                                {filteredSuggestions.length === 0 && ingredientSearchText.trim().length > 0 && !exactMatchFound && (
                                    <li className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 italic">No matching ingredients found.</li>
                                )}
                                {ingredientSearchText.trim().length === 0 && availableInventoryItems.length === 0 && (
                                    <li className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 italic">No ingredients available. Start typing to create one.</li>
                                )}
                                {ingredientSearchText.trim().length > 0 && filteredSuggestions.length === 0 && exactMatchFound && (
                                    <li className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 italic">Exact match selected.</li>
                                )}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                {/* Row 2: Quantity, Unit, Cost, Remove Button */}
                <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto] gap-x-2.5 gap-y-3 items-end">
                    <div className="col-span-1 h-15 flex flex-col justify-end">
                        <InputField
                            id={`${generatedIdBase}-quantity`}
                            label="Quantity"
                            name={`qty_${component.id}`}
                            type="number"
                            value={component.quantity || ''}
                            onChange={(e) => handleFieldChange('quantity', e.target.value)}
                            error={errors?.quantity}
                            placeholder="e.g., 100"
                            min="0.000001"
                            step="any"
                            required
                            hidelabel
                            classNameWrapper="mb-0"
                            inputClassName="text-sm sm:text-base"
                            aria-label={`Quantity for ${ingredientSearchText || `item ${index + 1}`}`}
                        />
                    </div>
                    <div className="col-span-1 h-15 flex flex-col justify-end">
                        <Dropdown
                            id={`${generatedIdBase}-unit`}
                            label="Unit"
                            name={`unit_${component.id}`}
                            options={[{ value: '', label: 'Select...' }, ...unitOptionsForThisRow]}
                            value={component.unit || ''}
                            onChange={(val) => handleFieldChange('unit', val)}
                            error={errors?.unit}
                            required
                            disabled={!selectedInventoryItem}
                            hidelabel
                            classNameWrapper="mb-0"
                            aria-label={`Unit for ${ingredientSearchText || `item ${index + 1}`}`}
                            errorClassName="absolute"
                        />
                    </div>
                    <div className="flex flex-col justify-end col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">Est. Cost</label>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={componentCost === null ? `no-cost-${component.id}` : `cost-${component.id}-${componentCost}`}
                                variants={animationVariants.costDisplay}
                                initial="initial" animate="animate" exit="exit"
                                className="h-9 flex items-center text-sm px-3 rounded-full bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-200 font-medium"
                            >
                                {componentCost !== null ? formatCurrency(componentCost) : 'N/A'}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
                        <button
                            type="button"
                            onClick={handleRemoveClick}
                            className={`w-full sm:w-auto flex items-center justify-center p-2 sm:h-9 sm:w-9 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-300 rounded-md sm:rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${currentTheme.removeButtonFocusRing} focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-600/50 bg-neutral-50 dark:bg-neutral-700/30 sm:bg-transparent sm:dark:bg-transparent mt-1 sm:mt-0 sm:self-end`}
                            aria-label={`Remove ingredient ${ingredientSearchText || `item ${index + 1}`}`}
                        >
                            <Icon name="remove_circle_outline" className="w-6 h-6 sm:w-6 sm:h-6" />
                            <span className="sm:hidden ml-2 text-xs">Remove Ingredient</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Row-Level Error Display */}
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
        default_unit: PropTypes.string,      // Expect data from backend
        measurement_type: PropTypes.string,  // Expect data from backend
        cost_per_base_unit: PropTypes.number, // Expect data from backend (as number)
        base_unit_for_cost: PropTypes.string,// Expect data from backend
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