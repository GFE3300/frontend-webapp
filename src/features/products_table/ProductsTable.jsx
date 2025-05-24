import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTableSettings } from './hooks/useTableSettings';
import { useProducts, useUpdateProduct, useDeleteProduct } from '../../contexts/ProductDataContext';
import ProductsToolbar from './subcomponents/ProductsToolbar';
import ProductsTableHeader from './subcomponents/ProductsTableHeader';
import ProductsTableBody from './subcomponents/ProductsTableBody';
import { initialColumns as allAvailableColumnsConfig, setTableInteractionContext } from './utils/tableConfig'; // Renamed
import AddProductModal from '../add_product_modal/subcomponents/AddProductModal';
import Icon from '../../components/common/Icon';
import ConfirmationModal from '../../components/common/ConfirmationModal'; // Import ConfirmationModal

// Placeholder for a real toast notification system (e.g., react-toastify, sonner)
const toast = {
    success: (message) => console.log(`SUCCESS: ${message}`), // Replace with actual toast call
    error: (message) => console.error(`ERROR: ${message}`),   // Replace with actual toast call
};

const ProductsTable = () => {
    const {
        columnVisibility,
        setColumnVisibility,
        columnOrder,
        setColumnOrder,
        filters, setFilters,
        sort, setSort,
        pagination, setPagination,
        resetTableSettings
    } = useTableSettings();

    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [updatingStatusProductId, setUpdatingStatusProductId] = useState(null); // For status toggle loading

    // State for Confirmation Modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState({
        message: '',
        onConfirm: () => { },
        isLoading: false,
    });


    const queryParams = useMemo(() => {
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
        // This is awaited by EditableCell, which handles its own isSaving state
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

    const handleStatusToggle = useCallback(async (productId, newStatus) => {
        setUpdatingStatusProductId(productId);
        try {
            await updateProductMutation.mutateAsync({ productId, data: { is_active: newStatus } });
            toast.success(`Product status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
        } catch (err) {
            console.error("Status update failed:", err);
            toast.error(err.response?.data?.detail || "Failed to update status.");
            // Optionally refetch or revert UI state here if mutation doesn't handle it
        } finally {
            setUpdatingStatusProductId(null);
        }
    }, [updateProductMutation]);

    const handleEditProduct = useCallback((product) => {
        setEditingProduct(product);
        setIsAddProductModalOpen(true);
    }, []);

    const handleDeleteRequest = useCallback((productId, productName) => {
        setConfirmModalProps({
            title: "Confirm Deletion",
            message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
            onConfirm: () => confirmDeleteProduct(productId, productName),
            isLoading: false,
        });
        setIsConfirmModalOpen(true);
    }, []);

    const confirmDeleteProduct = async (productId, productName) => {
        setConfirmModalProps(prev => ({ ...prev, isLoading: true }));
        try {
            await deleteProductMutation.mutateAsync(productId);
            toast.success(`Product "${productName}" deleted successfully.`);
            setIsConfirmModalOpen(false);
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.detail || `Failed to delete "${productName}".`);
            // Keep modal open to show error or close and show toast
            setConfirmModalProps(prev => ({ ...prev, isLoading: false, message: `Error: ${err.response?.data?.detail || "Failed to delete."}` })); // Example: update message
            // Or simply:
            // setConfirmModalProps(prev => ({ ...prev, isLoading: false }));
            // setIsConfirmModalOpen(false); // if you want to close it and rely on toast
        } finally {
            // Ensure isLoading is false if modal isn't closed on error
            if (isConfirmModalOpen) { // Check if modal might still be open
                setConfirmModalProps(prev => ({ ...prev, isLoading: false }));
            }
        }
    };

    useEffect(() => {
        setTableInteractionContext({ // Use the renamed setter
            onEdit: handleEditProduct,
            onDeleteRequest: handleDeleteRequest, // Pass request handler
            onStatusToggle: handleStatusToggle,
            isProductStatusUpdating: (pid) => pid === updatingStatusProductId,
        });
    }, [handleEditProduct, handleDeleteRequest, handleStatusToggle, updatingStatusProductId]);


    const handleSort = (columnIdToSort) => {
        if (!allAvailableColumnsConfig.find(col => col.id === columnIdToSort)?.isSortable) return;
        setSort(prevSort => {
            if (prevSort.id === columnIdToSort) {
                return { id: columnIdToSort, desc: !prevSort.desc };
            }
            return { id: columnIdToSort, desc: false };
        });
    };

    const visibleColumns = useMemo(() => {
        return columnOrder
            .filter(key => columnVisibility.has(key))
            .map(key => allAvailableColumnsConfig.find(col => col.id === key))
            .filter(Boolean);
    }, [columnOrder, columnVisibility]);

    const handleProductAddedOrUpdated = () => {
        refetch();
        setIsAddProductModalOpen(false);
        setEditingProduct(null);
    };

    const closeModal = () => {
        setIsAddProductModalOpen(false);
        setEditingProduct(null);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };

    const isEffectivelyLoading = (isLoading && !productsData?.items?.length && !updateProductMutation.isLoading && !deleteProductMutation.isLoading);

    const renderPaginationControls = () => {
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
                onSortChange={setSort}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnOrder={columnOrder}
                onColumnOrderChange={setColumnOrder}
                allColumns={allAvailableColumnsConfig}
                onAddProduct={() => { setEditingProduct(null); setIsAddProductModalOpen(true); }}
                onRefresh={refetch}
                onResetTableSettings={resetTableSettings}
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
                        onUpdateProductField={handleUpdateProductField} // This prop is still needed by ProductsTableCell for EditableCell
                        colSpan={visibleColumns.length}
                    // No need to pass updatingStatusProductId here, tableConfig handles it via context
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
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModalProps.onConfirm}
                title={confirmModalProps.title}
                message={confirmModalProps.message}
                isLoading={confirmModalProps.isLoading}
            />
        </div>
    );
};

export default ProductsTable;