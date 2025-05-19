// src/components/products_table/ProductsTable.jsx
import React, { useState, useEffect } from 'react';
import { useProductTableState } from '../hooks/useProductTableState';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableToolbar from './TableToolbar';
import { DndProvider } from 'react-dnd'; // For drag and drop
import { HTML5Backend } from 'react-dnd-html5-backend'; // For drag and drop

// Import mock data for now
import { mockProductsData } from '../utils/productTableUtils';

const ALL_COLUMNS_CONFIG = [
    { key: 'selection', label: 'Select', isFixed: true, alwaysVisible: true }, // Not user-toggleable
    { key: 'product', label: 'Product', isFixed: false },
    { key: 'categoryTags', label: 'Category & Tags', isFixed: false },
    { key: 'priceCostMargin', label: 'Price / Cost / Margin', isFixed: false },
    { key: 'stock', label: 'Stock Level', isFixed: false },
    { key: 'salesSparkline', label: '7-Day Sales', isFixed: false },
    { key: 'status', label: 'Status', isFixed: false },
    { key: 'actions', label: 'Actions', isFixed: false },
];

const ProductsTable = () => {
    // Initialize visible columns state (all true by default, except those marked alwaysVisible: false)
    const initialVisibleColumns = ALL_COLUMNS_CONFIG.reduce((acc, col) => {
        acc[col.key] = col.alwaysVisible !== false; // If alwaysVisible is undefined, it's true
        return acc;
    }, {});

    const {
        products,
        setProducts, // We'll use this to set initial data
        selectedProductIds,
        handleSelectProduct,
        handleSelectAll,
        isAllSelected,
        visibleColumns,
        toggleColumnVisibility,
        searchTerm,
        handleSearchChange,
        activeFilters,
        handleFilterChange,
        clearFilter,
        clearAllFilters,
        updateProductData,
        updateMultipleProducts,
        // reorderProducts, // For drag & drop, to be implemented
    } = useProductTableState(mockProductsData, initialVisibleColumns); // Initialize with mock data

    const [currentView, setCurrentView] = useState('table'); // 'table' or 'card'

    // Simulate fetching data - replace with actual API call
    useEffect(() => {
        // In a real app, you'd fetch data here and then:
        // setProducts(fetchedData);
        // For now, mockProductsData is passed directly to useProductTableState
    }, [setProducts]);


    const handleBulkAction = (actionType) => {
        console.log(`Bulk action: ${actionType} on ${selectedProductIds.size} products`);
        // Example: if (actionType === 'delete_selected') { ... call API ... }
        if (actionType === 'change_status') {
            // Example: prompt for new status
            const newStatus = prompt("Enter new status (active/inactive):");
            if (newStatus === 'active' || newStatus === 'inactive') {
                updateMultipleProducts(selectedProductIds, { status: newStatus });
            }
        }
    };

    const displayColumns = ALL_COLUMNS_CONFIG.filter(col => visibleColumns[col.key]);


    // Placeholder for Card View
    const CardView = () => (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <div key={product.id} className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md">
                    <img src={product.thumbnailUrl} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">{product.name}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{product.category}</p>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">${product.price.toFixed(2)}</p>
                    {/* Add more card details here */}
                </div>
            ))}
            {products.length === 0 && <p className="col-span-full text-center text-neutral-500 dark:text-neutral-400 py-10">No products to display in card view.</p>}
        </div>
    );

    return (
        <DndProvider backend={HTML5Backend}> {/* Needed for react-beautiful-dnd if you implement drag & drop */}
            <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
                <TableToolbar
                    selectedCount={selectedProductIds.size}
                    onBulkAction={handleBulkAction}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onClearFilter={clearFilter}
                    onClearAllFilters={clearAllFilters}
                    allColumns={ALL_COLUMNS_CONFIG}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumnVisibility}
                    currentView={currentView}
                    onViewToggle={setCurrentView}
                />
                {currentView === 'table' ? (
                    <div className="flex-grow overflow-x-auto"> {/* This div enables horizontal scrolling */}
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <TableHeader
                                columns={displayColumns}
                                onSelectAll={handleSelectAll}
                                isAllSelected={isAllSelected}
                                visibleColumns={visibleColumns} // Pass this down if header needs to know
                            />
                            <TableBody
                                products={products}
                                selectedProductIds={selectedProductIds}
                                onSelectProduct={handleSelectProduct}
                                visibleColumns={visibleColumns}
                                onUpdateProduct={updateProductData}
                            />
                        </table>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto">
                        <CardView />
                    </div>
                )}
                {/* Optional: Pagination component */}
            </div>
        </DndProvider>
    );
};

export default ProductsTable;