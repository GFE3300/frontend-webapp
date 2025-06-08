import { useState, useMemo, useCallback } from 'react';
import {
    usePublicProductsList,
    usePublicCategories,
    usePublicProductTags,
} from '../../../contexts/ProductDataContext';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION

/**
 * Custom hook to manage fetching and filtering of menu data for the Userpage.
 *
 * @param {string | null | undefined} businessIdentifierForAPI - The identifier for the business.
 * @param {'loading' | 'error' | 'setup' | 'main' | 'orderPlaced'} appStage - The current stage of the Userpage.
 * @returns {object} An object containing menu data, loading/error states, filter states, and filter handlers.
 */
export const useMenuDataAndFilters = (businessIdentifierForAPI, appStage) => {
    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null); // null means 'All'
    const [activeTagFilters, setActiveTagFilters] = useState([]);
    const [productsPagination, setProductsPagination] = useState({ page: 1, pageSize: 20 });

    const isDataFetchingEnabled = !!businessIdentifierForAPI && appStage === 'main';

    // Data Fetching Hooks
    const {
        data: publicProductsApiResponse,
        isLoading: isLoadingProducts,
        isError: isProductsError,
        error: productsError,
        isFetching: isFetchingProducts,
    } = usePublicProductsList(
        businessIdentifierForAPI,
        { category_id: activeCategoryFilter, tag_ids: activeTagFilters, search_query: searchQuery },
        { page: productsPagination.page, page_size: productsPagination.pageSize },
        {
            enabled: isDataFetchingEnabled,
            keepPreviousData: true,
        }
    );

    const isLoadingProductsInitial = isLoadingProducts && !publicProductsApiResponse;

    const {
        data: categoriesDataResult,
        isLoading: isLoadingCategories,
        isError: isCategoriesError,
        error: categoriesError,
    } = usePublicCategories(businessIdentifierForAPI, { enabled: isDataFetchingEnabled });

    const {
        data: allPublicTagsResult,
        isLoading: isLoadingAllPublicTags,
        isError: isAllPublicTagsError,
        error: allPublicTagsError,
    } = usePublicProductTags(businessIdentifierForAPI, { enabled: isDataFetchingEnabled });

    // Memoized Processed Data
    const productsData = useMemo(() => publicProductsApiResponse?.results || [], [publicProductsApiResponse]);

    const categoriesData = useMemo(() => {
        const rawData = Array.isArray(categoriesDataResult) ? categoriesDataResult : (categoriesDataResult?.results || []);
        return [...rawData].sort((a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity) || (a.name ?? "").localeCompare(b.name ?? ""));
    }, [categoriesDataResult]);

    const allPublicTags = useMemo(() => Array.isArray(allPublicTagsResult) ? allPublicTagsResult : (allPublicTagsResult?.results || []), [allPublicTagsResult]);

    const displayedTagsData = useMemo(() => {
        if (isLoadingAllPublicTags || !allPublicTags || allPublicTags.length === 0) return [];
        // If no product filters are active and not currently searching, show all public tags.
        if (activeCategoryFilter === null && activeTagFilters.length === 0 && !searchQuery.trim()) {
            return allPublicTags;
        }
        // Otherwise, filter tags based on currently displayed products or if actively fetching.
        const tagIdsInFilteredProducts = new Set();
        if (productsData && productsData.length > 0) {
            productsData.forEach(product => {
                if (product.product_tags_details && Array.isArray(product.product_tags_details)) {
                    product.product_tags_details.forEach(tagDetail => {
                        if (tagDetail.is_publicly_visible) tagIdsInFilteredProducts.add(tagDetail.id);
                    });
                }
            });
        }
        return allPublicTags.filter(tag => tagIdsInFilteredProducts.has(tag.id) || (productsData.length === 0 && isFetchingProducts));
    }, [activeCategoryFilter, activeTagFilters, searchQuery, productsData, allPublicTags, isLoadingAllPublicTags, isFetchingProducts]);

    const categorizedProducts = useMemo(() => {
        if (!productsData || productsData.length === 0) return {};
        const categoriesMap = {};
        categoriesData.forEach(cat => { if (cat && cat.id) categoriesMap[cat.id] = { ...cat, items: [] }; });
        const UNCAT_ID = 'uncategorized';
        const UNCAT_DETAILS = { id: UNCAT_ID, name: sl.menuDisplayLayout.otherItemsCategory || 'Other Items', color_class: 'bg-neutral-500 dark:bg-neutral-600', icon_name: 'label', display_order: Infinity, items: [] };

        productsData.forEach(product => {
            if (!product || !product.id) return;
            const productWithDisplayOrder = { ...product, display_order: product.display_order ?? Infinity };
            const categoryId = product.category;
            if (categoryId && categoriesMap[categoryId]) {
                categoriesMap[categoryId].items.push(productWithDisplayOrder);
            } else {
                if (!categoriesMap[UNCAT_ID]) categoriesMap[UNCAT_ID] = { ...UNCAT_DETAILS };
                categoriesMap[UNCAT_ID].items.push(productWithDisplayOrder);
            }
        });

        for (const catId in categoriesMap) {
            categoriesMap[catId].items.sort((a, b) => (a.display_order) - (b.display_order) || (a.name || "").localeCompare(b.name || ""));
        }

        const finalCategorizedArray = [];
        categoriesData.forEach(cat => {
            if (categoriesMap[cat.id] && categoriesMap[cat.id].items.length > 0) {
                finalCategorizedArray.push(categoriesMap[cat.id]);
            }
        });
        if (categoriesMap[UNCAT_ID] && categoriesMap[UNCAT_ID].items.length > 0 && !categoriesData.find(c => c.id === UNCAT_ID)) {
            finalCategorizedArray.push(categoriesMap[UNCAT_ID]);
        }

        const finalCategorizedObject = {};
        finalCategorizedArray.forEach(cat => { finalCategorizedObject[cat.id] = cat; });
        return finalCategorizedObject;
    }, [productsData, categoriesData]);

    // Filter Handler Callbacks
    const handleSetSearchQuery = useCallback((query) => {
        setSearchQuery(query);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // For MenuSearchBar's onSearchSubmit
    const handleSearchSubmit = useCallback((query) => {
        handleSetSearchQuery(query);
    }, [handleSetSearchQuery]);

    const handleSelectCategory = useCallback((categoryId) => {
        setActiveCategoryFilter(categoryId);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
        setSearchQuery(''); // Clear search when category changes
        // Optionally clear tag filters too, or leave them based on desired UX
        // setActiveTagFilters([]);
    }, []);

    const handleToggleTag = useCallback((tagId) => {
        setActiveTagFilters(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setActiveCategoryFilter(null);
        setActiveTagFilters([]);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // This can be passed to MenuSearchBar's onSuggestionSelect
    const handleSuggestionSelect = useCallback((suggestion, scrollToProductCardFn) => {
        setSearchQuery(''); // Clear search input after selection
        if (suggestion.type === 'product' && typeof scrollToProductCardFn === 'function') {
            // We need a way to trigger scroll in Userpage.jsx.
            // This hook can't directly do it.
            // The consuming component Userpage.jsx will provide scrollToProductCardFn.
            scrollToProductCardFn(suggestion.id);
        } else if (suggestion.type === 'category') {
            setActiveCategoryFilter(suggestion.id);
        } else if (suggestion.type === 'tag') {
            setActiveTagFilters(prev => prev.includes(suggestion.id) ? prev.filter(id => id !== suggestion.id) : [...prev, suggestion.id]);
        } else if (suggestion.type === 'GeneralSearch') {
            handleSetSearchQuery(suggestion.query);
        }
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, [handleSetSearchQuery]);

    return {
        // Filter States
        searchQuery,
        activeCategoryFilter,
        activeTagFilters,
        productsPagination,

        // Filter Handlers (to be passed to child components like UserPageHeader/SearchBar/FilterBars)
        setSearchQuery: handleSetSearchQuery, // Direct setter if needed, or use more specific handlers
        handleSearchSubmit, // For search bar form submission
        handleSelectCategory,
        handleToggleTag,
        handleSuggestionSelect, // For search bar suggestion selection
        clearAllFilters, // For a "Clear Filters" button

        // Pagination Control
        setProductsPagination,

        // Raw API Responses (optional, if Userpage needs them for some reason)
        // publicProductsApiResponse,
        // categoriesDataResult,
        // allPublicTagsResult,

        // Processed Data for Display
        productsData, // Array of products
        categoriesData, // Sorted array of category objects (for CategoryFilterBar)
        allPublicTags, // Array of all tag objects (potentially for some other UI)
        displayedTagsData, // Filtered array of tag objects (for TagFilterPills)
        categorizedProducts, // Object: { categoryId: { ...category, items: [...] } } (for MenuDisplayLayout)

        // Loading States
        isLoadingProducts,
        isLoadingProductsInitial,
        isFetchingProducts, // True during refetches for filters/pagination
        isLoadingCategories,
        isLoadingAllPublicTags,

        // Error States
        isProductsError,
        productsError,
        isCategoriesError,
        categoriesError,
        isAllPublicTagsError,
        allPublicTagsError,
    };
};