import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import CustomColumnDropdown from './CustomColumnDropdown';
import AnimatedSearchBar from './AnimatedSearchBar';
import ToolbarDropdown from './ToolbarDropdown';
import { useCategories } from '../../../contexts/ProductDataContext';
import { filterOptions as defaultFilterOptions, sortOptions } from '../utils/tableConfig';

const ProductsToolbar = ({
    filters,
    onFilterChange,
    sort,
    onSortChange,
    columnVisibility, 
    onColumnVisibilityChange, // This is passed directly
    columnOrder,
    onColumnOrderChange,      // This is passed directly
    allColumns,
    onAddProduct,
    onRefresh,
    onResetTableSettings // Assuming this comes from useTableSettings via ProductsTable
}) => {
    const { data: categoriesData } = useCategories();
    const [currentFilterOptions, setCurrentFilterOptions] = useState(defaultFilterOptions);

    useEffect(() => {
        const categoryOpts = categoriesData?.length
            ? [
                { value: '', label: 'All Categories' },
                ...categoriesData.map(cat => ({ value: cat.id, label: cat.name }))
            ]
            : [{ value: '', label: 'Loading Categories...' }];

        setCurrentFilterOptions(prev => ({
            ...prev,
            category: categoryOpts,
        }));
    }, [categoriesData]);

    const handleActualSearchSubmit = (term) => {
        onFilterChange({ search: term });
    };

    const handleDropdownFilterChange = (filterKey, newValue) => {
        onFilterChange({ [filterKey]: newValue });
    };

    const handleSortDropdownChange = (newValue) => {
        if (!newValue) {
            onSortChange({ id: '', desc: false });
        } else {
            const isDesc = newValue.startsWith('-');
            const id = isDesc ? newValue.substring(1) : newValue;
            onSortChange({ id, desc: isDesc });
        }
    };

    // Local handleColumnToggle and handleColumnReorder are removed.
    // onColumnVisibilityChange and onColumnOrderChange props are passed directly.

    return (
        <div className="p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-x-3 gap-y-2">
            <AnimatedSearchBar
                initialSearchTerm={filters.search || ''}
                onSearchSubmit={handleActualSearchSubmit}
                placeholder="Search name, SKU, tags..."
            />

            <ToolbarDropdown
                ariaLabel="Filter by category"
                options={currentFilterOptions.category}
                value={filters.category || ''}
                onChange={(newValue) => handleDropdownFilterChange('category', newValue)}
                placeholder="Category"
                className="min-w-[150px]"
            />
            <ToolbarDropdown
                ariaLabel="Filter by product type"
                options={currentFilterOptions.product_type}
                value={filters.product_type || ''}
                onChange={(newValue) => handleDropdownFilterChange('product_type', newValue)}
                placeholder="Type"
                className="min-w-[150px]"
            />
            <ToolbarDropdown
                ariaLabel="Filter by status"
                options={currentFilterOptions.is_active}
                value={filters.is_active || ''}
                onChange={(newValue) => handleDropdownFilterChange('is_active', newValue)}
                placeholder="Status"
                className="min-w-[150px]"
            />
            <ToolbarDropdown
                ariaLabel="Sort by"
                iconName="sort"
                options={sortOptions}
                value={sort.id ? (sort.desc ? `-${sort.id}` : sort.id) : ''}
                onChange={handleSortDropdownChange}
                placeholder="Sort By"
                className="min-w-[160px]"
            />

            <div className="flex-grow"></div> {/* Spacer */}

            <CustomColumnDropdown
                allTableColumns={allColumns}
                visibleColumnKeys={columnVisibility}
                columnOrderKeys={columnOrder}    
                onVisibilityChange={onColumnVisibilityChange} // Pass directly
                onOrderChange={onColumnOrderChange}         // Pass directly
                onResetColumns={onResetTableSettings} 
            />
            
            <button
                onClick={onRefresh}
                className="p-2 h-9 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-300 rounded-full flex items-center"
                title="Refresh Data"
            >
                <Icon name="refresh" className="w-5 h-5" style={{ fontSize: '1.25rem'}}/>
            </button>
            <button
                onClick={onAddProduct}
                className="px-2 pr-4 h-9 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-full flex items-center"
            >
                <Icon name="add_circle" className="w-5 h-5 mr-2" style={{ fontSize: '1.25rem'}}/>
                Add Product
            </button>
        </div>
    );
};

ProductsToolbar.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    sort: PropTypes.object.isRequired,
    onSortChange: PropTypes.func.isRequired,
    columnVisibility: PropTypes.instanceOf(Set).isRequired, 
    onColumnVisibilityChange: PropTypes.func.isRequired, // Expects (updaterFn) => void
    columnOrder: PropTypes.arrayOf(PropTypes.string).isRequired, 
    onColumnOrderChange: PropTypes.func.isRequired,      // Expects (newOrderArray) => void
    allColumns: PropTypes.array.isRequired,
    onAddProduct: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    onResetTableSettings: PropTypes.func,
};

export default ProductsToolbar;