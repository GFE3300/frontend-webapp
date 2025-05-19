// src/components/products_table/hooks/useProductTableState.js
import { useState, useCallback, useMemo } from 'react';

export const useProductTableState = (initialProducts, initialVisibleColumns) => {
    const [products, setProducts] = useState(initialProducts);
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns); // Map of columnKey: boolean
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({}); // e.g., { category: 'Breads', status: 'active' }
    // Add sorting state if needed: { columnKey: 'name', direction: 'asc' }
    const [sortConfig, setSortConfig] = useState(null);


    // Selection handlers
    const handleSelectProduct = useCallback((productId) => {
        setSelectedProductIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(productId)) {
                newSelection.delete(productId);
            } else {
                newSelection.add(productId);
            }
            return newSelection;
        });
    }, []);

    const handleSelectAll = useCallback((isSelectingAll) => {
        if (isSelectingAll) {
            setSelectedProductIds(new Set(products.map(p => p.id)));
        } else {
            setSelectedProductIds(new Set());
        }
    }, [products]);

    const isAllSelected = useMemo(() => products.length > 0 && selectedProductIds.size === products.length, [products, selectedProductIds]);

    // Column visibility
    const toggleColumnVisibility = useCallback((columnKey) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    }, []);

    // Search and Filtering (basic examples)
    const handleSearchChange = useCallback((term) => {
        setSearchTerm(term.toLowerCase());
    }, []);

    const handleFilterChange = useCallback((filterKey, filterValue) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterKey]: filterValue,
        }));
    }, []);

    const clearFilter = useCallback((filterKey) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[filterKey];
            return newFilters;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setActiveFilters({});
        setSearchTerm('');
    }, []);


    // Product data updates (e.g., after status toggle, inline edit, reorder)
    const updateProductData = useCallback((productId, updatedData) => {
        setProducts(prevProducts =>
            prevProducts.map(p => (p.id === productId ? { ...p, ...updatedData } : p))
        );
        // Here you would also trigger an API call to update the backend
    }, []);

    const updateMultipleProducts = useCallback((productIds, dataToUpdate) => {
        setProducts(prevProducts =>
            prevProducts.map(p => (productIds.has(p.id) ? { ...p, ...dataToUpdate } : p))
        );
        // API call for bulk update
    }, []);

    const reorderProducts = useCallback((newOrder) => {
        // `newOrder` would be an array of product IDs in the new sequence
        // This is complex and often involves a library like react-beautiful-dnd
        // For now, just a placeholder for the logic
        // You might update an `order` property on each product
        console.log("Reordering products to:", newOrder);
        // Example: setProducts(reorderedArray);
    }, []);


    // Memoized filtered and sorted products (add sorting later if needed)
    const processedProducts = useMemo(() => {
        let filtered = products;
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value) { // Only filter if value is not empty/null
                filtered = filtered.filter(p => {
                    if (key === 'category') return p.category === value;
                    if (key === 'status') return p.status === value;
                    // Add more filter key logic here
                    return true;
                });
            }
        });
        // Add sorting logic here based on sortConfig
        return filtered.sort((a, b) => a.order - b.order); // Simple sort by `order` property
    }, [products, searchTerm, activeFilters, /* sortConfig */]);


    return {
        products: processedProducts, // Use processed products for display
        setProducts, // To update the base list, e.g., after fetching from API
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
        reorderProducts,
        // sortConfig, setSortConfig (add if implementing sorting)
    };
};