import React from 'react'; // Keep React if you plan to use custom JSX/SVG for some visuals
import { getDefaultSeatsForSize, getNextAvailableTableNumber } from '../utils/layoutUtils';

// Localization
import slRaw from '../utils/script_lines.js'; // Adjust path as necessary
const sl = slRaw.venueManagement.itemConfigs;

/**
 * Defines the types for draggable tools from the toolbar and
 * for items once they are placed on the design grid.
 */
export const ItemTypes = {
    TABLE_TOOL: 'tableTool',
    WALL_TOOL: 'wallTool',
    DOOR_TOOL: 'doorTool',
    DECOR_TOOL: 'decorTool',
    COUNTER_TOOL: 'counterTool',
    PLACED_TABLE: 'placedTable',
    PLACED_WALL: 'placedWall',
    PLACED_DOOR: 'placedDoor',
    PLACED_DECOR: 'placedDecor',
    PLACED_COUNTER: 'placedCounter',
    RESIZE_HANDLE: 'resizeHandle',
    ROTATION_HANDLE: 'rotationHandle',
};

/**
 * Configuration for each PLACED item type.
 */
export const ITEM_CONFIGS = {
    [ItemTypes.PLACED_TABLE]: {
        toolItemType: ItemTypes.TABLE_TOOL,
        displayName: sl.placedTableDisplayName || 'Table',
        isRotatable: true,
        isResizable: true,
        canHaveQr: true,
        defaultPropsFactory: (toolPayload, currentSubdivision, existingItems) => {
            const tables = existingItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE && typeof item.number !== 'undefined');
            return {
                shape: toolPayload.size_identifier,
                seats: getDefaultSeatsForSize(toolPayload.size_identifier, toolPayload.w_major, toolPayload.h_major),
                number: getNextAvailableTableNumber(tables),
                isProvisional: false,
            };
        },
        PlacedComponent: 'TableRenderer',
        SidebarEditorComponent: 'TableEditor',
    },
    [ItemTypes.PLACED_WALL]: {
        toolItemType: ItemTypes.WALL_TOOL,
        displayName: sl.placedWallDisplayName || 'Wall',
        isRotatable: true,
        isResizable: true,
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier,
            thickness_minor: toolPayload.thickness_minor || 1,
        }),
        PlacedComponent: 'WallRenderer',
        SidebarEditorComponent: 'WallEditor',
    },
    [ItemTypes.PLACED_DOOR]: {
        toolItemType: ItemTypes.DOOR_TOOL,
        displayName: sl.placedDoorDisplayName || 'Door',
        isRotatable: true,
        isResizable: false,
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier,
            swingDirection: 'left',
            isOpen: false,
        }),
        PlacedComponent: 'DoorRenderer',
        SidebarEditorComponent: 'DoorEditor',
    },
    [ItemTypes.PLACED_DECOR]: {
        toolItemType: ItemTypes.DECOR_TOOL,
        displayName: sl.placedDecorDisplayName || 'Decor',
        isRotatable: true,
        isResizable: (item) => (item.decorType === 'rug'), // Example: only rugs are resizable generic decor
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier,
            decorType: toolPayload.decorType, // MUST be provided by toolDefinition
        }),
        PlacedComponent: 'DecorRenderer',
        SidebarEditorComponent: 'DecorEditor',
    },
    [ItemTypes.PLACED_COUNTER]: {
        toolItemType: ItemTypes.COUNTER_TOOL,
        displayName: sl.placedCounterDisplayName || 'Counter',
        isRotatable: true,
        isResizable: true,
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier,
            label: toolPayload.label || '',
            length_units: toolPayload.w_major || 1,
        }),
        PlacedComponent: 'CounterRenderer',
        SidebarEditorComponent: 'CounterEditor',
    },
};

/**
 * Definitions for the tools available in the EditorToolbar.
 */
export const toolDefinitions = [
    // --- Furniture ---
    {
        name: sl.squareTableToolName || 'Square Table',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 1, h_major: 1, size_identifier: 'square-1x1',
        category: 'Furniture', // Category names could also be localized if needed
        visual: 'square_foot',
    },
    {
        name: sl.rectTableToolName || 'Rect. Table',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2, h_major: 1, size_identifier: 'rectangle-2x1',
        category: 'Furniture',
        visual: 'table_restaurant',
    },
    {
        name: sl.roundTableToolName || 'Round Table',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 1, h_major: 1, size_identifier: 'round-1x1',
        category: 'Furniture',
        visual: 'table_bar',
    },
    {
        name: sl.counterToolName || 'Counter',
        toolItemType: ItemTypes.COUNTER_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_COUNTER,
        w_major: 2, h_major: 1, size_identifier: 'counter-straight-2x1',
        label: '',
        category: 'Furniture',
        visual: 'countertops',
    },

    // --- Structure ---
    {
        name: sl.wallToolName || 'Wall',
        toolItemType: ItemTypes.WALL_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_WALL,
        w_major: 1, h_major: 1,
        size_identifier: 'wall-segment',
        thickness_minor: 1,
        category: 'Structure',
        visual: 'horizontal_rule',
    },
    {
        name: sl.doorToolName || 'Door',
        toolItemType: ItemTypes.DOOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DOOR,
        w_major: 1, h_major: 1, size_identifier: 'standard-door',
        category: 'Structure',
        visual: 'door_front',
    },

    // --- Decor ---
    {
        name: sl.plantToolName || 'Plant',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 1, h_major: 1, size_identifier: 'plant-pot-small',
        decorType: 'plant',
        category: 'Decor',
        visual: 'potted_plant',
    },
    {
        name: sl.rugToolName || 'Rug',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 2, h_major: 3, size_identifier: 'rug-medium-rect',
        decorType: 'rug',
        category: 'Decor',
        visual: 'texture',
    },
];