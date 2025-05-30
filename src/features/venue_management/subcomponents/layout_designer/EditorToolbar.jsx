import React, { useState, useEffect, useMemo, Fragment } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

import DraggableTool from './DraggableTool';
import Icon from '../../../../components/common/Icon';
import { useDebounce } from '../../../../hooks/useDebounce';

import {
    MIN_GRID_ROWS, MAX_GRID_ROWS,
    MIN_GRID_COLS, MAX_GRID_COLS,
    AVAILABLE_SUBDIVISIONS,
} from '../../constants/layoutConstants';

// --- Design Guideline Variables ---
const TOOLBAR_STYLES = { 
    containerBase: "flex flex-col font-montserrat md:flex-row md:items-stretch md:justify-between gap-x-4 gap-y-2 transition-all duration-200 ease-in-out print:hidden",
    bgLight: "bg-white",
    bgDark: "dark:bg-neutral-800",
    shadow: "shadow-md",
    borderLight: "border-b border-neutral-200",
    borderDark: "dark:border-neutral-700",
    paddingNormal: "p-3",
    paddingZen: "p-1.5",
    sectionSeparatorLight: "border-neutral-300",
    sectionSeparatorDark: "dark:border-neutral-600",
};
const ICON_BUTTON_STYLES = { 
    base: "flex items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 dark:focus-visible:ring-offset-neutral-800",
    sizeNormal: "w-9 h-9", // 36px
    sizeZen: "w-8 h-8",   // 32px
    colorsLight: "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
    colorsDark: "dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200",
    activeLight: "!bg-rose-100 !text-rose-600",
    activeDark: "dark:!bg-rose-500/20 dark:!text-rose-400",
    disabled: "opacity-50 cursor-not-allowed !bg-transparent !text-neutral-400 dark:!text-neutral-500 dark:hover:!bg-transparent",
    iconSize: "w-5 h-5", // Standardized icon size for toolbar buttons
};
const INPUT_STYLES = { 
    base: "border text-xs rounded-md shadow-sm focus:ring-1 focus:border-transparent",
    light: "bg-neutral-50 border-neutral-300 text-neutral-700 placeholder-neutral-400 focus:ring-rose-400",
    dark: "dark:bg-neutral-700 dark:border-neutral-500 dark:text-neutral-200 dark:placeholder-neutral-500 dark:focus:ring-rose-500",
    sizeToolbar: "h-8 px-2 py-1",
    sizeToolbarSmall: "h-7 px-1.5 py-0.5",
};
const LABEL_STYLES = { 
    light: "text-xs font-medium text-neutral-500",
    dark: "dark:text-neutral-400",
};
const PRIMARY_BUTTON_STYLES = { 
    base: `${ICON_BUTTON_STYLES.base} font-medium text-xs shadow-sm`,
    sizeNormal: "px-3 py-1.5",
    sizeZen: "w-8 h-8",
    colorsLight: "bg-rose-500 text-white hover:bg-rose-600",
    colorsDark: "dark:bg-rose-600 dark:text-white dark:hover:bg-rose-500",
};
// --- End Design Guideline Variables ---

const ToolbarSectionWrapper = ({ children, className = "", isVisible = true }) => {
    if (!isVisible) return null;
    return <div className={`flex items-center space-x-1.5 md:space-x-2 ${className}`}>{children}</div>;
};


const EditorToolbar = ({
    majorGridRows: initialMajorGridRows, majorGridCols: initialMajorGridCols, currentGridSubdivision,
    onGridDimensionChange, onGridSubdivisionChange,
    zoomLevel, onZoomIn, onZoomOut, onResetZoom,
    toolDefinitions, 
    isEraserActive, onToggleEraser,
    onUndo, onRedo, canUndo, canRedo,
    onSave, onClearAll,
    isZenMode, onToggleZenMode,
    onToolbarToolSelect, // << NEW PROP: Callback for when a tool is selected for click-placement
    activeToolForPlacementName, // << NEW PROP: Name of the tool currently active for click-placement
}) => {
    const [localMajorRows, setLocalMajorRows] = useState(String(initialMajorGridRows));
    const [localMajorCols, setLocalMajorCols] = useState(String(initialMajorGridCols));

    const toolCategories = useMemo(() => { 
        const categories = toolDefinitions.reduce((acc, tool) => {
            const category = tool.category || 'Elements';
            if (!acc[category]) acc[category] = [];
            acc[category].push(tool);
            return acc;
        }, {});
        const order = ['Furniture', 'Structure', 'Decor', 'Elements'];
        const ordered = {};
        order.forEach(catName => {
            if (categories[catName]) ordered[catName] = categories[catName];
        });
        Object.keys(categories).forEach(catName => {
            if (!ordered[catName]) ordered[catName] = categories[catName];
        });
        return ordered;
    }, [toolDefinitions]);

    useEffect(() => setLocalMajorRows(String(initialMajorGridRows)), [initialMajorGridRows]);
    useEffect(() => setLocalMajorCols(String(initialMajorGridCols)), [initialMajorGridCols]);

    const debouncedMajorRows = useDebounce(localMajorRows, 500);
    const debouncedMajorCols = useDebounce(localMajorCols, 500);

    useEffect(() => { /* ... (no changes to dimension update logic) ... */
        const rowsNum = parseInt(debouncedMajorRows, 10);
        if (debouncedMajorRows === '') return;
        if (!isNaN(rowsNum) && rowsNum >= MIN_GRID_ROWS && rowsNum <= MAX_GRID_ROWS && rowsNum !== initialMajorGridRows) {
            onGridDimensionChange('rows', String(rowsNum));
        } else if (rowsNum !== initialMajorGridRows && (isNaN(rowsNum) || rowsNum < MIN_GRID_ROWS || rowsNum > MAX_GRID_ROWS)) {
            setLocalMajorRows(String(initialMajorGridRows));
        }
    }, [debouncedMajorRows, initialMajorGridRows, onGridDimensionChange]);

    useEffect(() => { /* ... (no changes to dimension update logic) ... */
        const colsNum = parseInt(debouncedMajorCols, 10);
        if (debouncedMajorCols === '') return;
        if (!isNaN(colsNum) && colsNum >= MIN_GRID_COLS && colsNum <= MAX_GRID_COLS && colsNum !== initialMajorGridCols) {
            onGridDimensionChange('cols', String(colsNum));
        } else if (colsNum !== initialMajorGridCols && (isNaN(colsNum) || colsNum < MIN_GRID_COLS || colsNum > MAX_GRID_COLS)) {
            setLocalMajorCols(String(initialMajorGridCols));
        }
    }, [debouncedMajorCols, initialMajorGridCols, onGridDimensionChange]);


    const handleLocalDimChange = (e, dimension) => { 
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            if (dimension === 'rows') setLocalMajorRows(value);
            else if (dimension === 'cols') setLocalMajorCols(value);
        }
    };
    const handleDimBlur = (e, dimension) => { 
        let value = parseInt(e.target.value, 10);
        const initialValue = dimension === 'rows' ? initialMajorGridRows : initialMajorGridCols;
        const min = dimension === 'rows' ? MIN_GRID_ROWS : MIN_GRID_COLS;
        const max = dimension === 'rows' ? MAX_GRID_ROWS : MAX_GRID_COLS;

        if (e.target.value === '' || isNaN(value) || value < min || value > max) value = initialValue;

        if (String(value) !== (dimension === 'rows' ? localMajorRows : localMajorCols)) {
            if (dimension === 'rows') setLocalMajorRows(String(value)); else setLocalMajorCols(String(value));
        }
        if (value !== initialValue) onGridDimensionChange(dimension, String(value));
    };
    const handleSubdivisionSelect = (e) => onGridSubdivisionChange(parseInt(e.target.value, 10));

    const currentIconButtonSize = isZenMode ? ICON_BUTTON_STYLES.sizeZen : ICON_BUTTON_STYLES.sizeNormal;
    const currentInputSize = isZenMode ? INPUT_STYLES.sizeToolbarSmall : INPUT_STYLES.sizeToolbar;
    const currentPrimaryButtonSize = isZenMode ? PRIMARY_BUTTON_STYLES.sizeZen : PRIMARY_BUTTON_STYLES.sizeNormal;

    return (
        <div
            className={`
                ${TOOLBAR_STYLES.containerBase} ${TOOLBAR_STYLES.bgLight} ${TOOLBAR_STYLES.bgDark}
                ${TOOLBAR_STYLES.shadow} ${TOOLBAR_STYLES.borderLight} ${TOOLBAR_STYLES.borderDark}
                ${isZenMode ? TOOLBAR_STYLES.paddingZen : TOOLBAR_STYLES.paddingNormal}
            `}
            role="toolbar" aria-label="Layout Editor Toolbar"
        >
            {/* --- Tools Palette --- */}
            <div className={`flex-grow flex items-center gap-x-3 md:gap-x-4 overflow-x-auto pb-1.5 md:pb-0 custom-scrollbar-thin ${isZenMode ? 'justify-center' : ''}`}>
                {Object.entries(toolCategories).map(([categoryName, tools], catIndex, arr) => (
                    <Fragment key={categoryName}>
                        {!isZenMode && tools.length > 0 && (
                            <div className="flex flex-col items-start">
                                <span className={`text-[10px] mb-1 font-medium ${LABEL_STYLES.light} ${LABEL_STYLES.dark} uppercase tracking-wider`}>{categoryName}</span>
                                <div className="flex items-center space-x-1.5 md:space-x-2">
                                    {tools.map(tool => (
                                        <DraggableTool
                                            key={tool.name}
                                            tool={tool}
                                            itemType={tool.toolItemType}
                                            onToolClick={onToolbarToolSelect}
                                            isActiveForPlacement={activeToolForPlacementName === tool.name}
                                            isZenMode={isZenMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {isZenMode && tools.map(tool => (
                            <DraggableTool
                                key={tool.name}
                                tool={tool}
                                itemType={tool.toolItemType}
                                onToolClick={onToolbarToolSelect}
                                isActiveForPlacement={activeToolForPlacementName === tool.name}
                                isZenMode={isZenMode}
                            />
                        ))}
                        {!isZenMode && tools.length > 0 && catIndex < arr.length - 1 && Object.values(arr[catIndex + 1] || {}).length > 0 && (
                            <div className={`self-stretch w-px bg-neutral-200 dark:bg-neutral-700 mx-1`} />
                        )}
                    </Fragment>
                ))}
            </div>

            {/* --- Separator --- */}
            <div className="w-full md:w-auto my-1 md:my-0 md:h-8 md:border-l md:border-neutral-300 dark:md:border-neutral-600 md:mx-2" />

            {/* --- Contextual Controls (Right Aligned) --- */}
            <div className="flex items-center justify-end md:justify-start space-x-1.5 md:space-x-2 flex-wrap gap-y-1.5">
                {/* ... (Eraser, Grid Dims, Zoom, Undo/Redo, Save, Clear, Zen Mode buttons - no changes needed in their internal logic for this feature) ... */}
                <ToolbarSectionWrapper className="p-0.5 bg-neutral-100 dark:bg-neutral-700/40 rounded-full">
                    <button
                        onClick={onToggleEraser}
                        className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark} ${isEraserActive ? `${ICON_BUTTON_STYLES.activeLight} ${ICON_BUTTON_STYLES.activeDark}` : ''}`}
                        title={isEraserActive ? "Deactivate Eraser (E)" : "Activate Eraser (E)"} aria-pressed={isEraserActive}
                    >
                        <Icon name="ink_eraser" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} />
                    </button>
                </ToolbarSectionWrapper>

                <AnimatePresence>
                    {!isZenMode && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2 } }} exit={{ opacity: 0, width: 0, transition: { duration: 0.15 } }}
                            className="flex items-center space-x-1 md:space-x-1.5 p-1 bg-neutral-100 dark:bg-neutral-700/40 rounded-lg overflow-hidden"
                        >
                            <div className="flex items-center">
                                <label htmlFor="majorGridRowsInput" className={`mr-1 ${LABEL_STYLES.light} ${LABEL_STYLES.dark}`}>R:</label>
                                <input type="text" id="majorGridRowsInput" value={localMajorRows} onChange={(e) => handleLocalDimChange(e, 'rows')} onBlur={(e) => handleDimBlur(e, 'rows')}
                                    className={`${INPUT_STYLES.base} ${INPUT_STYLES.light} ${INPUT_STYLES.dark} ${currentInputSize} !w-9 text-center`} aria-label="Grid Rows" />
                            </div>
                            <div className="flex items-center">
                                <label htmlFor="majorGridColsInput" className={`mr-1 ${LABEL_STYLES.light} ${LABEL_STYLES.dark}`}>C:</label>
                                <input type="text" id="majorGridColsInput" value={localMajorCols} onChange={(e) => handleLocalDimChange(e, 'cols')} onBlur={(e) => handleDimBlur(e, 'cols')}
                                    className={`${INPUT_STYLES.base} ${INPUT_STYLES.light} ${INPUT_STYLES.dark} ${currentInputSize} !w-9 text-center`} aria-label="Grid Columns" />
                            </div>
                            <select id="gridSubdivisionSelect" value={currentGridSubdivision} onChange={handleSubdivisionSelect} aria-label="Grid Subdivision"
                                className={`${INPUT_STYLES.base} ${INPUT_STYLES.light} ${INPUT_STYLES.dark} ${currentInputSize} !pl-1.5 !pr-5 appearance-none bg-no-repeat bg-right`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23${isZenMode ? 'a3a3a3' : '737373'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")` }}>
                                {AVAILABLE_SUBDIVISIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label.split(' ')[0]}</option>)}
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ToolbarSectionWrapper isVisible={!isZenMode || (isZenMode && zoomLevel !== 1.0)} className="p-0.5 bg-neutral-100 dark:bg-neutral-700/40 rounded-full">
                    <button onClick={onZoomOut} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark}`} title="Zoom Out (-)" aria-label="Zoom Out"><Icon name="zoom_out" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} /></button>
                    <button onClick={onResetZoom} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark} px-1.5 text-xs`} title={`Reset Zoom (${Math.round(zoomLevel * 100)}%)`} aria-label="Reset Zoom">{Math.round(zoomLevel * 100)}%</button>
                    <button onClick={onZoomIn} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark}`} title="Zoom In (+)" aria-label="Zoom In"><Icon name="zoom_in" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} /></button>
                </ToolbarSectionWrapper>

                <ToolbarSectionWrapper className="p-0.5 bg-neutral-100 dark:bg-neutral-700/40 rounded-full">
                    <button onClick={onUndo} disabled={!canUndo} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark} ${!canUndo ? ICON_BUTTON_STYLES.disabled : ''}`} title="Undo (Ctrl+Z)" aria-label="Undo" aria-disabled={!canUndo}><Icon name="undo" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} /></button>
                    <button onClick={onRedo} disabled={!canRedo} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark} ${!canRedo ? ICON_BUTTON_STYLES.disabled : ''}`} title="Redo (Ctrl+Y)" aria-label="Redo" aria-disabled={!canRedo}><Icon name="redo" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} /></button>
                </ToolbarSectionWrapper>

                <div className={`h-6 border-l ${TOOLBAR_STYLES.sectionSeparatorLight} ${TOOLBAR_STYLES.sectionSeparatorDark} ${isZenMode ? 'hidden md:block' : ''} mx-1 md:mx-2`} />

                <ToolbarSectionWrapper>
                    <button onClick={onSave} className={`${PRIMARY_BUTTON_STYLES.base} ${currentPrimaryButtonSize} ${PRIMARY_BUTTON_STYLES.colorsLight} ${PRIMARY_BUTTON_STYLES.colorsDark}`} title="Save Layout (Ctrl+S)">
                        {isZenMode ? <Icon name="save" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} /> : <><Icon name="save" className="w-4 h-4 mr-1.5" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 400, grade: 0, opsz: 24 }} />Save</>}
                    </button>
                    {!isZenMode && (
                        <button onClick={onClearAll} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10`} title="Clear Entire Layout">
                            <Icon name="delete_sweep" className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} />
                        </button>
                    )}
                    <button onClick={onToggleZenMode} className={`${ICON_BUTTON_STYLES.base} ${currentIconButtonSize} ${ICON_BUTTON_STYLES.colorsLight} ${ICON_BUTTON_STYLES.colorsDark}`} title={isZenMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode"} aria-label={isZenMode ? "Exit Focus Mode" : "Enter Focus Mode"}>
                        <Icon name={isZenMode ? "fullscreen_exit" : "fullscreen"} className={ICON_BUTTON_STYLES.iconSize} style={{ fontSize: '1.25rem' }} />
                    </button>
                </ToolbarSectionWrapper>
            </div>
        </div>
    );
};

export default EditorToolbar;