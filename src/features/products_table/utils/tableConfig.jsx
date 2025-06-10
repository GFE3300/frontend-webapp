import React from 'react';
import Icon from '../../../components/common/Icon';
import CategoryLabel from '../subcomponents/cell_contents/CategoryLabel';
import StockLevelDisplay from '../subcomponents/cell_contents/StockLevelDisplay';
import TagPills from '../subcomponents/cell_contents/TagPills';
import SalesSparkline from '../subcomponents/cell_contents/SalesSparkline';
import SimpleToggle from '../subcomponents/cell_contents/SimpleToggle';
import { scriptLines_ProductsTable as scriptLines } from './script_lines.js';

export const COLUMN_KEYS = {
    SELECTION: 'selection',
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
    PROFIT_MARGIN: 'profit_margin',
};

// This context is now only for functions and less frequently updated data.
// Reactive selection state will be passed via props.
let tableInteractionContext = {
    onEdit: (product) => console.warn('onEdit not implemented', product),
    onDeleteRequest: (productId, productName) => console.warn('onDeleteRequest not implemented', productId, productName),
    onStatusToggle: (productId, newStatus) => console.warn('onStatusToggle not implemented', productId, newStatus),
    isProductStatusUpdating: (productId) => false,
    salesData: {},
};

export const setTableInteractionContext = (context) => {
    tableInteractionContext = { ...tableInteractionContext, ...context };
};

export const initialColumns = [
    {
        id: COLUMN_KEYS.SELECTION,
        // The header function now accepts props.
        header: ({ pageProductIds, selectedProductIds, onToggleAllRows }) => {
            const pageProductIdsSet = new Set(pageProductIds);
            const selectedOnPageCount = new Set([...selectedProductIds].filter(id => pageProductIdsSet.has(id))).size;

            const isAllSelected = pageProductIds.length > 0 && selectedOnPageCount === pageProductIds.length;
            const isSomeSelected = selectedOnPageCount > 0 && selectedOnPageCount < pageProductIds.length;

            return (
                <div className="flex justify-center items-center px-4">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-500 dark:bg-neutral-600 dark:checked:bg-rose-500 dark:checked:border-rose-500"
                        ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                        checked={isAllSelected}
                        onChange={onToggleAllRows}
                        aria-label="Select all rows on this page"
                    />
                </div>
            );
        },
        // The cell function now accepts props.
        cell: ({ row, isSelected, onToggleRow }) => {
            const productId = row.original.id;
            return (
                <div className="flex justify-center items-center px-4">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-500 dark:bg-neutral-600 dark:checked:bg-rose-500 dark:checked:border-rose-500"
                        checked={isSelected}
                        onChange={() => onToggleRow(productId)}
                        aria-label={`Select row for product ${row.original.name}`}
                    />
                </div>
            );
        },
        size: 60,
        minWidth: 60,
        isResizable: false,
        isSortable: false,
        isVisibilityToggleable: false,
        sticky: 'left',
        align: 'center',
    },
    {
        id: COLUMN_KEYS.ACTIONS,
        header: scriptLines.tableConfig.headers.actions,
        accessorKey: 'actions',
        isSortable: false,
        isResizable: false,
        minWidth: 100,
        isVisibilityToggleable: false,
        size: 100,
        sticky: 'left',
        align: 'center',
        skeletonType: 'actions',
        cell: ({ row }) => (
            <div className="flex space-x-2 items-center justify-center">
                <button
                    onClick={() => tableInteractionContext.onEdit(row.original)}
                    title={scriptLines.tableConfig.tooltips.editProduct}
                    className="p-1 w-7 h-7 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    <Icon name="edit" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
                </button>
                <button
                    onClick={() => tableInteractionContext.onDeleteRequest(row.original.id, row.original.name)}
                    title={scriptLines.tableConfig.tooltips.deleteProduct}
                    className="p-1 w-7 h-7 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                    <Icon name="delete" className="w-5 h-5" style={{ fontSize: '1.25rem' }} />
                </button>
            </div>
        ),
    },
    {
        id: COLUMN_KEYS.IMAGE,
        header: scriptLines.tableConfig.headers.image,
        accessorKey: 'image_url',
        isSortable: false,
        isResizable: false,
        minWidth: 80,
        isVisibilityToggleable: true,
        size: 80,
        align: 'center',
        skeletonType: 'image',
        cell: ({ getValue }) => (
            <div className="flex justify-center items-center w-full h-full">
                {getValue() ? <img src={getValue()} alt={scriptLines.tableConfig.alts.productImage} className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-400 dark:text-neutral-500"><Icon name="image_not_supported" /></div>}
            </div>
        ),
    },
    {
        id: COLUMN_KEYS.NAME,
        header: scriptLines.tableConfig.headers.name,
        accessorKey: 'name',
        isSortable: true,
        isResizable: true,
        minWidth: 200,
        cellType: 'editableText',
        size: 250,
        align: 'left',
        skeletonType: 'name',
        cell: ({ row, getValue }) => {
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
        header: scriptLines.tableConfig.headers.sku,
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
        header: scriptLines.tableConfig.headers.category,
        accessorFn: (row) => row.category_details,
        isSortable: true,
        isResizable: true,
        minWidth: 120,
        size: 180,
        align: 'left',
        skeletonType: 'text_short',
        cell: ({ getValue }) => <CategoryLabel category={getValue()} />,
    },
    {
        id: COLUMN_KEYS.TYPE,
        header: scriptLines.tableConfig.headers.type,
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
            const typeText = scriptLines.tableConfig.productTypes[type] || type.replace(/_/g, ' ');
            return (
                <span className={`px-2 py-1 font-montserrat py-0.5 text-xs rounded-full ${type === 'made_in_house' ? 'bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100'}`}>
                    {typeText}
                </span>
            );
        }
    },
    {
        id: COLUMN_KEYS.PRICE,
        header: scriptLines.tableConfig.headers.price,
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
        header: scriptLines.tableConfig.headers.cost,
        accessorKey: 'total_cost',
        isSortable: true,
        isResizable: true,
        minWidth: 100,
        cellType: 'editableCurrency',
        size: 100,
        align: 'right',
        skeletonType: 'price',
    },
    {
        id: COLUMN_KEYS.PROFIT_MARGIN,
        header: "Margin",
        accessorKey: 'profit_margin',
        isSortable: true,
        isResizable: true,
        minWidth: 80,
        size: 90,
        align: 'right',
        skeletonType: 'price',
        cellType: 'percentage',
    },
    {
        id: COLUMN_KEYS.STOCK,
        header: scriptLines.tableConfig.headers.stock,
        accessorKey: 'stock_quantity',
        isSortable: true,
        isResizable: true,
        minWidth: 120,
        size: 180,
        align: 'left',
        skeletonType: 'text_short',
        cell: ({ getValue }) => <StockLevelDisplay quantity={getValue()} lowStockThreshold={10} />,
    },
    {
        id: COLUMN_KEYS.SALES,
        header: scriptLines.tableConfig.headers.sales,
        isSortable: false, // Sales data is complex and not sortable by this column
        isResizable: true,
        minWidth: 100,
        size: 120,
        align: 'left',
        skeletonType: 'sales',
        // --- MODIFICATION START ---
        // Implement the cell renderer to process and pass data to the sparkline component.
        cell: ({ row }) => {
            const productId = row.original.id;
            // Access the salesData from the context.
            const salesHistoryForProduct = tableInteractionContext.salesData?.[productId] || [];

            // Map the array of objects to an array of numbers.
            const unitsSoldData = salesHistoryForProduct.map(day => day.units_sold);

            // Pass the numerical data to the SalesSparkline component.
            return <SalesSparkline data={unitsSoldData} />;
        },
        // --- MODIFICATION END ---
    },
    {
        id: COLUMN_KEYS.STATUS,
        header: scriptLines.tableConfig.headers.status,
        accessorKey: 'is_active',
        isSortable: true,
        isResizable: false,
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
        header: scriptLines.tableConfig.headers.tags,
        accessorFn: (row) => (row.product_tags_details || []),
        isSortable: false,
        isResizable: true,
        minWidth: 200,
        size: 220,
        align: 'left',
        skeletonType: 'tags',
        cell: ({ getValue }) => <TagPills tags={getValue() || []} maxVisibleTags={2} />,
    },
    {
        id: COLUMN_KEYS.BARCODE,
        header: scriptLines.tableConfig.headers.barcode,
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
        header: scriptLines.tableConfig.headers.lastUpdated,
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
                return scriptLines.tableConfig.errors.invalidDate;
            }
        }
    },
];

export const filterOptions = {
    category: [],
    product_type: [
        { value: '', label: scriptLines.tableConfig.filters.allTypes },
        { value: 'made_in_house', label: scriptLines.tableConfig.productTypes.made_in_house },
        { value: 'resold_item', label: scriptLines.tableConfig.productTypes.resold_item },
    ],
    is_active: [
        { value: '', label: scriptLines.tableConfig.filters.allStatuses },
        { value: 'active', label: scriptLines.tableConfig.filters.active },
        { value: 'inactive', label: scriptLines.tableConfig.filters.inactive },
    ],
};

export const sortOptions = [
    { value: '', label: scriptLines.tableConfig.sort.default },
    { value: 'name', label: scriptLines.tableConfig.sort.nameAsc },
    { value: '-name', label: scriptLines.tableConfig.sort.nameDesc },
    { value: 'selling_price_excl_tax', label: scriptLines.tableConfig.sort.priceAsc },
    { value: '-selling_price_excl_tax', label: scriptLines.tableConfig.sort.priceDesc },
    { value: 'updated_at', label: scriptLines.tableConfig.sort.updatedAsc },
    { value: '-updated_at', label: scriptLines.tableConfig.sort.updatedDesc },
    { value: COLUMN_KEYS.STOCK, label: scriptLines.tableConfig.sort.stockAsc },
    { value: `-${COLUMN_KEYS.STOCK}`, label: scriptLines.tableConfig.sort.stockDesc },
];