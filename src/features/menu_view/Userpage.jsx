// frontend/src/features/menu_view/Userpage.jsx
// (Focusing on ProductDetailModal integration and related state/callbacks)

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
import Modal from '../../components/animated_alerts/Modal.jsx';

// Menu Subcomponents
import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
// import ProductOptionsPopup from './subcomponents/ProductOptionsPopup'; // Likely to be deprecated
import ProductDetailModal from './subcomponents/ProductDetailModal.jsx'; // NEW
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import OrderSummaryPanel from './subcomponents/OrderSummaryPanel';
import BottomNav from './subcomponents/BottomNav.jsx';
import MenuSearchBar from './subcomponents/MenuSearchBar';
import CategoryFilterBar from './subcomponents/CategoryFilterBar';
import TagFilterPills from './subcomponents/TagFilterPills.jsx';
import SetupStage from './subcomponents/SetupStage.jsx';

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx';
import apiService from '../../services/api';

// Helper components for Full Page States
const FullPageError = ({ message, iconName = "error_outline", onRetry }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-8 text-center">
        <Icon name={iconName} className="w-20 h-20 text-red-500 dark:text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
            Oops! Something went wrong.
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
            {message || "We encountered an issue. Please try again or contact support."}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
                Try Again
            </button>
        )}
    </div>
);
const FullPageSpinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 text-center">
        <Spinner size="xl" />
        {message && <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{message}</p>}
    </div>
);


function AppContent() {
    const { theme } = useTheme();
    const { businessIdentifier: businessIdentifierFromUrl, tableLayoutItemId } = useParams();
    const shouldReduceMotion = useReducedMotion();

    const [appStage, setAppStage] = useState('loading');

    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);
    const orderDrawerCloseButtonRef = useRef(null);
    const menuDisplayLayoutRef = useRef(null);

    const [venueContext, setVenueContext] = useState(null);
    const {
        data: publicTableInfoData,
        isLoading: isLoadingPublicTableInfo,
        isError: isPublicTableInfoError,
        error: publicTableInfoError,
        refetch: refetchPublicTableInfo
    } = usePublicTableInfo(tableLayoutItemId, {
        enabled: !!tableLayoutItemId,
        retry: (failureCount, error) => (error.status === 404 || error.status === 400 ? false : failureCount < 1)
    });

    useEffect(() => {
        if (!tableLayoutItemId) {
            setAppStage('error');
            return;
        }
        if (isLoadingPublicTableInfo) setAppStage('loading');
        else if (isPublicTableInfoError) setAppStage('error');
        else if (publicTableInfoData) {
            setVenueContext({
                tableNumber: publicTableInfoData.table_display_number,
                businessName: publicTableInfoData.business_name,
                businessUUID: publicTableInfoData.business_uuid,
                businessIdentifierForAPI: publicTableInfoData.business_slug || publicTableInfoData.business_uuid,
                userName: 'Guest', // Default, will be updated by SetupStage
                numberOfPeople: 1, // Default, will be updated by SetupStage
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

    const [currentPage, setCurrentPage] = useState('menu');
    const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
    const [activeTagFilters, setActiveTagFilters] = useState([]);
    const [productsPagination, setProductsPagination] = useState({ page: 1, pageSize: 20 });

    const {
        data: publicProductsApiResponse,
        isLoading: isLoadingProductsInitial,
        isError: isProductsError,
        error: productsError,
        isFetching: isFetchingProducts
    } = usePublicProductsList(
        venueContext?.businessIdentifierForAPI,
        { category_id: activeCategoryFilter, tag_ids: activeTagFilters, search_query: searchQuery },
        { page: productsPagination.page, page_size: productsPagination.pageSize },
        {
            enabled: !!venueContext?.businessIdentifierForAPI && appStage === 'main',
            keepPreviousData: true
        }
    );

    const productsData = useMemo(() => publicProductsApiResponse?.results || [], [publicProductsApiResponse]);

    const { data: categoriesDataResult, isLoading: isLoadingCategories, isError: isCategoriesError, error: categoriesError } =
        usePublicCategories(venueContext?.businessIdentifierForAPI, { enabled: !!venueContext?.businessIdentifierForAPI && appStage === 'main' });

    const categoriesData = useMemo(() => {
        const rawData = Array.isArray(categoriesDataResult) ? categoriesDataResult : (categoriesDataResult?.results || []);
        return [...rawData].sort((a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity) || (a.name ?? "").localeCompare(b.name ?? ""));
    }, [categoriesDataResult]);

    const { data: allPublicTagsResult, isLoading: isLoadingAllPublicTags, isError: isAllPublicTagsError, error: allPublicTagsError } =
        usePublicProductTags(venueContext?.businessIdentifierForAPI, { enabled: !!venueContext?.businessIdentifierForAPI && appStage === 'main' });

    const allPublicTags = useMemo(() => Array.isArray(allPublicTagsResult) ? allPublicTagsResult : (allPublicTagsResult?.results || []), [allPublicTagsResult]);

    const displayedTagsData = useMemo(() => {
        if (isLoadingAllPublicTags || !allPublicTags || allPublicTags.length === 0) return [];
        if (activeCategoryFilter === null) return allPublicTags;
        if (!productsData || productsData.length === 0) return [];
        const tagIdsInFilteredProducts = new Set();
        productsData.forEach(product => {
            if (product.product_tags_details && Array.isArray(product.product_tags_details)) {
                product.product_tags_details.forEach(tagDetail => { if (tagDetail.is_publicly_visible) tagIdsInFilteredProducts.add(tagDetail.id); });
            }
        });
        return allPublicTags.filter(tag => tagIdsInFilteredProducts.has(tag.id));
    }, [activeCategoryFilter, productsData, allPublicTags, isLoadingAllPublicTags]);

    const categorizedProducts = useMemo(() => {
        if (!productsData || productsData.length === 0) return {};
        const categoriesMap = {};
        categoriesData.forEach(cat => { if (cat && cat.id) categoriesMap[cat.id] = { ...cat, items: [] }; });
        const UNCAT_ID = 'uncategorized';
        const UNCAT_DETAILS = { id: UNCAT_ID, name: 'Other Items', color_class: 'bg-neutral-500 dark:bg-neutral-600', icon_name: 'label', display_order: Infinity, items: [] };
        productsData.forEach(product => {
            if (!product || !product.id) return;
            const productWithDisplayOrder = { ...product, display_order: product.display_order ?? Infinity };
            const categoryId = product.category;
            if (categoryId && categoriesMap[categoryId]) categoriesMap[categoryId].items.push(productWithDisplayOrder);
            else {
                if (!categoriesMap[UNCAT_ID]) categoriesMap[UNCAT_ID] = { ...UNCAT_DETAILS };
                categoriesMap[UNCAT_ID].items.push(productWithDisplayOrder);
            }
        });
        for (const catId in categoriesMap) categoriesMap[catId].items.sort((a, b) => (a.display_order) - (b.display_order) || (a.name || "").localeCompare(b.name || ""));
        const finalCategorizedArray = [];
        categoriesData.forEach(cat => { if (categoriesMap[cat.id] && categoriesMap[cat.id].items.length > 0) finalCategorizedArray.push(categoriesMap[cat.id]); });
        if (categoriesMap[UNCAT_ID] && categoriesMap[UNCAT_ID].items.length > 0) finalCategorizedArray.push(categoriesMap[UNCAT_ID]);
        const finalCategorizedObject = {};
        finalCategorizedArray.forEach(cat => { finalCategorizedObject[cat.id] = cat; });
        return finalCategorizedObject;
    }, [productsData, categoriesData]);

    const [orderItems, setOrderItems] = useState([]);
    const [flyingItem, setFlyingItem] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    // NEW state for ProductDetailModal
    const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
    const [currentProductForDetailModal, setCurrentProductForDetailModal] = useState(null);
    // Old state for ProductOptionsPopup (can be removed later if ProductOptionsPopup is fully deprecated)
    // const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    // const [currentItemForOptions, setCurrentItemForOptions] = useState(null);


    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [userInteractionModal, setUserInteractionModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });
    const showUserModal = useCallback((title, message, type = 'info', isLoading = false) => setUserInteractionModal({ isOpen: true, title, message, type, isLoading }), []);
    const hideUserModal = useCallback(() => setUserInteractionModal({ isOpen: false, title: '', message: '', type: 'info', isLoading: false }), []);
    const toggleOrderDrawer = useCallback(() => setIsOrderDrawerOpen(prev => !prev), []);

    useEffect(() => {
        if (!isDesktop && isOrderDrawerOpen && orderDrawerCloseButtonRef.current) {
            const timer = setTimeout(() => orderDrawerCloseButtonRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isOrderDrawerOpen, isDesktop]);

    useEffect(() => {
        if (!isDesktop && isOrderDrawerOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOrderDrawerOpen, isDesktop]);

    const addToOrder = useCallback((itemToAdd, itemImageRect) => {
        setOrderItems(prevOrderItems => {
            const existingItemIndex = prevOrderItems.findIndex(item => item.id === itemToAdd.id); // Assumes itemToAdd.id is unique (originalId + options)
            if (existingItemIndex > -1) return prevOrderItems.map((item, index) => index === existingItemIndex ? { ...item, quantity: item.quantity + itemToAdd.quantity } : item);
            return [...prevOrderItems, itemToAdd];
        });
        if (itemImageRect && itemToAdd.imageUrl) {
            const endTargetRef = isDesktop ? orderPanelRefDesktop : orderNavTabRefMobile;
            if (endTargetRef.current) setFlyingItem({ id: Date.now(), imageUrl: itemToAdd.imageUrl, startRect: itemImageRect, endRect: endTargetRef.current.getBoundingClientRect() });
        }
    }, [isDesktop]);

    // NEW: Handler to open ProductDetailModal
    const handleOpenProductDetailModal = useCallback((product, imageRect) => { // imageRect might not be used by modal but kept for potential future anim
        setCurrentProductForDetailModal(product);
        setIsProductDetailModalOpen(true);
    }, []);

    // NEW: Handler for confirming from ProductDetailModal
    const handleConfirmProductDetailModal = useCallback((originalProduct, configuredItemDetails) => {
        const { quantity, selectedOptions, finalPricePerItem } = configuredItemDetails;
        const optionsSummary = selectedOptions.map(opt => opt.name).join(', ') || null; // Corrected from opt.optionName

        // Construct a unique ID based on product ID and selected option IDs
        // This ensures that items with different option configurations are treated as distinct in the cart.
        const selectedOptionIdsString = selectedOptions.map(o => o.id).sort().join('-'); // Sort IDs for consistency
        const uniqueOrderItemId = `${originalProduct.id}-${selectedOptionIdsString || 'base'}`;

        addToOrder({
            id: uniqueOrderItemId,
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: finalPricePerItem, // This is price per unit with options
            quantity: quantity,
            selectedOptionsSummary: optionsSummary,
            detailedSelectedOptions: selectedOptions // Store the full option details
        }, null); // imageRect is null because the modal is the source, not the card directly

        setIsProductDetailModalOpen(false); // Close modal on confirm
        setCurrentProductForDetailModal(null);
    }, [addToOrder]);


    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        setOrderItems(prevItems => {
            if (newQuantity <= 0) return prevItems.filter(item => item.id !== itemId);
            return prevItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
        });
    }, []);

    const handleConfirmOrderAction = useCallback(async (payloadFromSummaryPanel) => {
        showUserModal("Placing Order...", "Please wait while we submit your order.", "loading", true);
        try {
            const response = await apiService.post('orders/create/', payloadFromSummaryPanel);
            showUserModal("Order Placed!", `Your order (${String(response.data.id).substring(0, 8)}...) has been successfully submitted. Pickup code: ${response.data.pickup_code || 'N/A'}.`, "success");
            setOrderItems([]);
            if (!isDesktop && isOrderDrawerOpen) toggleOrderDrawer();
            setAppStage('orderPlaced');
        } catch (error) {
            console.error("[Userpage] Error placing order:", error);
            let errorMsg = "Failed to place order. Please try again or alert staff.";
            if (error.response?.data) {
                const data = error.response.data;
                if (data.detail) errorMsg = data.detail;
                else if (data.error_type && data.errors) errorMsg = `${data.error_type}: ${Object.values(data.errors).flat().join(' ')}`;
                else if (typeof data === 'string') errorMsg = data;
                else if (data.message) errorMsg = data.message;
            } else if (error.message) errorMsg = error.message;
            showUserModal("Order Failed", errorMsg, "error");
        }
    }, [showUserModal, isDesktop, isOrderDrawerOpen, toggleOrderDrawer]);

    const handleSearchSubmit = useCallback((query) => { setSearchQuery(query); setProductsPagination(prev => ({ ...prev, page: 1 })); }, []);
    const scrollToProductCard = useCallback((productId) => {
        const cardElement = document.getElementById(`product-card-${productId}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardElement.classList.add('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400', 'transition-all', 'duration-300', 'rounded-2xl');
            setTimeout(() => cardElement.classList.remove('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400'), 2500);
        }
    }, []);
    const handleSuggestionSelect = useCallback((suggestion) => {
        setSearchQuery('');
        if (suggestion.type === 'product') scrollToProductCard(suggestion.id);
        else if (suggestion.type === 'category') setActiveCategoryFilter(suggestion.id);
        else if (suggestion.type === 'tag') setActiveTagFilters(prev => prev.includes(suggestion.id) ? prev.filter(id => id !== suggestion.id) : [...prev, suggestion.id]);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, [scrollToProductCard]);
    const handleSelectCategory = useCallback((categoryId) => { setActiveCategoryFilter(categoryId); setProductsPagination(prev => ({ ...prev, page: 1 })); }, []);
    const handleToggleTag = useCallback((tagId) => {
        setActiveTagFilters(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
        setProductsPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // --- Loading and Error States ---
    if (appStage === 'loading') return <FullPageSpinner message={!tableLayoutItemId ? "Invalid link..." : "Loading Restaurant Info..."} />;
    if (appStage === 'error') {
        const canRetryTableInfo = publicTableInfoError && typeof refetchPublicTableInfo === 'function';
        return <FullPageError message={publicTableInfoError?.message || "Sorry, this link appears to be invalid or the table/restaurant is not found."} onRetry={canRetryTableInfo ? refetchPublicTableInfo : undefined} />;
    }
    if (appStage === 'setup') return <SetupStage tableNumber={venueContext?.tableNumber || "N/A"} onSetupComplete={handleSetupComplete} theme={theme} />;
    if (appStage === 'orderPlaced') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 dark:bg-green-900/30 p-8 text-center">
                <Icon name="check_circle" className="w-24 h-24 text-green-500 dark:text-green-400 mb-6" />
                <h2 className="text-3xl font-bold text-green-700 dark:text-green-200 mb-4">Order Confirmed!</h2>
                <p className="text-green-600 dark:text-green-300 max-w-md mb-8">
                    Thank you! Your order has been successfully placed. Our team is on it.
                </p>
                <button
                    onClick={() => { setOrderItems([]); setAppStage('main'); }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
                > Place Another Order </button>
            </div>
        );
    }

    const drawerTransition = shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 35, mass: 0.8 };
    const drawerAnimation = { initial: { y: "100%" }, animate: { y: "0%" }, exit: { y: "100%" } };
    const backdropAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-inter flex flex-col">
            <header className="p-4 bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-30">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 truncate font-montserrat">
                                {venueContext?.businessName || "Restaurant Menu"}
                            </h1>
                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                Table: {venueContext?.tableNumber || "N/A"} • Guests: {venueContext?.numberOfPeople || 1} • For: {venueContext?.userName || "Guest"}
                            </p>
                        </div>
                    </div>
                    <MenuSearchBar
                        onSearchSubmit={handleSearchSubmit}
                        onSuggestionSelect={handleSuggestionSelect}
                        businessIdentifier={venueContext?.businessIdentifierForAPI}
                        className="w-full"
                    />
                </div>
            </header>

            <div className="container mx-auto sticky top-[calc(var(--header-height,9rem)+0.25rem)] z-20 bg-slate-100 dark:bg-neutral-900 py-1 shadow-sm">
                {isLoadingCategories ? (<div className="h-12 flex items-center justify-center"><Spinner size="sm" message="Loading categories..." /></div>
                ) : isCategoriesError ? (<div className="h-12 flex items-center justify-center text-red-500 dark:text-red-400 text-xs px-4 text-center"><Icon name="error" className="mr-1 w-4 h-4" />Could not load categories. ({categoriesError?.message || 'Unknown error'})</div>
                ) : (<CategoryFilterBar categoriesData={categoriesData} activeCategoryId={activeCategoryFilter} onSelectCategory={handleSelectCategory} />
                )}

                {isLoadingAllPublicTags ? (<div className="h-10 flex items-center justify-center"><Spinner size="xs" message="Loading tags..." /></div>
                ) : isAllPublicTagsError ? (<div className="h-10 flex items-center justify-center text-red-500 dark:text-red-400 text-xs px-4 text-center"><Icon name="error" className="mr-1 w-4 h-4" />Could not load tags. ({allPublicTagsError?.message || 'Unknown error'})</div>
                ) : (
                    <TagFilterPills tagsData={displayedTagsData} activeTagIds={activeTagFilters} onToggleTag={handleToggleTag} />
                )}
            </div>

            <div ref={menuDisplayLayoutRef} className="container mx-auto flex flex-1 flex-col lg:flex-row mt-1 lg:mt-2 min-h-0">
                {isDesktop && (<aside className="w-full lg:w-64 xl:w-72 p-4 pt-0 lg:pt-4 lg:pr-0 shrink-0 hidden lg:block"></aside>)}
                <main className={`flex-1 p-4 min-h-0 ${isOrderDrawerOpen && !isDesktop ? 'overflow-hidden fixed inset-0 pt-[calc(var(--header-height,9rem)+2.75rem)]' : 'overflow-y-auto'}`}>
                    {isLoadingProductsInitial && !isFetchingProducts && (<div className="flex justify-center items-center h-64 pt-8"><Spinner size="lg" message="Loading menu..." /></div>)}
                    {isProductsError && !isLoadingProductsInitial && (<div className="p-4 text-center text-red-500 dark:text-red-400"><Icon name="warning" className="inline mr-2 w-5 h-5" /> Error: {productsError?.message || "Could not load products."}</div>)}
                    {!isLoadingProductsInitial && !isProductsError && (
                        <MenuDisplayLayout
                            categorizedProducts={categorizedProducts}
                            onOpenProductDetailModal={handleOpenProductDetailModal} // UPDATED PROP
                            isFiltered={!!searchQuery || activeCategoryFilter !== null || activeTagFilters.length > 0}
                            isFetchingWhileFiltered={isFetchingProducts && !isLoadingProductsInitial}
                        />
                    )}
                </main>
                {isDesktop && venueContext && (
                    <aside ref={orderPanelRefDesktop} className="lg:w-80 xl:w-96 p-4 lg:pl-0 shrink-0">
                        <OrderSummaryPanel
                            orderItems={orderItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onConfirmOrderAction={handleConfirmOrderAction}
                            isSidebarVersion={true}
                            venueContext={venueContext}
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
                        <motion.div key="order-drawer-backdrop" className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-45"
                            variants={backdropAnimation} initial="initial" animate="animate" exit="exit"
                            transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.3, ease: "circOut" }}
                            onClick={toggleOrderDrawer} aria-hidden="true"
                        />
                        <motion.div key="order-drawer-content" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 shadow-2xl rounded-t-2xl z-50 flex flex-col"
                            style={{ maxHeight: '85vh' }} variants={drawerAnimation} initial="initial" animate="animate" exit="exit"
                            transition={drawerTransition} role="dialog" aria-modal="true" aria-labelledby="order-drawer-title"
                        >
                            <div className="p-3 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                                <h3 id="order-drawer-title" className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 pl-2 font-montserrat">Your Order</h3>
                                <button ref={orderDrawerCloseButtonRef} onClick={toggleOrderDrawer}
                                    className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 transition-colors"
                                    aria-label="Close order summary"
                                > <Icon name="close" className="w-6 h-6" /> </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <OrderSummaryPanel
                                    orderItems={orderItems}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onConfirmOrderAction={handleConfirmOrderAction}
                                    isSidebarVersion={false}
                                    venueContext={venueContext}
                                    navigateToMenu={() => { setCurrentPage('menu'); toggleOrderDrawer(); }}
                                    hidePanelTitle={true}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* NEW ProductDetailModal */}
            <ProductDetailModal
                isOpen={isProductDetailModalOpen}
                onClose={() => { setIsProductDetailModalOpen(false); setCurrentProductForDetailModal(null); }}
                product={currentProductForDetailModal}
                onConfirmWithOptions={handleConfirmProductDetailModal}
            />

            {/* Old ProductOptionsPopup (can be removed once ProductDetailModal fully replaces its use cases) */}
            {/* <AnimatePresence>
                {isOptionsPopupOpen && currentItemForOptions && (
                    <ProductOptionsPopup
                        isOpen={isOptionsPopupOpen}
                        onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                        product={currentItemForOptions.product}
                        onConfirmWithOptions={handleConfirmWithOptions} // This would need to be adapted or removed
                    />
                )}
            </AnimatePresence> */}

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