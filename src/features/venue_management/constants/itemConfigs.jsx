// features/venue_management/constants/itemConfigs.jsx
import React from 'react';
// These utilities will be used by defaultPropsFactory for tables
import { getDefaultSeatsForSize, getNextAvailableTableNumber } from '../utils/layoutUtils';

/**
 * Defines the types for draggable tools from the toolbar and
 * for items once they are placed on the design grid.
 */
export const ItemTypes = {
    // --- Tool Types (used as `type` in useDrag for DraggableGenericTool) ---
    TABLE_TOOL: 'tableTool',
    WALL_TOOL: 'wallTool',
    DOOR_TOOL: 'doorTool',
    DECOR_TOOL: 'decorTool',
    // Add more tool types as needed (e.g., WINDOW_TOOL, STAIR_TOOL)

    // --- Placed Item Types (used as `item.itemType` on the actual design items) ---
    PLACED_TABLE: 'placedTable',
    PLACED_WALL: 'placedWall',
    PLACED_DOOR: 'placedDoor',
    PLACED_DECOR: 'placedDecor',
    RESIZE_HANDLE: 'resizeHandle', // For resizing items
};

/**
 * Configuration for each PLACED item type.
 * This defines properties, default behaviors, and associated components.
 */
export const ITEM_CONFIGS = {
    [ItemTypes.PLACED_TABLE]: {
        toolItemType: ItemTypes.TABLE_TOOL,
        displayName: 'Table',
        isRotatable: true,
        isResizable: true, // Tables can be resized
        canHaveQr: true,
        defaultPropsFactory: (toolPayload, currentSubdivision, existingItems) => {
            const tables = existingItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE && typeof item.number !== 'undefined');
            return {
                shape: toolPayload.size_identifier,
                seats: getDefaultSeatsForSize(toolPayload.size_identifier, toolPayload.w_major, toolPayload.h_major),
                number: getNextAvailableTableNumber(tables),
            };
        },
        PlacedComponent: 'PlacedTableItem',
        SidebarEditorComponent: 'TablePropertiesEditor',
    },
    [ItemTypes.PLACED_WALL]: {
        toolItemType: ItemTypes.WALL_TOOL,
        displayName: 'Wall',
        isRotatable: true,
        isResizable: true, // Walls can be resized (e.g., length)
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => ({
            shape: toolPayload.size_identifier, // e.g., 'wall-segment-2major'
            thickness_minor: 1, // Default thickness in minor grid cells for its narrow dimension
        }),
        PlacedComponent: 'PlacedWallItem',
        SidebarEditorComponent: 'WallPropertiesEditor',
    },
    [ItemTypes.PLACED_DOOR]: {
        toolItemType: ItemTypes.DOOR_TOOL,
        displayName: 'Door',
        isRotatable: true, // To orient with wall and set swing
        isResizable: false, // Doors typically have fixed sizes
        canHaveQr: false,
        // placementConstraint: 'RequiresWall', // Phase 2/3: For advanced placement rules
        defaultPropsFactory: (toolPayload /*, currentSubdivision, existingItems */) => ({
            shape: toolPayload.size_identifier, // e.g., 'standard-door'
            swingDirection: 'left', // 'left', 'right'
            isOpen: false, // Visual state
        }),
        PlacedComponent: 'PlacedDoorItem',
        SidebarEditorComponent: 'DoorPropertiesEditor', // Ensure this editor exists
    },
    [ItemTypes.PLACED_DECOR]: {
        toolItemType: ItemTypes.DECOR_TOOL,
        displayName: 'Decor',
        isRotatable: true,
        isResizable: (item) => { // Only counters are resizable among decor items
            return item && item.decorType && item.decorType.startsWith('counter-');
        },
        canHaveQr: false,
        defaultPropsFactory: (toolPayload) => {
            const props = {
                shape: toolPayload.size_identifier,
                decorType: toolPayload.size_identifier,
            };
            if (toolPayload.size_identifier && toolPayload.size_identifier.startsWith('counter-')) {
                props.length_units = toolPayload.w_major || 1;
            }
            return props;
        },
        PlacedComponent: 'PlacedDecorItem',
        SidebarEditorComponent: 'DecorPropertiesEditor', // Corrected name
    },
};

/**
 * Definitions for the tools available in the LayoutDesignerToolbar.
 * - name: Display name for the tool.
 * - toolItemType: The ItemType for the draggable tool itself.
 * - createsPlacedItemType: The ItemType of the item it creates on the grid.
 * - w_major, h_major: Base dimensions in MAJOR grid cells (before rotation).
 * - size_identifier: A unique string identifying the tool's specific size/shape variant.
 *                    Used by defaultPropsFactory and PlacedComponent for specific logic.
 * - visual: JSX element for the tool's icon in the toolbar.
 */
export const toolDefinitions = [
    // --- Table Tools ---
    {
        name: 'Square Table (1x1)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 1, h_major: 1, size_identifier: 'square-1x1',
        visual: <div className="w-6 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Rectangle Table (2x1)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2, h_major: 1, size_identifier: 'rectangle-2x1',
        visual: <div className="w-12 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Round Table (2x2 major)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2, h_major: 2, size_identifier: 'round-2x2',
        visual: <div className="w-10 h-10 bg-indigo-200 border border-indigo-400 rounded-full shadow-sm flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-300"></div></div>
    },

    // --- Wall Tools ---
    {
        name: 'Wall Segment (2x1 major)',
        toolItemType: ItemTypes.WALL_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_WALL,
        w_major: 2, h_major: 1,
        size_identifier: 'wall-segment-2major',
        visual: <div className="w-12 h-2 bg-gray-400 border border-gray-500 rounded-sm shadow-sm my-2"></div>
    },

    // --- Door Tools ---
    {
        name: 'Standard Door (1x1 major)',
        toolItemType: ItemTypes.DOOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DOOR,
        w_major: 1, h_major: 1, size_identifier: 'standard-door',
        visual: <div className="w-6 h-6 border-2 border-amber-500 rounded-sm shadow-sm flex items-center justify-end pr-0.5"><div className="w-1 h-4 bg-amber-500 rounded-sm"></div></div>
    },

    // --- Decor Tools ---
    {
        name: 'Plant (1x1 major)',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 1, h_major: 1, size_identifier: 'plant-decor', // decorType will be this
        visual: <div className="w-6 h-6 text-green-600 flex items-center justify-center text-xl">🪴</div>
    },
    {
        name: 'Counter (2x1 major)',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 2,
        h_major: 1,
        size_identifier: 'counter-2x1', // decorType will be this
        visual: <div className="w-12 h-4 bg-orange-300 border border-orange-500 rounded-sm shadow-sm my-1"></div>
    },
    {
        name: 'Counter (1x1 major)',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 1,
        h_major: 1,
        size_identifier: 'counter-1x1', // decorType will be this
        visual: <div className="w-6 h-4 bg-orange-300 border border-orange-500 rounded-sm shadow-sm my-1"></div>
    },
];