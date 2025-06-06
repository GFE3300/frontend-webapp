// frontend/src/features/products_table/ProductsTable.jsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { useTableSettings } from './hooks/useTableSettings';
import { useProducts, useUpdateProduct, useDeleteProduct } from '../../contexts/ProductDataContext';
import ProductsToolbar from './subcomponents/ProductsToolbar';
import ProductsTableHeader from './subcomponents/ProductsTableHeader';
import ProductsTableBody from './subcomponents/ProductsTableBody';
import { initialColumns as allAvailableColumnsConfig, setTableInteractionContext } from './utils/tableConfig';
import AddProductModal from '../add_product_modal/subcomponents/AddProductModal';
import Icon from '../../components/common/Icon';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Button from '../../components/common/Button';

const ProductsTable = () => {
    const {
        columnVisibility, setColumnVisibility,
        columnOrder, setColumnOrder,
        filters, setFilters,
        sort, setSort,
        pagination, setPagination,
        resetTableSettings
    } = useTableSettings();

    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [updatingStatusProductId, setUpdatingStatusProductId] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState({
        title: '', message: '', onConfirm: () => { }, isLoading: false,
    });

    const tableWrapperRef = useRef(null);

    const queryParams = useMemo(() => ({
        page: pagination.pageIndex + 1,
        search: filters.search,
        category: filters.category,
        status: filters.is_active,
        product_type: filters.product_type,
        tags: Array.isArray(filters.tags) ? filters.tags.join(',') : '',
        sort: sort.id ? (sort.desc ? `-${sort.id}` : sort.id) : '',
    }), [pagination.pageIndex, filters, sort]);

    const {
        data: productsData,
        isLoading: isLoadingProducts,
        error: productsError,
        refetch: refetchProducts
    } = useProducts(queryParams, { keepPreviousData: true });

    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    const hasActiveFilters = useMemo(() => (
        Object.values(filters).some(value => (Array.isArray(value) ? value.length > 0 : !!value && String(value).trim() !== ''))
    ), [filters]);

    const isEffectivelyLoading = (
        isLoadingProducts && !productsData?.items?.length && !updateProductMutation.isLoading && !deleteProductMutation.isLoading
    );

    const parseBackendError = useCallback((err, defaultMessage = "An error occurred.") => {
        const backendErrorData = err.response?.data;
        if (!backendErrorData) return err.message || defaultMessage;
        if (typeof backendErrorData === 'string') return backendErrorData;
        if (backendErrorData.detail) return backendErrorData.detail;
        const firstKey = Object.keys(backendErrorData)[0];
        if (firstKey && Array.isArray(backendErrorData[firstKey])) return `${firstKey}: ${backendErrorData[firstKey][0]}`;
        return JSON.stringify(backendErrorData) || defaultMessage;
    }, []);

    const handleSaveChangesToField = useCallback(async (productId, fieldKey, newValue) => {
        try {
            await updateProductMutation.mutateAsync({ productId, data: { [fieldKey]: newValue } });
            toast.success(`Product field '${fieldKey}' updated.`);
        } catch (err) {
            const errorMessage = parseBackendError(err, `Failed to update ${fieldKey}.`);
            toast.error(errorMessage);
            throw err;
        }
    }, [updateProductMutation, parseBackendError]);

    const handleStatusToggle = useCallback(async (productId, newStatus) => {
        setUpdatingStatusProductId(productId);
        try {
            await updateProductMutation.mutateAsync({ productId, data: { is_active: newStatus } });
            toast.success(`Product status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
        } catch (err) {
            const errorMessage = parseBackendError(err, "Failed to update status.");
            toast.error(errorMessage);
        } finally {
            setUpdatingStatusProductId(null);
        }
    }, [updateProductMutation, parseBackendError]);

    const handleEditProductInModal = useCallback((product) => {
        setEditingProduct(product); setIsAddProductModalOpen(true);
    }, []);

    const confirmDeleteProduct = useCallback(async (productId, productName) => {
        setConfirmModalProps(prev => ({ ...prev, isLoading: true }));
        try {
            await deleteProductMutation.mutateAsync(productId);
            toast.success(`Product "${productName}" deleted successfully.`);
            setIsConfirmModalOpen(false);
        } catch (err) {
            const errorMessage = parseBackendError(err, `Failed to delete "${productName}".`);
            toast.error(errorMessage);
            setConfirmModalProps(prev => ({ ...prev, isLoading: false }));
        }
    }, [deleteProductMutation, parseBackendError]);

    const handleDeleteRequest = useCallback((productId, productName) => {
        setConfirmModalProps({
            title: "Confirm Deletion",
            message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
            onConfirm: () => confirmDeleteProduct(productId, productName),
            isLoading: false,
        });
        setIsConfirmModalOpen(true);
    }, [confirmDeleteProduct]);

    const handleSort = useCallback((columnIdToSort) => {
        if (!allAvailableColumnsConfig.find(col => col.id === columnIdToSort)?.isSortable) return;
        setSort(prevSort => ({
            id: columnIdToSort, desc: prevSort.id === columnIdToSort ? !prevSort.desc : false,
        }));
    }, [setSort]);

    const handleOpenAddProductModal = () => { setEditingProduct(null); setIsAddProductModalOpen(true); };
    const handleProductModalClose = () => { setIsAddProductModalOpen(false); setEditingProduct(null); };
    const handleProductAddedOrUpdatedInModal = () => { refetchProducts(); handleProductModalClose(); };
    const handleClearFilters = useCallback(() => {
        setFilters({ search: '', category: '', product_type: '', is_active: '', tags: [] });
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        toast.success("Filters cleared");
    }, [setFilters, setPagination]);

    useEffect(() => {
        setTableInteractionContext({
            onEdit: handleEditProductInModal,
            onDeleteRequest: handleDeleteRequest,
            onStatusToggle: handleStatusToggle,
            isProductStatusUpdating: (pid) => pid === updatingStatusProductId,
        });
    }, [
        handleEditProductInModal, handleDeleteRequest, handleStatusToggle,
        updatingStatusProductId
    ]);

    const visibleColumns = useMemo(() => {
        const cols = columnOrder
            .filter(key => columnVisibility.has(key))
            .map(key => {
                const colConfig = allAvailableColumnsConfig.find(col => col.id === key);
                if (!colConfig) return null;
                return {
                    ...colConfig,
                    currentWidth: colConfig.size || 150,
                    minWidth: colConfig.minWidth || 50,
                };
            })
            .filter(Boolean);
        return cols;
    }, [columnOrder, columnVisibility, allAvailableColumnsConfig]);


    const renderPaginationControls = () => {
        if (!productsData || productsData.count === 0) return null;
        const { currentPage, totalPages, count, pageSize } = productsData;
        const canPreviousPage = currentPage > 1;
        const canNextPage = currentPage < totalPages;
        const goToPage = (pageIndex) => setPagination(prev => ({ ...prev, pageIndex }));

        return (
            <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <Button onClick={() => goToPage(pagination.pageIndex - 1)} disabled={!canPreviousPage} variant="outline" color="neutral">Previous</Button>
                    <Button onClick={() => goToPage(pagination.pageIndex + 1)} disabled={!canNextPage} variant="outline" color="neutral" className="ml-3">Next</Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div><p className="text-sm text-neutral-700 dark:text-neutral-300">Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, count)}</span> of <span className="font-medium">{count}</span> results</p></div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <Button onClick={() => goToPage(pagination.pageIndex - 1)} disabled={!canPreviousPage} variant="outline" color="neutral" className="relative inline-flex items-center px-2 py-2 rounded-l-md" aria-label="Previous page"><Icon name="chevron_left" className="h-5 w-5" /></Button>
                            <span className="relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">Page {currentPage || 0} of {totalPages || 0}</span>
                            <Button onClick={() => goToPage(pagination.pageIndex + 1)} disabled={!canNextPage} variant="outline" color="neutral" className="relative inline-flex items-center px-2 py-2 rounded-r-md" aria-label="Next page"><Icon name="chevron_right" className="h-5 w-5" /></Button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
            <ProductsToolbar
                filters={filters} onFilterChange={setFilters}
                sort={sort} onSortChange={setSort}
                columnVisibility={columnVisibility} onColumnVisibilityChange={setColumnVisibility}
                columnOrder={columnOrder} onColumnOrderChange={setColumnOrder}
                allColumns={allAvailableColumnsConfig}
                onAddProduct={handleOpenAddProductModal} onRefresh={refetchProducts}
                onResetTableSettings={resetTableSettings}
                onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}
            />

            <div className="flex-grow overflow-x-auto" ref={tableWrapperRef}>
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 table-fixed">
                    <ProductsTableHeader
                        columns={visibleColumns}
                        onSort={handleSort}
                        currentSort={sort}
                    />
                    <ProductsTableBody
                        products={productsData?.items}
                        columns={visibleColumns}
                        isLoading={isEffectivelyLoading}
                        error={productsError}
                        onUpdateProductField={handleSaveChangesToField}
                        updatingStatusProductId={updatingStatusProductId}
                        colSpan={visibleColumns.length || 1}
                        onRetry={refetchProducts}
                        onAddProductClick={handleOpenAddProductModal}
                        onClearFiltersClick={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </table>
            </div>

            {renderPaginationControls()}

            {isAddProductModalOpen && (
                <AddProductModal
                    isOpen={isAddProductModalOpen} onClose={handleProductModalClose}
                    onProductAdded={handleProductAddedOrUpdatedInModal} initialProductData={editingProduct}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalProps.onConfirm} title={confirmModalProps.title}
                message={confirmModalProps.message} isLoading={confirmModalProps.isLoading}
            />
        </div>
    );
};

export default ProductsTable;