// features/venue_management/subcomponents/layout_designer/item_renderers/TableRenderer.jsx
import React, { useState, useEffect, useCallback } from 'react';

// Localization
import slRaw from '../../../utils/script_lines.js'; // Adjusted path
const sl = slRaw.venueManagement.tableRenderer;

// Design Guideline Mappings (Copied from original, no changes here)
const TABLE_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-indigo-400 to-indigo-500",
    gradientDark: "dark:from-indigo-500 dark:to-indigo-600",
    borderLight: "border-indigo-600",
    borderDark: "dark:border-indigo-400",
    textLight: "text-indigo-50",
    textDark: "dark:text-indigo-100",
    provisionalBorderLight: "border-purple-500",
    provisionalBorderDark: "dark:border-purple-400",
    provisionalGradientLight: "bg-gradient-to-br from-purple-300 to-purple-400",
    provisionalGradientDark: "dark:from-purple-500 dark:to-purple-600",
    provisionalTextLight: "text-purple-700",
    provisionalTextDark: "dark:text-purple-300",
    fontFamily: "font-montserrat",
    fontWeight: "font-semibold",
    fontSizeBase: "text-xs",
    fontSizeSmall: "text-[10px]",
    inputBgLight: "bg-indigo-50/80 dark:bg-purple-50/80",
    inputBgDark: "dark:bg-indigo-900/70 dark:bg-purple-900/70",
    inputBorderFocusLight: "border-indigo-300 ring-indigo-300",
    inputBorderFocusDark: "dark:border-indigo-500 dark:ring-indigo-500",
};
// --- End Design Guideline Variables ---

const TableRenderer = ({ item, onUpdateItemProperty, isSelected, isPreviewMode = false }) => { // Added isPreviewMode
    const [isEditingNumber, setIsEditingNumber] = useState(false);
    const [currentNumberInput, setCurrentNumberInput] = useState(String(item.number ?? ''));

    useEffect(() => {
        if (!isEditingNumber && (item.number !== undefined || item.number === null) && String(item.number ?? '') !== currentNumberInput) {
            setCurrentNumberInput(String(item.number ?? ''));
        }
    }, [item.number, isEditingNumber, currentNumberInput]);

    const handleNumberTextClick = useCallback((e) => {
        e.stopPropagation();
        if (item.isFixed || !onUpdateItemProperty || isPreviewMode) return; // Don't allow edit in preview mode
        setCurrentNumberInput(String(item.number ?? ''));
        setIsEditingNumber(true);
    }, [item.number, item.isFixed, onUpdateItemProperty, isPreviewMode]);

    const handleInputChange = (e) => {
        setCurrentNumberInput(e.target.value);
    };

    const saveNumber = useCallback(() => {
        if (!item?.id || !onUpdateItemProperty) return;
        onUpdateItemProperty(item.id, { number: currentNumberInput });
        setIsEditingNumber(false);
    }, [item?.id, currentNumberInput, onUpdateItemProperty]);

    const handleInputKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveNumber();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setCurrentNumberInput(String(item.number ?? ''));
            setIsEditingNumber(false);
        }
    }, [saveNumber, item.number]);

    const shapeClass = item.shape?.includes('round') ? 'rounded-full' : 'rounded-lg';
    const smallestDimensionMinor = Math.min(item.w_minor || 4, item.h_minor || 4);
    const effectiveGridSubdivision = item.gridSubdivision || 1; // item.gridSubdivision may not be available on `item` directly
    const fontSizeClass = smallestDimensionMinor < (effectiveGridSubdivision * 1.5)
        ? TABLE_RENDERER_STYLES.fontSizeSmall
        : TABLE_RENDERER_STYLES.fontSizeBase;

    const baseClasses = `w-full h-full flex items-center justify-center select-none transition-all duration-150 border`;
    const colorClasses = item.isProvisional
        ? `${TABLE_RENDERER_STYLES.provisionalBorderLight} ${TABLE_RENDERER_STYLES.provisionalBorderDark} border-2 ${TABLE_RENDERER_STYLES.provisionalGradientLight} ${TABLE_RENDERER_STYLES.provisionalGradientDark}`
        : `${TABLE_RENDERER_STYLES.borderLight} ${TABLE_RENDERER_STYLES.borderDark} ${TABLE_RENDERER_STYLES.gradientLight} ${TABLE_RENDERER_STYLES.gradientDark}`;

    const textClasses = item.isProvisional
        ? `${TABLE_RENDERER_STYLES.provisionalTextLight} ${TABLE_RENDERER_STYLES.provisionalTextDark}`
        : `${TABLE_RENDERER_STYLES.textLight} ${TABLE_RENDERER_STYLES.textDark}`;

    const canEdit = onUpdateItemProperty && !item.isFixed && isSelected && !isPreviewMode;

    // Construct dynamic title for the table item itself (shown on hover by PlacedItem)
    // This title logic is actually handled by PlacedItem.jsx, so we don't need to duplicate it here.
    // The renderer just focuses on display.

    const tableDisplayText = item.isProvisional
        ? (sl.provisionalDisplayValue || "Nº?")
        : `${sl.tableNumberPrefix || "T"}${item.number ?? (sl.tableNumberNotSet || "")}`;

    return (
        <div
            className={`${baseClasses} ${colorClasses} ${shapeClass}`}
        // Title is handled by the parent PlacedItem component
        >
            {(isEditingNumber && canEdit) ? (
                <input
                    type="text" // Use text to allow empty string for provisional clearing
                    inputMode="numeric" // Hint for mobile keyboards
                    value={currentNumberInput}
                    onChange={handleInputChange}
                    onBlur={saveNumber}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent PlacedItem's click
                    className={`w-3/4 max-w-[60px] text-center rounded
                                ${fontSizeClass} ${TABLE_RENDERER_STYLES.fontFamily} ${TABLE_RENDERER_STYLES.fontWeight}
                                ${item.isProvisional ? TABLE_RENDERER_STYLES.inputBgLight : TABLE_RENDERER_STYLES.inputBgLight} 
                                ${item.isProvisional ? TABLE_RENDERER_STYLES.provisionalTextLight : textClasses}
                                dark:${item.isProvisional ? TABLE_RENDERER_STYLES.inputBgDark : TABLE_RENDERER_STYLES.inputBgDark}
                                dark:${item.isProvisional ? TABLE_RENDERER_STYLES.provisionalTextDark : textClasses}
                                p-0.5 z-10 outline-none ring-1 
                                ${TABLE_RENDERER_STYLES.inputBorderFocusLight} ${TABLE_RENDERER_STYLES.inputBorderFocusDark}`}
                />
            ) : (
                <span
                    className={`${TABLE_RENDERER_STYLES.fontFamily} ${TABLE_RENDERER_STYLES.fontWeight} ${fontSizeClass} ${textClasses} ${canEdit ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
                    onClick={canEdit ? handleNumberTextClick : undefined}
                >
                    {tableDisplayText}
                </span>
            )}
        </div>
    );
};

export default TableRenderer;