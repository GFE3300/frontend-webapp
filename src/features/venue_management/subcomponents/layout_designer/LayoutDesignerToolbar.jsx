// features/venue_management/subcomponents/layout_designer/LayoutDesignerToolbar.jsx
import React, { useState, useEffect } from 'react';
import DraggableGenericTool from './DraggableGenericTool';
import Icon from '../../../../components/common/Icon';
import { useDebounce } from '../../../../hooks/useDebounce';

import {
    MIN_GRID_ROWS,
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    AVAILABLE_SUBDIVISIONS,
    // Assuming ZOOM_STEP, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL might be useful for button enable/disable
    // but not strictly necessary for this component's core functionality if LayoutDesigner handles clamping.
} from '../../constants/layoutConstants';

const LayoutDesignerToolbar = ({
    majorGridRows: initialMajorGridRows,
    majorGridCols: initialMajorGridCols,
    currentGridSubdivision,
    onGridDimensionChange,
    onGridSubdivisionChange,
    minGridRows = MIN_GRID_ROWS, // Provide default from constants
    maxGridRows = MAX_GRID_ROWS,
    minGridCols = MIN_GRID_COLS,
    maxGridCols = MAX_GRID_COLS,

    toolDefinitions,

    isEraserActive,
    onToggleEraser,
    onUndo,
    onRedo,
    canUndo,
    canRedo,

    // Zoom props
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onResetZoom,
}) => {
    // Local state for immediate input updates for grid dimensions
    const [localMajorRows, setLocalMajorRows] = useState(String(initialMajorGridRows));
    const [localMajorCols, setLocalMajorCols] = useState(String(initialMajorGridCols));

    // Update local state if initial props change (e.g., on reset or load)
    useEffect(() => {
        setLocalMajorRows(String(initialMajorGridRows));
    }, [initialMajorGridRows]);

    useEffect(() => {
        setLocalMajorCols(String(initialMajorGridCols));
    }, [initialMajorGridCols]);

    // Debounce the local state values
    const debouncedMajorRows = useDebounce(localMajorRows, 500);
    const debouncedMajorCols = useDebounce(localMajorCols, 500);

    // Effect to call the expensive update function with debounced values
    useEffect(() => {
        const rowsNum = parseInt(debouncedMajorRows, 10);
        if (!isNaN(rowsNum) && rowsNum !== initialMajorGridRows) { // Check if it's a valid number and different
            onGridDimensionChange('rows', String(rowsNum));
        }
    }, [debouncedMajorRows, onGridDimensionChange, initialMajorGridRows]);

    useEffect(() => {
        const colsNum = parseInt(debouncedMajorCols, 10);
        if (!isNaN(colsNum) && colsNum !== initialMajorGridCols) { // Check if it's a valid number and different
            onGridDimensionChange('cols', String(colsNum));
        }
    }, [debouncedMajorCols, onGridDimensionChange, initialMajorGridCols]);

    const handleLocalMajorDimChange = (e, dimension) => {
        const value = e.target.value;
        if (dimension === 'rows') {
            setLocalMajorRows(value);
        } else if (dimension === 'cols') {
            setLocalMajorCols(value);
        }
    };

    const handleSubdivisionSelect = (e) => {
        const newSubdivision = parseInt(e.target.value, 10);
        if (!isNaN(newSubdivision)) {
            onGridSubdivisionChange(newSubdivision);
        }
    };

    // Determine if zoom buttons should be disabled (optional, LayoutDesigner already clamps)
    // const canZoomIn = zoomLevel < MAX_ZOOM_LEVEL;
    // const canZoomOut = zoomLevel > MIN_ZOOM_LEVEL;

    return (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-lg">
            {/* Grid Setup Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-5 pb-4 border-b border-gray-200 items-end">
                <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Major Grid Dimensions</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                            <label htmlFor="majorGridRowsInput" className="text-sm font-medium text-gray-600">Rows:</label>
                            <input
                                type="number"
                                id="majorGridRowsInput"
                                name="majorGridRows"
                                value={localMajorRows}
                                onChange={(e) => handleLocalMajorDimChange(e, 'rows')}
                                min={minGridRows}
                                max={maxGridRows}
                                className="w-20 p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <label htmlFor="majorGridColsInput" className="text-sm font-medium text-gray-600">Cols:</label>
                            <input
                                type="number"
                                id="majorGridColsInput"
                                name="majorGridCols"
                                value={localMajorCols}
                                onChange={(e) => handleLocalMajorDimChange(e, 'cols')}
                                min={minGridCols}
                                max={maxGridCols}
                                className="w-20 p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Cell Subdivision</h3>
                    <div className="flex items-center">
                        <select
                            id="gridSubdivisionSelect"
                            value={currentGridSubdivision}
                            onChange={handleSubdivisionSelect}
                            className="p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"
                            title="Select grid cell subdivision level"
                        >
                            {AVAILABLE_SUBDIVISIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div> {/* Container for Zoom Controls */}
                    <h3 className="text-md font-semibold text-gray-700 mb-2">View Controls</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onZoomOut}
                            className="p-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Zoom Out"
                        // disabled={!canZoomOut} // Optional: disable if at MIN_ZOOM_LEVEL
                        >
                            <Icon name="zoom_out" className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={onZoomIn}
                            className="p-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Zoom In"
                        // disabled={!canZoomIn} // Optional: disable if at MAX_ZOOM_LEVEL
                        >
                            <Icon name="zoom_in" className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={onResetZoom}
                            className="px-3 py-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Reset Zoom (Current: ${Math.round(zoomLevel * 100)}%)`}
                            disabled={zoomLevel === 1.0} // Disable if already at 100%
                        >
                            {Math.round(zoomLevel * 100)}%
                        </button>
                    </div>
                </div>
            </div>

            {/* Tools Section */}
            <div>
                <h3 className="text-md font-semibold text-gray-700 mb-3">Tools</h3>
                <div className="flex flex-wrap items-center gap-3">
                    {toolDefinitions.map(tool => (
                        <DraggableGenericTool
                            key={tool.name}
                            tool={tool}
                            itemType={tool.toolItemType}
                        />
                    ))}

                    <div className="border-l border-gray-300 h-10 mx-1.5"></div>
                    <button
                        onClick={onToggleEraser}
                        className={`p-2.5 border rounded-lg flex flex-col items-center shadow-sm transition-colors duration-150 ${isEraserActive ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' : 'bg-white hover:bg-gray-50 text-gray-600'
                            }`}
                        title={isEraserActive ? "Eraser Active (Deactivate)" : "Activate Eraser"}
                    >
                        <Icon name="ink_eraser" className="w-5 h-5 text-gray-500" />
                        <span className="text-xxs mt-0.5">{isEraserActive ? 'ON' : 'Eraser'}</span>
                    </button>

                    <div className="border-l border-gray-300 h-10 mx-1.5"></div>
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <Icon name="undo" className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="p-2 border rounded-md shadow-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                    >
                        <Icon name="redo" className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LayoutDesignerToolbar;