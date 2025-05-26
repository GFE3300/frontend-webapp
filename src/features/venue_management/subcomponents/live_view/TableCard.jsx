import React from 'react';
import { motion } from 'framer-motion';
// timeSince utility would be imported, e.g., from '../../../utils/orderUtils'

// Placeholder for timeSince, assuming it's passed or will be imported
const placeholderTimeSince = (dateString) => {
    if (!dateString) return '';
    return `${Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)}m ago`;
};

const TableCard = ({ tableData, onClick, onRightClick, gridCols, timeSince = placeholderTimeSince }) => {
    const { id, number, status, order, gridPosition, size } = tableData;

    let density = 'medium';
    if (gridCols <= 9) density = 'low';
    else if (gridCols > 16 && gridCols <= 25) density = 'high';
    else if (gridCols > 25) density = 'ultrahigh';

    let bgColorClass = 'bg-white';
    let textColorClass = density === 'low' ? 'text-indigo-900' : 'text-indigo-800';

    let motionAnimateTarget = { opacity: 1, y: 0, scale: 1 };
    let motionTransitionProps = { type: "spring", stiffness: 200, damping: 20 };

    const orderTimeAgo = order?.createdAt ? timeSince(order.createdAt) : '';
    const isVeryNew = order?.createdAt && (new Date() - new Date(order.createdAt)) < 60000;

    let titleAttribute = `Table ${number} (${status.replace('_', ' ')})`;
    if (order) {
        const itemSummary = order.items.map(item => `${item.name} (x${item.qty})`).join(', ');
        titleAttribute = `Table ${number} - ${status.replace('_', ' ')}\nOrder ID: ${order.id.substring(0, 10)}...\nItems: ${itemSummary}\nPeople: ${order.people}\nTotal: $${order.totalPrice.toFixed(2)}\nPlaced: ${orderTimeAgo}`;
    }

    if (status === 'new_order') {
        bgColorClass = ''; // Handled by motion.div style for animation
        textColorClass = 'text-white';
        // For backgroundColor animation, it's better to apply directly to motion.div style prop if complex
        // Or use a dedicated animated background component. Here, we'll rely on the parent `motion.div` animate prop.
        // The original code had motionAnimateTarget.backgroundColor, which works with motion.div's animate prop.
        motionAnimateTarget.backgroundColor = ['#f43f5e', '#fda4af', '#f43f5e'];
        motionTransitionProps = { duration: 0.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' };
    } else if (status === 'viewed_order') {
        bgColorClass = density === 'low' ? 'bg-yellow-300' : 'bg-yellow-400';
        textColorClass = density === 'low' ? 'text-gray-900' : 'text-yellow-900';
    } else {
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
    switch (density) {
        case 'low': sizeSpecificClasses = size === 'rectangle' ? 'w-56 h-28' : size === 'rectangle-tall' ? 'w-28 h-56' : size === 'round' ? 'w-56 h-56' : 'w-28 h-28'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-xl'; paddingClass = 'p-2.5'; numberSizeClass = 'text-2xl font-bold'; statusSizeClass = 'text-sm'; clearTextSizeClass = 'text-xs'; timeAgoSizeClass = 'text-[11px]'; break;
        case 'medium': sizeSpecificClasses = size === 'rectangle' ? 'w-48 h-24' : size === 'rectangle-tall' ? 'w-24 h-48' : size === 'round' ? 'w-48 h-48' : 'w-24 h-24'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-lg'; paddingClass = 'p-2'; numberSizeClass = 'text-xl font-bold'; statusSizeClass = 'text-xs'; clearTextSizeClass = 'text-[10px]'; timeAgoSizeClass = 'text-[10px]'; break;
        case 'high': sizeSpecificClasses = size === 'rectangle' ? 'w-40 h-20' : size === 'rectangle-tall' ? 'w-20 h-40' : size === 'round' ? 'w-40 h-40' : 'w-20 h-20'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-lg'; paddingClass = 'p-1.5'; numberSizeClass = 'text-lg font-semibold'; statusSizeClass = 'text-[10px]'; clearTextSizeClass = 'text-[9px]'; timeAgoSizeClass = 'text-[9px]'; break;
        case 'ultrahigh': sizeSpecificClasses = size === 'rectangle' ? 'w-32 h-16' : size === 'rectangle-tall' ? 'w-16 h-32' : size === 'round' ? 'w-32 h-32' : 'w-16 h-16'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-md'; paddingClass = 'p-1'; numberSizeClass = 'text-base font-semibold'; statusSizeClass = 'text-[9px]'; clearTextSizeClass = 'text-[8px]'; timeAgoSizeClass = 'text-[8px]'; break;
        default: sizeSpecificClasses = 'w-24 h-24'; shapeClass = size === 'round' ? 'rounded-full' : 'rounded-lg'; paddingClass = 'p-2'; numberSizeClass = 'text-xl font-bold'; statusSizeClass = 'text-xs'; clearTextSizeClass = 'text-[10px]'; timeAgoSizeClass = 'text-[10px]'; break;
    }

    // If status is new_order, motion.div's animate prop will handle backgroundColor.
    // Otherwise, apply bgColorClass.
    const staticBgColorClass = status === 'new_order' ? '' : bgColorClass;

    const combinedClassName = [
        staticBgColorClass, textColorClass, sizeSpecificClasses, shapeClass, paddingClass,
        'border border-gray-200 shadow-sm', 'flex flex-col items-center justify-center text-center',
        'cursor-pointer transition-shadow hover:shadow-md', 'relative'
    ].filter(Boolean).join(' ');

    return (
        <motion.div
            key={id} // Key might be better handled by the parent mapping this component
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={motionAnimateTarget}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={motionTransitionProps}
            style={gridStyles}
            className={combinedClassName}
            title={titleAttribute}
            onClick={() => onClick(tableData)}
            onContextMenu={(e) => { e.preventDefault(); if (status !== 'empty') onRightClick(tableData); }}
        >
            <span className={`${numberSizeClass} leading-tight`}>{number}</span>
            <span className={`${statusSizeClass} leading-tight capitalize mt-0.5`}>{status.replace('_', ' ')}</span>
            {orderTimeAgo && (
                <span className={`${timeAgoSizeClass} leading-tight opacity-80 mt-0.5 ${isVeryNew && status === 'new_order' ? 'animate-pulse text-rose-200' : ''}`}>
                    {orderTimeAgo}
                </span>
            )}
            {status !== 'empty' && <span className={`${clearTextSizeClass} leading-tight opacity-70 mt-1`}>{'(Right-click to clear)'}</span>}
        </motion.div>
    );
};

export default TableCard;