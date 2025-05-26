// features/venue_management/constants/layoutConstants.jsx
import React from 'react';

export const DEFAULT_INITIAL_GRID_ROWS = 8;
export const DEFAULT_INITIAL_GRID_COLS = 13;
export const MIN_GRID_ROWS = 4;
export const MAX_GRID_ROWS = 30;
export const MIN_GRID_COLS = 4;
export const MAX_GRID_COLS = 40;
export const CELL_SIZE_REM = 4; // Size of a MAJOR grid cell.

// --- Grid Subdivision Constants ---
export const DEFAULT_GRID_SUBDIVISION = 1;
export const AVAILABLE_SUBDIVISIONS = [
    { label: '1x1 (Default)', value: 1 }, // Clarified label
    { label: '2x2', value: 2 },
    { label: '4x4', value: 4 },
    // { label: '8x8', value: 8 }, // Can be added later
];
// --- End Grid Subdivision Constants ---

export const ItemTypes = {
    TABLE_TOOL: 'tableTool',
    PLACED_TABLE: 'placedTable',
};

export const tableToolsConfig = [
    {
        name: 'Square Table (1x1)',
        type: 'square',
        w: 1, // Major grid cell width
        h: 1, // Major grid cell height
        size: 'square',
        visual: <div className="w-6 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Rectangle Table (2x1)',
        type: 'rectangle',
        w: 2, // Major
        h: 1, // Major
        size: 'rectangle',
        visual: <div className="w-12 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Tall Table (1x2)',
        type: 'rectangle-tall',
        w: 1, // Major
        h: 2, // Major
        size: 'rectangle-tall',
        visual: <div className="w-6 h-12 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div>
    },
    {
        name: 'Round Table (2x2)',
        type: 'round',
        w: 2, // Major
        h: 2, // Major
        size: 'round',
        visual: <div className="w-10 h-10 bg-indigo-200 border border-indigo-400 rounded-full shadow-sm flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-300"></div></div>
    },
];

export const obstacleToolsConfig = [];