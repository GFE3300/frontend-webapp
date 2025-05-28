// features/venue_management/constants/itemConfigs.jsx
import React from 'react'; // Keep React if you plan to use custom JSX/SVG for some visuals
import { getDefaultSeatsForSize, getNextAvailableTableNumber } from '../utils/layoutUtils';

/**
 * Defines the types for draggable tools from the toolbar and
 * for items once they are placed on the design grid.
 */
export const ItemTypes = {
    // --- Tool Types ---
    TABLE_TOOL: 'tableTool',
    WALL_TOOL: 'wallTool',
    DOOR_TOOL: 'doorTool',
    DECOR_TOOL: 'decorTool',
    COUNTER_TOOL: 'counterTool',

    // --- Placed Item Types ---
    PLACED_TABLE: 'placedTable',
    PLACED_WALL: 'placedWall',
    PLACED_DOOR: 'placedDoor',
    PLACED_DECOR: 'placedDecor', // Generic decor (e.g., plants, rugs)
    PLACED_COUNTER: 'placedCounter', // Specific for counters

    // --- Interaction Types ---
    RESIZE_HANDLE: 'resizeHandle',
    ROTATION_HANDLE: 'rotationHandle',
};

/**
 * Configuration for each PLACED item type.
 */
export const ITEM_CONFIGS = {
    [ItemTypes.PLACED_TABLE]: {
        toolItemType: ItemTypes.TABLE_TOOL,
        displayName: 'Table',
        isRotatable: true,
        isResizable: true,
        canHaveQr: true, // Assuming QR is for tables
        defaultPropsFactory: (toolPayload, currentSubdivision, existingItems) => {
            const tables = existingItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE && typeof item.number !== 'undefined');
            return {
                shape: toolPayload.size_identifier, // e.g., 'square-1x1', 'round-1x1'
                seats: getDefaultSeatsForSize(toolPayload.size_identifier, toolPayload.w_major, toolPayload.h_major),
                number: getNextAvailableTableNumber(tables),
                isProvisional: true, // Tables start as provisional until number is confirmed
            };
        },
        PlacedComponent: 'TableRenderer',
        SidebarEditorComponent: 'TableEditor',
    },
    [ItemTypes.PLACED_WALL]: {
        toolItemType: ItemTypes.WALL_TOOL,
        displayName: 'Wall',
        isRotatable: true,
        isResizable: true,
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier, // e.g., 'wall-segment'
            thickness_minor: toolPayload.thickness_minor || 1,
        }),
        PlacedComponent: 'WallRenderer',
        SidebarEditorComponent: 'WallEditor',
    },
    [ItemTypes.PLACED_DOOR]: {
        toolItemType: ItemTypes.DOOR_TOOL,
        displayName: 'Door',
        isRotatable: true,
        isResizable: false, // Doors are typically fixed size from tool
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier, // e.g., 'standard-door'
            swingDirection: 'left',
            isOpen: false, // Visual state for designer
        }),
        PlacedComponent: 'DoorRenderer',
        SidebarEditorComponent: 'DoorEditor',
    },
    [ItemTypes.PLACED_DECOR]: { // For generic decor like plants, rugs
        toolItemType: ItemTypes.DECOR_TOOL,
        displayName: 'Decor',
        isRotatable: true,
        // Resizable can be a function based on decorType
        isResizable: (item) => {console.log(item); return (item.decorType == 'rug')}, // Example: only rugs are resizable generic decor
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier, // e.g., 'plant-pot-small', 'rug-medium-rect'
            decorType: toolPayload.decorType, // MUST be provided by toolDefinition
        }),
        PlacedComponent: 'DecorRenderer',
        SidebarEditorComponent: 'DecorEditor',
    },
    [ItemTypes.PLACED_COUNTER]: {
        toolItemType: ItemTypes.COUNTER_TOOL,
        displayName: 'Counter',
        isRotatable: true,
        isResizable: true,
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier, // e.g., 'counter-straight-2x1'
            // decorType is implicitly 'counter' by using PLACED_COUNTER type
            label: toolPayload.label || '', // Optional label from tool, or default
            length_units: toolPayload.w_major || 1, // Default length in major units
        }),
        PlacedComponent: 'CounterRenderer',
        SidebarEditorComponent: 'CounterEditor',
    },
};

/**
 * Definitions for the tools available in the EditorToolbar.
 * - visual: Material Icon name string.
 * - category: For grouping in the toolbar.
 */
export const toolDefinitions = [
    // --- Furniture ---
    {
        name: 'Square Table',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 1, h_major: 1, size_identifier: 'square-1x1',
        category: 'Furniture',
        visual: 'square_foot', // Abstract representation
    },
    {
        name: 'Rect. Table',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2, h_major: 1, size_identifier: 'rectangle-2x1',
        category: 'Furniture',
        visual: 'table_restaurant', // Abstract representation
    },
    {
        name: 'Round Table',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 1, h_major: 1, size_identifier: 'round-1x1', // Smaller default round table
        category: 'Furniture',
        visual: 'table_bar', // Abstract representation
    },
    {
        name: 'Counter',
        toolItemType: ItemTypes.COUNTER_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_COUNTER,
        w_major: 2, h_major: 1, size_identifier: 'counter-straight-2x1',
        label: '', // Default label if any
        category: 'Furniture',
        visual: 'countertops',
    },

    // --- Structure ---
    {
        name: 'Wall',
        toolItemType: ItemTypes.WALL_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_WALL,
        w_major: 1, h_major: 1, // Default to 1 major unit long, can be resized
        size_identifier: 'wall-segment',
        thickness_minor: 1, // Default visual thickness in minor cells
        category: 'Structure',
        visual: 'horizontal_rule', // More generic for a segment
    },
    {
        name: 'Door',
        toolItemType: ItemTypes.DOOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DOOR,
        w_major: 1, h_major: 1, size_identifier: 'standard-door',
        category: 'Structure',
        visual: 'door_front',
    },

    // --- Decor ---
    {
        name: 'Plant',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 1, h_major: 1, size_identifier: 'plant-pot-small',
        decorType: 'plant', // Crucial for DecorRenderer
        category: 'Decor',
        visual: 'potted_plant',
    },
    {
        name: 'Rug',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 2, h_major: 3, size_identifier: 'rug-medium-rect', // Example size
        decorType: 'rug', // Crucial for DecorRenderer
        category: 'Decor',
        visual: 'texture', // Or 'style' or other abstract icon
    },
];