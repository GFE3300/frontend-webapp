import React, { useMemo } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

// Common Components
import Icon from '../../../../components/common/Icon';

// Constants & Configs
// ITEM_CONFIGS is now primarily passed as a prop (propItemConfigs)
// import { ITEM_CONFIGS as DefaultItemConfigs } from '../../constants/itemConfigs'; // Keep as fallback if needed

// Specific Property Editors
import TableEditor from './property_editors/TableEditor';
import WallEditor from './property_editors/WallEditor';
import DoorEditor from './property_editors/DoorEditor';
import DecorEditor from './property_editors/DecorEditor';
import CounterEditor from './property_editors/CounterEditor';

// Fallback component if no specific editor is found or no item selected
const DefaultInspectorContent = ({ item, ITEM_CONFIGS_Local }) => ( // Pass ITEM_CONFIGS locally if needed for display name
    <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
        {item ? (
            <>
                <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Properties for: {ITEM_CONFIGS_Local[item.itemType]?.displayName || item.itemType}
                </p>
                <p className="text-xs">No specific editor configured for this item type, or the configured key is not matched.</p>
                {import.meta.env.NODE_ENV === 'development' && (
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
const INSPECTOR_SHADOW = 'shadow-xl';

const HEADER_PADDING = 'p-4';
const HEADER_BORDER_LIGHT = 'border-b border-neutral-200';
const HEADER_BORDER_DARK = 'dark:border-neutral-700';
const HEADER_TITLE_FONT = 'font-montserrat font-semibold';
const HEADER_TITLE_SIZE = 'text-base';
const HEADER_TITLE_COLOR_LIGHT = 'text-neutral-800';
const HEADER_TITLE_COLOR_DARK = 'dark:text-neutral-100';

const CLOSE_BUTTON_STYLE = `p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700`;

const CONTENT_PADDING = 'p-4';
// --- End Design Guideline Variables ---

const PropertiesInspector = ({
    designItems,
    selectedItemId,
    onUpdateItemProperties,
    ITEM_CONFIGS: propItemConfigs, // Passed prop from LayoutEditor
    ItemTypes, // Passed prop from LayoutEditor
    isOpen,
    onClose,
    gridSubdivision,
}) => {
    const selectedItem = useMemo(() => {
        if (!selectedItemId || !designItems) return null;
        return designItems.find(item => item.id === selectedItemId);
    }, [selectedItemId, designItems]);

    // Use the ITEM_CONFIGS passed as a prop. Fallback to direct import is removed for clarity,
    // as LayoutEditor should always pass it.
    const currentItemConfigs = propItemConfigs;

    let SpecificEditorComponent = DefaultInspectorContent;
    let editorKey = null;

    if (selectedItem && selectedItem.itemType && currentItemConfigs && currentItemConfigs[selectedItem.itemType]) {
        editorKey = currentItemConfigs[selectedItem.itemType].SidebarEditorComponent;

        // Special handling for decor items that should use the CounterEditor
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            // The key 'CounterEditor' should match a case in the switch statement
            // and also the SidebarEditorComponent value for PLACED_COUNTER in itemConfigs.jsx
            editorKey = 'CounterEditor';
        }
    }

    // The 'case' strings MUST EXACTLY MATCH the 'SidebarEditorComponent' values in itemConfigs.jsx
    switch (editorKey) {
        case 'TableEditor': // Was 'TablePropertiesEditor'
            SpecificEditorComponent = TableEditor;
            break;
        case 'WallEditor': // Was 'WallPropertiesEditor'
            SpecificEditorComponent = WallEditor;
            break;
        case 'DoorEditor': // Was 'DoorPropertiesEditor'
            SpecificEditorComponent = DoorEditor;
            break;
        case 'DecorEditor': // Was 'DecorPropertiesEditor'
            // This case handles regular decor. Counter-like decor is overridden to 'CounterEditor' above.
            SpecificEditorComponent = DecorEditor;
            break;
        case 'CounterEditor': // Was 'CounterPropertiesEditor'
            SpecificEditorComponent = CounterEditor;
            break;
        // No default needed as SpecificEditorComponent is already DefaultInspectorContent
    }

    const panelVariants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 30, duration: 0.25 } },
        closed: { x: "100%", opacity: 0, transition: { type: 'spring', stiffness: 320, damping: 30, duration: 0.2 } },
    };

    const inspectorTitle = useMemo(() => {
        if (!selectedItem || !currentItemConfigs) return "Properties";
        const config = currentItemConfigs[selectedItem.itemType];
        let displayName = config?.displayName || selectedItem.itemType;

        // Consistent title for counter-like decor
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            displayName = "Counter";
        }
        return `${displayName} Properties`;
    }, [selectedItem, currentItemConfigs, ItemTypes]);


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    key="properties-inspector-panel"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={panelVariants}
                    className={`
                        ${INSPECTOR_WIDTH} ${INSPECTOR_BG_LIGHT} ${INSPECTOR_BG_DARK}
                        ${INSPECTOR_BORDER_LIGHT} ${INSPECTOR_BORDER_DARK} ${INSPECTOR_SHADOW}
                        flex flex-col fixed right-0 top-0 h-full z-40
                    `}
                    aria-labelledby="properties-inspector-title"
                >
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

                    <div className={`flex-1 overflow-y-auto ${CONTENT_PADDING} scrollbar-thin`}>
                        <SpecificEditorComponent
                            key={selectedItem ? selectedItem.id : 'no-item'} // Re-mounts editor if item changes
                            item={selectedItem}
                            onUpdateItemProperty={onUpdateItemProperties}
                            gridSubdivision={gridSubdivision}
                            // Pass ITEM_CONFIGS to DefaultInspectorContent if it needs it for display name
                            ITEM_CONFIGS_Local={currentItemConfigs}
                        />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default PropertiesInspector;