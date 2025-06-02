// frontend/src/features/menu_view/Userpage.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// TanStack Query Hooks
import { usePublicTableInfo } from '../../contexts/VenueDataContext';
import {
    usePublicProductsList,
    usePublicCategories,
    usePublicProductTags,
} from '../../contexts/ProductDataContext';

// Common Components
import Spinner from '../../components/common/Spinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import Modal from '../../components/animated_alerts/Modal.jsx'; // For user interaction modals

// Menu Subcomponents
import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
import ProductOptionsPopup from './subcomponents/ProductOptionsPopup';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import OrderSummaryPanel from './subcomponents/OrderSummaryPanel';
import BottomNav from './subcomponents/BottomNav.jsx';
import MenuSearchBar from './subcomponents/MenuSearchBar';
import CategoryFilterBar from './subcomponents/CategoryFilterBar';
import TagFilterPills from './subcomponents/TagFilterPills';

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx'; // Assuming ThemeProvider is at utils/ThemeProvider.jsx
import apiService from '../../services/api'; // For order submission, promo validation

// Helper components for Full Page States
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
const FullPageSpinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 text-center">
        <Spinner size="xl" />
        {message && <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{message}</p>}
    </div>
);


function AppContent() {
    const { theme } = useTheme(); // Assuming useTheme provides 'theme' ("light" | "dark")
    const { businessIdentifier: businessIdentifierFromUrl, tableLayoutItemId } = useParams();
    const shouldReduceMotion = useReducedMotion();

    // Refs
    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);
    const orderDrawerCloseButtonRef = useRef(null);
    const menuDisplayLayoutRef = useRef(null);

    // Venue & User Context
    const [venueContext, setVenueContext] = useState(null);
    const { data: publicTableInfoData, isLoading: isLoadingPublicTableInfo, isError: isPublicTableInfoError, error: publicTableInfoError } =
        usePublicTableInfo(tableLayoutItemId, {
            enabled: !!tableLayoutItemId,
            retry: (failureCount, error) => (error.status === 404 || error.status === 400 ? false : failureCount < 1)
        });

    useEffect(() => {
        if (publicTableInfoData) {
            setVenueContext({
                tableNumber: publicTableInfoData.table_display_number,
                businessName: publicTableInfoData.business_name,
                businessUUID: publicTableInfoData.business_uuid,
                businessIdentifierForAPI: publicTableInfoData.business_slug || businessIdentifierFromUrl,
                userName: 'Guest' // Can be updated by a setup stage if implemented
            });
        }
    }, [publicTableInfoData, businessIdentifierFromUrl]);

    // Page Navigation & Drawer State
    const [currentPage, setCurrentPage] = useState('menu'); // For mobile bottom nav
    const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null); // Category ID or null for "All"
    const [activeTagFilters, setActiveTagFilters] = useState([]); // Array of tag IDs

    // Pagination
    const [productsPagination, setProductsPagination] = useState({ page: 1, pageSize: 20 }); // pageSize can be configurable

    // Data Fetching
    const { data: publicProductsApiResponse, isLoading: isLoadingProductsInitial, isError: isProductsError, error: productsError, isFetching: isFetchingProducts } =
        usePublicProductsList(
            venueContext?.businessIdentifierForAPI,
            {
                category_id: activeCategoryFilter,
                tag_ids: activeTagFilters,
                search_query: searchQuery
            },
            { page: productsPagination.page, page_size: productsPagination.pageSize },
            { enabled: !!venueContext?.businessIdentifierForAPI, keepPreviousData: true }
        );

    const productsData = useMemo(() => publicProductsApiResponse?.results || [], [publicProductsApiResponse]);

    const { data: categoriesDataResult, isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } =
        usePublicCategories(venueContext?.businessIdentifierForAPI, { enabled: !!venueContext?.businessIdentifierForAPI });

    const categoriesData = useMemo(() => {
        const rawData = Array.isArray(categoriesDataResult) ? categoriesDataResult : (categoriesDataResult?.results || []); // Handle direct array or paginated-like structure
        return [...rawData].sort((a, b) => {
            const orderA = a.display_order ?? Infinity;
            const orderB = b.display_order ?? Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return (a.name ?? "").localeCompare(b.name ?? "");
        });
    }, [categoriesDataResult]);

    const { data: publicTagsDataResult, isLoading: isLoadingTags, isError: isTagsError, error: publicTagsError } =
        usePublicProductTags(venueContext?.businessIdentifierForAPI, { enabled: !!venueContext?.businessIdentifierForAPI });

    const publicTagsData = useMemo(() =>
        Array.isArray(publicTagsDataResult) ? publicTagsDataResult : (publicTagsDataResult?.results || []),
        [publicTagsDataResult]);

    // Contextual Tags Display Logic
    const displayedTagsData = useMemo(() => {
        if (!activeCategoryFilter || activeCategoryFilter === null) {
            return publicTagsData; // Show all public tags if "All" categories or no filter
        }
        if (!productsData || productsData.length === 0 || !publicTagsData || publicTagsData.length === 0) {
            return [];
        }
        const tagIdsInFilteredProducts = new Set();
        productsData.forEach(product => {
            // Ensure product is in the active category (API should handle this, but good client-side check)
            if (product.category === activeCategoryFilter && product.product_tags_details) {
                product.product_tags_details.forEach(tagDetail => {
                    if (tagDetail.is_publicly_visible) {
                        tagIdsInFilteredProducts.add(tagDetail.id);
                    }
                });
            }
        });
        return publicTagsData.filter(tag => tagIdsInFilteredProducts.has(tag.id));
    }, [activeCategoryFilter, productsData, publicTagsData]);


    // Categorized Products for Display
    const categorizedProducts = useMemo(() => {
        if (!productsData || productsData.length === 0) return {};

        const categoriesMap = {};
        categoriesData.forEach(cat => {
            if (cat && cat.id) categoriesMap[cat.id] = { ...cat, items: [] };
        });

        const UNCAT_ID = 'uncategorized';
        const UNCAT_DETAILS = { id: UNCAT_ID, name: 'Other Items', color_class: 'bg-neutral-500 dark:bg-neutral-600', icon_name: 'label', display_order: Infinity, items: [] };

        productsData.forEach(product => {
            if (!product || !product.id) return;
            const productWithDisplayOrder = { ...product, display_order: product.display_order ?? Infinity };
            const categoryId = product.category;
            if (categoryId && categoriesMap[categoryId]) {
                categoriesMap[categoryId].items.push(productWithDisplayOrder);
            } else {
                if (!categoriesMap[UNCAT_ID]) {
                    categoriesMap[UNCAT_ID] = { ...UNCAT_DETAILS };
                }
                categoriesMap[UNCAT_ID].items.push(productWithDisplayOrder);
            }
        });

        for (const catId in categoriesMap) {
            categoriesMap[catId].items.sort((a, b) => {
                const orderDiff = (a.display_order) - (b.display_order);
                if (orderDiff !== 0) return orderDiff;
                return (a.name || "").localeCompare(b.name || "");
            });
        }

        const finalCategorizedArray = [];
        // Add sorted categories from `categoriesData` first
        categoriesData.forEach(cat => {
            if (categoriesMap[cat.id] && categoriesMap[cat.id].items.length > 0) {
                finalCategorizedArray.push(categoriesMap[cat.id]);
            }
        });
        // Add "Other Items" if it exists and has items
        if (categoriesMap[UNCAT_ID] && categoriesMap[UNCAT_ID].items.length > 0) {
            finalCategorizedArray.push(categoriesMap[UNCAT_ID]);
        }

        // Convert to object structure expected by MenuDisplayLayout, if still needed, or adapt MenuDisplayLayout
        const finalCategorizedObject = {};
        finalCategorizedArray.forEach(cat => {
            finalCategorizedObject[cat.id] = cat;
        });
        return finalCategorizedObject;

    }, [productsData, categoriesData]);

    // Order State & Callbacks
    const [orderItems, setOrderItems] = useState([]);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null);
    const [flyingItem, setFlyingItem] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [userInteractionModal, setUserInteractionModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });
    const showUserModal = useCallback((title, message, type = 'info', isLoading = false) => setUserInteractionModal({ isOpen: true, title, message, type, isLoading }), []);
    const hideUserModal = useCallback(() => setUserInteractionModal({ isOpen: false, title: '', message: '', type: 'info', isLoading: false }), []);

    const [validatedPromoCode, setValidatedPromoCode] = useState(null);
    // Note: OrderSummaryPanel now handles localOrderNotes. If syncing is needed, pass props.

    // Drawer Toggle & Focus Management
    const toggleOrderDrawer = useCallback(() => setIsOrderDrawerOpen(prev => !prev), []);

    useEffect(() => {
        if (!isDesktop && isOrderDrawerOpen && orderDrawerCloseButtonRef.current) {
            const timer = setTimeout(() => orderDrawerCloseButtonRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isOrderDrawerOpen, isDesktop]);

    useEffect(() => { // Body scroll lock for mobile drawer
        if (!isDesktop && isOrderDrawerOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOrderDrawerOpen, isDesktop]);

    // Order Actions
    const addToOrder = useCallback((itemToAdd, itemImageRect) => {
        setOrderItems(prevOrderItems => {
            const existingItemIndex = prevOrderItems.findIndex(item => item.id === itemToAdd.id);
            if (existingItemIndex > -1) {
                return prevOrderItems.map((item, index) =>
                    index === existingItemIndex ? { ...item, quantity: item.quantity + itemToAdd.quantity } : item
                );
            }
            return [...prevOrderItems, itemToAdd];
        });

        if (itemImageRect && itemToAdd.imageUrl) {
            const endTargetRef = isDesktop ? orderPanelRefDesktop : orderNavTabRefMobile;
            if (endTargetRef.current) {
                setFlyingItem({
                    id: Date.now(), imageUrl: itemToAdd.imageUrl,
                    startRect: itemImageRect, endRect: endTargetRef.current.getBoundingClientRect()
                });
            }
        }
    }, [isDesktop]);

    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        setCurrentItemForOptions({ product, imageRect }); // Store imageRect for addToOrder
        setIsOptionsPopupOpen(true);
    }, []);

    const handleConfirmWithOptions = useCallback((originalProduct, configuredItemDetails) => {
        const { quantity, selectedOptions, finalPricePerItem } = configuredItemDetails;
        const optionsSummary = selectedOptions.map(opt => opt.optionName).join(', ') || null;
        const uniqueOrderItemId = `${originalProduct.id}-${selectedOptions.map(o => o.optionId).join('-') || 'base'}`;

        addToOrder({
            id: uniqueOrderItemId,
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: finalPricePerItem,
            quantity: quantity,
            selectedOptionsSummary: optionsSummary,
            // Potentially store full selectedOptions array if needed for backend
        }, currentItemForOptions?.imageRect); // Use stored imageRect

        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    }, [addToOrder, currentItemForOptions]);

    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        setOrderItems(prevItems => {
            if (newQuantity <= 0) return prevItems.filter(item => item.id !== itemId);
            return prevItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
        });
    }, []);

    const handleApplyPromoCode = useCallback(async (promoCodeString) => {
        if (!venueContext?.businessUUID) {
            setValidatedPromoCode({ error: true, message: "Business context not loaded." });
            return;
        }
        try {
            // API Endpoint: POST /api/discounts/validate-order-promo-code/
            // Body: { business_uuid, promo_code, order_items: [{product_id, quantity, price_per_unit, category_id (optional)}, ...] }
            const simplifiedOrderItems = orderItems.map(item => ({
                product_id: item.originalId, // Use original product ID for validation rules
                quantity: item.quantity,
                price_per_unit: item.price, // Price of this specific configuration per unit
                // category_id: productsData.find(p => p.id === item.originalId)?.category // Optional, if backend needs it
            }));

            const response = await apiService.post('discounts/validate-order-promo-code/', {
                business_uuid: venueContext.businessUUID,
                promo_code: promoCodeString,
                order_items: simplifiedOrderItems,
            });
            // Expected response: { valid: true, code_name, type, discount_amount, public_display_name, message }
            // or { valid: false, message }
            setValidatedPromoCode(response.data);

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.detail || "Invalid or expired promo code.";
            setValidatedPromoCode({ error: true, message: errorMsg, codeName: promoCodeString });
            console.error("Error validating promo code:", error.response || error);
        }
    }, [venueContext, orderItems]);

    const handleRemovePromoCode = useCallback(() => setValidatedPromoCode(null), []);

    const handleConfirmActualOrder = useCallback(async (payloadFromSummaryPanel) => {
        if (!venueContext?.businessUUID || !venueContext?.tableNumber) {
            showUserModal("Error", "Missing venue or table information to place order.", "error");
            return;
        }
        showUserModal("Placing Order...", "Please wait while we submit your order.", "loading", true);
        try {
            // API Endpoint: POST /api/orders/customer-place-order/
            // Body: { business_uuid, table_layout_item_id (from URL), items, subtotal_amount, discount_applied, total_amount, notes }
            const finalPayload = {
                ...payloadFromSummaryPanel,
                business_uuid: venueContext.businessUUID,
                table_layout_item_id: tableLayoutItemId, // from URL params
            };

            await apiService.post('orders/customer-place-order/', finalPayload);

            showUserModal("Order Placed!", "Your order has been successfully submitted. Our staff will attend to you shortly.", "success");
            setOrderItems([]);
            setValidatedPromoCode(null);
            // setOrderNotesText(""); // OrderSummaryPanel handles its local notes
            if (!isDesktop && isOrderDrawerOpen) toggleOrderDrawer();

        } catch (error) {
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to place order. Please try again or alert staff.";
            showUserModal("Order Failed", errorMsg, "error");
            console.error("Error placing order:", error.response || error);
        }
    }, [venueContext, tableLayoutItemId, showUserModal, hideUserModal, isDesktop, isOrderDrawerOpen, toggleOrderDrawer]);

    // Filter & Search Callbacks
    const handleSearchSubmit = useCallback((query) => {
        setSearchQuery(query);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const scrollToProductCard = useCallback((productId) => {
        const cardElement = document.getElementById(`product-card-${productId}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardElement.classList.add('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400', 'transition-all', 'duration-300', 'rounded-2xl'); // Ensure rounded matches card
            setTimeout(() => {
                cardElement.classList.remove('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400');
            }, 2500);
        }
    }, []);

    const handleSuggestionSelect = useCallback((suggestion) => {
        setSearchQuery(''); // Clear search input after selecting a specific suggestion
        if (suggestion.type === 'product') {
            scrollToProductCard(suggestion.id);
            // Optionally refine filters, e.g., show only the product's category:
            // if (suggestion.details?.category_id) {
            //     setActiveCategoryFilter(suggestion.details.category_id);
            //     setActiveTagFilters([]);
            // }
        } else if (suggestion.type === 'category') {
            setActiveCategoryFilter(suggestion.id);
            setActiveTagFilters([]); // Clear tags when a category is directly selected from search
        } else if (suggestion.type === 'tag') {
            setActiveTagFilters(prevTags => prevTags.includes(suggestion.id) ? prevTags : [suggestion.id]); // Example: select only this tag
            // setActiveCategoryFilter(null); // Optionally clear category filter
        }
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, [scrollToProductCard]);

    const handleSelectCategory = useCallback((categoryId) => {
        setActiveCategoryFilter(categoryId);
        // Keep activeTagFilters, user might want to refine within new category + existing tags
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const handleToggleTag = useCallback((tagId) => {
        setActiveTagFilters(prevTags =>
            prevTags.includes(tagId) ? prevTags.filter(id => id !== tagId) : [...prevTags, tagId]
        );
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Loading & Error States
    if (isLoadingPublicTableInfo) return <FullPageSpinner message="Loading Restaurant Info..." />;
    if (isPublicTableInfoError) return <FullPageError message={publicTableInfoError?.message || "Sorry, this link appears to be invalid or the table is not found."} />;
    if (!venueContext) return <FullPageError message="Could not load essential venue information. Please ensure the QR code or link is correct." />;

    // Drawer animation variants
    const drawerTransition = shouldReduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 350, damping: 35, mass: 0.8 };
    const drawerAnimation = { initial: { y: "100%" }, animate: { y: "0%" }, exit: { y: "100%" } };
    const backdropAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-inter flex flex-col">
            <header className="p-4 bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-30">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 truncate font-montserrat">
                                {venueContext.businessName}
                            </h1>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                Table: {venueContext.tableNumber}
                            </p>
                        </div>
                        {/* Theme toggle could go here */}
                    </div>
                    <MenuSearchBar
                        onSearchSubmit={handleSearchSubmit}
                        onSuggestionSelect={handleSuggestionSelect}
                        businessIdentifier={venueContext.businessIdentifierForAPI}
                        className="w-full"
                    />
                </div>
            </header>

            <div className="container mx-auto sticky top-[calc(var(--header-height,8.5rem)+0.25rem)] z-20 bg-slate-100 dark:bg-neutral-900 py-1 shadow-sm">
                {/* Calculate actual header height for sticky top dynamically if possible, or use a fixed estimate like 8.5rem */}
                {/* CSS variable --header-height can be set via JS based on headerRef.current.offsetHeight */}
                {isLoadingCategories ? (
                    <div className="h-12 flex items-center justify-center"><Spinner size="sm" message="Loading categories..." /></div>
                ) : isCategoriesError ? (
                    <div className="h-12 flex items-center justify-center text-red-500 dark:text-red-400 text-xs px-4 text-center"><Icon name="error" className="mr-1 w-4 h-4" />Could not load categories. Menu filtering by category may be affected.</div>
                ) : (
                    <CategoryFilterBar
                        categoriesData={categoriesData}
                        activeCategoryId={activeCategoryFilter}
                        onSelectCategory={handleSelectCategory}
                    />
                )}
                {isLoadingTags ? (
                    <div className="h-10 flex items-center justify-center"><Spinner size="xs" message="Loading tags..." /></div>
                ) : isTagsError ? (
                    <div className="h-10 flex items-center justify-center text-red-500 dark:text-red-400 text-xs px-4 text-center"><Icon name="error" className="mr-1 w-4 h-4" />Could not load tags. Filtering by tags may be affected.</div>
                ) : (
                    <TagFilterPills
                        tagsData={displayedTagsData}
                        activeTagIds={activeTagFilters}
                        onToggleTag={handleToggleTag}
                    />
                )}
            </div>

            <div ref={menuDisplayLayoutRef} className="container mx-auto flex flex-1 flex-col lg:flex-row mt-1 lg:mt-2 min-h-0"> {/* min-h-0 for flex child */}
                {/* Desktop Left Sidebar (Optional) */}
                {isDesktop && (
                    <aside className="w-full lg:w-64 xl:w-72 p-4 pt-0 lg:pt-4 lg:pr-0 shrink-0 hidden lg:block">
                        {/* Content for desktop sidebar, e.g., duplicated filters or info */}
                    </aside>
                )}

                <main className={`flex-1 p-4 min-h-0 ${isOrderDrawerOpen && !isDesktop ? 'overflow-hidden fixed inset-0 pt-[calc(var(--header-height,8.5rem)+2.75rem)]' : 'overflow-y-auto'}`}>
                    {/* Initial product loading state */}
                    {isLoadingProductsInitial && !isFetchingProducts && (
                        <div className="flex justify-center items-center h-64 pt-8"><Spinner size="lg" message="Loading menu..." /></div>
                    )}
                    {/* Error loading products */}
                    {isProductsError && !isLoadingProductsInitial && (
                        <div className="p-4 text-center text-red-500 dark:text-red-400"><Icon name="warning" className="inline mr-2 w-5 h-5" /> Error: {productsError?.message || "Could not load products."}</div>
                    )}

                    {/* MenuDisplayLayout handles its own "fetching while filtered" and "no results" states */}
                    {!isLoadingProductsInitial && !isProductsError && (
                        <MenuDisplayLayout
                            categorizedProducts={categorizedProducts}
                            onOpenOptionsPopup={handleOpenOptionsPopup}
                            isFiltered={!!searchQuery || activeCategoryFilter !== null || activeTagFilters.length > 0}
                            isFetchingWhileFiltered={isFetchingProducts && !isLoadingProductsInitial}
                        />
                    )}
                </main>

                {/* Desktop Right Sidebar for Order Summary */}
                {isDesktop && venueContext && (
                    <aside ref={orderPanelRefDesktop} className="lg:w-80 xl:w-96 p-4 lg:pl-0 shrink-0">
                        <OrderSummaryPanel
                            orderItems={orderItems} onUpdateQuantity={handleUpdateQuantity} onConfirmOrderAction={handleConfirmActualOrder}
                            isSidebarVersion={true} tableNumber={venueContext.tableNumber} userName={venueContext.userName}
                            validatedPromoCode={validatedPromoCode} onApplyPromoCode={handleApplyPromoCode} onRemovePromoCode={handleRemovePromoCode}
                            hidePanelTitle={false}
                        />
                    </aside>
                )}
            </div>

            {!isDesktop && venueContext && (
                <BottomNav
                    currentPage={currentPage} setCurrentPage={setCurrentPage}
                    isOrderDrawerOpen={isOrderDrawerOpen} onToggleOrderDrawer={toggleOrderDrawer}
                    orderItemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    orderTabRefProp={orderNavTabRefMobile}
                />
            )}

            <AnimatePresence>
                {!isDesktop && isOrderDrawerOpen && (
                    <>
                        <motion.div
                            key="order-drawer-backdrop"
                            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-45"
                            variants={backdropAnimation} initial="initial" animate="animate" exit="exit"
                            transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.3, ease: "circOut" }}
                            onClick={toggleOrderDrawer} aria-hidden="true"
                        />
                        <motion.div
                            key="order-drawer-content"
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 shadow-2xl rounded-t-2xl z-50 flex flex-col"
                            style={{ maxHeight: '85vh' }}
                            variants={drawerAnimation} initial="initial" animate="animate" exit="exit"
                            transition={drawerTransition}
                            role="dialog" aria-modal="true" aria-labelledby="order-drawer-title"
                        >
                            <div className="p-3 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                                <h3 id="order-drawer-title" className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 pl-2 font-montserrat">Your Order</h3>
                                <button
                                    ref={orderDrawerCloseButtonRef} onClick={toggleOrderDrawer}
                                    className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 transition-colors"
                                    aria-label="Close order summary"
                                > <Icon name="close" className="w-6 h-6" /> </button>
                            </div>
                            <div className="flex-1 overflow-y-auto"> {/* Scrollable content */}
                                <OrderSummaryPanel
                                    orderItems={orderItems} onUpdateQuantity={handleUpdateQuantity} onConfirmOrderAction={handleConfirmActualOrder}
                                    isSidebarVersion={false} tableNumber={venueContext?.tableNumber} userName={venueContext?.userName}
                                    validatedPromoCode={validatedPromoCode} onApplyPromoCode={handleApplyPromoCode} onRemovePromoCode={handleRemovePromoCode}
                                    navigateToMenu={() => { setCurrentPage('menu'); toggleOrderDrawer(); }}
                                    hidePanelTitle={true}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOptionsPopupOpen && currentItemForOptions && (
                    <ProductOptionsPopup
                        isOpen={isOptionsPopupOpen}
                        onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                        product={currentItemForOptions.product}
                        onConfirmWithOptions={handleConfirmWithOptions}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {flyingItem && (
                    <FlyingItemAnimator
                        key={flyingItem.id} imageUrl={flyingItem.imageUrl} startRect={flyingItem.startRect}
                        endRect={flyingItem.endRect} onAnimationComplete={() => setFlyingItem(null)}
                    />
                )}
            </AnimatePresence>

            <Modal isOpen={userInteractionModal.isOpen} onClose={hideUserModal} title={userInteractionModal.title} type={userInteractionModal.type} isLoading={userInteractionModal.isLoading}>
                <p>{userInteractionModal.message}</p>
            </Modal>
        </div>
    );
}

export default function UserpageWrapper() {
    return <AppContent />;
}