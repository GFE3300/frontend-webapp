import React, { useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const useLongPress = (
    callback = () => { },
    { ms = 500 } = {}
) => {
    const timerRef = useRef(null);
    const eventTargetRef = useRef(null);

    const handlePressStart = useCallback((event) => {
        if (event.type === "touchstart") {
            eventTargetRef.current = event.target;
        }

        timerRef.current = setTimeout(() => {
            callback(event); // Fire the long press callback
            timerRef.current = null;
        }, ms);
    }, [callback, ms]);

    const handlePressEnd = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        eventTargetRef.current = null;
    }, []);

    const handleTouchMove = useCallback((event) => {
        // If touch moves significantly from the initial target, cancel long press
        // This is a simple check; a more robust one would calculate distance
        if (eventTargetRef.current && event.target !== eventTargetRef.current) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    // Prevent context menu on long touch, which simulates right click on some devices
    const handleContextMenu = useCallback((event) => {
        // If a long press timer was active or just fired, prevent context menu
        // This check might need refinement depending on exact timing
        if (!timerRef.current) { // Check if long press actually fired
            event.preventDefault();
        }
    }, []);

    return {
        onMouseDown: (e) => { if (e.button === 0) handlePressStart(e); }, // Left mouse button
        onMouseUp: handlePressEnd,
        onMouseLeave: handlePressEnd, // Clear timer if mouse leaves element
        onTouchStart: handlePressStart,
        onTouchEnd: handlePressEnd,
        onTouchMove: handleTouchMove, // Cancel on scroll/drag
        onContextMenu: handleContextMenu,
    };
};


// Placeholder for timeSince, assuming it's passed or will be imported
const placeholderTimeSince = (dateString) => {
    if (!dateString) return '';
    return `${Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)}m ago`;
};

const TableCard = ({
    tableData,
    onClick,
    onLongPress, // Changed from onRightClick
    isTouchDevice, // New prop for dynamic helper text
    gridCols,
    timeSince = placeholderTimeSince
}) => {
    const { number, status, order, gridPosition, size } = tableData;

    const longPressBindings = useLongPress(() => {
        if (status !== 'empty' && onLongPress) {
            onLongPress(tableData);
        }
    }, { ms: 700 }); // 700ms for long press

    let density = 'medium';
    if (gridCols <= 9) density = 'low';
    else if (gridCols > 16 && gridCols <= 25) density = 'high';
    else if (gridCols > 25) density = 'ultrahigh';

    let bgColorClass = 'bg-white';
    let textColorClass = density === 'low' ? 'text-indigo-900' : 'text-indigo-800';

    let motionAnimateTarget = { opacity: 1, y: 0, scale: 1 };
    let motionTransitionProps = { type: "spring", stiffness: 200, damping: 20 };

    const orderTimeAgo = order?.createdAt ? timeSince(order.createdAt) : '';
    const isVeryNew = order?.createdAt && (new Date() - new Date(order.createdAt)) < 60000; // 1 minute

    let titleAttribute = `Table ${number} (${status.replace('_', ' ')})`;
    if (order) {
        const itemSummary = order.items.map(item => `${item.name} (x${item.qty})`).join(', ');
        titleAttribute = `Table ${number} - ${status.replace('_', ' ')}\nOrder ID: ${order.id.substring(0, 10)}...\nItems: ${itemSummary}\nPeople: ${order.people}\nTotal: $${order.totalPrice.toFixed(2)}\nPlaced: ${orderTimeAgo}`;
    } else {
        titleAttribute += `\nClick to view details. ${isTouchDevice ? 'Long-press' : 'Right-click'} to see options if occupied.`;
    }


    if (status === 'new_order') {
        bgColorClass = ''; // Handled by motion.div style for animation
        textColorClass = 'text-white';
        motionAnimateTarget.backgroundColor = ['#f43f5e', '#fda4af', '#f43f5e']; // Rose-500, Rose-300, Rose-500
        motionTransitionProps = { duration: 0.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' };
    } else if (status === 'viewed_order') {
        bgColorClass = density === 'low' ? 'bg-yellow-300' : 'bg-yellow-400'; // Amber-300 / Amber-400
        textColorClass = density === 'low' ? 'text-gray-900' : 'text-yellow-900';
    } else { // 'empty' status
        bgColorClass = 'bg-white';
        textColorClass = density === 'low' ? 'text-indigo-900' : 'text-indigo-800';
    }

    const gridStyles = {
        gridRowStart: gridPosition.rowStart, gridColumnStart: gridPosition.colStart,
        gridRowEnd: gridPosition.rowSpan ? `span ${gridPosition.rowSpan}` : 'auto',
        gridColumnEnd: gridPosition.colSpan ? `span ${gridPosition.colSpan}` : 'auto',
        zIndex: 10,
    };

    let sizeSpecificClasses = '', shapeClass = '', paddingClass = '', numberSizeClass = '', statusSizeClass = '', clearTextSizeClass = '', timeAgoSizeClass = '';
    // Adjusted font sizes and paddings slightly for better legibility, especially at high densities
    switch (density) {
        case 'low': sizeSpecificClasses = size === 'rectangle' ? 'w-56 h-28' : size === 'rectangle-tall' ? 'w-28 h-56' : size === 'round' ? 'w-56 h-56' : 'w-28 h-28'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-xl'; paddingClass = 'p-2.5'; numberSizeClass = 'text-2xl font-bold'; statusSizeClass = 'text-sm'; clearTextSizeClass = 'text-xs'; timeAgoSizeClass = 'text-[11px]'; break;
        case 'medium': sizeSpecificClasses = size === 'rectangle' ? 'w-48 h-24' : size === 'rectangle-tall' ? 'w-24 h-48' : size === 'round' ? 'w-48 h-48' : 'w-24 h-24'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-lg'; paddingClass = 'p-2'; numberSizeClass = 'text-xl font-bold'; statusSizeClass = 'text-xs'; clearTextSizeClass = 'text-[10px]'; timeAgoSizeClass = 'text-[10px]'; break;
        case 'high': sizeSpecificClasses = size === 'rectangle' ? 'w-40 h-20' : size === 'rectangle-tall' ? 'w-20 h-40' : size === 'round' ? 'w-40 h-40' : 'w-20 h-20'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-lg'; paddingClass = 'p-1.5'; numberSizeClass = 'text-lg font-semibold'; statusSizeClass = 'text-[10px]'; clearTextSizeClass = 'text-[9px]'; timeAgoSizeClass = 'text-[9px]'; break;
        case 'ultrahigh': sizeSpecificClasses = size === 'rectangle' ? 'w-32 h-16' : size === 'rectangle-tall' ? 'w-16 h-32' : size === 'round' ? 'w-32 h-32' : 'w-16 h-16'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-md'; paddingClass = 'p-1.5'; numberSizeClass = 'text-md font-semibold'; statusSizeClass = 'text-[9px]'; clearTextSizeClass = 'text-[8px]'; timeAgoSizeClass = 'text-[8px]'; break; // p-1 to p-1.5, text-base to text-md
        default: sizeSpecificClasses = 'w-24 h-24'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-lg'; paddingClass = 'p-2'; numberSizeClass = 'text-xl font-bold'; statusSizeClass = 'text-xs'; clearTextSizeClass = 'text-[10px]'; timeAgoSizeClass = 'text-[10px]'; break;
    }

    const staticBgColorClass = status === 'new_order' ? '' : bgColorClass;

    const combinedClassName = [
        staticBgColorClass, textColorClass, sizeSpecificClasses, shapeClass, paddingClass,
        'border border-gray-300 shadow-md', // Slightly increased shadow for better pop
        'flex flex-col items-center justify-center text-center',
        'cursor-pointer transition-all duration-150 ease-in-out hover:shadow-lg hover:scale-105', // Added scale on hover
        'relative select-none', // Added select-none to prevent text selection during long press
        'overflow-hidden', // Ensure content like pulsing animations don't bleed out
    ].filter(Boolean).join(' ');

    return (
        <motion.div
            // Key should be handled by the parent component mapping over TableCard instances
            // Example: tables.map(table => <TableCard key={table.id} ... />)
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={motionAnimateTarget}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={motionTransitionProps}
            style={gridStyles}
            className={combinedClassName}
            title={titleAttribute}
            onClick={() => onClick(tableData)} // Main click action
            {...longPressBindings} // Spread long press event handlers
        >
            <span className={`${numberSizeClass} leading-tight`}>{number}</span>
            <span className={`${statusSizeClass} leading-tight capitalize mt-0.5`}>{status.replace('_', ' ')}</span>
            {orderTimeAgo && (
                <span className={`${timeAgoSizeClass} leading-tight opacity-80 mt-0.5 ${isVeryNew && status === 'new_order' ? 'animate-pulse text-rose-200 font-semibold' : ''}`}>
                    {orderTimeAgo}
                </span>
            )}
            {status !== 'empty' && (
                <span className={`${clearTextSizeClass} leading-tight opacity-70 mt-1`}>
                    {isTouchDevice ? '(Long-press to clear)' : '(Right-click to clear)'}
                </span>
            )}
            {status === 'new_order' && isVeryNew && ( // Pulsing dot for very new orders
                <motion.div
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
        </motion.div>
    );
};

export default TableCard;