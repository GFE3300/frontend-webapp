import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { useDeviceDetection } from '../../../../hooks/useDeviceDetection';

import TableEditor from './property_editors/TableEditor';
import WallEditor from './property_editors/WallEditor';
import DoorEditor from './property_editors/DoorEditor';
import DecorEditor from './property_editors/DecorEditor';
import CounterEditor from './property_editors/CounterEditor';

// Localization
import slRaw from '../../utils/script_lines.js';
const sl = slRaw.venueManagement.propertiesInspector;
// ITEM_CONFIGS is used for item.displayName. Assuming ITEM_CONFIGS.displayName is the source.
import { ITEM_CONFIGS as fallbackItemConfigs, ItemTypes } from '../../constants/itemConfigs'; // For ITEM_CONFIGS and ItemTypes

// Default Content (Now uses localization strings)
const DefaultInspectorContent = ({ item, ITEM_CONFIGS_Local }) => (
    <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
        {item ? (
            <>
                <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {ITEM_CONFIGS_Local[item.itemType]?.displayName || item.itemType} {(sl.itemPropertiesTitleSuffix || "Properties")}
                </p>
                <p className="text-xs">{sl.defaultInspectorContent_noEditorConfigured || "No specific editor configured..."}</p>
                {import.meta.env.NODE_ENV === 'development' && (
                    <pre className="mt-3 text-xxs bg-neutral-100 dark:bg-neutral-700 p-2 rounded-md overflow-auto max-h-60">
                        {JSON.stringify(item, null, 2)}
                    </pre>
                )}
            </>
        ) : (
            <p>{sl.noItemSelectedMessage || "Select an item on the canvas to view its properties."}</p>
        )}
    </div>
);


// Design Guideline Variables (Copied from original, no changes here)
const INSPECTOR_BG_LIGHT = 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg';
const INSPECTOR_SHADOW = 'shadow-2xl';
const INSPECTOR_BORDER_LIGHT = 'border border-neutral-200/70';
const INSPECTOR_BORDER_DARK = 'dark:border-neutral-700/70';
const DESKTOP_PANEL_WIDTH = 'w-72 sm:w-80';
const DESKTOP_PANEL_MAX_HEIGHT = 'max-h-[calc(100vh-8rem)]';
const DESKTOP_PANEL_MARGIN = 'm-4';
const DESKTOP_PANEL_RADIUS = 'rounded-xl';
const MINIMIZED_TAB_WIDTH = 'w-10';
const MINIMIZED_TAB_HEIGHT = 'h-12';
const BOTTOM_SHEET_MAX_HEIGHT = 'max-h-[75vh]';
const BOTTOM_SHEET_PEEK_HEIGHT_NUM = 64;
const BOTTOM_SHEET_RADIUS = 'rounded-t-2xl';
const HEADER_PADDING = 'px-4 py-3';
const HEADER_BORDER_LIGHT = 'border-b border-neutral-200/80';
const HEADER_BORDER_DARK = 'dark:border-neutral-700/80';
const HEADER_TITLE_FONT = 'font-montserrat font-semibold';
const HEADER_TITLE_SIZE = 'text-base';
const HEADER_TITLE_COLOR_LIGHT = 'text-neutral-800';
const HEADER_TITLE_COLOR_DARK = 'dark:text-neutral-100';
const CLOSE_BUTTON_STYLE = `p-1.5 w-8 h-8 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700/50`;
const GRAB_HANDLE_STYLE = `w-10 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full mx-auto`;
const CONTENT_PADDING = 'p-4';
// --- End Design Guideline Variables ---

const PropertiesInspector = ({
    designItems,
    selectedItemId,
    onUpdateItemProperties,
    ITEM_CONFIGS: propItemConfigs, // Renamed to avoid conflict with imported fallbackItemConfigs
    // ItemTypes prop is also passed but used via imported ItemTypes
    isOpen,
    onClose,
    gridSubdivision,
}) => {
    const { isMobile } = useDeviceDetection();

    const [isMinimizedDesktop, setIsMinimizedDesktop] = useState(false);
    const [isExpandedMobile, setIsExpandedMobile] = useState(false);
    const inspectorRef = useRef(null);

    const currentItemConfigs = propItemConfigs || fallbackItemConfigs; // Use passed ITEM_CONFIGS or fallback

    const selectedItem = useMemo(() => {
        if (!selectedItemId || !designItems) return null;
        return designItems.find(item => item.id === selectedItemId);
    }, [selectedItemId, designItems]);

    useEffect(() => {
        if (!isOpen || !selectedItem) {
            setIsMinimizedDesktop(true);
            setIsExpandedMobile(false);
        } else {
            setIsMinimizedDesktop(false);
            if (isMobile) {
                setIsExpandedMobile(true);
            }
        }
    }, [isOpen, selectedItem, isMobile]);


    let SpecificEditorComponent = DefaultInspectorContent;
    let editorKey = null;
    if (selectedItem && selectedItem.itemType && currentItemConfigs && currentItemConfigs[selectedItem.itemType]) {
        editorKey = currentItemConfigs[selectedItem.itemType].SidebarEditorComponent;
        // Special handling for counters that might be under PLACED_DECOR type
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            editorKey = 'CounterEditor';
        }
    }
    switch (editorKey) {
        case 'TableEditor': SpecificEditorComponent = TableEditor; break;
        case 'WallEditor': SpecificEditorComponent = WallEditor; break;
        case 'DoorEditor': SpecificEditorComponent = DoorEditor; break;
        case 'DecorEditor': SpecificEditorComponent = DecorEditor; break;
        case 'CounterEditor': SpecificEditorComponent = CounterEditor; break;
        default: SpecificEditorComponent = DefaultInspectorContent;
    }

    const inspectorTitle = useMemo(() => {
        if (!selectedItem || !currentItemConfigs) return sl.defaultTitle || "Properties";
        const config = currentItemConfigs[selectedItem.itemType];
        let itemName = config?.displayName || selectedItem.itemType;
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            itemName = "Counter"; // Could be localized: sl.counterTypeName || "Counter"
        }
        return `${itemName} ${sl.itemPropertiesTitleSuffix || "Properties"}`;
    }, [selectedItem, currentItemConfigs, ItemTypes.PLACED_DECOR]);


    const mobilePeekTitle = useMemo(() => {
        if (!selectedItem || !currentItemConfigs) return sl.defaultTitle || "Properties";
        const config = currentItemConfigs[selectedItem.itemType];
        let itemName = config?.displayName || selectedItem.itemType;
        if (selectedItem.itemType === ItemTypes.PLACED_DECOR && selectedItem.decorType?.startsWith('counter-')) {
            itemName = "Counter";
        }
        return `${itemName} ${sl.mobilePeekTitleSuffix || "Properties"}`;
    }, [selectedItem, currentItemConfigs, ItemTypes.PLACED_DECOR]);


    const handleClose = useCallback(() => {
        if (isMobile) setIsExpandedMobile(false);
        setIsMinimizedDesktop(true);
        onClose();
    }, [isMobile, onClose]);

    const toggleMinimizeDesktop = () => {
        if (!selectedItem && !isMinimizedDesktop) {
            onClose();
            return;
        }
        setIsMinimizedDesktop(prev => !prev);
    }

    const desktopPanelVariants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
        minimized: { x: "calc(100% - 3.5rem)", opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
        closed: { x: "100%", opacity: 0, transition: { type: 'spring', stiffness: 280, damping: 28, delay: 0.1 } },
    };
    const currentDesktopState = !isOpen ? "closed" : (isMinimizedDesktop ? "minimized" : "open");

    const mobileBottomSheetVariants = {
        closed: { y: "100%", opacity: 0.7, transition: { type: 'tween', ease: "anticipate", duration: 0.3 } },
        peek: { y: `calc(100% - ${BOTTOM_SHEET_PEEK_HEIGHT_NUM}px)`, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        open: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };
    const currentMobileState = !isOpen ? "closed" : (isExpandedMobile ? "open" : "peek");

    const panelBaseClasses = `
        flex flex-col fixed z-40 
        ${INSPECTOR_BG_LIGHT} ${INSPECTOR_SHADOW}
        ${INSPECTOR_BORDER_LIGHT} ${INSPECTOR_BORDER_DARK}
    `;

    const panelDynamicClasses = isMobile
        ? `left-0 bottom-0 w-full ${BOTTOM_SHEET_MAX_HEIGHT} ${BOTTOM_SHEET_RADIUS}`
        : `${DESKTOP_PANEL_WIDTH} right-0 top-0 ${DESKTOP_PANEL_MARGIN} ${DESKTOP_PANEL_MAX_HEIGHT} ${DESKTOP_PANEL_RADIUS}`;


    const headerContent = (isMinimizedDesktop && !isMobile) ? null : (
        <div className={`
            ${HEADER_PADDING}
            flex justify-between items-center shrink-0
            ${isMobile && isExpandedMobile ? `${HEADER_BORDER_LIGHT} ${HEADER_BORDER_DARK}` : ''}
            ${!isMobile ? `${HEADER_BORDER_LIGHT} ${HEADER_BORDER_DARK}` : ''}
        `}>
            <h3
                id="properties-inspector-title" // Added ID for aria-labelledby
                className={`${HEADER_TITLE_FONT} ${HEADER_TITLE_SIZE} ${HEADER_TITLE_COLOR_LIGHT} ${HEADER_TITLE_COLOR_DARK} tracking-tight truncate`}
            >
                {selectedItem ? inspectorTitle : (sl.defaultTitle || "Properties")}
            </h3>
            <button
                onClick={handleClose}
                className={CLOSE_BUTTON_STYLE}
                title={sl.closeButtonTooltip || "Close Properties Panel"}
                aria-label={sl.closeButtonAriaLabel || "Close Properties Panel"}
            >
                <Icon name="close" className="w-5 h-5" style={{ fontSize: "1.25rem" }} />
            </button>
        </div>
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inspectorRef.current && !inspectorRef.current.contains(event.target) && isOpen) {
                const clickedOnCanvasItem = event.target.closest && event.target.closest('[data-is-canvas-item="true"]');
                if (!clickedOnCanvasItem) {
                    handleClose();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClose]);

    return (
        <AnimatePresence>
            {(isOpen || (!isMobile && isMinimizedDesktop && selectedItem)) && (
                <motion.aside
                    ref={inspectorRef}
                    key="properties-inspector-panel"
                    className={`${panelBaseClasses} ${panelDynamicClasses}`}
                    initial={isMobile ? "closed" : "closed"}
                    animate={isMobile ? currentMobileState : currentDesktopState}
                    exit={isMobile ? "closed" : "closed"}
                    variants={isMobile ? mobileBottomSheetVariants : desktopPanelVariants}
                    drag={isMobile && selectedItem ? "y" : false}
                    dragConstraints={isMobile ? { top: 0, bottom: 0 } : false}
                    dragElastic={{ top: 0.1, bottom: 0.3 }}
                    onDragEnd={
                        isMobile ? (event, info) => {
                            const dragThreshold = 50;
                            if (info.offset.y > dragThreshold && isExpandedMobile) {
                                setIsExpandedMobile(false);
                            } else if (info.offset.y < -dragThreshold && !isExpandedMobile && selectedItem) {
                                setIsExpandedMobile(true);
                            } else if (info.offset.y > dragThreshold * 1.5 && !isExpandedMobile && selectedItem) {
                                handleClose();
                            }
                        } : undefined
                    }
                    aria-labelledby="properties-inspector-title" // Refers to h3 id
                >
                    {!isMobile && isMinimizedDesktop && selectedItem && (
                        <motion.button
                            key="desktop-minimized-tab"
                            onClick={toggleMinimizeDesktop}
                            className={`absolute -left-10 top-1/2 -translate-y-1/2 ${MINIMIZED_TAB_WIDTH} ${MINIMIZED_TAB_HEIGHT} 
                                        ${INSPECTOR_BG_LIGHT} ${INSPECTOR_BORDER_LIGHT} ${INSPECTOR_BORDER_DARK} ${INSPECTOR_SHADOW}
                                        flex items-center justify-center rounded-l-lg cursor-pointer group`}
                            title={sl.minimizedTabTooltip || "Show Properties"}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <Icon name="segment" className={`w-5 h-5 text-neutral-600 dark:text-neutral-300 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors`} style={{ fontSize: "1.25rem" }} />
                        </motion.button>
                    )}

                    {isMobile && selectedItem && (
                        <motion.div
                            className={`pt-3 pb-1 ${isExpandedMobile ? '' : 'cursor-pointer'}`}
                            onClick={!isExpandedMobile ? () => setIsExpandedMobile(true) : undefined}
                            animate={currentMobileState === "peek" ? { y: [0, -2, 0] } : {}}
                            transition={currentMobileState === "peek" ? { duration: 0.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } : {}}
                        >
                            <div className={GRAB_HANDLE_STYLE} />
                            {!isExpandedMobile && (
                                <div className={`${HEADER_PADDING} py-1 flex justify-between items-center`}>
                                    <h3 className={`${HEADER_TITLE_FONT} text-sm ${HEADER_TITLE_COLOR_LIGHT} ${HEADER_TITLE_COLOR_DARK} tracking-tight truncate`}>
                                        {mobilePeekTitle}
                                    </h3>
                                    <Icon name="expand_less" className="w-5 h-5 text-neutral-500 dark:text-neutral-400" style={{ fontSize: "1.25rem" }} />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {headerContent}

                    {(!isMobile && !isMinimizedDesktop || isMobile && isExpandedMobile) && (
                        <div className={`flex-1 overflow-y-auto ${CONTENT_PADDING} scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent`}>
                            <SpecificEditorComponent
                                key={selectedItem ? selectedItem.id : 'no-item'}
                                item={selectedItem}
                                onUpdateItemProperty={onUpdateItemProperties}
                                gridSubdivision={gridSubdivision}
                                ITEM_CONFIGS_Local={currentItemConfigs} // Pass the resolved configs
                            // ItemTypes is not directly used by editor components, but could be if needed
                            />
                        </div>
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default PropertiesInspector;