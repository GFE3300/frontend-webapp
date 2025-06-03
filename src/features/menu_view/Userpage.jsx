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
import Modal from '../../components/animated_alerts/Modal.jsx'; // User Interaction Modal

// Menu Subcomponents
import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
import ProductDetailModal from './subcomponents/ProductDetailModal.jsx';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import OrderSummaryPanel from './subcomponents/OrderSummaryPanel';
import BottomNav from './subcomponents/BottomNav.jsx';
import MenuSearchBar from './subcomponents/MenuSearchBar';
import CategoryFilterBar from './subcomponents/CategoryFilterBar';
import TagFilterPills from './subcomponents/TagFilterPills.jsx';
import SetupStage from './subcomponents/SetupStage.jsx';

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx';
import apiService from '../../services/api'; // Used for onConfirmOrderAction (though logic is passed in)

// --- Styling Constants from Design Guidelines ---
// Color Palette (Guideline 2.1)
const PAGE_BG_LIGHT = "bg-neutral-100"; // Light BG (similar to neutral-100)
const PAGE_BG_DARK = "dark:bg-neutral-900"; // Dark BG (darkest neutral)
const HEADER_AREA_BG_LIGHT = "bg-white"; // Header and filter bar area
const HEADER_AREA_BG_DARK = "dark:bg-neutral-800";
const HEADER_AREA_SHADOW = "shadow-md"; // For sticky header/filter area

// Typography (Guideline 2.2) - Applied within subcomponents, ensure Userpage uses FONT_INTER for any direct text.
const FONT_INTER = "font-inter";
const FONT_MONTSERRAT = "font-montserrat";

// Error/Loading State Styling (Guideline 4.5 Feedback)
const FULL_PAGE_STATE_BG_LIGHT = "bg-neutral-100";
const FULL_PAGE_STATE_BG_DARK = "dark:bg-neutral-900";
const FULL_PAGE_ERROR_ICON_COLOR = "text-red-500 dark:text-red-400";
const FULL_PAGE_TEXT_PRIMARY = "text-neutral-700 dark:text-neutral-200";
const FULL_PAGE_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-400";
const FULL_PAGE_BUTTON_BG = "bg-rose-500 hover:bg-rose-600"; // Primary button
const FULL_PAGE_BUTTON_TEXT = "text-white";

// Spacing (Guideline 3.2)
const CONTAINER_PADDING_X = "px-4 md:px-6"; // Horizontal padding for main content container
const HEADER_AREA_PADDING_Y = "py-3 sm:py-4"; // Vertical padding for header section
const MAIN_CONTENT_MARGIN_TOP_MOBILE = "mt-1"; // Small margin for mobile
const MAIN_CONTENT_MARGIN_TOP_DESKTOP = "lg:mt-2"; // Slightly larger for desktop

const PANEL_BG_DRAWER = "bg-white dark:bg-neutral-800";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const ROSE_RING_FOCUS = "focus:ring-rose-500 dark:focus:ring-rose-400";

// Helper components for Full Page States
const FullPageError = ({ message, iconName = "error_outline", onRetry }) => (
    <div className={`flex flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} p-8 text-center ${FONT_INTER}`}>
        <Icon name={iconName} className={`w-20 h-20 ${FULL_PAGE_ERROR_ICON_COLOR} mb-6`} />
        <h2 className={`text-2xl font-semibold ${FULL_PAGE_TEXT_PRIMARY} mb-3 ${FONT_MONTSERRAT}`}>
            Oops! Something went wrong.
        </h2>
        <p className={`${FULL_PAGE_TEXT_SECONDARY} max-w-md mb-6`}>
            {message || "We encountered an issue. Please try again or contact support."}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                className={`${FULL_PAGE_BUTTON_BG} ${FULL_PAGE_BUTTON_TEXT} font-semibold py-2 px-6 rounded-lg shadow-md transition-colors`} // Guideline 6.1
            >
                Try Again
            </button>
        )}
    </div>
);
const FullPageSpinner = ({ message }) => (
    <div className={`flex flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} text-center ${FONT_INTER}`}>
        <Spinner size="xl" /> {/* Spinner color should adapt or be set via props (Guideline 4.5) */}
        {message && <p className={`mt-4 text-lg ${FULL_PAGE_TEXT_SECONDARY}`}>{message}</p>}
    </div>
);


function AppContent() {
    const { theme } = useTheme();
    const { tableLayoutItemId } = useParams();
    const shouldReduceMotion = useReducedMotion(); // Guideline 4.1

    const [appStage, setAppStage] = useState('loading'); // loading, error, setup, main, orderPlaced

    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);
    const orderDrawerCloseButtonRef = useRef(null);
    const menuDisplayLayoutRef = useRef(null); // For potential scroll interactions

    const [venueContext, setVenueContext] = useState(null);
    const {
        data: publicTableInfoData,
        isLoading: isLoadingPublicTableInfo,
        isError: isPublicTableInfoError,
        error: publicTableInfoError,
        refetch: refetchPublicTableInfo
    } = usePublicTableInfo(tableLayoutItemId, {
        enabled: !!tableLayoutItemId, // Only run if tableLayoutItemId is present
        retry: (failureCount, error) => (error.status === 404 || error.status === 400 ? false : failureCount < 1)
    });

    useEffect(() => {
        if (!tableLayoutItemId) {
            setAppStage('error'); // Error if no table ID in URL
            return;
        }
        if (isLoadingPublicTableInfo) setAppStage('loading');
        else if (isPublicTableInfoError) setAppStage('error');
        else if (publicTableInfoData) {
            setVenueContext({
                tableNumber: publicTableInfoData.table_display_number,
                businessName: publicTableInfoData.business_name,
                businessUUID: publicTableInfoData.business_uuid,
                // Use slug for API calls if available, otherwise UUID
                businessIdentifierForAPI: publicTableInfoData.business_slug || publicTableInfoData.business_uuid,
                userName: 'Guest', // Default, to be updated by SetupStage
                numberOfPeople: 1, // Default
            });
            setAppStage('setup');
        }
    }, [publicTableInfoData, isLoadingPublicTableInfo, isPublicTableInfoError, tableLayoutItemId]);

    const handleSetupComplete = useCallback((setupData) => {
        setVenueContext(prev => ({
            ...prev,
            userName: setupData.userName,
            numberOfPeople: setupData.numberOfPeople,
        }));
        setAppStage('main');
    }, []);

    // State for menu interactions
    const [currentPage, setCurrentPage] = useState('menu'); // For BottomNav logic
    const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null); // null means 'All'
    const [activeTagFilters, setActiveTagFilters] = useState([]);
    const [productsPagination, setProductsPagination] = useState({ page: 1, pageSize: 20 }); // Default page size

    const {
        data: publicProductsApiResponse,
        isLoading: isLoadingProducts,
        isError: isProductsError,
        error: productsError, // To be passed to MenuDisplayLayout if needed
        isFetching: isFetchingProducts
    } = usePublicProductsList(
        venueContext?.businessIdentifierForAPI,
        { category_id: activeCategoryFilter, tag_ids: activeTagFilters, search_query: searchQuery },
        { page: productsPagination.page, page_size: productsPagination.pageSize },
        {
            enabled: !!venueContext?.businessIdentifierForAPI && appStage === 'main',
            keepPreviousData: true // Good for UX with pagination/filtering
        }
    );

    // isLoadingProductsInitial will be true only for the very first load.
    // Subsequent fetches due to filter/pagination changes will have isLoadingProducts=true AND isFetchingProducts=true.
    const isLoadingProductsInitial = isLoadingProducts && !publicProductsApiResponse;


    const productsData = useMemo(() => publicProductsApiResponse?.results || [], [publicProductsApiResponse]);

    const { data: categoriesDataResult, isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } =
        usePublicCategories(venueContext?.businessIdentifierForAPI, { enabled: !!venueContext?.businessIdentifierForAPI && appStage === 'main' });

    const categoriesData = useMemo(() => { /* ... existing memo ... */
        const rawData = Array.isArray(categoriesDataResult) ? categoriesDataResult : (categoriesDataResult?.results || []);
        return [...rawData].sort((a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity) || (a.name ?? "").localeCompare(b.name ?? ""));
    }, [categoriesDataResult]);

    const { data: allPublicTagsResult, isLoading: isLoadingAllPublicTags, isError: isAllPublicTagsError, error: allPublicTagsError } =
        usePublicProductTags(venueContext?.businessIdentifierForAPI, { enabled: !!venueContext?.businessIdentifierForAPI && appStage === 'main' });

    const allPublicTags = useMemo(() => Array.isArray(allPublicTagsResult) ? allPublicTagsResult : (allPublicTagsResult?.results || []), [allPublicTagsResult]);
    const displayedTagsData = useMemo(() => { /* ... existing memo ... */
        if (isLoadingAllPublicTags || !allPublicTags || allPublicTags.length === 0) return [];
        if (activeCategoryFilter === null && activeTagFilters.length === 0 && !searchQuery) return allPublicTags; // Show all if no product filters active

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
        // Only show tags that are present in the currently displayed (filtered) products OR if no products are filtered yet.
        return allPublicTags.filter(tag => tagIdsInFilteredProducts.has(tag.id) || (productsData.length === 0 && isFetchingProducts));

    }, [activeCategoryFilter, activeTagFilters, searchQuery, productsData, allPublicTags, isLoadingAllPublicTags, isFetchingProducts]);

    const categorizedProducts = useMemo(() => { /* ... existing memo ... */
        if (!productsData || productsData.length === 0) return {};
        const categoriesMap = {};
        categoriesData.forEach(cat => { if (cat && cat.id) categoriesMap[cat.id] = { ...cat, items: [] }; });
        const UNCAT_ID = 'uncategorized';
        const UNCAT_DETAILS = { id: UNCAT_ID, name: 'Other Items', color_class: 'bg-neutral-500 dark:bg-neutral-600', icon_name: 'label', display_order: Infinity, items: [] };
        productsData.forEach(product => {
            if (!product || !product.id) return;
            const productWithDisplayOrder = { ...product, display_order: product.display_order ?? Infinity };
            const categoryId = product.category; // This is just an ID
            if (categoryId && categoriesMap[categoryId]) categoriesMap[categoryId].items.push(productWithDisplayOrder);
            else {
                if (!categoriesMap[UNCAT_ID]) categoriesMap[UNCAT_ID] = { ...UNCAT_DETAILS };
                categoriesMap[UNCAT_ID].items.push(productWithDisplayOrder);
            }
        });
        for (const catId in categoriesMap) categoriesMap[catId].items.sort((a, b) => (a.display_order) - (b.display_order) || (a.name || "").localeCompare(b.name || ""));

        const finalCategorizedArray = [];
        // Order by original categoriesData order
        categoriesData.forEach(cat => {
            if (categoriesMap[cat.id] && categoriesMap[cat.id].items.length > 0) finalCategorizedArray.push(categoriesMap[cat.id]);
        });
        if (categoriesMap[UNCAT_ID] && categoriesMap[UNCAT_ID].items.length > 0 && !categoriesData.find(c => c.id === UNCAT_ID)) {
            finalCategorizedArray.push(categoriesMap[UNCAT_ID]);
        }

        const finalCategorizedObject = {};
        finalCategorizedArray.forEach(cat => { finalCategorizedObject[cat.id] = cat; });
        return finalCategorizedObject;
    }, [productsData, categoriesData]);


    // Order State
    const [orderItems, setOrderItems] = useState([]);
    const [flyingItem, setFlyingItem] = useState(null); // For add-to-cart animation
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024); // Guideline 3.3 Responsive Breakpoints (lg: 1024px)

    // Modal States
    const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
    const [currentProductForDetailModal, setCurrentProductForDetailModal] = useState(null);
    const [userInteractionModal, setUserInteractionModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });

    // --- Effects ---
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showUserModal = useCallback((title, message, type = 'info', isLoading = false) => setUserInteractionModal({ isOpen: true, title, message, type, isLoading }), []);
    const hideUserModal = useCallback(() => setUserInteractionModal({ isOpen: false, title: '', message: '', type: 'info', isLoading: false }), []);
    const toggleOrderDrawer = useCallback(() => setIsOrderDrawerOpen(prev => !prev), []);

    useEffect(() => { // Focus management for order drawer (Guideline 7 Accessibility)
        if (!isDesktop && isOrderDrawerOpen && orderDrawerCloseButtonRef.current) {
            const timer = setTimeout(() => orderDrawerCloseButtonRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isOrderDrawerOpen, isDesktop]);

    useEffect(() => { // Prevent body scroll when drawer is open on mobile (Guideline 4.x UX)
        if (!isDesktop && isOrderDrawerOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOrderDrawerOpen, isDesktop]);


    // --- Callbacks ---
    const addToOrder = useCallback((itemToAdd, itemImageRect) => { /* ... existing ... */
        setOrderItems(prevOrderItems => {
            const existingItemIndex = prevOrderItems.findIndex(item => item.id === itemToAdd.id);
            if (existingItemIndex > -1) return prevOrderItems.map((item, index) => index === existingItemIndex ? { ...item, quantity: item.quantity + itemToAdd.quantity } : item);
            return [...prevOrderItems, itemToAdd];
        });
        if (itemImageRect && itemToAdd.imageUrl) {
            const endTargetRef = isDesktop ? orderPanelRefDesktop : orderNavTabRefMobile;
            if (endTargetRef.current) setFlyingItem({ id: Date.now(), imageUrl: itemToAdd.imageUrl, startRect: itemImageRect, endRect: endTargetRef.current.getBoundingClientRect() });
        }
    }, [isDesktop]);

    const handleOpenProductDetailModal = useCallback((product, imageRect) => {
        setCurrentProductForDetailModal(product);
        setIsProductDetailModalOpen(true);
    }, []);

    const handleConfirmProductDetailModal = useCallback((originalProduct, configuredItemDetails) => { /* ... existing ... */
        const { quantity, selectedOptions, finalPricePerItem } = configuredItemDetails;
        const optionsSummary = selectedOptions.map(opt => opt.name).join(', ') || null;
        const selectedOptionIdsString = selectedOptions.map(o => o.id).sort().join('-');
        const uniqueOrderItemId = `${originalProduct.id}-${selectedOptionIdsString || 'base'}`;

        addToOrder({
            id: uniqueOrderItemId,
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: finalPricePerItem,
            quantity: quantity,
            selectedOptionsSummary: optionsSummary,
            detailedSelectedOptions: selectedOptions
        }, null);

        setIsProductDetailModalOpen(false);
        setCurrentProductForDetailModal(null);
    }, [addToOrder]);

    const handleUpdateQuantity = useCallback((itemId, newQuantity) => { /* ... existing ... */
        setOrderItems(prevItems => {
            if (newQuantity <= 0) return prevItems.filter(item => item.id !== itemId);
            return prevItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
        });
    }, []);

    const handleConfirmOrderAction = useCallback(async (payloadFromSummaryPanel) => { /* ... existing ... */
        showUserModal("Placing Order...", "Please wait while we submit your order.", "loading", true);
        try {
            const response = await apiService.post('orders/create/', payloadFromSummaryPanel); // Assuming apiService handles POST correctly
            showUserModal("Order Placed!", `Your order (${String(response.data.id).substring(0, 8)}...) has been successfully submitted. Pickup code: ${response.data.pickup_code || 'N/A'}.`, "success");
            setOrderItems([]);
            if (!isDesktop && isOrderDrawerOpen) toggleOrderDrawer();
            setAppStage('orderPlaced');
        } catch (error) {
            console.error("[Userpage] Error placing order:", error);
            let errorMsg = "Failed to place order. Please try again or alert staff.";
            if (error.response?.data) { /* ... error parsing ... */ }
            else if (error.message) errorMsg = error.message;
            showUserModal("Order Failed", errorMsg, "error");
        }
    }, [showUserModal, isDesktop, isOrderDrawerOpen, toggleOrderDrawer]);

    const handleSearchSubmit = useCallback((query) => { setSearchQuery(query); setProductsPagination(prev => ({ ...prev, page: 1 })); }, []);
    const scrollToProductCard = useCallback((productId) => { /* ... existing ... */
        const cardElement = document.getElementById(`product-card-${productId}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardElement.classList.add('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400', 'transition-all', 'duration-300', 'rounded-2xl');
            setTimeout(() => cardElement.classList.remove('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400'), 2500);
        }
    }, []);
    const handleSuggestionSelect = useCallback((suggestion) => { /* ... existing ... */
        setSearchQuery('');
        if (suggestion.type === 'product') scrollToProductCard(suggestion.id);
        else if (suggestion.type === 'category') setActiveCategoryFilter(suggestion.id);
        else if (suggestion.type === 'tag') setActiveTagFilters(prev => prev.includes(suggestion.id) ? prev.filter(id => id !== suggestion.id) : [...prev, suggestion.id]);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, [scrollToProductCard]);
    const handleSelectCategory = useCallback((categoryId) => { setActiveCategoryFilter(categoryId); setProductsPagination(prev => ({ ...prev, page: 1 })); }, []);
    const handleToggleTag = useCallback((tagId) => { /* ... existing ... */
        setActiveTagFilters(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // --- Conditional Rendering for App Stages ---
    if (appStage === 'loading') return <FullPageSpinner message={!tableLayoutItemId ? "Invalid link..." : "Loading Restaurant Info..."} />;
    if (appStage === 'error') {
        const canRetryTableInfo = publicTableInfoError && typeof refetchPublicTableInfo === 'function';
        return <FullPageError message={publicTableInfoError?.message || "Sorry, this link appears to be invalid or the table/restaurant is not found."} onRetry={canRetryTableInfo ? refetchPublicTableInfo : undefined} />;
    }
    if (appStage === 'setup') return <SetupStage tableNumber={venueContext?.tableNumber || "N/A"} onSetupComplete={handleSetupComplete} theme={theme} />;
    if (appStage === 'orderPlaced') {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen bg-green-50 dark:bg-green-900/30 p-8 text-center ${FONT_INTER}`}>
                <Icon name="check_circle" className="w-24 h-24 text-green-500 dark:text-green-400 mb-6" />
                <h2 className={`text-3xl font-bold text-green-700 dark:text-green-200 mb-4 ${FONT_MONTSERRAT}`}>Order Confirmed!</h2>
                <p className="text-green-600 dark:text-green-300 max-w-md mb-8"> Thank you! Your order has been successfully placed. Our team is on it. </p>
                <button onClick={() => { setOrderItems([]); setAppStage('main'); }}
                    className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors`} // Guideline 6.1 Success Button
                > Place Another Order </button>
            </div>
        );
    }

    // Framer Motion transition variants (Guideline 4.3)
    const drawerTransition = shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 35, mass: 0.8 };
    const drawerAnimation = { initial: { y: "100%" }, animate: { y: "0%" }, exit: { y: "100%" } };
    const backdropAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

    return (
        // Main page container (Guideline colors, fonts)
        <div className={`min-h-screen ${PAGE_BG_LIGHT} ${PAGE_BG_DARK} ${FONT_INTER} flex flex-col`} role="document">
            {/* Header Area (Guideline 6.7 Headers, 2.1 Colors, 2.5 Shadows, 3.2 Spacing) */}
            <header className={`${CONTAINER_PADDING_X} ${HEADER_AREA_PADDING_Y} ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} ${HEADER_AREA_SHADOW} sticky top-0 z-30`} role="banner">
                {/* This container div is important for max-w-7xl if applied globally */}
                <div className="container mx-auto"> {/* Or max-w-7xl if that's the grid system max width */}
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            {/* Business Name (Guideline 2.2 H1: Montserrat Bold, 36px) */}
                            <h1 className={`text-xl sm:text-2xl font-bold ${FONT_MONTSERRAT} ${FULL_PAGE_TEXT_PRIMARY} truncate`}>
                                {venueContext?.businessName || "Restaurant Menu"}
                            </h1>
                            {/* Context Info (Guideline 2.2 Body Small) */}
                            <p className={`text-xs sm:text-sm ${FULL_PAGE_TEXT_SECONDARY}`}>
                                Table: {venueContext?.tableNumber || "N/A"} • Guests: {venueContext?.numberOfPeople || 1} • For: {venueContext?.userName || "Guest"}
                            </p>
                        </div>
                    </div>
                    <MenuSearchBar
                        onSearchSubmit={handleSearchSubmit}
                        onSuggestionSelect={handleSuggestionSelect}
                        businessIdentifier={venueContext?.businessIdentifierForAPI}
                        className="w-full" // SearchBar component handles its own styling
                    />
                </div>
            </header>

            {/* Filter Bars Area (Guideline 6.7 Tabs/Segmented Controls (styling for active/inactive), 3.2 Spacing) */}
            {/* Using calc for sticky top positioning: adjust --header-height CSS variable if header height changes */}
            <div style={{ '--header-height': '9rem' }} /* Approximate header height, adjust as needed */
                className={`${CONTAINER_PADDING_X} sticky top-[calc(var(--header-height)+0rem)] sm:top-[calc(var(--header-height)+0rem)] z-20 ${HEADER_AREA_BG_LIGHT} ${HEADER_AREA_BG_DARK} py-1 ${HEADER_AREA_SHADOW} sm:shadow-sm`}>
                <div className="container mx-auto"> {/* Or max-w-7xl */}
                    <CategoryFilterBar
                        categoriesData={categoriesData}
                        activeCategoryId={activeCategoryFilter}
                        onSelectCategory={handleSelectCategory}
                        isLoading={isLoadingCategories}
                        isError={isCategoriesError}
                        error={categoriesError}
                    />
                    <TagFilterPills
                        tagsData={displayedTagsData}
                        activeTagIds={activeTagFilters}
                        onToggleTag={handleToggleTag}
                        isLoading={isLoadingAllPublicTags}
                        isError={isAllPublicTagsError}
                        error={allPublicTagsError}
                    />
                </div>
            </div>

            {/* Main Content Area (Guideline 3.1 Grid System, 3.2 Spacing) */}
            <div ref={menuDisplayLayoutRef} className={`container mx-auto flex flex-1 flex-col lg:flex-row ${MAIN_CONTENT_MARGIN_TOP_MOBILE} ${MAIN_CONTENT_MARGIN_TOP_DESKTOP} min-h-0`}>
                {/* Placeholder for potential left sidebar on desktop, hidden for now or use for ads/info */}
                {isDesktop && (<aside className="w-full lg:w-64 xl:w-72 p-4 pt-0 lg:pt-4 lg:pr-0 shrink-0 hidden lg:block" role="complementary"></aside>)}

                {/* Products Display (Guideline 7 Semantic HTML) */}
                <main id="main-menu-content" className={`flex-1 ${CONTAINER_PADDING_X} py-4 min-h-0 ${isOrderDrawerOpen && !isDesktop ? 'overflow-hidden fixed inset-0 pt-[calc(var(--header-height,9rem)+2.75rem)]' : 'overflow-y-auto'}`} role="main">
                    <MenuDisplayLayout
                        categorizedProducts={categorizedProducts}
                        onOpenProductDetailModal={handleOpenProductDetailModal}
                        isFiltered={!!searchQuery || activeCategoryFilter !== null || activeTagFilters.length > 0}
                        isFetchingWhileFiltered={isFetchingProducts && !isLoadingProductsInitial}
                        isLoadingProductsInitial={isLoadingProductsInitial}
                        // Pass error state for products list if necessary
                        isError={isProductsError}
                        error={productsError}
                    />
                </main>

                {/* Order Summary Panel - Desktop (Guideline 6.7 Sidebars) */}
                {isDesktop && venueContext && (
                    <aside ref={orderPanelRefDesktop} className="lg:w-80 xl:w-96 p-4 lg:pl-0 shrink-0" role="complementary" aria-labelledby="desktop-order-summary-title">
                        <h2 id="desktop-order-summary-title" className="sr-only">Order Summary</h2> {/* Hidden title for landmark */}
                        <OrderSummaryPanel
                            orderItems={orderItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onConfirmOrderAction={handleConfirmOrderAction}
                            isSidebarVersion={true}
                            venueContext={venueContext}
                            hidePanelTitle={false} // Show title in sidebar
                        />
                    </aside>
                )}
            </div>

            {/* Bottom Navigation - Mobile (Guideline 6.7 Navigation Bars) */}
            {!isDesktop && venueContext && (
                <BottomNav
                    currentPage={currentPage} setCurrentPage={setCurrentPage}
                    isOrderDrawerOpen={isOrderDrawerOpen} onToggleOrderDrawer={toggleOrderDrawer}
                    orderItemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    orderTabRefProp={orderNavTabRefMobile}
                />
            )}

            {/* Order Drawer - Mobile (Guideline 6.4 Modals/Dialogs styling applied to drawer) */}
            <AnimatePresence>
                {!isDesktop && isOrderDrawerOpen && (
                    <>
                        <motion.div key="order-drawer-backdrop" className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-45"
                            variants={backdropAnimation} initial="initial" animate="animate" exit="exit"
                            transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.3, ease: "circOut" }}
                            onClick={toggleOrderDrawer} aria-hidden="true"
                        />
                        <motion.div key="order-drawer-content"
                            className={`fixed bottom-0 left-0 right-0 ${PANEL_BG_DRAWER} shadow-2xl rounded-t-2xl z-50 flex flex-col`} // Guideline: shadow-2xl, rounded-2xl
                            style={{ maxHeight: '85vh' }} // Ensures drawer doesn't take full screen
                            variants={drawerAnimation} initial="initial" animate="animate" exit="exit"
                            transition={drawerTransition} role="dialog" aria-modal="true" aria-labelledby="order-drawer-title"
                        >
                            {/* Drawer Header (Guideline 6.4 Header, 2.2 Typography) */}
                            <div className={`p-3 flex justify-between items-center border-b ${NEUTRAL_BORDER_LIGHTER} shrink-0`}>
                                <h3 id="order-drawer-title" className={`text-lg font-semibold ${FONT_MONTSERRAT} ${FULL_PAGE_TEXT_PRIMARY} pl-2`}>Your Order</h3>
                                <button ref={orderDrawerCloseButtonRef} onClick={toggleOrderDrawer}
                                    className={`p-1.5 rounded-full ${NEUTRAL_TEXT_MUTED} hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 ${ROSE_RING_FOCUS} transition-colors`}
                                    aria-label="Close order summary"
                                > <Icon name="close" className="w-6 h-6" /> </button> {/* Guideline 2.3 Large Icon */}
                            </div>
                            <div className="flex-1 overflow-y-auto"> {/* Scrollable content area */}
                                <OrderSummaryPanel
                                    orderItems={orderItems}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onConfirmOrderAction={handleConfirmOrderAction}
                                    isSidebarVersion={false}
                                    venueContext={venueContext}
                                    navigateToMenu={() => { setCurrentPage('menu'); toggleOrderDrawer(); }}
                                    hidePanelTitle={true} // Title is in drawer header
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Product Detail Modal (already reviewed) */}
            <ProductDetailModal
                isOpen={isProductDetailModalOpen}
                onClose={() => { setIsProductDetailModalOpen(false); setCurrentProductForDetailModal(null); }}
                product={currentProductForDetailModal}
                onConfirmWithOptions={handleConfirmProductDetailModal}
            />

            {/* Flying Item Animation (Guideline 4.1 General Animation Principles) */}
            <AnimatePresence>
                {flyingItem && (
                    <FlyingItemAnimator
                        key={flyingItem.id} imageUrl={flyingItem.imageUrl} startRect={flyingItem.startRect}
                        endRect={flyingItem.endRect} onAnimationComplete={() => setFlyingItem(null)}
                    />
                )}
            </AnimatePresence>

            {/* User Interaction Modal (Guideline 4.5 Feedback - Alerts) */}
            <Modal
                isOpen={userInteractionModal.isOpen}
                onClose={hideUserModal}
                title={userInteractionModal.title}
                type={userInteractionModal.type}
                isLoading={userInteractionModal.isLoading}
            >
                <p>{userInteractionModal.message}</p>
            </Modal>
        </div>
    );
}

export default function UserpageWrapper() {
    // This wrapper can be used for any top-level context providers specific to Userpage if needed in future
    // For now, it just renders AppContent.
    return <AppContent />;
}