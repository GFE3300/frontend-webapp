// src/features/venue_management/utils/layoutUtils.js

import { tableToolsConfig, ItemTypes } from './layoutConstants'; // kitchenToolConfig and obstacleToolsConfig removed

export const getDefaultSeatsForSize = (size) => {
    switch (size) {
        case 'square': return 2;
        case 'rectangle': return 4;
        case 'rectangle-tall': return 2; // Was 2, seems reasonable for a 1x2
        case 'round': return 4;
        default: return 2;
    }
};

export const getToolConfigByType = (type) => {
    const tableTool = tableToolsConfig.find(tool => tool.type === type);
    if (tableTool) return tableTool;
    // Removed obstacleTool and kitchenToolConfig logic
    return null;
};

export const getEffectiveDimensions = (item) => {
    // item.size refers to the 'type' in tableToolsConfig (e.g., 'square', 'rectangle')
    const config = getToolConfigByType(item.size);
    if (!config) return { w: 1, h: 1 }; // Default fallback

    // For tables with rotation
    if (item.itemType === ItemTypes.PLACED_TABLE && item.rotation === 90) {
        return { w: config.h, h: config.w }; // Swap width and height
    }
    return { w: config.w, h: config.h }; // Original width and height
};

export const isCellOccupiedByTable = (row, col, tables, excludeId = null) => {
    for (const table of tables.filter(t => t && t.gridPosition)) {
        if (table.id === excludeId) continue;
        const { w: tableW, h: tableH } = getEffectiveDimensions(table);
        const { rowStart, colStart } = table.gridPosition;
        if (row >= rowStart && row < rowStart + tableH && col >= colStart && col < colStart + tableW) {
            return true;
        }
    }
    return false;
};

export const canPlaceItem = (row, col, itemW, itemH, currentTables, gridRows, gridCols, itemToExcludeId = null) => {
    // Check grid boundaries
    if (row < 1 || col < 1 || row + itemH - 1 > gridRows || col + itemW - 1 > gridCols) {
        return false;
    }
    // Check for overlap with other tables
    for (let rOffset = 0; rOffset < itemH; rOffset++) {
        for (let cOffset = 0; cOffset < itemW; cOffset++) {
            const checkRow = row + rOffset;
            const checkCol = col + cOffset;
            if (isCellOccupiedByTable(checkRow, checkCol, currentTables, itemToExcludeId)) {
                return false;
            }
        }
    }
    return true;
};

export const checkItemsInBounds = (newRows, newCols, tables) => {
    for (const table of tables.filter(t => t && t.gridPosition)) {
        const { w: itemWidth, h: itemHeight } = getEffectiveDimensions(table);
        const { rowStart, colStart } = table.gridPosition;
        if (rowStart + itemHeight - 1 > newRows || colStart + itemWidth - 1 > newCols) return false;
    }
    return true;
};

export const getNextAvailableTableNumber = (tables) => {
    if (!tables || tables.length === 0) return 1;
    const existingNumbers = tables.map(t => t.number).filter(n => typeof n === 'number' && !isNaN(n));
    if (existingNumbers.length === 0) return 1;
    let num = 1;
    while (existingNumbers.includes(num)) num++;
    return num;
};