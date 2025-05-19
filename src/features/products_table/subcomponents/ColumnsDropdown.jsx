import React, { useState, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const ColumnsDropdown = memo(({ allColumns, visibleColumns, onToggleColumn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Toggle column visibility"
            >
                <Icon name="view_column" className="w-5 h-5 mr-2" />
                Columns
                <Icon name={isOpen ? "arrow_drop_up" : "arrow_drop_down"} className="w-5 h-5 ml-1" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black dark:ring-neutral-700 ring-opacity-5 focus:outline-none z-30 py-1"
                    >
                        {allColumns.map(col => (
                            // The 'selection' column might not be toggleable, or handled differently
                            col.key !== 'selection' && ( // Example: always show selection or handle it separately
                                <label
                                    key={col.key}
                                    className="flex items-center justify-between px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                                >
                                    <span>{col.label}</span>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-rose-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-rose-500 dark:bg-neutral-700 dark:checked:bg-rose-500"
                                        checked={!!visibleColumns[col.key]}
                                        onChange={() => onToggleColumn(col.key)}
                                    />
                                </label>
                            )
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

ColumnsDropdown.propTypes = {
    allColumns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    visibleColumns: PropTypes.object.isRequired,
    onToggleColumn: PropTypes.func.isRequired,
};

export default ColumnsDropdown;