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
// import { ToastProvider } from '../../contexts/ToastContext'; // Placeholder for actual ToastProvider
import { getEffectiveDisplayPrice } from "./utils/productUtils.js"; // For quick add price

// UI Components
import UserPageHeader from './user_page/UserPageHeader';
import MenuContentArea from './user_page/MenuContentArea';
import OrderInteractionController from './user_page/OrderInteractionController';
import GuestProfileModal from './user_page/GuestProfileModal';

// Common & SubComponents
import Spinner from '../../components/common/Spinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import Modal from '../../components/animated_alerts/Modal.jsx';
import ProductDetailModal from './subcomponents/ProductDetailModal.jsx';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import BottomNav from './subcomponents/BottomNav.jsx';
import SetupStage from './subcomponents/SetupStage.jsx';

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx';
import apiService from '../../services/api'; 

// --- Styling Constants & Helpers (Centralized definitions for Userpage structure) ---
// ... (Keep existing constants: PAGE_BG_LIGHT, FONT_INTER, etc.) ...
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

const ORDER_PLACED_BG_LIGHT = "bg-green-50";
const ORDER_PLACED_BG_DARK = "dark:bg-green-900/30"; 
const ORDER_PLACED_ICON_COLOR_LIGHT = "text-green-500";
const ORDER_PLACED_ICON_COLOR_DARK = "dark:text-green-400";
const ORDER_PLACED_TITLE_COLOR_LIGHT = "text-green-700";
const ORDER_PLACED_TITLE_COLOR_DARK = "dark:text-green-200";
const ORDER_PLACED_SUBTEXT_COLOR_LIGHT = "text-green-600";
const ORDER_PLACED_SUBTEXT_COLOR_DARK = "dark:text-green-300";
const ORDER_PLACED_BUTTON_BG = "bg-green-600 hover:bg-green-700";

const HEADER_SCROLL_THRESHOLD_PX = 80; 
const HEADER_ANIMATION_DURATION = 0.3; 

const useIsDesktop = () => {
    const { width } = useWindowSize();
    return width >= 1024; 
};

const FullPageError = ({ message, iconName = "error_outline", onRetry }) => (
    <div className={`flex flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} p-8 text-center ${FONT_INTER}`}>
        <Icon name={iconName} className={`w-20 h-20 ${FULL_PAGE_ERROR_ICON_COLOR} mb-6`} />
        <h2 className={`text-2xl font-semibold ${FULL_PAGE_TEXT_PRIMARY_LIGHT} ${FULL_PAGE_TEXT_PRIMARY_DARK} mb-3 ${FONT_MONTSERRAT}`}>{message ? "Oops! Something went wrong." : "Error"}</h2>
        <p className={`${FULL_PAGE_TEXT_SECONDARY_LIGHT} ${FULL_PAGE_TEXT_SECONDARY_DARK} max-w-md mb-6`}>{message || "We encountered an issue."}</p>
        {onRetry && <button onClick={onRetry} className={`${FULL_PAGE_BUTTON_BG} ${FULL_PAGE_BUTTON_TEXT} font-semibold py-2 px-6 rounded-lg shadow-md transition-colors`}>Try Again</button>}
    </div>
);
const FullPageSpinner = ({ message }) => (
    <div className={`flex flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} text-center ${FONT_INTER}`}>
        <Spinner size="xl" />
        {message && <p className={`mt-4 text-lg ${FULL_PAGE_TEXT_SECONDARY_LIGHT} ${FULL_PAGE_TEXT_SECONDARY_DARK}`}>{message}</p>}
    </div>
);


function AppContent() {
    const { tableLayoutItemId } = useParams();
    const { theme } = useTheme();
    const isDesktop = useIsDesktop();
    const shouldReduceMotion = useReducedMotion();

    const [appStage, setAppStage] = useState('loading');

    const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
    const [currentProductForDetailModal, setCurrentProductForDetailModal] = useState(null);
    const [isGuestProfileModalOpen, setIsGuestProfileModalOpen] = useState(false);
    const [userInteractionModal, setUserInteractionModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });

    const orderInteractionAreaRef = useRef(null); 
    const mainContentScrollRef = useRef(null); 

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

    useEffect(() => {
        if (!tableLayoutItemId) {
            setAppStage('error'); return;
        }
        if (isLoadingVenueContext) {
            if (!['main', 'orderPlaced', 'error', 'setup'].includes(appStage)) {
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
    }, [tableLayoutItemId, venueContext, isLoadingVenueContext, isVenueContextError, appStage]);

    const handleSetupComplete = useCallback((setupData) => {
        updateVenueUserDetails({ userName: setupData.userName, numberOfPeople: setupData.numberOfPeople });
        setAppStage('main');
    }, [updateVenueUserDetails]);

    const handleProfileUpdate = useCallback((profileData) => {
        updateVenueUserDetails({ newUserName: profileData.newUserName, newNumberOfPeople: profileData.newNumberOfPeople });
        setIsGuestProfileModalOpen(false);
    }, [updateVenueUserDetails]);

    const showUserModal = useCallback((title, message, type = 'info', isLoading = false) => {
        setUserInteractionModal({ isOpen: true, title, message, type, isLoading });
    }, []);
    const hideUserModal = useCallback(() => {
        setUserInteractionModal({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });
    }, []);

    // MODIFIED handleOpenProductDetailModal for Quick Add
    const handleOpenProductDetailModal = useCallback((product, imageRect, quickAddIfNoOptions = false) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        
        if (quickAddIfNoOptions && !hasOptions && product.is_active !== false) {
            // Perform Quick Add
            const { displayPrice } = getEffectiveDisplayPrice(product);
            const flyingImageTarget = orderInteractionAreaRef.current;

            order.addToOrder({
                id: product.id, // Or a more complex ID if needed for cart uniqueness without options
                originalId: product.id,
                name: product.name,
                imageUrl: product.image_url,
                price: displayPrice,
                quantity: 1,
                selectedOptionsSummary: null,
                detailedSelectedOptions: []
            }, imageRect, flyingImageTarget);
            // Do NOT open the modal for quick add
        } else {
            // Default behavior: open the modal
            setCurrentProductForDetailModal(product);
            setIsProductDetailModalOpen(true);
        }
    }, [order.addToOrder]); // Ensure order.addToOrder is stable or memoized in useOrderManagement

    const handleConfirmProductDetailModal = useCallback((originalProduct, configuredItemDetails) => {
        const flyingImageTarget = orderInteractionAreaRef.current;
        order.addToOrder({
            id: `${originalProduct.id}-${configuredItemDetails.selectedOptions.map(o => o.id).sort().join('-') || 'base'}`,
            originalId: originalProduct.id, name: originalProduct.name,
            imageUrl: originalProduct.image_url, price: configuredItemDetails.finalPricePerItem,
            quantity: configuredItemDetails.quantity,
            selectedOptionsSummary: configuredItemDetails.selectedOptions.map(opt => opt.name).join(', ') || null,
            detailedSelectedOptions: configuredItemDetails.selectedOptions
        }, null, flyingImageTarget); // imageRect is null here, as animation starts from card for options products
        setIsProductDetailModalOpen(false);
        setCurrentProductForDetailModal(null);
    }, [order.addToOrder]);

    const handleConfirmOrderAction = useCallback(async (payloadFromSummaryPanel) => {
        showUserModal("Placing Order...", "Please wait while we submit your order.", "loading", true);
        try {
            const response = await apiService.post('orders/create/', payloadFromSummaryPanel);
            showUserModal("Order Placed!", `Your order (#${String(response.data.id).substring(0, 6)}...) has been successfully submitted. Pickup code: ${response.data.pickup_code || 'N/A'}.`, "success");
            order.clearOrder();
            setPromoValidationResult(null); 
            setAppStage('orderPlaced');
        } catch (error) {
            let errorMsg = "Failed to place order. Please try again or alert staff.";
            if (error.response?.data?.message) errorMsg = error.response.data.message;
            else if (error.response?.data?.detail) errorMsg = error.response.data.detail;
            else if (error.message) errorMsg = error.message;
            console.error("[Userpage] Order placement error:", error.response || error);
            showUserModal("Order Failed", errorMsg, "error");
        }
    }, [showUserModal, order.clearOrder]);

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

    if (appStage === 'loading') return <FullPageSpinner message={!tableLayoutItemId ? "Invalid link..." : "Loading Restaurant Info..."} />;
    if (appStage === 'error') return <FullPageError message={venueContextError?.message || "This link is invalid or the restaurant is not found."} onRetry={refetchVenueContext} />;
    if (appStage === 'setup') return <SetupStage tableNumber={venueContext?.tableNumber || "N/A"} onSetupComplete={handleSetupComplete} theme={theme} />;
    if (appStage === 'orderPlaced') {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen ${ORDER_PLACED_BG_LIGHT} ${ORDER_PLACED_BG_DARK} p-8 text-center ${FONT_INTER}`}>
                <Icon name="check_circle" className={`w-24 h-24 ${ORDER_PLACED_ICON_COLOR_LIGHT} ${ORDER_PLACED_ICON_COLOR_DARK} mb-6`} />
                <h2 className={`text-3xl font-bold ${ORDER_PLACED_TITLE_COLOR_LIGHT} ${ORDER_PLACED_TITLE_COLOR_DARK} mb-4 ${FONT_MONTSERRAT}`}>Order Confirmed!</h2>
                <p className={`${ORDER_PLACED_SUBTEXT_COLOR_LIGHT} ${ORDER_PLACED_SUBTEXT_COLOR_DARK} max-w-md mb-8`}>Thank you! Your order has been placed. Our team is on it.</p>
                <button onClick={() => { order.clearOrder(); setPromoValidationResult(null); setAppStage('main'); }}
                    className={`${ORDER_PLACED_BUTTON_BG} ${FULL_PAGE_BUTTON_TEXT} font-semibold py-3 px-6 rounded-lg shadow-md transition-colors`}>
                    Place Another Order
                </button>
            </div>
        );
    }

    const preventScrollOnMain = !isDesktop &&
        order.orderItems.length > 0 &&
        orderInteractionAreaRef.current?.getAttribute('data-drawer-state') === 'open';

    return (
        // <ToastProvider> {/* Wrap with ToastProvider if implemented */}
            <div className={`min-h-screen ${PAGE_BG_LIGHT} ${PAGE_BG_DARK} ${FONT_INTER} flex flex-col`} role="document">
                <UserPageHeader
                    venueContext={venueContext}
                    logoError={logoError} onLogoError={() => setLogoError(true)}
                    onEditGuestProfile={() => setIsGuestProfileModalOpen(true)}
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
                    {isDesktop && (
                        <aside className="w-full lg:w-64 xl:w-72 p-4 pt-0 lg:pt-4 lg:pr-0 shrink-0 hidden lg:block" role="complementary" aria-label="Left sidebar spacer">
                        </aside>
                    )}

                    <MenuContentArea
                        menuDisplayProps={{
                            categorizedProducts: menu.categorizedProducts,
                            onOpenProductDetailModal: handleOpenProductDetailModal, // Passed down
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
                            totalDiscountAmount: order.totalDiscountAmount,
                            appliedPromoUIDetails: order.appliedPromoUIDetails,
                            itemLevelDiscountsMap: order.itemLevelDiscountsMap,
                        }}
                        venueContext={venueContext}
                        isDesktop={isDesktop}
                        onUpdateQuantity={order.handleUpdateQuantity}
                        onConfirmOrderAction={handleConfirmOrderAction}
                        promoValidationResult={promoValidationResult}
                        setPromoValidationResult={setPromoValidationResult}
                        navigateToMenu={menu.clearAllFilters}
                        interactionAreaRef={orderInteractionAreaRef} 
                        shouldReduceMotion={shouldReduceMotion}
                    />
                </div>

                {!isDesktop && (
                    <BottomNav
                        currentPage={menu.activeCategoryFilter === null && !menu.searchQuery && order.orderItems.length === 0 ? 'menu' : 'filtered'}
                        setCurrentPage={(pageKey) => { if (pageKey === 'menu') menu.clearAllFilters(); }}
                        onOpenGuestProfile={() => setIsGuestProfileModalOpen(true)}
                    />
                )}

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
                    isLoading={userInteractionModal.isLoading}>
                    <p>{userInteractionModal.message}</p>
                </Modal>
                <GuestProfileModal
                    isOpen={isGuestProfileModalOpen}
                    onClose={() => setIsGuestProfileModalOpen(false)}
                    currentUserName={venueContext?.userName}
                    currentNumberOfPeople={venueContext?.numberOfPeople}
                    onProfileUpdate={handleProfileUpdate}
                />
            </div>
        // </ToastProvider>
    );
}

export default function UserpageWrapper() {
    // If ToastProvider is a true context provider, wrap AppContent here.
    // Otherwise, if it's just a component that renders toasts based on a global state/store,
    // it might be placed at a higher level or within AppContent itself.
    // For now, assuming direct rendering or it's handled in App.jsx.
    return <AppContent />;
}