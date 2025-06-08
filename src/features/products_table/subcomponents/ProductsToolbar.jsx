import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import CustomColumnDropdown from './CustomColumnDropdown';
import AnimatedSearchBar from './AnimatedSearchBar';
import ToolbarDropdown from './ToolbarDropdown';
import { useCategories } from '../../../contexts/ProductDataContext';
import { COLUMN_KEYS } from '../utils/tableConfig';
import { scriptLines_ProductsTable as scriptLines } from '../utils/script_lines.js';

const ProductsToolbar = ({
    filters,
    onFilterChange,
    sort,
    onSortChange,
    columnVisibility,
    onColumnVisibilityChange,
    columnOrder,
    onColumnOrderChange,
    allColumns,
    onAddProduct,
    onRefresh,
    onResetTableSettings,
}) => {
    const { data: categoriesData } = useCategories();
    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        const categoryOpts = categoriesData?.length
            ? [
                { value: '', label: scriptLines.productsToolbar.filters.allCategoriesLabel },
                ...categoriesData.map(cat => ({ value: cat.id, label: cat.name }))
            ]
            : [{ value: '', label: scriptLines.productsToolbar.filters.loadingCategoriesLabel, disabled: true }];

        setCategoryOptions(categoryOpts);
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
    
    const filterKeyMap = {
        [COLUMN_KEYS.NAME]: 'search',
        [COLUMN_KEYS.SKU]: 'search',
        [COLUMN_KEYS.CATEGORY]: 'category',
        [COLUMN_KEYS.TYPE]: 'product_type',
        [COLUMN_KEYS.STATUS]: 'is_active',
    };
    const activeFilterKeyForSortedColumn = sort.id ? filterKeyMap[sort.id] : null;

    return (
        <div className="p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-x-3 gap-y-2">
            <AnimatedSearchBar
                initialSearchTerm={filters.search || ''}
                onSearchSubmit={handleActualSearchSubmit}
                placeholder={scriptLines.productsToolbar.searchPlaceholder}
                isSortActiveTarget={activeFilterKeyForSortedColumn === 'search'}
            />

            <ToolbarDropdown
                ariaLabel={scriptLines.productsToolbar.filters.categoryAriaLabel}
                options={categoryOptions}
                value={filters.category || ''}
                onChange={(newValue) => handleDropdownFilterChange('category', newValue)}
                placeholder={scriptLines.productsToolbar.filters.categoryPlaceholder}
                className="min-w-[150px]"
                isSortActiveTarget={activeFilterKeyForSortedColumn === 'category'}
            />
            <ToolbarDropdown
                ariaLabel={scriptLines.productsToolbar.filters.typeAriaLabel}
                options={scriptLines.tableConfig.filterOptions.product_type}
                value={filters.product_type || ''}
                onChange={(newValue) => handleDropdownFilterChange('product_type', newValue)}
                placeholder={scriptLines.productsToolbar.filters.typePlaceholder}
                className="min-w-[150px]"
                isSortActiveTarget={activeFilterKeyForSortedColumn === 'product_type'}
            />
            <ToolbarDropdown
                ariaLabel={scriptLines.productsToolbar.filters.statusAriaLabel}
                options={scriptLines.tableConfig.filterOptions.is_active}
                value={filters.is_active || ''}
                onChange={(newValue) => handleDropdownFilterChange('is_active', newValue)}
                placeholder={scriptLines.productsToolbar.filters.statusPlaceholder}
                className="min-w-[150px]"
                isSortActiveTarget={activeFilterKeyForSortedColumn === 'is_active'}
            />
            <ToolbarDropdown
                ariaLabel={scriptLines.productsToolbar.sort.ariaLabel}
                iconName="sort"
                options={scriptLines.tableConfig.sortOptions}
                value={sort.id ? (sort.desc ? `-${sort.id}` : sort.id) : ''}
                onChange={handleSortDropdownChange}
                placeholder={scriptLines.productsToolbar.sort.placeholder}
                className="min-w-[160px]"
            />

            <div className="flex-grow"></div> 

            <CustomColumnDropdown
                allTableColumns={allColumns}
                visibleColumnKeys={columnVisibility}
                columnOrderKeys={columnOrder}
                onVisibilityChange={onColumnVisibilityChange}
                onOrderChange={onColumnOrderChange}
                onResetColumns={onResetTableSettings}
            />

            <button
                onClick={onRefresh}
                className="p-2 h-9 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300 rounded-full flex items-center"
                title={scriptLines.productsToolbar.buttons.refreshTooltip}
            >
                <Icon name="refresh" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
            </button>
            <button
                onClick={onAddProduct}
                className="px-2 pr-4 h-9 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-full flex items-center"
            >
                <Icon name="add_circle" className="w-5 h-5 mr-2" style={{ fontSize: '1.25rem' }} />
                {scriptLines.productsToolbar.buttons.addProduct}
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
    onColumnVisibilityChange: PropTypes.func.isRequired,
    columnOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
    onColumnOrderChange: PropTypes.func.isRequired,
    allColumns: PropTypes.array.isRequired,
    onAddProduct: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    onResetTableSettings: PropTypes.func,
};

export default ProductsToolbar;