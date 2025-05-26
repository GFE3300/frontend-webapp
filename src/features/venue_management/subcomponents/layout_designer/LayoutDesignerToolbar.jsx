import React from 'react';
import DraggableGenericTool from './DraggableGenericTool';
import Icon from '../../../../components/common/Icon';

import {
    MIN_GRID_ROWS, // These refer to MAJOR grid rows/cols
    MAX_GRID_ROWS,
    MIN_GRID_COLS,
    MAX_GRID_COLS,
    AVAILABLE_SUBDIVISIONS, // Import for the dropdown
} from '../../constants/layoutConstants';

const LayoutDesignerToolbar = ({
    majorGridRows,       // Current major grid rows
    majorGridCols,       // Current major grid cols
    currentGridSubdivision, // Current selected subdivision level (e.g., 1, 2, 4)
    onGridDimensionChange, // (dimension: 'rows'|'cols', value: string) => void (for MAJOR grid)
    onGridSubdivisionChange, // (newSubdivisionValue: number) => void

    tableToolsConfig,
    ItemTypes,

    isEraserActive,
    onToggleEraser,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => {

    const handleMajorDimChange = (e, dimension) => {
        onGridDimensionChange(dimension, e.target.value);
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
                                value={majorGridRows}
                                onChange={(e) => handleMajorDimChange(e, 'rows')}
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
                                value={majorGridCols}
                                onChange={(e) => handleMajorDimChange(e, 'cols')}
                                min={MIN_GRID_COLS}
                                max={MAX_GRID_COLS}
                                className="w-20 p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Cell Subdivision</h3> {/* Changed title */}
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
                    {tableToolsConfig.map(tool => (
                        <DraggableGenericTool
                            key={tool.type}
                            tool={tool} // tool.w and tool.h are in MAJOR cell units
                            itemType={ItemTypes.TABLE_TOOL}
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