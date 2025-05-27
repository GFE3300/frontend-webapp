// features/venue_management/constants/layoutConstants.jsx

// ------------- MAJOR Grid Dimensions & Cell Size -------------
// These define the overall canvas size in terms of major grid cells.
export const DEFAULT_INITIAL_GRID_ROWS = 8;  // Default number of major rows
export const DEFAULT_INITIAL_GRID_COLS = 13; // Default number of major columns

export const MIN_GRID_ROWS = 4;  // Minimum settable major rows
export const MAX_GRID_ROWS = 30; // Maximum settable major rows
export const MIN_GRID_COLS = 4;  // Minimum settable major columns
export const MAX_GRID_COLS = 40; // Maximum settable major columns

// CELL_SIZE_REM now defines the visual size of one MAJOR grid cell.
// The visual size of minor cells will be (CELL_SIZE_REM / gridSubdivision).
export const CELL_SIZE_REM = 4;

// ------------- Grid Subdivision Levels -------------
// Defines how each major grid cell can be subdivided.
export const DEFAULT_GRID_SUBDIVISION = 1; // Default: 1x1 (no actual subdivision beyond major cells)
export const AVAILABLE_SUBDIVISIONS = [
    { label: '1x1 (Default)', value: 1 },
    { label: '2x2', value: 2 },
    { label: '4x4', value: 4 },
    // { label: '8x8', value: 8 }, // Example: Can be added for more granularity
];

// ------------- ZOOM Levels -------------
// Defines the zoom levels for the layout designer.
export const DEFAULT_ZOOM_LEVEL = 1.0;
export const MIN_ZOOM_LEVEL = 0.25;
export const MAX_ZOOM_LEVEL = 2.0;
export const ZOOM_STEP = 0.1;
// Note:
// Specific ItemTypes (e.g., TABLE_TOOL, PLACED_TABLE) and detailed tool configurations
// (like tableToolsConfig, obstacleToolsConfig) will now be defined in a new file,
// for example, 'itemConfigs.js', to keep this file focused on general layout parameters.