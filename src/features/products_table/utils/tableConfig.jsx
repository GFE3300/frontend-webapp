import React from 'react';
import StockProgressBar from '../subcomponents/StockProgressBar';
import SalesSparkline from '../subcomponents/SalesSparkline';
import Icon from '../../../components/common/Icon';
import SimpleToggle from '../subcomponents/SimpleToggle';

// Define unique keys for each column for stable rendering and settings
export const COLUMN_KEYS = {
    ACTIONS: 'actions',
    IMAGE: 'image',
    NAME: 'name',
    SKU: 'sku',
    CATEGORY: 'category',
    TYPE: 'product_type',
    PRICE: 'selling_price_excl_tax',
    COST: 'labor_overhead_cost',
    STOCK: 'stock',
    SALES: 'sales',
    STATUS: 'is_active',
    TAGS: 'product_tags',
    BARCODE: 'barcode',
    LAST_UPDATED: 'updated_at',
};

// This context will be populated by ProductsTable
let tableInteractionContext = {
    onEdit: (product) => console.warn('onEdit not implemented', product),
    onDeleteRequest: (productId, productName) => console.warn('onDeleteRequest not implemented', productId, productName), // Renamed to avoid confusion with direct delete
    onStatusToggle: (productId, newStatus) => console.warn('onStatusToggle not implemented', productId, newStatus),
    isProductStatusUpdating: (productId) => false, // New: check if a specific product's status is updating
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
        isVisibilityToggleable: false,
        size: 100,
        sticky: 'left',
        cell: ({ row }) => (
            <div className="flex space-x-2 items-center">
                <button
                    onClick={() => tableInteractionContext.onEdit(row.original)}
                    title="Edit Product"
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    <Icon name="edit" className="w-4 h-4" />
                </button>
                <button
                    onClick={() => tableInteractionContext.onDeleteRequest(row.original.id, row.original.name)}
                    title="Delete Product"
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                    <Icon name="delete" className="w-4 h-4" />
                </button>
            </div>
        ),
    },
    // ... (IMAGE, NAME, SKU, CATEGORY, TYPE, PRICE, COST, STOCK, SALES columns remain the same for brevity)
    {
        id: COLUMN_KEYS.IMAGE,
        header: 'Image',
        accessorKey: 'image_url',
        isSortable: false,
        cell: ({ getValue }) => (
            getValue() ? <img src={getValue()} alt="Product" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-400 dark:text-neutral-500"><Icon name="image_not_supported" /></div>
        ),
        size: 80,
    },
    {
        id: COLUMN_KEYS.NAME,
        header: 'Product Name',
        accessorKey: 'name',
        isSortable: true,
        cellType: 'editableText',
        cell: ({ row, getValue }) => (
            <div>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{getValue()}</span>
                {row.original.subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{row.original.subtitle}</p>}
            </div>
        ),
        size: 250,
    },
    { id: COLUMN_KEYS.SKU, header: 'SKU', accessorKey: 'sku', isSortable: true, cellType: 'editableText', size: 120 },
    { id: COLUMN_KEYS.CATEGORY, header: 'Category', accessorFn: (row) => row.category_details?.name || 'N/A', isSortable: true, size: 150 },
    {
        id: COLUMN_KEYS.TYPE,
        header: 'Type',
        accessorKey: 'product_type',
        isSortable: true,
        cell: ({ getValue }) => (
            <span className={`px-2 py-0.5 text-xs rounded-full ${getValue() === 'made_in_house' ? 'bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100'}`}>
                {getValue()?.replace(/_/g, ' ')?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
        ),
        size: 150,
    },
    {
        id: COLUMN_KEYS.PRICE,
        header: 'Price',
        accessorKey: 'selling_price_excl_tax',
        isSortable: true,
        cellType: 'editableCurrency',
        size: 100,
    },
    {
        id: COLUMN_KEYS.COST,
        header: 'Cost',
        accessorKey: 'labor_overhead_cost',
        isSortable: true,
        cellType: 'editableCurrency',
        size: 100,
    },
    {
        id: COLUMN_KEYS.STOCK,
        header: 'Stock Level',
        accessorKey: 'stock',
        isSortable: false,
        cell: ({ getValue }) => <StockProgressBar percentage={getValue() || 0} />,
        size: 150,
    },
    {
        id: COLUMN_KEYS.SALES,
        header: 'Sales (7d)',
        accessorKey: 'sales',
        isSortable: false,
        cell: ({ getValue }) => <SalesSparkline data={getValue() || []} />,
        size: 120,
    },
    {
        id: COLUMN_KEYS.STATUS,
        header: 'Status',
        accessorKey: 'is_active',
        isSortable: true,
        cell: ({ row }) => (
            <SimpleToggle
                checked={row.original.is_active}
                onChange={() => tableInteractionContext.onStatusToggle(row.original.id, !row.original.is_active)}
                size="sm"
                isLoading={tableInteractionContext.isProductStatusUpdating(row.original.id)} // Use context here
            />
        ),
        size: 80,
    },
    {
        id: COLUMN_KEYS.TAGS,
        header: 'Tags',
        accessorFn: (row) => (row.product_tags_details || []).map(tag => tag.name).join(', '),
        isSortable: false,
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
                {(row.original.product_tags_details || []).slice(0, 2).map(tag => (
                    <span key={tag.id} className="px-1.5 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded">
                        {tag.name}
                    </span>
                ))}
                {(row.original.product_tags_details || []).length > 2 && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        +{(row.original.product_tags_details || []).length - 2} more
                    </span>
                )}
            </div>
        ),
        size: 200,
    },
    { id: COLUMN_KEYS.BARCODE, header: 'Barcode', accessorKey: 'barcode', isSortable: true, cellType: 'editableText', size: 130 },
    {
        id: COLUMN_KEYS.LAST_UPDATED,
        header: 'Last Updated',
        accessorKey: 'updated_at',
        isSortable: true,
        cell: ({ getValue }) => new Date(getValue()).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
        size: 180,
    },
];

// ... (defaultColumnVisibility, defaultColumnOrder, filterOptions, sortOptions remain the same)
export const defaultColumnVisibility = initialColumns.reduce((acc, col) => {
    if ([COLUMN_KEYS.STOCK, COLUMN_KEYS.SALES, COLUMN_KEYS.BARCODE, COLUMN_KEYS.LAST_UPDATED].includes(col.id)) {
        acc[col.id] = false;
    } else {
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
];