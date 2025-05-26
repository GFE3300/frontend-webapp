// features/venue_management/subcomponents/layout_designer/LayoutDesignerToolbar.jsx
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import DraggableGenericTool from './DraggableGenericTool';
import Icon from '../../../../components/common/Icon';
import { useDebounce } from '../../../../hooks/useDebounce'; // Assuming this path is correct

import {
    MIN_GRID_ROWS,
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    AVAILABLE_SUBDIVISIONS,
} from '../../constants/layoutConstants';

const LayoutDesignerToolbar = ({
    majorGridRows: initialMajorGridRows, // Rename prop to avoid conflict
    majorGridCols: initialMajorGridCols, // Rename prop to avoid conflict
    currentGridSubdivision,
    onGridDimensionChange, // This will now receive debounced values
    onGridSubdivisionChange,

    toolDefinitions,
    ItemTypes,

    isEraserActive,
    onToggleEraser,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => {
    // Local state for immediate input updates
    const [localMajorRows, setLocalMajorRows] = useState(initialMajorGridRows);
    const [localMajorCols, setLocalMajorCols] = useState(initialMajorGridCols);

    // Update local state if initial props change (e.g., on reset or load)
    useEffect(() => {
        setLocalMajorRows(initialMajorGridRows);
    }, [initialMajorGridRows]);

    useEffect(() => {
        setLocalMajorCols(initialMajorGridCols);
    }, [initialMajorGridCols]);

    // Debounce the local state values
    const debouncedMajorRows = useDebounce(localMajorRows, 500); // 500ms delay
    const debouncedMajorCols = useDebounce(localMajorCols, 500);

    // Effect to call the expensive update function with debounced values
    useEffect(() => {
        // Only call if the debounced value is different from the initial prop
        // to avoid unnecessary calls on initial render or if prop changed due to external reset
        if (debouncedMajorRows !== initialMajorGridRows) {
            // And ensure it's a valid number before calling
            const rowsNum = parseInt(debouncedMajorRows, 10);
            if (!isNaN(rowsNum)) {
                onGridDimensionChange('rows', String(rowsNum)); // Pass as string as before
            }
        }
    }, [debouncedMajorRows, onGridDimensionChange, initialMajorGridRows]);

    useEffect(() => {
        if (debouncedMajorCols !== initialMajorGridCols) {
            const colsNum = parseInt(debouncedMajorCols, 10);
            if (!isNaN(colsNum)) {
                onGridDimensionChange('cols', String(colsNum));
            }
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

    return (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-lg">
            {/* Grid Setup Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5 pb-4 border-b border-gray-200">
                <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Major Grid Dimensions</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                            <label htmlFor="majorGridRowsInput" className="text-sm font-medium text-gray-600">Rows:</label>
                            <input
                                type="number"
                                id="majorGridRowsInput"
                                name="majorGridRows"
                                value={localMajorRows} // Use local state for input value
                                onChange={(e) => handleLocalMajorDimChange(e, 'rows')} // Update local state
                                min={MIN_GRID_ROWS}
                                max={MAX_GRID_ROWS}
                                className="w-20 p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <label htmlFor="majorGridColsInput" className="text-sm font-medium text-gray-600">Cols:</label>
                            <input
                                type="number"
                                id="majorGridColsInput"
                                name="majorGridCols"
                                value={localMajorCols} // Use local state
                                onChange={(e) => handleLocalMajorDimChange(e, 'cols')} // Update local state
                                min={MIN_GRID_COLS}
                                max={MAX_GRID_COLS}
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
                            className="p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto"
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
            </div>

            {/* Tools Section */}
            <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Tools</h3>
                <div className="flex flex-wrap items-center gap-2.5">
                    {toolDefinitions.map(tool => (
                        <DraggableGenericTool
                            key={tool.name}
                            tool={tool}
                            itemType={tool.toolItemType}
                        />
                    ))}

                    <div className="border-l border-gray-300 h-10 mx-1"></div>
                    <button
                        onClick={onToggleEraser}
                        className={`p-2.5 border rounded-lg flex flex-col items-center shadow-sm transition-colors duration-150 ${isEraserActive ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' : 'bg-white hover:bg-gray-50 text-gray-600'
                            }`}
                        title={isEraserActive ? "Eraser Active (Deactivate)" : "Activate Eraser"}
                    >
                        <Icon name="ink_eraser" className="w-5 h-5 text-gray-500" />
                        <span className="text-xxs mt-0.5">{isEraserActive ? 'ON' : 'Eraser'}</span>
                    </button>

                    <div className="border-l border-gray-300 h-10 mx-1"></div>
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-1.5 border rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <Icon name="undo" className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="p-1.5 border rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                    >
                        <Icon name="redo" className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LayoutDesignerToolbar;