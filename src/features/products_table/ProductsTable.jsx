import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

// Hooks and context
import { useUpdateProduct, useDeleteProduct, useProducts } from '../../contexts/ProductDataContext';
import apiService from '../../services/api';

// Subcomponents
import ProductsToolbar from './subcomponents/ProductsToolbar';
import ProductsTableHeader from './subcomponents/ProductsTableHeader';
import ProductsTableBody from './subcomponents/ProductsTableBody';
import AddProductModal from '../add_product_modal/subcomponents/AddProductModal'; // Will be removed, handled by parent
import ConfirmationModal from '../../components/common/ConfirmationModal';

// Utilities & Config
import { initialColumns as allAvailableColumnsConfig, setTableInteractionContext } from './utils/tableConfig';
import { scriptLines_ProductsTable as scriptLines } from './utils/script_lines.js';

const ProductsTable = ({ tableSettings, onEditProduct }) => {
    // Destructure all necessary state and setters from the passed prop
    const {
        columnVisibility, setColumnVisibility,
        columnOrder, setColumnOrder,
        filters, setFilters,
        sort, setSort,
        pagination, setPagination,
        resetTableSettings,
    } = tableSettings;

    // Local state for this component remains for modals and interaction-specific data
    const [updatingStatusProductId, setUpdatingStatusProductId] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState({
        title: '', message: '', onConfirm: () => { }, isLoading: false,
    });
    const [salesData, setSalesData] = useState({}); // State for sales trend data

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

    // Fetch sales data when productsData changes
    useEffect(() => {
        if (productsData?.items && productsData.items.length > 0) {
            const productIds = productsData.items.map(p => p.id).join(',');
            apiService.get(`/products/sales-trends/?ids=${productIds}`)
                .then(response => {
                    setSalesData(response.data);
                })
                .catch(err => {
                    console.error("Failed to fetch sales trends:", err);
                    setSalesData({}); // Clear old data on error
                });
        }
    }, [productsData]);

    // Add refetchProducts to the tableSettings object so parent can call it
    useEffect(() => {
        tableSettings.refetchProducts = refetchProducts;
    }, [refetchProducts, tableSettings]);

    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

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
        if (!allAvailableColumnsConfig.find(col => col.id === columnIdToSort)?.isSortable) return;
        setSort(prevSort => ({
            id: columnIdToSort, desc: prevSort.id === columnIdToSort ? !prevSort.desc : false,
        }));
    }, [setSort]);

    const handleClearFilters = useCallback(() => {
        setFilters({ search: '', category: '', product_type: '', is_active: '', tags: [] });
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        toast.success(scriptLines.productsTable.toasts.filtersCleared);
    }, [setFilters, setPagination]);

    // Set the context for cell renderers to call back with actions
    useEffect(() => {
        setTableInteractionContext({
            onEdit: onEditProduct,
            onDeleteRequest: handleDeleteRequest,
            onStatusToggle: handleStatusToggle,
            isProductStatusUpdating: (pid) => pid === updatingStatusProductId,
            salesData: salesData, // Pass sales data to the context
        });
    }, [onEditProduct, handleDeleteRequest, handleStatusToggle, updatingStatusProductId, salesData]);

    const visibleColumns = useMemo(() => {
        return columnOrder.filter(key => columnVisibility.has(key)).map(key => {
            const colConfig = allAvailableColumnsConfig.find(col => col.id === key);
            return colConfig ? { ...colConfig } : null;
        }).filter(Boolean);
    }, [columnOrder, columnVisibility]);

    // ... (renderPaginationControls remains unchanged) ...
    const renderPaginationControls = () => { /* ... existing implementation ... */ };

    return (
        <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden">
            <ProductsToolbar
                filters={filters} onFilterChange={setFilters}
                sort={sort} onSortChange={setSort}
                columnVisibility={columnVisibility} onColumnVisibilityChange={setColumnVisibility}
                columnOrder={columnOrder} onColumnOrderChange={setColumnOrder}
                allColumns={allAvailableColumnsConfig}
                onAddProduct={() => onEditProduct(null)} // Pass null for new product
                onRefresh={refetchProducts}
                onResetTableSettings={resetTableSettings}
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
                        onAddProductClick={() => onEditProduct(null)}
                        onClearFiltersClick={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </table>
            </div>
            {renderPaginationControls()}
            {/* The AddProductModal is no longer managed here */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalProps.onConfirm} title={confirmModalProps.title}
                message={confirmModalProps.message} isLoading={confirmModalProps.isLoading}
            />
        </div>
    );
};

ProductsTable.propTypes = {
    tableSettings: PropTypes.object.isRequired,
    onEditProduct: PropTypes.func.isRequired,
};

export default ProductsTable;