import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import DraggableColumnItem from './DraggableColumnItem';
// MODIFICATION: Import the centralized script lines
import { scriptLines_ProductsTable as scriptLines } from '../utils/script_lines.js';

const CustomColumnDropdown = ({
    allTableColumns,
    visibleColumnKeys,
    columnOrderKeys = [],
    onVisibilityChange,
    onOrderChange,
    onResetColumns,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [managedColumns, setManagedColumns] = useState([]);

    useEffect(() => {
        const newManagedColumns = columnOrderKeys
            .map(key => {
                const colConfig = allTableColumns.find(c => c.id === key);
                if (!colConfig) return null;
                return {
                    id: key,
                    text: colConfig.header || key,
                    isVisible: visibleColumnKeys.has(key),
                    isFixed: colConfig.isVisibilityToggleable === false || !!colConfig.sticky,
                };
            })
            .filter(Boolean);
        setManagedColumns(newManagedColumns);
    }, [allTableColumns, visibleColumnKeys, columnOrderKeys]);

    const handleToggleVisibility = useCallback((columnId) => {
        onVisibilityChange(prevSet => {
            const newSet = new Set(prevSet);
            const colConfig = allTableColumns.find(c => c.id === columnId);
            if (colConfig?.isVisibilityToggleable === false) return prevSet;

            if (newSet.has(columnId)) {
                newSet.delete(columnId);
            } else {
                newSet.add(columnId);
            }
            return newSet;
        });
    }, [onVisibilityChange, allTableColumns]);

    const handleMoveColumn = useCallback((dragIndex, hoverIndex) => {
        const currentOrderedKeys = [...columnOrderKeys];
        const [draggedKey] = currentOrderedKeys.splice(dragIndex, 1);
        currentOrderedKeys.splice(hoverIndex, 0, draggedKey);
        onOrderChange(currentOrderedKeys);
    }, [columnOrderKeys, onOrderChange]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fixedItems = managedColumns.filter(col => col.isFixed);
    const orderedDraggableItems = columnOrderKeys
        .map(key => managedColumns.find(item => item.id === key && !item.isFixed))
        .filter(Boolean);
    const visibleDraggableItems = orderedDraggableItems.filter(col => col.isVisible);
    const hiddenDraggableItems = orderedDraggableItems.filter(col => !col.isVisible);

    const renderColumnList = (itemsToRender, listTitleKey) => {
        const listTitle = scriptLines.customColumnDropdown.listTitles[listTitleKey];
        if (!itemsToRender || itemsToRender.length === 0 || !listTitle) return null;

        return (
            <section aria-labelledby={`${listTitleKey}-heading`} className="pt-1 font-montserrat">
                <h4
                    id={`${listTitleKey}-heading`}
                    className="px-2 pt-3 pb-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                    {listTitle}
                </h4>
                <ul className="space-y-1.5 px-1">
                    <AnimatePresence>
                        {itemsToRender.map((col) => (
                            <DraggableColumnItem
                                key={col.id}
                                id={col.id}
                                text={col.text}
                                index={columnOrderKeys.indexOf(col.id)}
                                isVisible={col.isVisible}
                                isFixed={col.isFixed}
                                onToggleVisibility={handleToggleVisibility}
                                onMoveColumn={handleMoveColumn}
                            />
                        ))}
                    </AnimatePresence>
                </ul>
            </section>
        );
    };

    const dropdownTrigger = (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`dropdown-button group w-full h-9 py-2 pl-4 pr-3 rounded-full font-montserrat font-medium flex items-center justify-between text-left bg-neutral-100 dark:bg-neutral-200 focus:outline-none focus-visible:ring-2 transition-all duration-200 text-neutral-900 dark:text-neutral-800 text-sm cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-300/80`}
            aria-haspopup="true"
            aria-expanded={isOpen}
            title={scriptLines.customColumnDropdown.triggerTooltip}
        >
            <Icon name="view_column" className="w-4 h-4 mr-2 text-neutral-600 dark:text-neutral-300" style={{ fontSize: '1rem' }} />
            {scriptLines.customColumnDropdown.triggerText}
            <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
                className="ml-1 h-5 w-5 flex-shrink-0"
            >
                <Icon name="expand_more" className={`w-5 h-5 flex-shrink-0`} style={{ fontSize: '1.25rem' }} />
            </motion.span>
        </button>
    );

    return (
        <div className="relative font-montserrat" ref={dropdownRef}>
            {dropdownTrigger}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.7 }}
                        className="absolute right-0 mt-2 max-h-120 w-80 sm:w-96 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-700 ring-opacity-5 z-30 flex flex-col"
                    >
                        <header className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                {scriptLines.customColumnDropdown.headerTitle}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {scriptLines.customColumnDropdown.headerSubtitle}
                            </p>
                        </header>

                        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {renderColumnList(fixedItems, 'fixed')}
                            {orderedDraggableItems.length > 0 && (
                                <>
                                    {renderColumnList(visibleDraggableItems, 'visibleAndDraggable')}
                                    {renderColumnList(hiddenDraggableItems, 'hidden')}
                                </>
                            )}
                            {(managedColumns.length === 0 || (fixedItems.length === managedColumns.length && managedColumns.length > 0)) && orderedDraggableItems.length === 0 && (
                                <p className="px-2 py-4 text-sm text-neutral-500 dark:text-neutral-400 italic text-center">
                                    {managedColumns.length === 0 ? scriptLines.customColumnDropdown.noColumnsAvailable : scriptLines.customColumnDropdown.noDraggableColumns}
                                </p>
                            )}
                        </div>

                        {onResetColumns && (
                            <footer className="p-2.5 border-t border-neutral-200 dark:border-neutral-700">
                                <button
                                    onClick={() => {
                                        onResetColumns();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-neutral-700/60 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 focus-visible:ring-rose-500 transition-colors group"
                                >
                                    <Icon name="restart_alt" className="w-4 h-4 mr-1.5 group-hover:rotate-[-60deg] transition-transform duration-200" style={{ fontSize: '1rem' }} />
                                    {scriptLines.customColumnDropdown.resetButton}
                                </button>
                            </footer>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

CustomColumnDropdown.propTypes = {
    allTableColumns: PropTypes.array.isRequired,
    visibleColumnKeys: PropTypes.instanceOf(Set).isRequired,
    columnOrderKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    onVisibilityChange: PropTypes.func.isRequired,
    onOrderChange: PropTypes.func.isRequired,
    onResetColumns: PropTypes.func,
};

export default CustomColumnDropdown;