import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

const ColumnVisibilityDropdown = ({ allColumns, columnVisibility, onColumnVisibilityChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumn = (columnId) => {
        onColumnVisibilityChange(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 flex items-center"
            >
                <Icon name="view_column" className="w-5 h-5 mr-2" />
                Columns
                <Icon name={isOpen ? "arrow_drop_up" : "arrow_drop_down"} className="w-5 h-5 ml-1" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-md shadow-lg ring-1 ring-black dark:ring-neutral-700 ring-opacity-5 z-10 py-1 max-h-72 overflow-y-auto"
                    >
                        {allColumns.filter(col => col.isVisibilityToggleable !== false).map((column) => (
                            <label
                                key={column.id}
                                className="flex items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={columnVisibility[column.id] !== false} // Default to true if undefined, explicitly check for false
                                    onChange={() => toggleColumn(column.id)}
                                    className="h-4 w-4 text-rose-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-rose-500 mr-3"
                                />
                                {column.header}
                            </label>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ColumnVisibilityDropdown.propTypes = {
    allColumns: PropTypes.array.isRequired,
    columnVisibility: PropTypes.object.isRequired,
    onColumnVisibilityChange: PropTypes.func.isRequired,
};

export default ColumnVisibilityDropdown;