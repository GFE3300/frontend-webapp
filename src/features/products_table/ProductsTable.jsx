import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTableSettings } from './hooks/useTableSettings';
import { useProducts, useUpdateProduct, useDeleteProduct } from '../../contexts/ProductDataContext';
import ProductsToolbar from './subcomponents/ProductsToolbar';
import ProductsTableHeader from './subcomponents/ProductsTableHeader';
import ProductsTableBody from './subcomponents/ProductsTableBody';
import { initialColumns as allAvailableColumns, setTableActions } from './utils/tableConfig';
import AddProductModal from '../add_product_modal/subcomponents/AddProductModal';
import Icon from '../../components/common/Icon';

const toast = {
    success: (message) => alert(`SUCCESS: ${message}`), // Replace with actual toast
    error: (message) => alert(`ERROR: ${message}`),   // Replace with actual toast
};


const ProductsTable = () => {
    const {
        columnVisibility, setColumnVisibility,
        columnOrder,
        filters, setFilters,
        sort, setSort,
        pagination, setPagination,
    } = useTableSettings();

    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // For editing

    const queryParams = useMemo(() => {
        const params = {
            page: pagination.pageIndex + 1,
            search: filters.search,
            category: filters.category,
            status: filters.is_active,
            product_type: filters.product_type,
            tags: Array.isArray(filters.tags) ? filters.tags.join(',') : '',
            sort: sort.id ? (sort.desc ? `-${sort.id}` : sort.id) : '',
            // pageSize will be handled by useProducts if you add it to useTableSettings
        };
        return params;
    }, [pagination.pageIndex, filters, sort]);

    const { data: productsData, isLoading, error, refetch } = useProducts(queryParams, { keepPreviousData: true });
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct(); // Initialize delete mutation

    const handleUpdateProductField = async (productId, fieldKey, newValue) => {
        try {
            await updateProductMutation.mutateAsync({ productId, data: { [fieldKey]: newValue } });
            toast.success(`Product field '${fieldKey}' updated.`);
            // TanStack Query onSuccess will invalidate and refetch (configured in ProductDataContext)
        } catch (err) {
            console.error("Update failed in table:", err);
            const errorMessage = err.response?.data?.detail || err.response?.data?.[fieldKey]?.[0] || `Failed to update ${fieldKey}.`;
            toast.error(errorMessage);
            throw err; // Re-throw to allow EditableCell to catch and display error
        }
    };

    const handleStatusToggle = useCallback( async (productId, newStatus) => {
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
            if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
                try {
                    await deleteProductMutation.mutateAsync(productId);
                    toast.success(`Product "${productName}" deleted successfully.`);
                    // TanStack Query onSuccess will invalidate and refetch
                } catch (err) {
                    console.error("Delete failed:", err);
                    toast.error(err.response?.data?.detail || `Failed to delete "${productName}".`);
                }
            }
        }, [deleteProductMutation]
    );

    // Pass action handlers to tableConfig
    useEffect(() => {
        setTableActions({
            onEdit: handleEditProduct,
            onDelete: handleDeleteProduct,
            onStatusToggle: handleStatusToggle,
        });
    }, [handleEditProduct, handleDeleteProduct, handleStatusToggle]); // Add dependencies if handlers change based on state/props

    const handleSort = (columnIdToSort) => {
        if (!allAvailableColumns.find(col => col.id === columnIdToSort)?.isSortable) return;

        setSort(prevSort => {
            if (prevSort.id === columnIdToSort) {
                return { id: columnIdToSort, desc: !prevSort.desc };
            }
            return { id: columnIdToSort, desc: false };
        });
    };

    const visibleColumns = useMemo(() => {
        return columnOrder
            .map(colId => allAvailableColumns.find(col => col.id === colId))
            .filter(col => col && columnVisibility[col.id] !== false);
    }, [columnOrder, columnVisibility]);

    const handleProductAddedOrUpdated = () => { // Renamed for clarity
        refetch();
        setIsAddProductModalOpen(false);
        setEditingProduct(null); // Clear editing state
    };

    const closeModal = () => {
        setIsAddProductModalOpen(false);
        setEditingProduct(null);
    };

    const isEffectivelyLoading = (isLoading && !productsData?.items?.length);

    const renderPaginationControls = () => {
        if (!productsData || productsData.count === 0) return null;
        const { currentPage, totalPages, count, pageSize } = productsData; // Added pageSize from productsData

        return (
            <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 sm:px-6">
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
                onSortChange={handleSort} // Direct pass-through
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                allColumns={allAvailableColumns}
                onAddProduct={() => { setEditingProduct(null); setIsAddProductModalOpen(true); }} // Clear editingProduct for new
                onRefresh={refetch}
            />
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
                    // Actions are now handled by tableConfig, no need to pass handlers here
                    />
                </table>
            </div>
            {renderPaginationControls()}
            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={closeModal}
                onProductAdded={handleProductAddedOrUpdated} // Used for both add and update success
                initialProductData={editingProduct} // Pass the product to edit
            />
        </div>
    );
};

export default ProductsTable;