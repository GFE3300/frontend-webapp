// C:/Users/Gilberto F/Desktop/Smore/frontend/src/features/add_product_modal/utils/unitUtils.js
export const categorizedUnits = {
    mass: [
        { value: "g", label: "g (gram)", baseFactor: 1 },
        { value: "kg", label: "kg (kilogram)", baseFactor: 1000 },
        { value: "mg", label: "mg (milligram)", baseFactor: 0.001 },
        { value: "oz", label: "oz (ounce)", baseFactor: 28.3495 },
        { value: "lb", label: "lb (pound)", baseFactor: 453.592 },
    ],
    volume: [
        { value: "ml", label: "ml (milliliter)", baseFactor: 1 },
        { value: "L", label: "L (liter)", baseFactor: 1000 },
        { value: "tsp", label: "tsp (teaspoon)", baseFactor: 4.92892 }, // US teaspoon
        { value: "tbsp", label: "tbsp (tablespoon)", baseFactor: 14.7868 }, // US tablespoon
        { value: "fl oz", label: "fl oz (fluid ounce)", baseFactor: 29.5735 }, // US fluid ounce
        { value: "cup", label: "cup (cup)", baseFactor: 236.588 }, // US cup
    ],
    pieces: [
        { value: "pcs", label: "pcs (pieces)", baseFactor: 1 },
        { value: "unit", label: "unit(s)", baseFactor: 1 },
        { value: "slice", label: "slice(s)", baseFactor: 1 },
        { value: "clove", label: "clove(s)", baseFactor: 1 },
        { value: "dozen", label: "dozen", baseFactor: 12 },
    ],
};

export const allUnitObjects = [
    ...categorizedUnits.mass,
    ...categorizedUnits.volume,
    ...categorizedUnits.pieces
];

export const getBaseUnit = (measurementType) => {
    if (measurementType === 'mass') return 'g';
    if (measurementType === 'volume') return 'ml';
    if (measurementType === 'pieces') return 'pcs';
    return null;
};

export const convertToBaseUnit = (quantity, unit, measurementType) => {

    if (!measurementType || !categorizedUnits[measurementType]) return null;
    const unitDef = categorizedUnits[measurementType].find(u => u.value === unit);
    if (!unitDef) return null; // Unknown unit for this type
    return parseFloat(quantity) * unitDef.baseFactor;
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); // Adjust currency as needed
}

export const calculateRawRecipeCost = (recipeComponents, availableInventoryItems) => {

    /* console.log(
        'calculateRawRecipeCost',
        'first', !recipeComponents,
        'second', recipeComponents.length === 0,
        'third', !availableInventoryItems,
        'fourth', availableInventoryItems.length === 0
    ) */

    if (!recipeComponents || recipeComponents.length === 0 || !availableInventoryItems || availableInventoryItems.length === 0) {
        return 0;
    }

    return recipeComponents.reduce((total, comp) => {
        const item = availableInventoryItems.find(invItem => invItem.id === comp.inventoryItemId);

        // Validate essential data for cost calculation
        if (!item ||
            typeof item.cost_per_base_unit == 'number' ||
            !item.base_unit_for_cost ||
            !item.measurement_type ||
            !comp.inventoryItemId || // Ensure an item is actually selected for the component
            comp.quantity === undefined || comp.quantity === null || String(comp.quantity).trim() === '' ||
            comp.unit === undefined || comp.unit === null || String(comp.unit).trim() === '' ||
            isNaN(parseFloat(String(comp.quantity))) || parseFloat(String(comp.quantity)) <= 0
        ) {
            // console.warn("calculateRawRecipeCost: Skipping component due to missing/invalid data", { comp, item });
            return total;
        }

        try {
            const quantityInBase = convertToBaseUnit(parseFloat(String(comp.quantity)), comp.unit, item.measurement_type);
            const itemExpectedBaseUnit = getBaseUnit(item.measurement_type);

            if (quantityInBase === null || quantityInBase === undefined) {
                // console.warn(`calculateRawRecipeCost: Cannot convert ${item.name} to base unit.`);
                return total;
            }
            if (item.base_unit_for_cost !== itemExpectedBaseUnit) {
                // console.warn(`calculateRawRecipeCost: Mismatched base unit for ${item.name}. Expected ${itemExpectedBaseUnit}, got ${item.base_unit_for_cost}`);
                return total;
            }

            return total + (quantityInBase * item.cost_per_base_unit);
        } catch (error) {
            console.error(`calculateRawRecipeCost: Error calculating cost for component ${item?.name || 'unknown'}:`, error);
            return total;
        }
    }, 0);
};