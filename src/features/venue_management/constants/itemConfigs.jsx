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
    // Add more placed item types as needed
};

/**
 * Configuration for each PLACED item type.
 * This defines properties, default behaviors, and associated components.
 */
export const ITEM_CONFIGS = {
    [ItemTypes.PLACED_TABLE]: {
        toolItemType: ItemTypes.TABLE_TOOL, // Which tool creates this?
        displayName: 'Table',
        isRotatable: true,
        canHaveQr: true,
        // Default properties when this item is created from a tool
        defaultPropsFactory: (toolPayload, currentSubdivision, existingItems) => {
            const tables = existingItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE && typeof item.number !== 'undefined');
            return {
                shape: toolPayload.size_identifier, // e.g., 'square-1x1', 'rectangle-2x1'
                seats: getDefaultSeatsForSize(toolPayload.size_identifier),
                number: getNextAvailableTableNumber(tables),
            };
        },
        // String key for the component that renders this item on the grid
        PlacedComponent: 'PlacedTableItem',
        // String key for the component that renders its properties in the sidebar
        SidebarEditorComponent: 'TablePropertiesEditor',
    },
    [ItemTypes.PLACED_WALL]: {
        toolItemType: ItemTypes.WALL_TOOL,
        displayName: 'Wall',
        isRotatable: true, // Can be horizontal or vertical
        canHaveQr: false,
        // isResizable: true, // Phase 2: For stretching walls
        defaultPropsFactory: (toolPayload /*, currentSubdivision, existingItems */) => ({
            shape: toolPayload.size_identifier, // e.g., 'wall-segment'
            thickness_minor: 1, // Default thickness in minor grid cells
            // material: 'drywall', // Example future property
        }),
        PlacedComponent: 'PlacedWallItem',
        SidebarEditorComponent: 'WallPropertiesEditor',
    },
    [ItemTypes.PLACED_DOOR]: {
        toolItemType: ItemTypes.DOOR_TOOL,
        displayName: 'Door',
        isRotatable: true, // To orient with wall and set swing
        canHaveQr: false,
        // placementConstraint: 'RequiresWall', // Phase 2/3: For advanced placement rules
        defaultPropsFactory: (toolPayload /*, currentSubdivision, existingItems */) => ({
            shape: toolPayload.size_identifier, // e.g., 'standard-door'
            swingDirection: 'left', // 'left', 'right'
            isOpen: false, // Visual state
        }),
        PlacedComponent: 'PlacedDoorItem',
        SidebarEditorComponent: 'DoorPropertiesEditor',
    },
    [ItemTypes.PLACED_DECOR]: {
        toolItemType: ItemTypes.DECOR_TOOL,
        displayName: 'Decor', // Can be made more specific by the item renderer using item.decorType
        isRotatable: true, // Most decor items can be rotated
        canHaveQr: false,
        defaultPropsFactory: (toolPayload /*, currentSubdivision, existingItems */) => ({
            shape: toolPayload.size_identifier, // e.g., 'plant', 'counter-small'
            decorType: toolPayload.size_identifier, // Specific type of decor
            // label: '', // Example future property
        }),
        PlacedComponent: 'PlacedDecorItem',
        SidebarEditorComponent: 'DecorPropertiesEditor',
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
        w_major: 1,
        h_major: 1,
        size_identifier: 'square-1x1',
        visual: <div className="w-6 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Rectangle Table (2x1)', // Base orientation
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2,
        h_major: 1,
        size_identifier: 'rectangle-2x1',
        visual: <div className="w-12 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Round Table (2x2 major)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2, // Occupies a 2x2 major cell square
        h_major: 2,
        size_identifier: 'round-2x2',
        visual: <div className="w-10 h-10 bg-indigo-200 border border-indigo-400 rounded-full shadow-sm flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-300"></div></div>
    },

    // --- Wall Tools ---
    {
        name: 'Wall Segment (2x1 major)', // Default length, can be rotated to 1x2
        toolItemType: ItemTypes.WALL_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_WALL,
        w_major: 2, // e.g., 2 major cells long
        h_major: 1, // 1 major cell thick (visual representation, actual thickness is in minor cells)
        size_identifier: 'wall-segment-2major',
        visual: <div className="w-12 h-2 bg-gray-400 border border-gray-500 rounded-sm shadow-sm my-2"></div> // Visual for a horizontal wall segment
    },

    // --- Door Tools ---
    {
        name: 'Standard Door (1x1 major)',
        toolItemType: ItemTypes.DOOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DOOR,
        w_major: 1,
        h_major: 1, // Doors usually fit within a 1x1 major cell (representing a doorway in a wall)
        size_identifier: 'standard-door',
        visual: <div className="w-6 h-6 border-2 border-amber-500 rounded-sm shadow-sm flex items-center justify-end pr-0.5"><div className="w-1 h-4 bg-amber-500 rounded-sm"></div></div> // Simple door visual
    },

    // --- Decor Tools ---
    {
        name: 'Plant (1x1 major)',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 1,
        h_major: 1,
        size_identifier: 'plant-decor',
        visual: <div className="w-6 h-6 text-green-600 flex items-center justify-center text-xl">🪴</div> // Using an emoji as a placeholder
    },
    {
        name: 'Counter (2x1 major)',
        toolItemType: ItemTypes.DECOR_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_DECOR,
        w_major: 2,
        h_major: 1,
        size_identifier: 'counter-2x1',
        visual: <div className="w-12 h-4 bg-orange-300 border border-orange-500 rounded-sm shadow-sm my-1"></div>
    },
    // Add more tools as needed
];