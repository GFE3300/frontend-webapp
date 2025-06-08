import React from 'react';
import TableRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/TableRenderer';
import WallRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/WallRenderer';
import DoorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DoorRenderer';
import DecorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DecorRenderer';
import CounterRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/CounterRenderer';
import TableStatusOverlay from './TableStatusOverlay';

// A map to look up the correct renderer component for each item type.
const itemRenderers = {
    placedTable: TableRenderer,
    placedWall: WallRenderer,
    placedDoor: DoorRenderer,
    placedDecor: DecorRenderer,
    placedCounter: CounterRenderer,
};

/**
 * Renders the static venue layout and overlays live table status information on top.
 * This is a "dumb" presentational component that receives all data via props.
 * @param {{ 
 *   layoutData: object, 
 *   liveDataMap: Object.<string, object>,
 *   onSelectTable: (layoutItemId: string) => void 
 * }} props
 *        - layoutData: The full layout data object from the useLayoutData hook.
 *        - liveDataMap: An object mapping layout_item_id to live table data.
 *        - onSelectTable: The handler to call when a table is clicked.
 */
const VenueLayoutDisplay = ({ layoutData, liveDataMap, onSelectTable }) => {
    // The parent component (`LiveOrdersPage`) now handles loading/error states.
    // This component can assume `layoutData` is valid when it renders.

    if (!layoutData || !layoutData.items || layoutData.items.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-4 text-center text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md">
                <div>
                    <p className="font-semibold">No venue layout has been configured.</p>
                    <p className="text-sm mt-2">An administrator can create one in the Venue Designer.</p>
                </div>
            </div>
        );
    }

    const { grid_rows, grid_cols, grid_subdivision } = layoutData;
    const cellSize = 16; // Base size in pixels for a grid cell. Consistent with designer.

    const gridStyle = {
        display: 'grid',
        gridTemplateRows: `repeat(${grid_rows * grid_subdivision}, ${cellSize / grid_subdivision}px)`,
        gridTemplateColumns: `repeat(${grid_cols * grid_subdivision}, ${cellSize / grid_subdivision}px)`,
        position: 'relative',
        width: `${grid_cols * cellSize}px`,
        height: `${grid_rows * cellSize}px`,
        margin: 'auto', // Center the layout in its container
    };

    return (
        <div className="relative w-full h-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div style={gridStyle}>
                {layoutData.items.map(item => {
                    const Renderer = itemRenderers[item.item_type];
                    if (!Renderer) return null;

                    const itemStyle = {
                        gridColumnStart: item.grid_col_start, // Corrected from grid_x
                        gridColumnEnd: `span ${item.w_minor}`, // Corrected from width
                        gridRowStart: item.grid_row_start,   // Corrected from grid_y
                        gridRowEnd: `span ${item.h_minor}`,   // Corrected from height
                        position: 'relative', // Needed for overlay positioning
                    };

                    // The backend uses 'placedTable', so we check for that.
                    const isTable = item.item_type === 'placedTable';
                    const tableLiveData = isTable ? liveDataMap[item.id] : null;

                    return (
                        <div key={item.id} style={itemStyle}>
                            <Renderer item={item} cellSize={cellSize} />
                            {isTable && (
                                <TableStatusOverlay
                                    tableStaticData={item}
                                    tableLiveData={tableLiveData}
                                    onSelect={() => onSelectTable(item.id)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VenueLayoutDisplay;