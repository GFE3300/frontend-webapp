import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown';
import { useCategories } from '../../../contexts/ProductDataContext'; // To populate category filter
import { filterOptions as defaultFilterOptions, sortOptions } from '../utils/tableConfig';

const ProductsToolbar = ({
    filters,
    onFilterChange,
    sort,
    onSortChange,
    columnVisibility,
    onColumnVisibilityChange,
    allColumns,
    onAddProduct, // New prop for Add Product button
    onRefresh, // New prop for refresh button
}) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const { data: categoriesData } = useCategories();
    const [currentFilterOptions, setCurrentFilterOptions] = useState(defaultFilterOptions);

    useEffect(() => {
        if (categoriesData) {
            setCurrentFilterOptions(prev => ({
                ...prev,
                category: [
                    { value: '', label: 'All Categories' },
                    ...categoriesData.map(cat => ({ value: cat.id, label: cat.name }))
                ]
            }));
        }
    }, [categoriesData]);
    
    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFilterChange({ search: searchTerm });
    };

    const handleSelectFilterChange = (filterKey, value) => {
        onFilterChange({ [filterKey]: value });
    };
    
    const handleSortChange = (e) => {
        const value = e.target.value;
        if (!value) {
            onSortChange({ id: '', desc: false });
        } else {
            const isDesc = value.startsWith('-');
            const id = isDesc ? value.substring(1) : value;
            onSortChange({ id, desc: isDesc });
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-grow min-w-[200px] sm:max-w-xs">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products (name, SKU)..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-rose-500 focus:border-rose-500 dark:bg-neutral-700 dark:text-neutral-100"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    </div>
                </div>
            </form>

            {/* Filters */}
            <select
                value={filters.category || ''}
                onChange={(e) => handleSelectFilterChange('category', e.target.value)}
                className="p-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-rose-500 focus:border-rose-500 dark:bg-neutral-700 dark:text-neutral-100 min-w-[150px]"
            >
                {currentFilterOptions.category.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
                value={filters.product_type || ''}
                onChange={(e) => handleSelectFilterChange('product_type', e.target.value)}
                className="p-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-rose-500 focus:border-rose-500 dark:bg-neutral-700 dark:text-neutral-100 min-w-[150px]"
            >
                {currentFilterOptions.product_type.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
                value={filters.is_active || ''}
                onChange={(e) => handleSelectFilterChange('is_active', e.target.value)}
                className="p-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-rose-500 focus:border-rose-500 dark:bg-neutral-700 dark:text-neutral-100 min-w-[150px]"
            >
                {currentFilterOptions.is_active.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            
            {/* Sort */}
             <select
                value={sort.id ? (sort.desc ? `-${sort.id}` : sort.id) : ''}
                onChange={handleSortChange}
                className="p-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-rose-500 focus:border-rose-500 dark:bg-neutral-700 dark:text-neutral-100 min-w-[150px]"
            >
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>

            {/* Spacer to push buttons to the right */}
            <div className="flex-grow"></div>


            {/* Column Visibility */}
            <ColumnVisibilityDropdown
                allColumns={allColumns}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={onColumnVisibilityChange}
            />

            {/* Refresh Button */}
             <button
                onClick={onRefresh}
                className="p-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg flex items-center"
                title="Refresh Data"
            >
                <Icon name="refresh" className="w-5 h-5" />
            </button>

            {/* Add Product Button */}
            <button
                onClick={onAddProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center"
            >
                <Icon name="add_circle" className="w-5 h-5 mr-2" />
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
    columnVisibility: PropTypes.object.isRequired,
    onColumnVisibilityChange: PropTypes.func.isRequired,
    allColumns: PropTypes.array.isRequired,
    onAddProduct: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
};

export default ProductsToolbar;