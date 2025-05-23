import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTableSettings } from './hooks/useTableSettings';
import { useProducts, useUpdateProduct, useDeleteProduct } from '../../contexts/ProductDataContext';
import ProductsToolbar from './subcomponents/ProductsToolbar';
import ProductsTableHeader from './subcomponents/ProductsTableHeader';
import ProductsTableBody from './subcomponents/ProductsTableBody';
import { initialColumns as allAvailableColumnsConfig, setTableActions } from './utils/tableConfig'; // Renamed for clarity
import AddProductModal from '../add_product_modal/subcomponents/AddProductModal';
import Icon from '../../components/common/Icon';

const toast = {
    success: (message) => alert(`SUCCESS: ${message}`), // Replace with actual toast
    error: (message) => alert(`ERROR: ${message}`),   // Replace with actual toast
};

const ProductsTable = () => {
    const {
        columnVisibility, // This is now a Set
        setColumnVisibility,
        columnOrder, // This is an Array of keys
        setColumnOrder, // New setter from useTableSettings
        filters, setFilters,
        sort, setSort,
        pagination, setPagination,
        resetTableSettings
    } = useTableSettings();

    // ... (isAddProductModalOpen, editingProduct, queryParams, data fetching, mutations... remain largely the same)
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const queryParams = useMemo(() => {
        // ...
         const params = {
            page: pagination.pageIndex + 1,
            search: filters.search,
            category: filters.category,
            status: filters.is_active,
            product_type: filters.product_type,
            tags: Array.isArray(filters.tags) ? filters.tags.join(',') : '',
            sort: sort.id ? (sort.desc ? `-${sort.id}` : sort.id) : '',
        };
        return params;
    }, [pagination.pageIndex, filters, sort]);

    const { data: productsData, isLoading, error, refetch } = useProducts(queryParams, { keepPreviousData: true });
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    const handleUpdateProductField = async (productId, fieldKey, newValue) => {
        // ...
        try {
            await updateProductMutation.mutateAsync({ productId, data: { [fieldKey]: newValue } });
            toast.success(`Product field '${fieldKey}' updated.`);
        } catch (err) {
            console.error("Update failed in table:", err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.[fieldKey]?.[0] || `Failed to update ${fieldKey}.`;
            toast.error(errorMessage);
            throw err; 
        }
    };

    const handleStatusToggle = useCallback( async (productId, newStatus) => {
        // ...
        try {
            await updateProductMutation.mutateAsync({ productId, data: { is_active: newStatus } });
            toast.success(`Product status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
        } catch (err) {
            console.error("Status update failed:", err);
            toast.error(err.response?.data?.detail || "Failed to update status.");
        }
    }, [updateProductMutation]);

    const handleEditProduct = useCallback( (product) => {
        setEditingProduct(product);
        setIsAddProductModalOpen(true);
    }, []);

    const handleDeleteProduct = useCallback(
        async (productId, productName) => {
            // ...
             if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
                try {
                    await deleteProductMutation.mutateAsync(productId);
                    toast.success(`Product "${productName}" deleted successfully.`);
                } catch (err) {
                    console.error("Delete failed:", err);
                    toast.error(err.response?.data?.detail || `Failed to delete "${productName}".`);
                }
            }
        }, [deleteProductMutation]
    );
    
    useEffect(() => {
        setTableActions({
            onEdit: handleEditProduct,
            onDelete: handleDeleteProduct,
            onStatusToggle: handleStatusToggle,
        });
    }, [handleEditProduct, handleDeleteProduct, handleStatusToggle]);


    const handleSort = (columnIdToSort) => {
        if (!allAvailableColumnsConfig.find(col => col.id === columnIdToSort)?.isSortable) return;
        setSort(prevSort => {
            // ...
            if (prevSort.id === columnIdToSort) {
                return { id: columnIdToSort, desc: !prevSort.desc };
            }
            return { id: columnIdToSort, desc: false };
        });
    };

    const visibleColumns = useMemo(() => {
        // columnOrder is an array of keys.
        // columnVisibility is a Set of visible keys.
        return columnOrder
            .filter(key => columnVisibility.has(key)) // Filter by visibility first
            .map(key => allAvailableColumnsConfig.find(col => col.id === key)) // Map to full column config
            .filter(Boolean); // Ensure no undefined columns if a key in order is somehow not in allAvailableColumnsConfig
    }, [columnOrder, columnVisibility]);

    // ... (handleProductAddedOrUpdated, closeModal, isEffectivelyLoading, renderPaginationControls... remain same)
    const handleProductAddedOrUpdated = () => { 
        refetch();
        setIsAddProductModalOpen(false);
        setEditingProduct(null); 
    };

    const closeModal = () => {
        setIsAddProductModalOpen(false);
        setEditingProduct(null);
    };

    const isEffectivelyLoading = (isLoading && !productsData?.items?.length);

    const renderPaginationControls = () => {
        // ...
        if (!productsData || productsData.count === 0) return null;
        const { currentPage, totalPages, count, pageSize } = productsData;

        return (
            <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 sm:px-6">
                {/* Mobile Pagination */}
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1) }))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                {/* Desktop Pagination */}
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                            {' '}to <span className="font-medium">{Math.min(currentPage * pageSize, count)}</span>
                            {' '}of <span className="font-medium">{count}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <Icon name="chevron_left" className="h-5 w-5" />
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Page {currentPage || 0} of {totalPages || 0}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1) }))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                <Icon name="chevron_right" className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
            <ProductsToolbar
                filters={filters}
                onFilterChange={setFilters}
                sort={sort}
                onSortChange={setSort} // Direct pass-through
                columnVisibility={columnVisibility} // Pass the Set
                onColumnVisibilityChange={setColumnVisibility} // Pass the updater function for the Set
                columnOrder={columnOrder} // Pass the array of keys
                onColumnOrderChange={setColumnOrder} // Pass the updater function for the array
                allColumns={allAvailableColumnsConfig} // Pass full config
                onAddProduct={() => { setEditingProduct(null); setIsAddProductModalOpen(true); }}
                onRefresh={refetch}
            />
            {/* ... rest of the table structure ... */}
            <div className="flex-grow overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <ProductsTableHeader
                        columns={visibleColumns}
                        onSort={handleSort}
                        currentSort={sort}
                    />
                    <ProductsTableBody
                        products={productsData?.items}
                        columns={visibleColumns}
                        isLoading={isEffectivelyLoading}
                        error={error}
                        onUpdateProductField={handleUpdateProductField}
                        colSpan={visibleColumns.length}
                    />
                </table>
            </div>
            {renderPaginationControls()}
            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={closeModal}
                onProductAdded={handleProductAddedOrUpdated}
                initialProductData={editingProduct}
            />
        </div>
    );
};

export default ProductsTable;