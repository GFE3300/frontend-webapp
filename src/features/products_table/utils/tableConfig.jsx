// features/products_table/utils/tableConfig.jsx
import React from 'react';
import Icon from '../../../components/common/Icon';

import CategoryLabel from '../subcomponents/cell_contents/CategoryLabel';
import StockLevelDisplay from '../subcomponents/cell_contents/StockLevelDisplay';
import TagPills from '../subcomponents/cell_contents/TagPills';
import SalesSparkline from '../subcomponents/cell_contents/SalesSparkline';
import SimpleToggle from '../subcomponents/cell_contents/SimpleToggle';

export const COLUMN_KEYS = {
    ACTIONS: 'actions',
    IMAGE: 'image',
    NAME: 'name',
    SKU: 'sku',
    CATEGORY: 'category',
    TYPE: 'product_type',
    PRICE: 'selling_price_excl_tax',
    COST: 'labor_overhead_cost',
    STOCK: 'stock_quantity',
    SALES: 'sales',
    STATUS: 'is_active',
    TAGS: 'product_tags',
    BARCODE: 'barcode',
    LAST_UPDATED: 'updated_at',
};

let tableInteractionContext = {
    onEdit: (product) => console.warn('onEdit not implemented', product),
    onDeleteRequest: (productId, productName) => console.warn('onDeleteRequest not implemented', productId, productName),
    onStatusToggle: (productId, newStatus) => console.warn('onStatusToggle not implemented', productId, newStatus),
    isProductStatusUpdating: (productId) => false,
};

export const setTableInteractionContext = (context) => {
    tableInteractionContext = { ...tableInteractionContext, ...context };
};


export const initialColumns = [
    {
        id: COLUMN_KEYS.ACTIONS,
        header: 'Actions',
        accessorKey: 'actions',
        isSortable: false,
        isResizable: false, // Actions column usually not resizable
        minWidth: 100,      // Still good to have a minWidth
        isVisibilityToggleable: false,
        size: 100,
        sticky: 'left',
        align: 'center',
        skeletonType: 'actions',
        cell: ({ row }) => (
            <div className="flex space-x-2 items-center justify-center">
                <button
                    onClick={() => tableInteractionContext.onEdit(row.original)}
                    title="Edit Product"
                    className="p-1 w-7 h-7 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    <Icon name="edit" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
                </button>
                <button
                    onClick={() => tableInteractionContext.onDeleteRequest(row.original.id, row.original.name)}
                    title="Delete Product"
                    className="p-1 w-7 h-7 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                    <Icon name="delete" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
                </button>
            </div>
        ),
    },
    {
        id: COLUMN_KEYS.IMAGE,
        header: 'Image',
        accessorKey: 'image_url',
        isSortable: false,
        isResizable: false, // Images are usually fixed size
        minWidth: 80,
        isVisibilityToggleable: true, // Assuming this can be toggled
        size: 80,
        align: 'center',
        skeletonType: 'image',
        cell: ({ getValue }) => (
            <div className="flex justify-center items-center w-full h-full">
                {getValue() ? <img src={getValue()} alt="Product" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-400 dark:text-neutral-500"><Icon name="image_not_supported" /></div>}
            </div>
        ),
    },
    {
        id: COLUMN_KEYS.NAME,
        header: 'Product Name',
        accessorKey: 'name',
        isSortable: true,
        isResizable: true,
        minWidth: 200,
        cellType: 'editableText',
        size: 250,
        align: 'left',
        skeletonType: 'name',
        cell: ({ row, getValue, column }) => {
            if (column.cellType === 'editableText' && tableInteractionContext.onUpdateProductField) {
                return (
                    <div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-100">{getValue()}</span>
                        {row.original.subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{row.original.subtitle}</p>}
                    </div>
                );
            }
            return (
                <div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-100">{getValue()}</span>
                    {row.original.subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{row.original.subtitle}</p>}
                </div>
            );
        }
    },
    {
        id: COLUMN_KEYS.SKU,
        header: 'SKU',
        accessorKey: 'sku',
        isSortable: true,
        isResizable: true,
        minWidth: 120,
        cellType: 'editableText',
        size: 120,
        align: 'left',
        skeletonType: 'sku',
    },
    {
        id: COLUMN_KEYS.CATEGORY,
        header: 'Category',
        accessorFn: (row) => row.category_details,
        isSortable: true,
        isResizable: true,
        minWidth: 120,
        size: 180,
        align: 'left',
        skeletonType: 'text_short',
        cell: ({ getValue }) => {
            const category = getValue();
            return <CategoryLabel category={category} />;
        },
    },
    {
        id: COLUMN_KEYS.TYPE,
        header: 'Type',
        accessorKey: 'product_type',
        isSortable: true,
        isResizable: true,
        minWidth: 100,
        size: 150,
        align: 'left',
        skeletonType: 'badge',
        cell: ({ getValue }) => {
            const type = getValue();
            if (!type) return null;
            return (
                <span className={`px-2 py-1 font-montserrat py-0.5 text-xs rounded-full ${type === 'made_in_house' ? 'bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100'}`}>
                    {type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
            );
        }
    },
    {
        id: COLUMN_KEYS.PRICE,
        header: 'Price',
        accessorKey: 'selling_price_excl_tax',
        isSortable: true,
        isResizable: true,
        minWidth: 120,
        cellType: 'editableCurrency',
        size: 100,
        align: 'right',
        skeletonType: 'price',
    },
    {
        id: COLUMN_KEYS.COST,
        header: 'Cost',
        accessorKey: 'labor_overhead_cost',
        isSortable: true,
        isResizable: true,
        minWidth: 100,
        cellType: 'editableCurrency',
        size: 100,
        align: 'right',
        skeletonType: 'price',
    },
    {
        id: COLUMN_KEYS.STOCK,
        header: 'Stock Level',
        accessorKey: 'stock_quantity',
        isSortable: true,
        isResizable: true,
        minWidth: 120,
        size: 180,
        align: 'left',
        skeletonType: 'text_short',
        cell: ({ getValue }) => {
            const quantity = getValue();
            return <StockLevelDisplay quantity={quantity} lowStockThreshold={10} />;
        },
    },
    {
        id: COLUMN_KEYS.SALES,
        header: 'Sales (7d)',
        accessorKey: 'sales_data',
        isSortable: false, // Sales data might be complex to sort on client
        isResizable: true,
        minWidth: 100,
        size: 120,
        align: 'left',
        skeletonType: 'sales',
        cell: ({ getValue }) => <SalesSparkline data={getValue() || []} />,
    },
    {
        id: COLUMN_KEYS.STATUS,
        header: 'Status',
        accessorKey: 'is_active',
        isSortable: true,
        isResizable: false, // Toggle usually doesn't need resize
        minWidth: 80,
        size: 80,
        align: 'center',
        skeletonType: 'status',
        cell: ({ row }) => (
            <div className="flex justify-center items-center w-full">
                <SimpleToggle
                    checked={row.original.is_active}
                    onChange={(newCheckedState) => tableInteractionContext.onStatusToggle(row.original.id, newCheckedState)}
                    size="sm"
                    isLoading={tableInteractionContext.isProductStatusUpdating(row.original.id)}
                />
            </div>
        ),
    },
    {
        id: COLUMN_KEYS.TAGS,
        header: 'Tags',
        accessorFn: (row) => (row.product_tags_details || []),
        isSortable: false,
        isResizable: true,
        minWidth: 200,
        size: 220,
        align: 'left',
        skeletonType: 'tags',
        cell: ({ getValue }) => {
            const tagsDetails = getValue();
            if (!tagsDetails || tagsDetails.length === 0) return null;
            return <TagPills tags={tagsDetails} maxVisibleTags={2} />;
        }
    },
    {
        id: COLUMN_KEYS.BARCODE,
        header: 'Barcode',
        accessorKey: 'barcode',
        isSortable: true,
        isResizable: true,
        minWidth: 150,
        cellType: 'editableText',
        size: 130,
        align: 'left',
        skeletonType: 'sku',
    },
    {
        id: COLUMN_KEYS.LAST_UPDATED,
        header: 'Last Updated',
        accessorKey: 'updated_at',
        isSortable: true,
        isResizable: true,
        minWidth: 150,
        size: 180,
        align: 'left',
        skeletonType: 'date',
        cell: ({ getValue }) => {
            const dateValue = getValue();
            if (!dateValue) return null;
            try {
                return new Date(dateValue).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
            } catch (e) {
                return 'Invalid Date';
            }
        }
    },
];

// ... (defaultColumnVisibility, defaultColumnOrder, filterOptions, sortOptions remain the same) ...
// Default visibility: Hide COST, SALES, BARCODE, LAST_UPDATED, TAGS by default
// Adjusted STOCK to be visible by default as it's commonly needed.
export const defaultColumnVisibility = initialColumns.reduce((acc, col) => {
    if ([COLUMN_KEYS.COST, COLUMN_KEYS.SALES, COLUMN_KEYS.BARCODE, COLUMN_KEYS.LAST_UPDATED].includes(col.id)) {
        acc[col.id] = false;
    } else {
        acc[col.id] = true;
    }
    if (col.isVisibilityToggleable === false) {
        acc[col.id] = true;
    }
    return acc;
}, {});

export const defaultColumnOrder = initialColumns.map(col => col.id);

export const filterOptions = {
    category: [],
    product_type: [
        { value: '', label: 'All Types' },
        { value: 'made_in_house', label: 'Made In-House' },
        { value: 'resold_item', label: 'Resold Item' },
    ],
    is_active: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ],
};

export const sortOptions = [
    { value: '', label: 'Default Sort' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: '-name', label: 'Name (Z-A)' },
    { value: 'selling_price_excl_tax', label: 'Price (Low-High)' },
    { value: '-selling_price_excl_tax', label: 'Price (High-Low)' },
    { value: 'updated_at', label: 'Last Updated (Oldest)' },
    { value: '-updated_at', label: 'Last Updated (Newest)' },
    { value: COLUMN_KEYS.STOCK, label: 'Stock (Low-High)' },
    { value: `-${COLUMN_KEYS.STOCK}`, label: 'Stock (High-Low)' },
];