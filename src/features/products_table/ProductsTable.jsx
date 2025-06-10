import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';

// Hooks and context
import { useSubscription } from '../../contexts/SubscriptionContext.jsx';
import { useUpdateProduct, useDeleteProduct, useProducts, useBulkUpdateProducts } from '../../contexts/ProductDataContext';
import apiService from '../../services/api';

// Subcomponents
import ProductsToolbar from './subcomponents/ProductsToolbar';
import ProductsTableHeader from './subcomponents/ProductsTableHeader';
import ProductsTableBody from './subcomponents/ProductsTableBody';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Button from '../../components/common/Button.jsx';
import Icon from '../../components/common/Icon.jsx';

// Utilities & Config
import { initialColumns as allAvailableColumnsConfig, setTableInteractionContext, COLUMN_KEYS } from './utils/tableConfig';
import { scriptLines_ProductsTable as scriptLines } from './utils/script_lines.js';

const ProductsTable = ({ tableSettings, onEditProduct }) => {
    const {
        columnVisibility, setColumnVisibility,
        columnOrder, setColumnOrder,
        filters, setFilters,
        sort, setSort,
        pagination, setPagination,
        resetTableSettings,
    } = tableSettings;

    // --- MODIFICATION START ---
    // 2. Use the subscription hook to check the current plan.
    const { subscription } = useSubscription();

    // 3. Define the feature flag based on the subscription plan.
    const isProfitabilityFeatureEnabled = useMemo(() => {
        if (!subscription || !subscription.is_active) return false;
        return ['growth_accelerator', 'premium_pro_suite'].includes(subscription.plan_name);
    }, [subscription]);

    // 4. Create a dynamic list of available columns based on the feature flag.
    const availableColumns = useMemo(() => {
        if (isProfitabilityFeatureEnabled) {
            return allAvailableColumnsConfig; // Return all columns if feature is enabled
        }
        // Filter out the profit margin column if the feature is not enabled.
        return allAvailableColumnsConfig.filter(col => col.id !== COLUMN_KEYS.PROFIT_MARGIN);
    }, [isProfitabilityFeatureEnabled]);
    // --- MODIFICATION END ---


    const [updatingStatusProductId, setUpdatingStatusProductId] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState({
        title: '', message: '', onConfirm: () => { }, isLoading: false,
    });
    const [salesData, setSalesData] = useState({});
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());

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

    const pageProductIds = useMemo(() => productsData?.items?.map(p => p.id) || [], [productsData]);

    useEffect(() => {
        if (productsData?.items && productsData.items.length > 0) {
            const productIds = productsData.items.map(p => p.id).join(',');
            apiService.get(`/products/sales-trends/?ids=${productIds}`)
                .then(response => {
                    setSalesData(response.data);
                })
                .catch(err => {
                    console.error("Failed to fetch sales trends:", err);
                    setSalesData({});
                });
        }
    }, [productsData]);

    useEffect(() => {
        tableSettings.refetchProducts = refetchProducts;
    }, [refetchProducts, tableSettings]);

    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const bulkUpdateMutation = useBulkUpdateProducts();

    const hasActiveFilters = useMemo(() => (
        Object.values(filters).some(value => (Array.isArray(value) ? value.length > 0 : !!value && String(value).trim() !== ''))
    ), [filters]);

    const isEffectivelyLoading = (
        isLoadingProducts && !productsData?.items?.length && !updateProductMutation.isLoading && !deleteProductMutation.isLoading
    );

    const parseBackendError = useCallback((err, defaultMessage) => {
        const backendErrorData = err.response?.data;
        if (!backendErrorData) return err.message || defaultMessage || "An unknown error occurred.";
        if (typeof backendErrorData === 'string') return backendErrorData;
        if (backendErrorData.detail) return backendErrorData.detail;
        const firstKey = Object.keys(backendErrorData)[0];
        if (firstKey && Array.isArray(backendErrorData[firstKey])) return `${firstKey}: ${backendErrorData[firstKey][0]}`;
        return JSON.stringify(backendErrorData);
    }, []);

    const handleToggleRow = useCallback((productId) => {
        setSelectedProductIds(prev => { const n = new Set(prev); n.has(productId) ? n.delete(productId) : n.add(productId); return n; });
    }, []);

    const handleToggleAllRows = useCallback(() => {
        setSelectedProductIds(prev => {
            const newSelected = new Set(prev);
            const selectedOnPageCount = pageProductIds.filter(id => newSelected.has(id)).length;
            if (selectedOnPageCount === pageProductIds.length) {
                pageProductIds.forEach(id => newSelected.delete(id));
            } else {
                pageProductIds.forEach(id => newSelected.add(id));
            }
            return newSelected;
        });
    }, [pageProductIds]);

    const handleSaveChangesToField = useCallback(async (productId, fieldKey, newValue) => {
        try {
            await updateProductMutation.mutateAsync({ productId, data: { [fieldKey]: newValue } });
            toast.success(scriptLines.productsTable.toasts.fieldUpdateSuccess.replace('{fieldKey}', fieldKey));
        } catch (err) {
            const errorMessage = parseBackendError(err, scriptLines.productsTable.toasts.fieldUpdateError.replace('{fieldKey}', fieldKey));
            toast.error(errorMessage);
            throw err;
        }
    }, [updateProductMutation, parseBackendError]);

    const handleStatusToggle = useCallback(async (productId, newStatus) => {
        setUpdatingStatusProductId(productId);
        try {
            await updateProductMutation.mutateAsync({ productId, data: { is_active: newStatus } });
            const statusText = newStatus ? scriptLines.productsTable.status.active : scriptLines.productsTable.status.inactive;
            toast.success(scriptLines.productsTable.toasts.statusUpdateSuccess.replace('{status}', statusText));
        } catch (err) {
            const errorMessage = parseBackendError(err, scriptLines.productsTable.toasts.statusUpdateError);
            toast.error(errorMessage);
        } finally {
            setUpdatingStatusProductId(null);
        }
    }, [updateProductMutation, parseBackendError]);

    const confirmDeleteProduct = useCallback(async (productId, productName) => {
        setConfirmModalProps(prev => ({ ...prev, isLoading: true }));
        try {
            await deleteProductMutation.mutateAsync(productId);
            toast.success(scriptLines.productsTable.toasts.deleteSuccess.replace('{productName}', productName));
            setIsConfirmModalOpen(false);
        } catch (err) {
            const errorMessage = parseBackendError(err, scriptLines.productsTable.toasts.deleteError.replace('{productName}', productName));
            toast.error(errorMessage);
        } finally {
            setConfirmModalProps(prev => ({ ...prev, isLoading: false }));
        }
    }, [deleteProductMutation, parseBackendError]);

    const handleDeleteRequest = useCallback((productId, productName) => {
        setConfirmModalProps({
            title: scriptLines.productsTable.deleteModal.title,
            message: scriptLines.productsTable.deleteModal.message.replace('{productName}', productName),
            onConfirm: () => confirmDeleteProduct(productId, productName),
            isLoading: false,
        });
        setIsConfirmModalOpen(true);
    }, [confirmDeleteProduct]);

    const handleSort = useCallback((columnIdToSort) => {
        // --- MODIFICATION START ---
        // 5. Use `availableColumns` for validation.
        if (!availableColumns.find(col => col.id === columnIdToSort)?.isSortable) return;
        // --- MODIFICATION END ---
        setSort(prevSort => ({
            id: columnIdToSort, desc: prevSort.id === columnIdToSort ? !prevSort.desc : false,
        }));
    }, [setSort, availableColumns]); // Add availableColumns dependency

    const handleClearFilters = useCallback(() => {
        setFilters({ search: '', category: '', product_type: '', is_active: '', tags: [] });
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        toast.success(scriptLines.productsTable.toasts.filtersCleared);
    }, [setFilters, setPagination]);


    const handleBulkAction = useCallback(async (action) => {
        const productIds = Array.from(selectedProductIds);
        if (productIds.length === 0) return;

        const performUpdate = async (updatePayload) => {
            try {
                await bulkUpdateMutation.mutateAsync(updatePayload);
                toast.success("Bulk update successful!");
                setSelectedProductIds(new Set());
            } catch (err) {
                const errorMessage = parseBackendError(err, "Bulk update failed.");
                toast.error(errorMessage);
            }
        };

        switch (action) {
            case 'activate':
                performUpdate({ product_ids: productIds, action: 'set_active', value: true });
                break;
            case 'deactivate':
                performUpdate({ product_ids: productIds, action: 'set_active', value: false });
                break;
            case 'delete':
                setConfirmModalProps({
                    title: `Delete ${productIds.length} Products`,
                    message: `Are you sure you want to permanently delete ${productIds.length} selected products? This action cannot be undone.`,
                    onConfirm: () => {
                        setIsConfirmModalOpen(false);
                        performUpdate({ product_ids: productIds, action: 'delete' });
                    },
                    isLoading: bulkUpdateMutation.isLoading,
                });
                setIsConfirmModalOpen(true);
                break;
            default:
                console.warn(`Unknown bulk action: ${action}`);
        }
    }, [selectedProductIds, bulkUpdateMutation, parseBackendError]);

    useEffect(() => {
        setTableInteractionContext({
            onEdit: onEditProduct,
            onDeleteRequest: handleDeleteRequest,
            onStatusToggle: handleStatusToggle,
            isProductStatusUpdating: (pid) => pid === updatingStatusProductId,
            salesData: salesData,
        });
    }, [
        onEditProduct, handleDeleteRequest, handleStatusToggle,
        updatingStatusProductId, salesData
    ]);

    const visibleColumns = useMemo(() => {
        return columnOrder.map(key => {
            if (!columnVisibility.has(key)) return null;
            // --- MODIFICATION START ---
            // 6. Use `availableColumns` to find the column config.
            return availableColumns.find(col => col.id === key);
            // --- MODIFICATION END ---
        }).filter(Boolean);
    }, [columnOrder, columnVisibility, availableColumns]); // Add availableColumns dependency

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
                // --- MODIFICATION START ---
                // 7. Pass `availableColumns` to the toolbar.
                allColumns={availableColumns}
                // --- MODIFICATION END ---
                onAddProduct={() => onEditProduct(null)}
                onRefresh={refetchProducts}
                onResetTableSettings={resetTableSettings}
                selectedProductIds={selectedProductIds}
                clearSelection={() => setSelectedProductIds(new Set())}
                onBulkAction={handleBulkAction}
            />
            <div className="flex-grow overflow-x-auto" ref={tableWrapperRef}>
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 table-fixed">
                    <ProductsTableHeader
                        columns={visibleColumns}
                        onSort={handleSort}
                        currentSort={sort}
                        pageProductIds={pageProductIds}
                        selectedProductIds={selectedProductIds}
                        onToggleAllRows={handleToggleAllRows}
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
                        onAddProductClick={() => onEditProduct(null)}
                        onClearFiltersClick={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        selectedProductIds={selectedProductIds}
                        onToggleRow={handleToggleRow}
                    />
                </table>
            </div>
            {renderPaginationControls()}
            <ConfirmationModal
                isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalProps.onConfirm} title={confirmModalProps.title}
                message={confirmModalProps.message} isLoading={confirmModalProps.isLoading || bulkUpdateMutation.isLoading}
            />
        </div>
    );
};

ProductsTable.propTypes = {
    tableSettings: PropTypes.object.isRequired,
    onEditProduct: PropTypes.func.isRequired,
};

export default ProductsTable;