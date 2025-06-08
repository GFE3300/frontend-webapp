// frontend/src/features/menu_view/Userpage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Custom Hooks
import { useVenueContextManager } from './hooks/useVenueContextManager';
import { useMenuDataAndFilters } from './hooks/useMenuDataAndFilters';
import { useOrderManagement } from './hooks/useOrderManagement';
import { useHeaderScrollAnimation } from './hooks/useHeaderScrollAnimation';
import useWindowSize from '../../hooks/useWindowSize';
import { ToastProvider, useToast }
    from '../../contexts/ToastContext';

// UI Components
import UserPageHeader from './user_page/UserPageHeader';
import MenuContentArea from './user_page/MenuContentArea';
import OrderInteractionController from './user_page/OrderInteractionController';
import GuestSettingsModal from './user_page/GuestSettingsModal';

// Common & SubComponents
import Spinner from '../../components/common/Spinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import Modal from '../../components/animated_alerts/Modal.jsx';
import ProductDetailModal from './subcomponents/ProductDetailModal.jsx';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import SetupStage from './subcomponents/SetupStage.jsx';

// NEW: Import the Order Tracker view
import OrderTrackerView from './live_order_view/OrderTrackerView.jsx';

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx';
import { VenueContext } from '../../contexts/VenueDataContext.jsx';
import apiService from '../../services/api';
import { getEffectiveDisplayPrice } from "./utils/productUtils.js";
import { scriptLines_menu_view as sl } from './utils/script_lines.js'; // LOCALIZATION: Import script lines
import { interpolate } from './utils/script_lines.js'; // LOCALIZATION: Import helper

// --- Styling & Logic Constants ---
const ACTIVE_ORDER_ID_STORAGE_KEY = 'smore-active-order-id'; // NEW: localStorage key

const PAGE_BG_LIGHT = "bg-neutral-100";
const PAGE_BG_DARK = "dark:bg-neutral-900";
const FONT_INTER = "font-inter";
const FONT_MONTSERRAT = "font-montserrat";
const MAIN_CONTENT_MARGIN_TOP_MOBILE = "mt-1";
const MAIN_CONTENT_MARGIN_TOP_DESKTOP = "lg:mt-2";
const FULL_PAGE_STATE_BG_LIGHT = "bg-neutral-100";
const FULL_PAGE_STATE_BG_DARK = "dark:bg-neutral-900";
const FULL_PAGE_ERROR_ICON_COLOR = "text-red-500 dark:text-red-400";
const FULL_PAGE_TEXT_PRIMARY_LIGHT = "text-neutral-700";
const FULL_PAGE_TEXT_PRIMARY_DARK = "dark:text-neutral-200";
const FULL_PAGE_TEXT_SECONDARY_LIGHT = "text-neutral-600";
const FULL_PAGE_TEXT_SECONDARY_DARK = "dark:text-neutral-400";
const FULL_PAGE_BUTTON_BG = "bg-rose-500 hover:bg-rose-600";
const FULL_PAGE_BUTTON_TEXT = "text-white";

const HEADER_SCROLL_THRESHOLD_PX = 80;
const HEADER_ANIMATION_DURATION = 0.3;

const useIsDesktop = () => {
    const { width } = useWindowSize();
    return width >= 1024; // Standard lg breakpoint
};

const FullPageError = ({ message, iconName = "error_outline", onRetry }) => (
    <div className={`flex font-montserrat flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} p-8 text-center ${FONT_INTER}`}>
        <Icon name={iconName} className={`w-20 h-20 ${FULL_PAGE_ERROR_ICON_COLOR} mb-6`} style={{ fontSize: "4rem" }} />
        <h2 className={`text-2xl font-semibold ${FULL_PAGE_TEXT_PRIMARY_LIGHT} ${FULL_PAGE_TEXT_PRIMARY_DARK} mb-3 ${FONT_MONTSERRAT}`}>{message ? (sl.userpage.errorTitle || "Oops! Something went wrong.") : (sl.userpage.errorTitleFallback || "Error")}</h2>
        <p className={`${FULL_PAGE_TEXT_SECONDARY_LIGHT} ${FULL_PAGE_TEXT_SECONDARY_DARK} max-w-md mb-6`}>{message || (sl.userpage.errorMessageFallback || "We encountered an issue.")}</p>
        {onRetry && <button onClick={onRetry} className={`${FULL_PAGE_BUTTON_BG} ${FULL_PAGE_BUTTON_TEXT} flex items-center font-semibold py-2 px-6 rounded-full shadow-md transition-colors`}>{sl.userpage.retryButton || "Try Again"} <Icon name="refresh" className="w-5 h-5 ml-2" style={{ fontSize: "1.25rem" }} /></button>}
    </div>
);
const FullPageSpinner = ({ message }) => (
    <div className={`flex font-montserrat flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} text-center ${FONT_INTER}`}>
        <Spinner size="xl" />
        {message && <p className={`mt-4 text-lg ${FULL_PAGE_TEXT_SECONDARY_LIGHT} ${FULL_PAGE_TEXT_SECONDARY_DARK}`}>{message}</p>}
    </div>
);

function AppContent() {
    const { tableLayoutItemId } = useParams();
    const { theme } = useTheme();
    const isDesktop = useIsDesktop();
    const { addToast } = useToast();

    // MODIFIED: State for app flow and order tracking
    const [appStage, setAppStage] = useState('loading');
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Modals State
    const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
    const [currentProductForDetailModal, setCurrentProductForDetailModal] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [userInteractionModal, setUserInteractionModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });

    // Refs
    const orderInteractionAreaRef = useRef(null);
    const mainContentScrollRef = useRef(null);

    // --- Custom Hooks ---
    const {
        venueContext, isLoadingVenueContext, isVenueContextError, venueContextError,
        refetchVenueContext, updateVenueUserDetails, logoError, setLogoError
    } = useVenueContextManager(tableLayoutItemId);

    const menu = useMenuDataAndFilters(venueContext?.businessIdentifierForAPI, appStage);

    const [promoValidationResult, setPromoValidationResult] = useState(null);
    const order = useOrderManagement(promoValidationResult);

    const { headerTargetY, headerTransition } = useHeaderScrollAnimation(
        HEADER_SCROLL_THRESHOLD_PX,
        HEADER_ANIMATION_DURATION
    );

    // --- Effects ---
    // MODIFIED: Effect to check for an active order on initial load
    useEffect(() => {
        const storedOrderId = localStorage.getItem(ACTIVE_ORDER_ID_STORAGE_KEY);
        if (storedOrderId) {
            setActiveOrderId(storedOrderId);
        }
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        if (isInitialLoad || activeOrderId) return; // Don't run this logic if we are still loading or an active order exists

        if (!tableLayoutItemId) {
            setAppStage('error'); return;
        }
        if (isLoadingVenueContext) {
            if (appStage !== 'main' && appStage !== 'setup') {
                setAppStage('loading');
            }
            return;
        }
        if (isVenueContextError) {
            setAppStage('error'); return;
        }
        if (venueContext) {
            if (appStage === 'loading') {
                setAppStage('setup');
            }
        } else {
            if (appStage !== 'error') setAppStage('loading');
        }
    }, [tableLayoutItemId, venueContext, isLoadingVenueContext, isVenueContextError, appStage, activeOrderId, isInitialLoad]);

    // --- Callbacks ---
    const handleSetupComplete = useCallback((setupData) => {
        updateVenueUserDetails({ newUserName: setupData.userName, newNumberOfPeople: setupData.numberOfPeople });
        setAppStage('main');
        addToast(interpolate(sl.userpage.toastWelcome, { userName: setupData.userName }) || `Welcome, ${setupData.userName}! Ready to order.`, "success", 3000);
    }, [updateVenueUserDetails, addToast]);

    // NEW: Handler to exit the tracker view and return to the menu
    const handleReturnToMenu = useCallback(() => {
        localStorage.removeItem(ACTIVE_ORDER_ID_STORAGE_KEY);
        setActiveOrderId(null);
        order.clearOrder();
        setPromoValidationResult(null);
        // This will re-trigger the main useEffect to decide between 'setup' and 'main'
        setAppStage('loading');
    }, [order, setPromoValidationResult]);

    const handleOpenSettingsModal = useCallback(() => setIsSettingsModalOpen(true), []);
    const handleCloseSettingsModal = useCallback(() => setIsSettingsModalOpen(false), []);
    const handleSaveSettings = useCallback((newSettings) => {
        updateVenueUserDetails(newSettings);
        setIsSettingsModalOpen(false);
        addToast(sl.userpage.toastSettingsSaved || "Your settings have been saved!", "success", 2500);
    }, [updateVenueUserDetails, addToast]);

    const showUserModal = useCallback((title, message, type = 'info', isLoading = false) => {
        setUserInteractionModal({ isOpen: true, title, message, type, isLoading });
    }, []);
    const hideUserModal = useCallback(() => {
        setUserInteractionModal({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });
    }, []);

    const handlePromoValidationChange = useCallback((validationResult) => {
        setPromoValidationResult(validationResult);
    }, []);

    const handleOpenProductDetailModal = useCallback((product, imageRect, quickAddIfNoOptions = false) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        if (quickAddIfNoOptions && !hasOptions && product.is_active !== false) {
            const { displayPrice } = getEffectiveDisplayPrice(product);
            const flyingImageTarget = orderInteractionAreaRef.current;
            order.addToOrder({
                id: product.id, originalId: product.id, name: product.name, imageUrl: product.image_url,
                price: displayPrice, quantity: 1, selectedOptionsSummary: null, detailedSelectedOptions: []
            }, imageRect, flyingImageTarget);
        } else {
            setCurrentProductForDetailModal(product);
            setIsProductDetailModalOpen(true);
        }
    }, [order.addToOrder]);

    const handleConfirmProductDetailModal = useCallback((originalProduct, configuredItemDetails) => {
        const flyingImageTarget = orderInteractionAreaRef.current;
        const uniqueItemId = `${originalProduct.id}-${(configuredItemDetails.selectedOptions.map(o => o.id).sort().join('-')) || 'base'}`;
        order.addToOrder({
            id: uniqueItemId, originalId: originalProduct.id, name: originalProduct.name, imageUrl: originalProduct.image_url,
            price: configuredItemDetails.finalPricePerItem, quantity: configuredItemDetails.quantity,
            selectedOptionsSummary: configuredItemDetails.selectedOptions.map(opt => opt.name).join(', ') || null,
            detailedSelectedOptions: configuredItemDetails.selectedOptions
        }, null, flyingImageTarget);
        setIsProductDetailModalOpen(false);
        setCurrentProductForDetailModal(null);
    }, [order.addToOrder]);

    // MODIFIED: Order placement now triggers the tracker view
    const handleConfirmOrderAction = useCallback(async (payloadFromSummaryPanel) => {
        showUserModal(sl.userpage.modalPlacingOrderTitle || "Placing Order...", sl.userpage.modalPlacingOrderMessage || "Please wait while we submit your order.", "loading", true);
        try {
            const response = await apiService.post('orders/create/', payloadFromSummaryPanel);
            const newOrderId = response.data.id;

            // NEW: Set up the tracker view
            localStorage.setItem(ACTIVE_ORDER_ID_STORAGE_KEY, newOrderId);
            setActiveOrderId(newOrderId);

            order.clearOrder();
            setPromoValidationResult(null);
            hideUserModal(); // Hide the "placing order" modal

            setTimeout(() => {
                addToast(
                    interpolate(sl.userpage.toastOrderPlaced, { orderId: String(response.data.id).substring(0, 6) }) || `Order #${String(response.data.id).substring(0, 6)}... Placed!`,
                    "success", 3000
                );
            }, 100);
        } catch (error) {
            let errorMsg = sl.userpage.errorOrderFailed || "Failed to place order. Please try again or alert staff.";
            if (error.response?.data?.message) errorMsg = error.response.data.message;
            else if (error.response?.data?.detail) errorMsg = error.response.data.detail;
            else if (error.message) errorMsg = error.message;
            console.error("[Userpage] Order placement error:", error.response || error);
            showUserModal(sl.userpage.modalOrderFailedTitle || "Order Failed", errorMsg, "error");
        }
    }, [showUserModal, hideUserModal, order, setPromoValidationResult, addToast]);

    const scrollToProductCard = useCallback((productId) => {
        const cardElement = document.getElementById(`product-card-${productId}`);
        if (cardElement && mainContentScrollRef.current) {
            const scrollContainer = mainContentScrollRef.current;
            const cardRect = cardElement.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const headerApproxHeight = 150;
            const scrollTop = scrollContainer.scrollTop + (cardRect.top - containerRect.top) - headerApproxHeight;
            scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
            cardElement.classList.add('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400', 'transition-all', 'duration-300', 'rounded-2xl');
            setTimeout(() => cardElement.classList.remove('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400'), 2500);
        } else {
            console.warn(`[Userpage] scrollToProductCard: Could not find element for product ID ${productId} or scroll container.`);
        }
    }, []);

    // --- Conditional Renders ---
    if (isInitialLoad) {
        return <FullPageSpinner message={sl.userpage.loadingActiveOrder || "Checking for active orders..."} />;
    }

    if (activeOrderId) {
        return <OrderTrackerView orderId={activeOrderId} onReturnToMenu={handleReturnToMenu} />;
    }

    if (appStage === 'loading') return <FullPageSpinner message={!tableLayoutItemId ? (sl.userpage.loadingInvalidLink || "Invalid link...") : (sl.userpage.loadingVenueInfo || "Loading Restaurant Info...")} />;
    if (appStage === 'error') return <FullPageError message={venueContextError?.message || (sl.userpage.errorInvalidLinkOrNotFound || "This link is invalid or the restaurant is not found.")} onRetry={refetchVenueContext} />;
    if (appStage === 'setup') return <SetupStage tableNumber={venueContext?.tableNumber || "N/A"} onSetupComplete={handleSetupComplete} theme={theme} />;

    // REMOVED: orderPlaced stage is now handled by OrderTrackerView

    const preventScrollOnMain = !isDesktop && order.orderItems.length > 0 && orderInteractionAreaRef.current?.getAttribute('data-drawer-state') === 'open';

    // --- Main App Content Render ---
    return (
        <VenueContext.Provider value={venueContext}>
            <div className={`min-h-screen ${PAGE_BG_LIGHT} ${PAGE_BG_DARK} ${FONT_INTER} flex flex-col`} role="document">
                <UserPageHeader
                    venueContext={venueContext}
                    logoError={logoError} onLogoError={() => setLogoError(true)}
                    onOpenSettingsModal={handleOpenSettingsModal}
                    searchProps={{
                        onSearchSubmit: menu.handleSearchSubmit,
                        onSuggestionSelect: menu.handleSuggestionSelect,
                        businessIdentifier: venueContext?.businessIdentifierForAPI,
                    }}
                    categoryFilterProps={{
                        categoriesData: menu.categoriesData, activeCategoryId: menu.activeCategoryFilter,
                        onSelectCategory: menu.handleSelectCategory, isLoading: menu.isLoadingCategories,
                        isError: menu.isCategoriesError, error: menu.categoriesError,
                    }}
                    tagFilterProps={{
                        tagsData: menu.displayedTagsData, activeTagIds: menu.activeTagFilters,
                        onToggleTag: menu.handleToggleTag, isLoading: menu.isLoadingAllPublicTags,
                        isError: menu.isAllPublicTagsError, error: menu.allPublicTagsError,
                    }}
                    animationProps={{ headerTargetY, headerTransition }}
                    scrollToProductCardFn={scrollToProductCard}
                />

                <div className={`container mx-auto flex flex-1 flex-col lg:flex-row ${MAIN_CONTENT_MARGIN_TOP_MOBILE} ${MAIN_CONTENT_MARGIN_TOP_DESKTOP} min-h-0 pb-16 sm:pb-0`}>
                    {isDesktop && <aside className="w-full lg:w-64 xl:w-72 p-4 pt-0 lg:pt-4 lg:pr-0 shrink-0 hidden lg:block" role="complementary" aria-label="Left sidebar spacer" />}

                    <MenuContentArea
                        menuDisplayProps={{
                            categorizedProducts: menu.categorizedProducts,
                            onOpenProductDetailModal: handleOpenProductDetailModal,
                            isFiltered: !!menu.searchQuery || menu.activeCategoryFilter !== null || menu.activeTagFilters.length > 0,
                            isFetchingWhileFiltered: menu.isFetchingProducts && !menu.isLoadingProductsInitial,
                            isLoadingProductsInitial: menu.isLoadingProductsInitial,
                            isError: menu.isProductsError, error: menu.productsError,
                        }}
                        isDesktop={isDesktop}
                        scrollContainerRef={mainContentScrollRef}
                        preventScroll={preventScrollOnMain}
                        clearAllFilters={menu.clearAllFilters}
                    />

                    <OrderInteractionController
                        orderItems={order.orderItems}
                        orderFinancials={{
                            subtotal: order.subtotal, finalTotal: order.finalTotal,
                            totalDiscountAmount: order.totalDiscountAmount, appliedPromoUIDetails: order.appliedPromoUIDetails,
                            itemLevelDiscountsMap: order.itemLevelDiscountsMap,
                        }}
                        onPromoValidationChange={handlePromoValidationChange}
                        venueContext={venueContext}
                        isDesktop={isDesktop}
                        onUpdateQuantity={order.handleUpdateQuantity}
                        onConfirmOrderAction={handleConfirmOrderAction}
                        navigateToMenu={menu.clearAllFilters}
                        interactionAreaRef={orderInteractionAreaRef}
                    />
                </div>

                {/* Modals & Global Elements */}
                <ProductDetailModal
                    isOpen={isProductDetailModalOpen}
                    onClose={() => { setIsProductDetailModalOpen(false); setCurrentProductForDetailModal(null); }}
                    product={currentProductForDetailModal}
                    onConfirmWithOptions={handleConfirmProductDetailModal}
                />
                <AnimatePresence>
                    {order.flyingItem && (
                        <FlyingItemAnimator
                            key={order.flyingItem.id}
                            imageUrl={order.flyingItem.imageUrl}
                            startRect={order.flyingItem.startRect}
                            endRect={order.flyingItem.endRect}
                            onAnimationComplete={() => order.setFlyingItem(null)}
                        />
                    )}
                </AnimatePresence>
                <Modal
                    isOpen={userInteractionModal.isOpen}
                    onClose={hideUserModal}
                    title={userInteractionModal.title}
                    type={userInteractionModal.type}
                    isLoading={userInteractionModal.isLoading}
                >
                    <p>{userInteractionModal.message}</p>
                </Modal>
                <GuestSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={handleCloseSettingsModal}
                    currentSettings={{
                        name: venueContext?.userName,
                        email: venueContext?.userEmail,
                        people: venueContext?.numberOfPeople,
                    }}
                    onSave={handleSaveSettings}
                />
            </div>
        </VenueContext.Provider>
    );
}

export default function UserpageWrapper() {
    const { venueContext, isLoadingVenueContext, isVenueContextError, venueContextError, refetchVenueContext, updateVenueUserDetails, logoError, setLogoError } = useVenueContextManager(useParams().tableLayoutItemId);
    const venueContextValue = { venueContext, isLoadingVenueContext, isVenueContextError, venueContextError, refetchVenueContext, updateVenueUserDetails, logoError, setLogoError };

    return (
        <ToastProvider>
            <VenueContext.Provider value={venueContextValue}>
                <AppContent />
            </VenueContext.Provider>
        </ToastProvider>
    );
}