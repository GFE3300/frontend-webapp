// src/features/kitchen_display_system/components/KitchenHeader.jsx
import React from 'react';
import Icon from '../../../components/common/Icon';
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';

const sl = scriptLines_kitchenDisplaySystem.header;
const slPage = scriptLines_kitchenDisplaySystem.page;

const KitchenHeader = ({ activeFilter, onFilterChange, orderCounts, groupByTable, onToggleGroupByTable }) => {
    const filters = [
        { key: 'all', label: sl.filterAll || "All", icon: "apps" },
        { key: 'new', label: sl.filterNew || "New", icon: "fiber_new" },
        { key: 'preparing', label: sl.filterPreparing || "Preparing", icon: "soup_kitchen" },
        { key: 'ready', label: sl.filterReady || "Ready", icon: "room_service" },
        { key: 'served', label: sl.filterServed || "Served", icon: "done_all" },
        { key: 'paid', label: sl.filterPaid || "Paid", icon: "receipt_long" },
    ];

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-neutral-100/85 dark:bg-neutral-800/85 backdrop-blur-lg border-b border-neutral-200/70 dark:border-neutral-700/70 shadow-md">
            <div className="flex items-center">
                <Icon name="kitchen" className="w-6 h-6 text-rose-500 dark:text-rose-400 mr-2 sm:mr-3" />
                <h1 className="font-montserrat font-semibold text-lg sm:text-xl text-neutral-700 dark:text-neutral-200 tracking-tight">
                    {slPage.pageTitle || "Kitchen Orders"}
                </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
                {filters.map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        // MODIFIED: Added `justify-center` to center the content
                        className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 ease-in-out
                                    flex items-center justify-center space-x-1.5
                                    ${activeFilter === filter.key
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-neutral-200/70 hover:bg-neutral-300/70 dark:bg-neutral-700/70 dark:hover:bg-neutral-600/70 text-neutral-700 dark:text-neutral-200'
                            }`}
                        title={`${filter.label} (${orderCounts[filter.key] || 0})`}
                    >
                        <Icon name={filter.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{filter.label}</span>
                        <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] 
                                        ${activeFilter === filter.key ? 'bg-rose-400/80' : 'bg-neutral-300/80 dark:bg-neutral-600/80'}`}>
                            {orderCounts[filter.key] || 0}
                        </span>
                    </button>
                ))}

                {/* Visual Separator */}
                <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600/70 mx-1 sm:mx-2"></div>

                {/* Group by Table Toggle */}
                <button
                    onClick={onToggleGroupByTable}
                    // MODIFIED: Added flexbox centering for consistency
                    className={`p-2 rounded-full transition-colors duration-150 ease-in-out flex items-center justify-center
                                ${groupByTable
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-neutral-200/70 hover:bg-neutral-300/70 dark:bg-neutral-700/70 dark:hover:bg-neutral-600/70 text-neutral-700 dark:text-neutral-200'
                        }`}
                    title={sl.groupByTableToggle || "Group by Table"}
                >
                    <Icon name="table_rows" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
        </header>
    );
};

export default KitchenHeader;