import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Common Components
import Icon from '../../../../components/common/Icon';

// Constants & Configs
import { ITEM_CONFIGS } from '../../constants/itemConfigs'; // For display names and editor mapping

// Specific Property Editors (dynamically imported or pre-imported)
// It's generally better to pre-import if the number of editors isn't excessively large,
// or use React.lazy for code-splitting if there are many. For this example, pre-importing.
import TableEditor from './property_editors/TableEditor';
import WallEditor from './property_editors/WallEditor';
import DoorEditor from './property_editors/DoorEditor';
import DecorEditor from './property_editors/DecorEditor';
import CounterEditor from './property_editors/CounterEditor'; // Assuming a separate one for counters

// Fallback component if no specific editor is found or no item selected
const DefaultInspectorContent = ({ item }) => (
    <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
        {item ? (
            <>
                <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Properties for: {ITEM_CONFIGS[item.itemType]?.displayName || item.itemType}
                </p>
                <p className="text-xs">No specific editor configured for this item type.</p>
                {process.env.NODE_ENV === 'development' && ( // Only show JSON dump in development
                    <pre className="mt-3 text-xxs bg-neutral-100 dark:bg-neutral-700 p-2 rounded-md overflow-auto max-h-60">
                        {JSON.stringify(item, null, 2)}
                    </pre>
                )}
            </>
        ) : (
            <p>Select an item on the canvas to view its properties.</p>
        )}
    </div>
);

// --- Design Guideline Variables ---
const INSPECTOR_WIDTH = 'w-80'; // 320px
const INSPECTOR_BG_LIGHT = 'bg-white';
const INSPECTOR_BG_DARK = 'dark:bg-neutral-800';
const INSPECTOR_BORDER_LIGHT = 'border-l border-neutral-200';
const INSPECTOR_BORDER_DARK = 'dark:border-neutral-700';
const INSPECTOR_SHADOW = 'shadow-xl'; // Prominent shadow for an overlay panel

const HEADER_PADDING = 'p-4';
const HEADER_BORDER_LIGHT = 'border-b border-neutral-200';
const HEADER_BORDER_DARK = 'dark:border-neutral-700';
const HEADER_TITLE_FONT = 'font-montserrat font-semibold';
const HEADER_TITLE_SIZE = 'text-base'; // Slightly smaller than page title, e.g., 1rem
const HEADER_TITLE_COLOR_LIGHT = 'text-neutral-800';
const HEADER_TITLE_COLOR_DARK = 'dark:text-neutral-100';

const CLOSE_BUTTON_STYLE = `p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700`;

const CONTENT_PADDING = 'p-4';
// --- End Design Guideline Variables ---

const PropertiesInspector = ({
    designItems,        // Array of all design item objects
    selectedItemId,     // ID of the currently selected item
    onUpdateItemProperties, // (itemId, { property: value }) => boolean
    ITEM_CONFIGS: propItemConfigs, // Passed prop, use this instead of direct import if testing/DI
    ItemTypes,          // Passed if any specific editor needs it (rare)
    isOpen,             // Boolean to control panel visibility
    onClose,            // Callback function to close the panel (typically deselects item)
    gridSubdivision,    // Current grid subdivision, passed to specific editors
    // QR related props (getQrStatus, downloadSingleQr) would be passed here if needed
}) => {
    const selectedItem = useMemo(() => {
        if (!selectedItemId || !designItems) return null;
        return designItems.find(item => item.id === selectedItemId);
    }, [selectedItemId, designItems]);

    const currentItemConfigs = propItemConfigs || ITEM_CONFIGS; // Use passed prop or direct import

    // --- Component Dispatch Logic for Properties Editor ---
    let SpecificEditorComponent = DefaultInspectorContent; // Default if no item or no specific editor
    let editorKey = null;

    if (selectedItem && selectedItem.itemType && currentItemConfigs[selectedItem.itemType]) {
        editorKey = currentItemConfigs[selectedItem.itemType].SidebarEditorComponent;

        // Special handling for 'counter-' decorType to use CounterEditor
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            editorKey = 'CounterPropertiesEditor'; // Override if it's a counter
        }
    }

    switch (editorKey) {
        case 'TablePropertiesEditor': SpecificEditorComponent = TableEditor; break;
        case 'WallPropertiesEditor': SpecificEditorComponent = WallEditor; break;
        case 'DoorPropertiesEditor': SpecificEditorComponent = DoorEditor; break;
        case 'DecorPropertiesEditor': SpecificEditorComponent = DecorEditor; break;
        case 'CounterPropertiesEditor': SpecificEditorComponent = CounterEditor; break;
        // No default case needed as DefaultInspectorContent is the initial value
    }

    // --- Animation Variants ---
    const panelVariants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 30, duration: 0.25 } },
        closed: { x: "100%", opacity: 0, transition: { type: 'spring', stiffness: 320, damping: 30, duration: 0.2 } },
    };

    const inspectorTitle = useMemo(() => {
        if (!selectedItem) return "Properties";
        const config = currentItemConfigs[selectedItem.itemType];
        let displayName = config?.displayName || selectedItem.itemType;
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            displayName = "Counter"; // Specific title for counters
        }
        return `${displayName} Properties`;
    }, [selectedItem, currentItemConfigs, ItemTypes]);


    return (
        <AnimatePresence>
            {isOpen && ( // Only render if isOpen is true
                <motion.aside
                    key="properties-inspector-panel" // Consistent key for AnimatePresence
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={panelVariants}
                    className={`
                        ${INSPECTOR_WIDTH} ${INSPECTOR_BG_LIGHT} ${INSPECTOR_BG_DARK}
                        ${INSPECTOR_BORDER_LIGHT} ${INSPECTOR_BORDER_DARK} ${INSPECTOR_SHADOW}
                        flex flex-col fixed right-0 top-0 h-full z-40
                    `} // z-index ensures it's above canvas, but below global modals
                    aria-labelledby="properties-inspector-title"
                >
                    {/* Header */}
                    <div className={`
                        ${HEADER_PADDING} ${HEADER_BORDER_LIGHT} ${HEADER_BORDER_DARK}
                        flex justify-between items-center shrink-0
                    `}>
                        <h3
                            id="properties-inspector-title"
                            className={`${HEADER_TITLE_FONT} ${HEADER_TITLE_SIZE} ${HEADER_TITLE_COLOR_LIGHT} ${HEADER_TITLE_COLOR_DARK} tracking-tight`}
                        >
                            {inspectorTitle}
                        </h3>
                        <button
                            onClick={onClose}
                            className={CLOSE_BUTTON_STYLE}
                            title="Close Properties Panel"
                            aria-label="Close Properties Panel"
                        >
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className={`flex-1 overflow-y-auto ${CONTENT_PADDING} scrollbar-thin`}>
                        {/* 
                          Pass selectedItem directly.
                          The key on SpecificEditorComponent ensures it re-mounts if the selected item changes,
                          which helps reset internal state of editors if they have any.
                        */}
                        <SpecificEditorComponent
                            key={selectedItem ? selectedItem.id : 'no-item'}
                            item={selectedItem}
                            onUpdateItemProperty={onUpdateItemProperties}
                            gridSubdivision={gridSubdivision}
                        // Pass other necessary props like getQrStatus, downloadSingleQr if re-enabled for TableEditor
                        />
                    </div>

                    {/* Optional Footer (e.g., for common actions like delete, though eraser tool is primary) */}
                    {/* <div className={`p-3 border-t ${HEADER_BORDER_LIGHT} ${HEADER_BORDER_DARK} mt-auto shrink-0`}>
                        {selectedItem && (
                            <button
                                // onClick={() => { onRemoveItemById(selectedItem.id); onClose(); }}
                                className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                                <Icon name="delete" className="w-3.5 h-3.5 mr-1.5" />
                                Delete Selected Item
                            </button>
                        )}
                    </div> */}
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default PropertiesInspector;