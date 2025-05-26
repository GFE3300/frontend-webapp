export const DEFAULT_INITIAL_GRID_ROWS = 8;
export const DEFAULT_INITIAL_GRID_COLS = 13;
export const MIN_GRID_ROWS = 8;
export const MAX_GRID_ROWS = 50;
export const MIN_GRID_COLS = 8;
export const MAX_GRID_COLS = 50;
export const CELL_SIZE_REM = 3;

export const ItemTypes = {
    TABLE_TOOL: 'tableTool',
    PLACED_TABLE: 'placedTable',
};

export const obstacleToolsConfig = [
    // Emptied for simplification in this iteration
];

export const tableToolsConfig = [
    { name: 'Square (1x1)', type: 'square', w: 1, h: 1, size: 'square', visual: <div className="w-6 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div> },
    { name: 'Rectangle (2x1)', type: 'rectangle', w: 2, h: 1, size: 'rectangle', visual: <div className="w-12 h-6 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div> },
    { name: 'Tall (1x2)', type: 'rectangle-tall', w: 1, h: 2, size: 'rectangle-tall', visual: <div className="w-6 h-12 bg-indigo-200 border border-indigo-400 rounded-md shadow-sm"></div> },
    { name: 'Round (2x2)', type: 'round', w: 2, h: 2, size: 'round', visual: <div className="w-10 h-10 bg-indigo-200 border border-indigo-400 rounded-full shadow-sm flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-300"></div></div> },
];