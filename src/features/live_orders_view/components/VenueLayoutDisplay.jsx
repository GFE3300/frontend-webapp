import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Import the existing, tested renderers from the venue management feature
import TableRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/TableRenderer';
import WallRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/WallRenderer';
import DoorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DoorRenderer';
import DecorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DecorRenderer';
import CounterRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/CounterRenderer';

// Import the overlay component we will build next
import TableStatusOverlay from './TableStatusOverlay';

// Import i18n text
import { scriptLines_liveOrders } from '../utils/script_lines';

// A map to look up the correct renderer component for each item type.
const itemRenderers = {
    // Note: The backend `item_type` is the key (e.g., 'placedTable')
    'placedTable': TableRenderer,
    'placedWall': WallRenderer,
    'placedDoor': DoorRenderer,
    'placedDecor': DecorRenderer,
    'placedCounter': CounterRenderer,
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
    const { user } = useAuth();

    // The parent component (`LiveOrdersPage`) handles the main loading/error states.
    // This component handles the specific case where data is loaded but the layout is empty.
    if (!layoutData || !layoutData.items || layoutData.items.length === 0) {
        const canConfigure = user?.role === 'ADMIN' || user?.role === 'MANAGER';
        return (
            <div className="flex items-center justify-center h-full p-4 text-center text-gray-500 dark:text-gray-400">
                <div>
                    <p className="font-semibold">{scriptLines_liveOrders.noLayoutConfiguredTitle}</p>
                    <p className="text-sm mt-2">{scriptLines_liveOrders.noLayoutConfiguredBody}</p>
                    {canConfigure && (
                        <Link to="/dashboard/business/venue-designer" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                            Go to Venue Designer
                        </Link>
                    )}
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
        margin: 'auto', // Center the layout within its flexible container
    };

    return (
        <div className="relative w-full h-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div style={gridStyle}>
                {layoutData.items.map(item => {
                    const Renderer = itemRenderers[item.item_type];
                    if (!Renderer) {
                        console.warn(`No renderer found for item_type: ${item.item_type}`);
                        return null;
                    }

                    const itemStyle = {
                        gridColumnStart: item.grid_col_start,
                        gridColumnEnd: `span ${item.w_minor}`,
                        gridRowStart: item.grid_row_start,
                        gridRowEnd: `span ${item.h_minor}`,
                        position: 'relative', // Crucial for absolutely positioning children like the overlay
                    };

                    const isTable = item.item_type === 'placedTable';
                    // Look up the live data for this specific table using its UUID.
                    const tableLiveData = isTable ? liveDataMap[item.id] : null;

                    return (
                        <div key={item.id} style={itemStyle}>
                            <Renderer item={item} cellSize={cellSize} isPreview={true} />
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