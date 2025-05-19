// src/components/products_table/TableToolbar.jsx
import React, { memo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import ColumnsDropdown from './ColumnsDropdown';

const TableToolbar = memo(({
    selectedCount,
    onBulkAction, // (actionType: string) => void
    searchTerm,
    onSearchChange,
    activeFilters, // { category: 'Breads', status: 'active' }
    onFilterChange, // (filterKey: string, filterValue: any) => void
    onClearFilter,  // (filterKey: string) => void
    onClearAllFilters,
    allColumns,
    visibleColumns,
    onToggleColumn,
    currentView, // 'table' or 'card'
    onViewToggle,
    // onAddProduct (placeholder for now)
}) => {
    const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
    const bulkActionsRef = useRef(null);
    // Placeholder categories for filter dropdown
    const categories = ["Breads", "Pastries", "Muffins", "Cakes", "Cookies"];
    const statuses = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target)) {
                setIsBulkActionsOpen(false);
            }
        };
        if (isBulkActionsOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isBulkActionsOpen]);

    const bulkActionOptions = [
        { label: 'Adjust Price...', action: 'adjust_price' },
        { label: 'Change Status...', action: 'change_status' },
        { label: 'Assign Category...', action: 'assign_category' },
        { label: 'Delete Selected', action: 'delete_selected', isDestructive: true },
    ];

    return (
        <div className="p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4">
            {/* Left: Bulk Actions (if items selected) */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {selectedCount > 0 ? (
                    <div className="relative" ref={bulkActionsRef}>
                        <button
                            onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center"
                        >
                            {selectedCount} selected
                            <Icon name={isBulkActionsOpen ? "arrow_drop_up" : "arrow_drop_down"} className="w-5 h-5 ml-1" />
                        </button>
                        <AnimatePresence>
                            {isBulkActionsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black dark:ring-neutral-700 ring-opacity-5 z-30 py-1"
                                >
                                    {bulkActionOptions.map(opt => (
                                        <button
                                            key={opt.action}
                                            onClick={() => { onBulkAction(opt.action); setIsBulkActionsOpen(false); }}
                                            className={`w-full text-left block px-4 py-2 text-sm 
                                                ${opt.isDestructive ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="h-9"></div> // Placeholder to maintain height
                )}
            </div>

            {/* Center: Search & Filter Chips */}
            <div className="flex-grow flex items-center gap-2 flex-wrap justify-center">
                <div className="relative min-w-[200px] sm:min-w-[250px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full py-2 pl-10 pr-3 text-sm bg-neutral-100 dark:bg-neutral-700 border border-transparent dark:border-neutral-600 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
                    />
                </div>
                {/* Placeholder Filter Dropdowns */}
                <select
                    value={activeFilters.category || ''}
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    className="text-sm bg-neutral-100 dark:bg-neutral-700 border border-transparent dark:border-neutral-600 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-neutral-700 dark:text-neutral-200"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                    value={activeFilters.status || ''}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="text-sm bg-neutral-100 dark:bg-neutral-700 border border-transparent dark:border-neutral-600 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-neutral-700 dark:text-neutral-200"
                >
                    <option value="">All Statuses</option>
                    {statuses.map(stat => <option key={stat.value} value={stat.value}>{stat.label}</option>)}
                </select>

                {/* Filter Chips */}
                {(Object.keys(activeFilters).some(key => activeFilters[key]) || searchTerm) && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {searchTerm && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200">
                                Search: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                                <button onClick={() => onSearchChange('')} className="ml-1 flex-shrink-0 p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-500">
                                    <Icon name="close" className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {Object.entries(activeFilters).map(([key, value]) => value && (
                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200">
                                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                <button onClick={() => onClearFilter(key)} className="ml-1 flex-shrink-0 p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-500">
                                    <Icon name="close" className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <button onClick={onClearAllFilters} className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-2">Clear All</button>
                    </div>
                )}
            </div>

            {/* Right: Columns, View Toggle, Add Product */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <ColumnsDropdown
                    allColumns={allColumns}
                    visibleColumns={visibleColumns}
                    onToggleColumn={onToggleColumn}
                />
                <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-md">
                    <button
                        onClick={() => onViewToggle('table')}
                        title="Table View"
                        className={`p-2 rounded-l-md ${currentView === 'table' ? 'bg-rose-500 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                    >
                        <Icon name="table_rows" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onViewToggle('card')}
                        title="Card View"
                        className={`p-2 rounded-r-md ${currentView === 'card' ? 'bg-rose-500 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                    >
                        <Icon name="grid_view" className="w-5 h-5" />
                    </button>
                </div>
                <button
                    // onClick={onAddProduct} // To be implemented
                    className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors flex items-center text-sm font-medium"
                    title="Add New Product (coming soon)"
                    disabled // For now
                >
                    <Icon name="add" className="w-5 h-5 mr-1.5 -ml-0.5" />
                    Add Product
                </button>
            </div>
        </div>
    );
});

TableToolbar.propTypes = {
    selectedCount: PropTypes.number.isRequired,
    onBulkAction: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    activeFilters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onClearFilter: PropTypes.func.isRequired,
    onClearAllFilters: PropTypes.func.isRequired,
    allColumns: PropTypes.array.isRequired,
    visibleColumns: PropTypes.object.isRequired,
    onToggleColumn: PropTypes.func.isRequired,
    currentView: PropTypes.oneOf(['table', 'card']).isRequired,
    onViewToggle: PropTypes.func.isRequired,
};

export default TableToolbar;