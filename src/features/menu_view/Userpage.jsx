import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// TanStack Query Hooks
import { usePublicTableInfo } from '../../contexts/VenueDataContext';
import {
    usePublicProductsList,
    usePublicCategories,
    usePublicProductTags,
} from '../../contexts/ProductDataContext'; // Updated imports

// Common Components
import Spinner from '../../components/common/Spinner.jsx';
import Icon from '../../components/common/Icon.jsx';
// import Modal from '../../components/animated_alerts/Modal.jsx'; // For future use

// Menu Subcomponents (will be used later)
// import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
// ... other subcomponents

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx'; // Assuming ThemeProvider is global

// Placeholder FullPageError component
const FullPageError = ({ message, iconName = "error_outline" }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-8 text-center">
        <Icon name={iconName} className="w-20 h-20 text-red-500 dark:text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
            Oops! Something went wrong.
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            {message || "We encountered an issue. Please try again or contact support."}
        </p>
    </div>
);

// Placeholder FullPageSpinner component
const FullPageSpinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 text-center">
        <Spinner size="xl" />
        {message && <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{message}</p>}
    </div>
);


function AppContent() {
    const { theme } = useTheme();
    const { businessIdentifier: businessIdentifierFromUrl, tableLayoutItemId } = useParams();

    console.log(`[Userpage] Initializing. Business Identifier from URL: ${businessIdentifierFromUrl}, Table Layout Item ID: ${tableLayoutItemId}`);

    // --- State Management ---
    const [venueContext, setVenueContext] = useState(null); // { tableNumber, businessName, businessUUID, businessSlug, businessIdentifierForAPI }

    const {
        data: publicTableInfoData,
        isLoading: isLoadingPublicTableInfo,
        isError: isPublicTableInfoError,
        error: publicTableInfoError,
    } = usePublicTableInfo(tableLayoutItemId, {
        enabled: !!tableLayoutItemId,
        retry: (failureCount, error) => {
            if (error.status === 404 || error.status === 400) return false;
            return failureCount < 1;
        },
    });

    useEffect(() => {
        if (publicTableInfoData) {
            console.log('[Userpage] publicTableInfoData successfully fetched:', publicTableInfoData);
            setVenueContext({
                tableNumber: publicTableInfoData.table_display_number,
                businessName: publicTableInfoData.business_name,
                businessUUID: publicTableInfoData.business_uuid,
                // Use the slug from the API if available, otherwise fallback to the URL identifier
                businessIdentifierForAPI: publicTableInfoData.business_slug || businessIdentifierFromUrl,
            });
        } else if (isPublicTableInfoError) {
            console.error('[Userpage] Error fetching public table info:', publicTableInfoError);
        }
    }, [publicTableInfoData, isPublicTableInfoError, publicTableInfoError, businessIdentifierFromUrl]);

    // --- Product, Category, Tag Filters and Pagination State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null); // Stores category ID
    const [activeTagFilters, setActiveTagFilters] = useState([]); // Array of tag IDs
    const [productsPagination, setProductsPagination] = useState({
        page: 1,
        pageSize: 20, // Default page size
    });

    // Task 2.2: Fetch Public Products
    const {
        data: publicProductsApiResponse, // This will be { results: [], count, next, previous }
        isLoading: isLoadingProducts,
        isError: isProductsError,
        error: productsError,
        isFetching: isFetchingProducts, // Useful for showing loading state on refetch/pagination
    } = usePublicProductsList(
        venueContext?.businessIdentifierForAPI,
        {
            category_id: activeCategoryFilter,
            tag_ids: activeTagFilters, // Hook expects comma-separated string or handles array
            search_query: searchQuery,
        },
        { page: productsPagination.page, page_size: productsPagination.pageSize },
        { enabled: !!venueContext?.businessIdentifierForAPI } // Enable only when business context is ready
    );

    // Extracted products and pagination info
    const productsData = useMemo(() => publicProductsApiResponse?.results || [], [publicProductsApiResponse]);
    const productsPaginationInfo = useMemo(() => ({
        currentPage: productsPagination.page,
        pageSize: productsPagination.pageSize,
        totalCount: publicProductsApiResponse?.count || 0,
        totalPages: publicProductsApiResponse?.count ? Math.ceil(publicProductsApiResponse.count / productsPagination.pageSize) : 1,
        nextPageUrl: publicProductsApiResponse?.next,
        previousPageUrl: publicProductsApiResponse?.previous,
    }), [publicProductsApiResponse, productsPagination]);


    // Task 2.3: Fetch Public Categories
    const {
        data: categoriesData,
        isLoading: isLoadingCategories,
        isError: isCategoriesError,
        error: categoriesError,
    } = usePublicCategories(venueContext?.businessIdentifierForAPI, {
        enabled: !!venueContext?.businessIdentifierForAPI,
    });

    // Task 2.4: Fetch Public Product Tags
    const {
        data: publicTagsData,
        isLoading: isLoadingTags,
        isError: isTagsError,
        error: publicTagsError,
    } = usePublicProductTags(venueContext?.businessIdentifierForAPI, {
        enabled: !!venueContext?.businessIdentifierForAPI,
    });


    // Task 3: Derived Data & Future State
    const categorizedProducts = useMemo(() => {
        if (!productsData || productsData.length === 0 || !categoriesData || categoriesData.length === 0) {
            if (productsData && productsData.length > 0 && (!categoriesData || categoriesData.length === 0)) {
                // Products exist but no categories, group under a default "All Items" category
                return {
                    all_items: {
                        id: 'all_items_default',
                        name: 'All Items',
                        color_class: 'bg-gray-500',
                        icon_name: 'inventory_2',
                        display_order: 0,
                        items: [...productsData].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
                    },
                };
            }
            return {};
        }

        console.log('[Userpage] Memoizing categorizedProducts...');
        const categoriesMap = {};
        const sortedCategoriesFromData = [...categoriesData].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        sortedCategoriesFromData.forEach(cat => {
            categoriesMap[cat.id] = {
                ...cat, // id, name, color_class, icon_name, display_order
                items: []
            };
        });

        productsData.forEach(product => {
            const categoryId = product.category; // Assuming product.category is the ID
            if (categoryId && categoriesMap[categoryId]) {
                categoriesMap[categoryId].items.push(product);
            } else {
                // Product with no category or category not in fetched list
                if (!categoriesMap['uncategorized']) {
                    categoriesMap['uncategorized'] = {
                        id: 'uncategorized', name: 'Other Items', color_class: 'bg-neutral-500', icon_name: 'label', display_order: 9999, items: []
                    };
                }
                categoriesMap['uncategorized'].items.push(product);
            }
        });

        // Sort items within each category
        Object.values(categoriesMap).forEach(cat => {
            cat.items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        });

        // Filter out categories that ended up with no items *after* product filtering, unless it's the 'uncategorized' one if it has items
        const finalCategorized = {};
        for (const catId in categoriesMap) {
            if (categoriesMap[catId].items.length > 0) {
                finalCategorized[catId] = categoriesMap[catId];
            }
        }
        return finalCategorized;

    }, [productsData, categoriesData]);

    // Future state placeholders
    const [orderItems, setOrderItems] = useState([]);
    const [validatedPromoCode, setValidatedPromoCode] = useState(null);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null);
    const [isOrderSummaryVisibleMobile, setIsOrderSummaryVisibleMobile] = useState(false);
    const [flyingItem, setFlyingItem] = useState(null);


    // --- Loading & Error States ---
    if (isLoadingPublicTableInfo) {
        console.log('[Userpage] Loading initial venue context...');
        return <FullPageSpinner message="Loading Restaurant Info..." />;
    }

    if (isPublicTableInfoError) {
        console.error('[Userpage] CRITICAL ERROR: Failed to load venue context.', publicTableInfoError);
        return (
            <FullPageError
                message={publicTableInfoError?.message || "Sorry, this link appears to be invalid. Please try scanning the QR code again or ask staff for assistance."}
                iconName="error_outline"
            />
        );
    }

    if (!venueContext) {
        console.warn('[Userpage] Venue context is null after loading attempts, showing error.');
        return <FullPageError message="Could not load essential venue information. Please try again." />;
    }

    // --- Main Content Render ---
    // Combined loading state for secondary data
    const isLoadingMenuData = isLoadingProducts || isLoadingCategories || isLoadingTags;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-sans flex flex-col">
            <header className="p-4 bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-30">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 truncate">
                            {venueContext.businessName}
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Table: {venueContext.tableNumber}
                        </p>
                    </div>
                </div>
                <div className="container mx-auto mt-3">
                    <div className="p-2 text-sm bg-neutral-200 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300">
                        Menu Search Bar Placeholder (Value: {searchQuery})
                    </div>
                </div>
            </header>

            <div className="container mx-auto flex flex-1 flex-col lg:flex-row mt-4">
                <aside className="w-full lg:w-64 xl:w-72 p-4 lg:pr-0 shrink-0">
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg shadow mb-4">
                        Category Filter Placeholder
                        {isLoadingCategories && <Spinner size="sm" message="Loading categories..." />}
                        {isCategoriesError && <p className="text-xs text-red-500">Error: {categoriesError.message}</p>}
                        {categoriesData && <p className="text-xs text-neutral-500">({categoriesData.length} categories loaded)</p>}
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg shadow">
                        Tag Filters Placeholder
                        {isLoadingTags && <Spinner size="sm" message="Loading tags..." />}
                        {isTagsError && <p className="text-xs text-red-500">Error: {publicTagsError.message}</p>}
                        {publicTagsData && <p className="text-xs text-neutral-500">({publicTagsData.length} tags loaded)</p>}
                    </div>
                </aside>

                <main className="flex-1 p-4 overflow-y-auto">
                    {isLoadingMenuData && !isFetchingProducts && ( // Show general menu loading if primary data sources are still fetching and not just a product refetch
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" message="Loading menu data..." />
                        </div>
                    )}
                    {isProductsError && (
                        <div className="p-4 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <Icon name="warning" className="w-8 h-8 mx-auto mb-2" />
                            Error loading products: {productsError.message}
                        </div>
                    )}
                    {!isLoadingProducts && !isProductsError && productsData && (
                        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow min-h-[300px]">
                            Menu Display Layout Placeholder
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                (Products: {productsData.length} of {productsPaginationInfo.totalCount})
                                {isFetchingProducts && <Spinner size="xs" className="ml-2" />}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                (Categorized groups: {Object.keys(categorizedProducts).length})
                            </p>
                        </div>
                    )}
                    {!isLoadingMenuData && !isProductsError && productsData.length === 0 && (
                        <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                            No products found for this menu at the moment.
                        </div>
                    )}
                </main>

                <aside className="hidden lg:block lg:w-80 xl:w-96 p-4 lg:pl-0 shrink-0">
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow h-full">
                        Order Summary Panel Placeholder
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                            (Items in order: {orderItems.length})
                        </p>
                    </div>
                </aside>
            </div>

            <footer className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 shadow-t-md z-40 flex justify-around items-center">
                <div>Menu</div>
                <div>Deals</div>
                <div>Order ({orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)})</div>
                <div>Account</div>
            </footer>

            {/* Modals and Global Animators will be added later */}
        </div>
    );
}

export default function UserpageWrapper() {
    return <AppContent />;
}