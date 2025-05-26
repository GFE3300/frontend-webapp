// features/venue_management/constants/itemConfigs.js
import React from 'react';
import { getDefaultSeatsForSize } from '../utils/layoutUtils'; // Will be adapted or moved
import { getNextAvailableTableNumber } from '../utils/layoutUtils';

export const ItemTypes = {
    // Tools (used as `type` in useDrag for DraggableGenericTool)
    TABLE_TOOL: 'tableTool',
    // Add more tool types later: WALL_TOOL, DECOR_TOOL, etc.

    // Placed Items (used as `itemType` property on the actual design items)
    PLACED_TABLE: 'placedTable',
    // Add more placed item types later: PLACED_WALL, PLACED_DECOR, etc.
};

// --- Configuration for each PLACED item type ---
export const ITEM_CONFIGS = {
    [ItemTypes.PLACED_TABLE]: {
        toolItemType: ItemTypes.TABLE_TOOL, // Which tool creates this?
        displayName: 'Table',
        isRotatable: true,
        canHaveQr: true,
        // Default properties when creating this item from a tool
        // toolPayload: { w_major, h_major, size_identifier (e.g., 'square'), placedItemType }
        defaultPropsFactory: (toolPayload, currentSubdivision, existingItems) => ({
            shape: toolPayload.size_identifier, // e.g., 'square', 'rectangle' -> for visual rendering by PlacedTableItem
            seats: getDefaultSeatsForSize(toolPayload.size_identifier),
            tableNumber: getNextAvailableTableNumber(existingItems.filter(item => item.itemType === ItemTypes.PLACED_TABLE)), // Ensure getNextAvailableTableNumber works with generic items
            // w_minor and h_minor will be set by useLayoutDesignerStateManagement based on toolPayload.w_major/h_major and subdivision
        }),
        // Component to render this item on the grid (will replace parts of current PlacedItem.jsx)
        PlacedComponent: 'PlacedTableItem', // Key to lookup/import PlacedTableItem.jsx
        // Component to render properties in the sidebar
        SidebarEditorComponent: 'TablePropertiesEditor', // Key to lookup/import TablePropertiesEditor.jsx
    },
    // Future: [ItemTypes.PLACED_WALL]: { ... },
};

// --- Definitions for the tools available in the toolbar ---
// w_major, h_major define the span in MAJOR grid cells.
export const toolDefinitions = [
    {
        name: 'Square Table (1x1)',
        toolItemType: ItemTypes.TABLE_TOOL,         // The type of this draggable tool
        createsPlacedItemType: ItemTypes.PLACED_TABLE, // The type of item it creates
        w_major: 1,                                 // Span in major grid cells
        h_major: 1,                                 // Span in major grid cells
        size_identifier: 'square',                  // For defaultPropsFactory and PlacedComponent visual
        visual: <div className="w-6 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Rectangle Table (2x1)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2,
        h_major: 1,
        size_identifier: 'rectangle',
        visual: <div className="w-12 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Tall Table (1x2)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 1,
        h_major: 2,
        size_identifier: 'rectangle-tall',
        visual: <div className="w-6 h-12 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Round Table (2x2)',
        toolItemType: ItemTypes.TABLE_TOOL,
        createsPlacedItemType: ItemTypes.PLACED_TABLE,
        w_major: 2, // Occupies a 2x2 major cell square
        h_major: 2,
        size_identifier: 'round',
        visual: <div className="w-10 h-10 bg-indigo-200 border border-indigo-400 rounded-full shadow-sm flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-300"></div></div>
    },
    // Future: { name: 'Wall Segment', toolItemType: ItemTypes.WALL_TOOL, createsPlacedItemType: ItemTypes.PLACED_WALL, ... }
];