import React, { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import RecipeComponentRow from './RecipeComponentRow';
import { convertToBaseUnit, formatCurrency, getBaseUnit, categorizedUnits, calculateRawRecipeCost } from '../utils/unitUtils';

// ===========================================================================
// Component Documentation
// ===========================================================================
/**
 * @component RecipeBuilder
 * @description A component for dynamically building and managing a list of recipe ingredients.
 * It allows adding, removing, reordering, and editing recipe components (ingredients).
 * It also calculates and displays the estimated total cost of the recipe based on inventory item costs.
 *
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.components - An array of recipe component objects. Each object should have at least an `id`, `inventoryItemId`, `inventoryItemName`, `quantity`, and `unit`.
 * @param {function} props.onComponentsChange - Callback function invoked when the components array changes (add, remove, update, reorder). Receives the new components array.
 * @param {Array<Object>} props.availableInventoryItems - An array of available inventory items to select from. Each item should have `id`, `name`, `costPerBaseUnit` ({value, unit}), `measurementType`, and optionally `defaultUnit`.
 * @param {Object} [props.errors] - An object containing validation errors related to the recipe components.
 *                                 Can have a top-level `recipeComponents` string error, or an array of errors for each component row.
 *                                 Example: `{ recipeComponents: "Recipe must have at least one ingredient." }` or
 *                                 `{ recipeComponents: [null, { quantity: "Quantity is required." }] }`
 * @param {function} props.onOpenCreateIngredientModal - Callback function to open a modal for creating a new inventory item (ingredient).
 */
const RecipeBuilder = ({
    components, // Validated below
    onComponentsChange, // Validated below
    availableInventoryItems, // Validated below
    errors,
    onOpenCreateIngredientModal, // Validated below
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const CONFIG = {
        TEXT: {
            TITLE: "Recipe Ingredients",
            SUBTITLE: "Define ingredients for one batch. Drag to reorder.",
            ESTIMATED_COST_PREFIX: "Est. Recipe Cost:",
            EMPTY_STATE_TITLE: "Recipe is Empty",
            EMPTY_STATE_SUBTITLE: "Add ingredients to build your product's recipe.",
            ADD_FIRST_BUTTON: "Add First Ingredient",
            ADD_ANOTHER_BUTTON: "Add Another Ingredient",
        },
        ANIMATION: {
            LAYOUT_CONTAINER: {
                layout: true,
            },
            COST_DISPLAY: {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
            },
            ERROR_MESSAGE: {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
            },
            EMPTY_STATE: {
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.95 },
            },
            ADD_BUTTON_HOVER: { scale: 1.02 },
            ADD_BUTTON_TAP: { scale: 0.98 },
        },
        NEW_COMPONENT_ID_PREFIX: 'component_',
    };

    // ===========================================================================
    // State
    // ===========================================================================
    const [draggingRowId, setDraggingRowId] = useState(null);

    // ===========================================================================
    // Memoized Values
    // ===========================================================================
    const totalRecipeCost = useMemo(() => {
        // RecipeBuilder is typically used for 'made_in_house' products,
        // so calculateRawRecipeCost is appropriate here.
        return calculateRawRecipeCost(components, availableInventoryItems);
    }, [components, availableInventoryItems]);

    console.log("[RecipeBuilder] totalRecipeCost:", totalRecipeCost);

    const arrayLevelError = useMemo(() => (typeof errors?.recipeComponents === 'string' ? errors.recipeComponents : null), [errors]);

    // ===========================================================================
    // Event Handlers
    // ===========================================================================
    const handleAddComponent = () => {
        const newId = `${CONFIG.NEW_COMPONENT_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        onComponentsChange([...components, { id: newId, inventoryItemId: '', inventoryItemName: '', quantity: '', unit: '' }]);
    };

    const handleRemoveComponent = (idToRemove) => {
        // The original implementation used index, but ID is safer with reordering
        onComponentsChange(components.filter(comp => comp.id !== idToRemove));
    };

    const handleComponentChange = (componentId, updates) => {
        console.log("[RecipeBuilder] handleComponentChange - componentId:", componentId, "updates:", updates); // ADD THIS LOG

        const newComponents = components.map((comp) => {
            if (comp.id === componentId) {
                let updatedComp = { ...comp, ...updates }; // Key line: spread existing, then new updates

                if (Object.prototype.hasOwnProperty.call(updates, 'inventoryItemId')) {
                    const newItemId = updates.inventoryItemId; // This should be the ID from selected item
                    const selectedItem = availableInventoryItems.find(item => item.id === newItemId);

                    if (selectedItem) {
                        // If inventoryItemName wasn't in `updates`, set it from selectedItem
                        if (!Object.prototype.hasOwnProperty.call(updates, 'inventoryItemName')) {
                            updatedComp.inventoryItemName = selectedItem.name;
                        }

                        const backendDefaultUnit = selectedItem.default_unit;
                        const newMeasurementType = selectedItem.measurement_type;
                        const currentUnitInUpdateCycle = Object.prototype.hasOwnProperty.call(updates, 'unit') ? updates.unit : comp.unit;

                        // Only set default unit if 'unit' wasn't part of this specific `updates` batch
                        if (!Object.prototype.hasOwnProperty.call(updates, 'unit')) {
                            if (backendDefaultUnit) {
                                updatedComp.unit = backendDefaultUnit;
                            } else if (currentUnitInUpdateCycle && newMeasurementType) {
                                const unitsForNewType = categorizedUnits[newMeasurementType]?.map(u => u.value) || [];
                                if (!unitsForNewType.includes(currentUnitInUpdateCycle)) {
                                    updatedComp.unit = '';
                                }
                            } else {
                                updatedComp.unit = '';
                            }
                        }
                    } else if (!newItemId) { // If inventoryItemId is being cleared
                        if (!Object.prototype.hasOwnProperty.call(updates, 'inventoryItemName')) updatedComp.inventoryItemName = '';
                        if (!Object.prototype.hasOwnProperty.call(updates, 'unit')) updatedComp.unit = '';
                        if (!Object.prototype.hasOwnProperty.call(updates, 'quantity')) updatedComp.quantity = ''; // Also clear quantity
                    }
                }
                return updatedComp;
            }
            return comp;
        });
        onComponentsChange(newComponents);
    };

    // ===========================================================================
    // Validation (Critical Props)
    // ===========================================================================
    if (
        !Array.isArray(components) ||
        typeof onComponentsChange !== 'function' ||
        !Array.isArray(availableInventoryItems) ||
        typeof onOpenCreateIngredientModal !== 'function'
    ) {
        console.error(
            'RecipeBuilder: Missing or invalid critical props. `components` (array), `onComponentsChange` (function), `availableInventoryItems` (array), and `onOpenCreateIngredientModal` (function) are required.'
        );
        return (
            <div className="p-4 text-sm text-red-600 dark:text-red-400 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900/30">
                Error: Recipe Builder is misconfigured. Please check console for details.
            </div>
        );
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <motion.div
            {...CONFIG.ANIMATION.LAYOUT_CONTAINER}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/60 shadow-lg space-y-4"
        >
            {/* Header: Title and Estimated Cost */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h3 className="text-base sm:text-md font-semibold text-neutral-700 dark:text-neutral-200">
                        {CONFIG.TEXT.TITLE}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {CONFIG.TEXT.SUBTITLE}
                    </p>
                </div>
                {components.length > 0 && (
                    <motion.div
                        {...CONFIG.ANIMATION.COST_DISPLAY}
                        className="mt-2 sm:mt-0 px-3 py-1.5 bg-green-100 dark:bg-green-700/30 text-green-700 dark:text-green-200 rounded-lg text-xs sm:text-sm font-medium"
                    >
                        {CONFIG.TEXT.ESTIMATED_COST_PREFIX} {formatCurrency(totalRecipeCost)}
                    </motion.div>
                )}
            </div>

            {/* Array-Level Error Message */}
            {arrayLevelError && (
                <motion.div
                    {...CONFIG.ANIMATION.ERROR_MESSAGE}
                    className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-xs text-red-700 dark:text-red-300"
                >
                    {arrayLevelError}
                </motion.div>
            )}

            {/* Empty State */}
            <AnimatePresence>
                {components.length === 0 && !arrayLevelError && (
                    <motion.div
                        {...CONFIG.ANIMATION.EMPTY_STATE}
                        className="text-center py-8 sm:py-10 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700/40"
                    >
                        <Icon name="list_alt_add" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-3" />
                        <p className="text-sm sm:text-md font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                            {CONFIG.TEXT.EMPTY_STATE_TITLE}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4">
                            {CONFIG.TEXT.EMPTY_STATE_SUBTITLE}
                        </p>
                        <motion.button
                            type="button"
                            onClick={handleAddComponent}
                            className="flex items-center justify-center gap-1.5 mx-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 dark:focus-visible:ring-offset-neutral-700/40"
                            whileHover={CONFIG.ANIMATION.ADD_BUTTON_HOVER}
                            whileTap={CONFIG.ANIMATION.ADD_BUTTON_TAP}
                        >
                            <Icon name="add_circle" className="w-6 h-6" /> {CONFIG.TEXT.ADD_FIRST_BUTTON}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recipe Component Rows */}
            {components.length > 0 && (
                <Reorder.Group
                    axis="y"
                    values={components}
                    onReorder={onComponentsChange}
                    className="space-y-3" // Spacing between component rows
                >
                    <AnimatePresence initial={false}>
                        {components.map((component, index) => {
                            // Error handling for individual rows
                            let rowErrors = {};
                            let generalRowError = null;
                            if (errors && Array.isArray(errors.recipeComponents) && errors.recipeComponents[index]) {
                                if (typeof errors.recipeComponents[index] === 'string') {
                                    generalRowError = errors.recipeComponents[index];
                                } else if (typeof errors.recipeComponents[index] === 'object') {
                                    Object.assign(rowErrors, errors.recipeComponents[index]);
                                }
                            }
                            const errorsForThisRow = generalRowError || (Object.keys(rowErrors).length > 0 ? rowErrors : null);

                            return (
                                <Reorder.Item
                                    key={component.id}
                                    value={component} // This is what `onReorder` receives
                                    dragListener={true} // Allow dragging only by drag handle in RecipeComponentRow
                                    onDragStart={() => setDraggingRowId(component.id)}
                                    onDragEnd={() => setDraggingRowId(null)}
                                    className="bg-transparent" // Let row style itself for rounded corners etc.
                                >
                                    <RecipeComponentRow
                                        // Props for RecipeComponentRow
                                        component={component}
                                        index={index} // index still useful for direct error mapping
                                        onComponentChange={(idx, updatesObj) => handleComponentChange(component.id, updatesObj)} // Pass component.id and the updates object
                                        onRemoveComponent={(id) => handleRemoveComponent(id)}
                                        availableInventoryItems={availableInventoryItems}
                                        errors={errorsForThisRow}
                                        onOpenCreateIngredientModal={onOpenCreateIngredientModal}
                                        isDragging={draggingRowId === component.id}
                                    />
                                </Reorder.Item>
                            );
                        })}
                    </AnimatePresence>
                </Reorder.Group>
            )}

            {/* "Add Another Ingredient" Button */}
            {components.length > 0 && (
                <button
                    type="button"
                    onClick={handleAddComponent}
                    className="mt-3 w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg border border-rose-500/70 dark:border-rose-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 dark:focus-visible:ring-offset-neutral-700/60"
                >
                    <Icon name="add_circle" className="w-6 h-6" style={{ fontSize: '1.25rem' }} /> {CONFIG.TEXT.ADD_ANOTHER_BUTTON}
                </button>
            )}
        </motion.div>
    );
};

// ===========================================================================
// Prop Types
// ===========================================================================
RecipeBuilder.propTypes = {
    components: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        inventoryItemId: PropTypes.string,
        inventoryItemName: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        unit: PropTypes.string,
    })).isRequired,
    onComponentsChange: PropTypes.func.isRequired,
    availableInventoryItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        costPerBaseUnit: PropTypes.shape({
            value: PropTypes.number.isRequired,
            unit: PropTypes.string.isRequired,
        }),
        measurementType: PropTypes.string.isRequired,
        defaultUnit: PropTypes.string,
    })).isRequired,
    errors: PropTypes.shape({
        recipeComponents: PropTypes.oneOfType([
            PropTypes.string, // For array-level errors
            PropTypes.arrayOf( // For row-level errors
                PropTypes.oneOfType([
                    PropTypes.string, // General error for the row
                    PropTypes.shape({ // Specific field errors
                        inventoryItemId: PropTypes.string,
                        quantity: PropTypes.string,
                        unit: PropTypes.string,
                    }),
                    PropTypes.oneOf([null]) // If no error for this row
                ])
            ),
        ]),
    }),
    onOpenCreateIngredientModal: PropTypes.func.isRequired,
};

// ===========================================================================
// Default Props
// ===========================================================================
RecipeBuilder.defaultProps = {
    errors: null,
};

// ===========================================================================
// Export
// ===========================================================================
export default memo(RecipeBuilder);