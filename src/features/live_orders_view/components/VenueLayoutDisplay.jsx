import React from 'react';
import { useLayoutData } from '../../venue_management/hooks/useLayoutData';
import Spinner from '../../../components/common/Spinner';
import TableRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/TableRenderer';
import WallRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/WallRenderer';
import DoorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DoorRenderer';
import DecorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DecorRenderer';
import CounterRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/CounterRenderer';
import TableStatusOverlay from './TableStatusOverlay'; // This will be created next

// A map to look up the correct renderer component for each item type.
const itemRenderers = {
    TABLE: TableRenderer,
    WALL: WallRenderer,
    DOOR: DoorRenderer,
    DECOR: DecorRenderer,
    COUNTER: CounterRenderer,
};

/**
 * Renders the static venue layout and overlays live table status information on top.
 * @param {{ liveDataMap: Object.<string, object> }} props
 *        - liveDataMap: An object mapping layout_item_id to live table data.
 */
const VenueLayoutDisplay = ({ liveDataMap, onSelectTable }) => {
    const { data: layoutData, isLoading, isError, error } = useLayoutData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size="md" />
                <span className="ml-3 text-gray-500 dark:text-gray-400">Loading venue layout...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-red-700 bg-red-100 rounded-md">
                <p>Error loading venue layout: {error.message}</p>
            </div>
        );
    }

    if (!layoutData || !layoutData.items) {
        return (
            <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">
                <p>No venue layout has been configured for this business yet.</p>
                <p className="text-sm mt-2">An administrator can create one in the Venue Designer.</p>
            </div>
        );
    }

    const { grid_rows, grid_cols, grid_subdivision } = layoutData;
    const cellSize = 16; // Base size in pixels for a grid cell

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
        <div className="relative w-full h-full overflow-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div style={gridStyle}>
                {layoutData.items.map(item => {
                    const Renderer = itemRenderers[item.item_type];
                    if (!Renderer) return null;

                    const itemStyle = {
                        gridColumnStart: item.grid_x,
                        gridColumnEnd: `span ${item.width}`,
                        gridRowStart: item.grid_y,
                        gridRowEnd: `span ${item.height}`,
                        position: 'relative', // Needed for overlay positioning
                    };

                    const isTable = item.item_type === 'TABLE';
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