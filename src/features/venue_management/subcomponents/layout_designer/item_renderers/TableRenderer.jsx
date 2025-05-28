import React, { useState, useEffect, useCallback } from 'react';

// Design Guideline Mappings for Tables
const TABLE_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-indigo-400 to-indigo-500",
    gradientDark: "dark:from-indigo-500 dark:to-indigo-600",
    borderLight: "border-indigo-600",
    borderDark: "dark:border-indigo-400",
    textLight: "text-indigo-50",
    textDark: "dark:text-indigo-100",
    provisionalBorderLight: "border-purple-500",
    provisionalBorderDark: "dark:border-purple-400",
    provisionalTextLight: "text-purple-700",
    provisionalTextDark: "dark:text-purple-300",
    fontFamily: "font-montserrat", // From guidelines (Secondary Font)
    fontWeight: "font-semibold",  // For emphasis
    fontSizeBase: "text-xs",      // e.g., 12px
    fontSizeSmall: "text-[10px]", // For very small table representations
    inputBgLight: "bg-indigo-50/80",
    inputBgDark: "dark:bg-indigo-900/70",
    inputBorderFocusLight: "border-indigo-300 ring-indigo-300",
    inputBorderFocusDark: "dark:border-indigo-500 dark:ring-indigo-500",
};

const TableRenderer = ({ item, onUpdateItemProperty }) => {
    const [isEditingNumber, setIsEditingNumber] = useState(false);
    const [currentNumberInput, setCurrentNumberInput] = useState(String(item.number ?? ''));

    useEffect(() => {
        if (!isEditingNumber && (item.number !== undefined || item.number === null) && String(item.number ?? '') !== currentNumberInput) {
            setCurrentNumberInput(String(item.number ?? ''));
        }
    }, [item.number, isEditingNumber, currentNumberInput]);

    const handleNumberTextClick = useCallback((e) => {
        e.stopPropagation();
        if (item.isFixed) return; // Don't allow editing if fixed
        setCurrentNumberInput(String(item.number ?? ''));
        setIsEditingNumber(true);
    }, [item.number, item.isFixed]);

    const handleInputChange = (e) => {
        setCurrentNumberInput(e.target.value);
    };

    const saveNumber = useCallback(() => {
        if (!item?.id) return;
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

    const shapeClass = item.shape?.includes('round') ? 'rounded-full' : 'rounded-lg'; // Consistent rounding from guidelines

    // Determine font size based on item's smallest dimension
    const smallestDimensionMinor = Math.min(item.w_minor || 4, item.h_minor || 4);
    const fontSizeClass = smallestDimensionMinor < ((item.gridSubdivision || 1) * 1.5) // If effective size < 1.5 major cells
        ? TABLE_RENDERER_STYLES.fontSizeSmall
        : TABLE_RENDERER_STYLES.fontSizeBase;

    const baseClasses = `w-full h-full flex items-center justify-center select-none transition-all duration-150 border`;
    const colorClasses = item.isProvisional
        ? `${TABLE_RENDERER_STYLES.provisionalBorderLight} ${TABLE_RENDERER_STYLES.provisionalBorderDark} border-2 ${TABLE_RENDERER_STYLES.gradientLight} ${TABLE_RENDERER_STYLES.gradientDark}` // Keep gradient for provisional
        : `${TABLE_RENDERER_STYLES.borderLight} ${TABLE_RENDERER_STYLES.borderDark} ${TABLE_RENDERER_STYLES.gradientLight} ${TABLE_RENDERER_STYLES.gradientDark}`;

    const textClasses = item.isProvisional
        ? `${TABLE_RENDERER_STYLES.provisionalTextLight} ${TABLE_RENDERER_STYLES.provisionalTextDark}`
        : `${TABLE_RENDERER_STYLES.textLight} ${TABLE_RENDERER_STYLES.textDark}`;

    return (
        <div
            className={`${baseClasses} ${colorClasses} ${shapeClass}`}
        // Title attribute is handled by PlacedItem.jsx
        >
            {isEditingNumber ? (
                <input
                    type="text"
                    value={currentNumberInput}
                    onChange={handleInputChange}
                    onBlur={saveNumber}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className={`w-3/4 max-w-[50px] text-center rounded
                                ${fontSizeClass} ${TABLE_RENDERER_STYLES.fontFamily} ${TABLE_RENDERER_STYLES.fontWeight}
                                ${TABLE_RENDERER_STYLES.inputBgLight} ${TABLE_RENDERER_STYLES.inputBgDark}
                                ${textClasses}
                                p-0.5 z-10 outline-none ring-1 
                                ${TABLE_RENDERER_STYLES.inputBorderFocusLight} ${TABLE_RENDERER_STYLES.inputBorderFocusDark}`}
                />
            ) : (
                <span
                    className={`cursor-pointer ${TABLE_RENDERER_STYLES.fontFamily} ${TABLE_RENDERER_STYLES.fontWeight} ${fontSizeClass} ${textClasses}`}
                    onClick={item.isFixed ? undefined : handleNumberTextClick}
                    title={item.isFixed ? `Table ${item.number ?? 'N/A'} (Fixed)` : (item.isProvisional ? "Click to set table number" : `Edit Table ${item.number ?? ''} Number`)}
                >
                    {item.isProvisional ? 'Nº?' : `T${item.number ?? ''}`}
                </span>
            )}
        </div>
    );
};

export default TableRenderer;