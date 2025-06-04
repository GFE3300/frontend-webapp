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
import { ToastProvider, useToast } // Added useToast here
    from '../../contexts/ToastContext';
import ToastContainer from '../../components/common/ToastContainer';
import { getEffectiveDisplayPrice } from "./utils/productUtils.js";

// UI Components
import UserPageHeader from './user_page/UserPageHeader';
import MenuContentArea from './user_page/MenuContentArea';
import OrderInteractionController from './user_page/OrderInteractionController';
import GuestProfileModal from './user_page/GuestProfileModal';

// Common & SubComponents
import Spinner from '../../components/common/Spinner.jsx';
import Icon from '../../components/common/Icon.jsx';
import Modal from '../../components/animated_alerts/Modal.jsx'; // Using the animated one
import ProductDetailModal from './subcomponents/ProductDetailModal.jsx';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
// BottomNav is removed from here, as OrderInteractionController handles mobile navigation/order peek
import SetupStage from './subcomponents/SetupStage.jsx';

// Utilities & Contexts
import { useTheme } from '../../utils/ThemeProvider.jsx';
import apiService from '../../services/api';

// Styling Constants (as defined in the previous prompt)
const PAGE_BG_LIGHT = "bg-neutral-100";
const PAGE_BG_DARK = "dark:bg-neutral-900";
const FONT_INTER = "font-inter";
const FONT_MONTSERRAT = "font-montserrat";
const MAIN_CONTENT_MARGIN_TOP_MOBILE = "mt-1"; // Adjusted based on header changes
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

const HEADER_SCROLL_THRESHOLD_PX = 80; // Example value
const HEADER_ANIMATION_DURATION = 0.3; // Example value

const useIsDesktop = () => {
    const { width } = useWindowSize();
    return width >= 1024; // Standard lg breakpoint
};

// --- Full Page State Components (Error, Spinner) ---
const FullPageError = ({ message, iconName = "error_outline", onRetry }) => (
    <div className={`flex font-montserrat flex-col items-center justify-center min-h-screen ${FULL_PAGE_STATE_BG_LIGHT} ${FULL_PAGE_STATE_BG_DARK} p-8 text-center ${FONT_INTER}`}>
        <Icon name={iconName} className={`w-20 h-20 ${FULL_PAGE_ERROR_ICON_COLOR} mb-6`} style={{ fontSize: "4rem" }} />
        <h2 className={`text-2xl font-semibold ${FULL_PAGE_TEXT_PRIMARY_LIGHT} ${FULL_PAGE_TEXT_PRIMARY_DARK} mb-3 ${FONT_MONTSERRAT}`}>{message ? "Oops! Something went wrong." : "Error"}</h2>
        <p className={`${FULL_PAGE_TEXT_SECONDARY_LIGHT} ${FULL_PAGE_TEXT_SECONDARY_DARK} max-w-md mb-6`}>{message || "We encountered an issue."}</p>
        {onRetry && <button onClick={onRetry} className={`${FULL_PAGE_BUTTON_BG} ${FULL_PAGE_BUTTON_TEXT} flex items-center font-semibold py-2 px-6 rounded-full shadow-md transition-colors`}>Try Again <Icon name="refresh" className="w-5 h-5 ml-2" style={{ fontSize: "1.25rem" }} /></button>}
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
    const shouldReduceMotion = useReducedMotion();
    const { addToast } = useToast();


    const [appStage, setAppStage] = useState('loading'); // loading, setup, main, orderPlaced, error

    // Modals State
    const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
    const [currentProductForDetailModal, setCurrentProductForDetailModal] = useState(null);
    const [isGuestProfileModalOpen, setIsGuestProfileModalOpen] = useState(false);
    const [userInteractionModal, setUserInteractionModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });

    // Refs
    const orderInteractionAreaRef = useRef(null); // For OrderInteractionController (drawer)
    const mainContentScrollRef = useRef(null);   // For MenuContentArea scroll container

    // --- Custom Hooks ---
    const {
        venueContext, isLoadingVenueContext, isVenueContextError, venueContextError,
        refetchVenueContext, updateVenueUserDetails, logoError, setLogoError
    } = useVenueContextManager(tableLayoutItemId);

    const menu = useMenuDataAndFilters(venueContext?.businessIdentifierForAPI, appStage);

    // NEW: Manage promoValidationResult state here
    const [promoValidationResult, setPromoValidationResult] = useState(null);
    const order = useOrderManagement(promoValidationResult); // useOrderManagement now takes promoValidationResult from this component

    const { headerTargetY, headerTransition } = useHeaderScrollAnimation(
        HEADER_SCROLL_THRESHOLD_PX,
        HEADER_ANIMATION_DURATION
    );

    // --- Effects ---
    useEffect(() => {
        if (!tableLayoutItemId) {
            setAppStage('error'); return;
        }
        if (isLoadingVenueContext) {
            if (!['main', 'orderPlaced', 'error', 'setup'].includes(appStage)) { // Don't revert to loading if already in a stable/error state
                setAppStage('loading');
            }
            return;
        }
        if (isVenueContextError) {
            setAppStage('error'); return;
        }
        if (venueContext) { // If venue context is successfully loaded
            if (appStage === 'loading') { // Transition from initial loading to setup
                setAppStage('setup');
            }
            // If already in 'main' or 'orderPlaced', stay there. Setup stage will transition to 'main'.
        } else { // Should not happen if no error and not loading, but as a fallback
            if (appStage !== 'error') setAppStage('loading'); // Or error if appropriate
        }
    }, [tableLayoutItemId, venueContext, isLoadingVenueContext, isVenueContextError, appStage]);


    // --- Callbacks ---
    const handleSetupComplete = useCallback((setupData) => {
        updateVenueUserDetails({ newUserName: setupData.userName, newNumberOfPeople: setupData.numberOfPeople });
        setAppStage('main');
        addToast(`Welcome, ${setupData.userName}! Ready to order.`, "success", 3000);
    }, [updateVenueUserDetails, addToast]);

    const handleProfileUpdate = useCallback((profileData) => {
        updateVenueUserDetails({ newUserName: profileData.newUserName, newNumberOfPeople: profileData.newNumberOfPeople });
        setIsGuestProfileModalOpen(false);
        addToast("Your info has been updated!", "success", 2500);
    }, [updateVenueUserDetails, addToast]);

    const showUserModal = useCallback((title, message, type = 'info', isLoading = false) => {
        setUserInteractionModal({ isOpen: true, title, message, type, isLoading });
    }, []);
    const hideUserModal = useCallback(() => {
        setUserInteractionModal({ isOpen: false, title: '', message: '', type: 'info', isLoading: false });
    }, []);

    // NEW: Callback for OrderSummaryPanel to update promoValidationResult here
    const handlePromoValidationChange = useCallback((validationResult) => {
        setPromoValidationResult(validationResult);
    }, []);


    const handleOpenProductDetailModal = useCallback((product, imageRect, quickAddIfNoOptions = false) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;

        if (quickAddIfNoOptions && !hasOptions && product.is_active !== false) { // is_active check
            const { displayPrice } = getEffectiveDisplayPrice(product);
            const flyingImageTarget = orderInteractionAreaRef.current;

            order.addToOrder({
                id: product.id, // Base product ID for simple items
                originalId: product.id,
                name: product.name,
                imageUrl: product.image_url,
                price: displayPrice,
                quantity: 1,
                selectedOptionsSummary: null,
                detailedSelectedOptions: []
            }, imageRect, flyingImageTarget);
            // Toast for quick add is handled inside order.addToOrder (useOrderManagement hook)
        } else {
            setCurrentProductForDetailModal(product);
            setIsProductDetailModalOpen(true);
        }
    }, [order.addToOrder]); // order.addToOrder is stable due to useCallback in useOrderManagement

    const handleConfirmProductDetailModal = useCallback((originalProduct, configuredItemDetails) => {
        const flyingImageTarget = orderInteractionAreaRef.current;
        const uniqueItemId = `${originalProduct.id}-${(configuredItemDetails.selectedOptions.map(o => o.id).sort().join('-')) || 'base'}`;

        order.addToOrder({
            id: uniqueItemId, // Unique ID based on options
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: configuredItemDetails.finalPricePerItem, // This is price per unit with options
            quantity: configuredItemDetails.quantity,
            selectedOptionsSummary: configuredItemDetails.selectedOptions.map(opt => opt.name).join(', ') || null,
            detailedSelectedOptions: configuredItemDetails.selectedOptions // Full option details
        }, null, flyingImageTarget); // imageRect is null as animation starts from modal center
        setIsProductDetailModalOpen(false);
        setCurrentProductForDetailModal(null);
        // Toast for adding with options is handled inside order.addToOrder
    }, [order.addToOrder]);

    const handleConfirmOrderAction = useCallback(async (payloadFromSummaryPanel) => {
        showUserModal("Placing Order...", "Please wait while we submit your order.", "loading", true);
        try {
            const response = await apiService.post('orders/create/', payloadFromSummaryPanel);
            // Modal will be closed by the AppContent logic once appStage changes
            order.clearOrder();
            setPromoValidationResult(null); // Clear promo after successful order
            setAppStage('orderPlaced'); // This will trigger re-render to OrderPlaced view

            // Success toast AFTER stage change ensures modal is gone
            // Using a slight delay for the toast if needed for visual timing with stage change
            setTimeout(() => {
                addToast(
                    `Order #${String(response.data.id).substring(0, 6)}... Placed! Pickup: ${response.data.pickup_code || 'N/A'}`,
                    "success",
                    5000 // Longer duration for important info
                );
            }, 100);

        } catch (error) {
            let errorMsg = "Failed to place order. Please try again or alert staff.";
            if (error.response?.data?.message) errorMsg = error.response.data.message;
            else if (error.response?.data?.detail) errorMsg = error.response.data.detail;
            else if (error.message) errorMsg = error.message;
            console.error("[Userpage] Order placement error:", error.response || error);
            showUserModal("Order Failed", errorMsg, "error"); // Keep user on the order page
        }
        // No finally block to hide modal here, stage change handles it
    }, [showUserModal, order.clearOrder, addToast]);


    const scrollToProductCard = useCallback((productId) => {
        const cardElement = document.getElementById(`product-card-${productId}`);
        if (cardElement && mainContentScrollRef.current) {
            const scrollContainer = mainContentScrollRef.current;
            const cardRect = cardElement.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();

            // Approx header height: UserPageHeader structure might make this complex.
            // Consider fixed header height or measure dynamically if very precise scroll needed.
            // For now, using a generous approximation.
            const headerApproxHeight = 150; // px, adjust based on actual header elements
            const scrollTop = scrollContainer.scrollTop + (cardRect.top - containerRect.top) - headerApproxHeight;

            scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });

            // Visual feedback for scrolled item
            cardElement.classList.add('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400', 'transition-all', 'duration-300', 'rounded-2xl');
            setTimeout(() => cardElement.classList.remove('ring-2', 'ring-offset-2', 'ring-rose-500', 'dark:ring-rose-400'), 2500);
        } else {
            console.warn(`[Userpage] scrollToProductCard: Could not find element for product ID ${productId} or scroll container.`);
        }
    }, []);


    // --- Conditional Renders for App Stages ---
    if (appStage === 'loading') return <FullPageSpinner message={!tableLayoutItemId ? "Invalid link..." : "Loading Restaurant Info..."} />;
    if (appStage === 'error') return <FullPageError message={venueContextError?.message || "This link is invalid or the restaurant is not found."} onRetry={refetchVenueContext} />;
    if (appStage === 'setup') return <SetupStage tableNumber={venueContext?.tableNumber || "N/A"} onSetupComplete={handleSetupComplete} theme={theme} />;
    if (appStage === 'orderPlaced') {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen ${ORDER_PLACED_BG_LIGHT} ${ORDER_PLACED_BG_DARK} p-8 text-center ${FONT_INTER}`}>
                <Icon name="check_circle" className={`w-24 h-24 ${ORDER_PLACED_ICON_COLOR_LIGHT} ${ORDER_PLACED_ICON_COLOR_DARK} mb-6`} style={{ fontSize: '4rem' }} />
                <h2 className={`text-3xl font-bold ${ORDER_PLACED_TITLE_COLOR_LIGHT} ${ORDER_PLACED_TITLE_COLOR_DARK} mb-4 ${FONT_MONTSERRAT}`}>Order Confirmed!</h2>
                <p className={`${ORDER_PLACED_SUBTEXT_COLOR_LIGHT} ${ORDER_PLACED_SUBTEXT_COLOR_DARK} max-w-md mb-8`}>Thank you! Your order has been placed. Our team is on it.</p>
                <button
                    onClick={() => {
                        order.clearOrder(); // Should already be cleared, but good measure
                        setPromoValidationResult(null); // Clear promo state for new order
                        setAppStage('main'); // Go back to main menu
                    }}
                    className={`${ORDER_PLACED_BUTTON_BG} ${FULL_PAGE_BUTTON_TEXT} font-semibold font-montserrat py-3 px-6 rounded-full shadow-md transition-colors`}
                >
                    Place Another Order
                </button>
            </div>
        );
    }

    // --- Main App Content Render ---
    // Determine if main content scroll should be prevented (mobile drawer open)
    const preventScrollOnMain = !isDesktop &&
        order.orderItems.length > 0 &&
        orderInteractionAreaRef.current?.getAttribute('data-drawer-state') === 'open';

    return (
        <div className={`min-h-screen ${PAGE_BG_LIGHT} ${PAGE_BG_DARK} ${FONT_INTER} flex flex-col`} role="document">
            <UserPageHeader
                venueContext={venueContext}
                logoError={logoError} onLogoError={() => setLogoError(true)}
                onEditGuestProfile={() => setIsGuestProfileModalOpen(true)}
                searchProps={{
                    onSearchSubmit: menu.handleSearchSubmit,
                    onSuggestionSelect: menu.handleSuggestionSelect, // handleSuggestionSelect in useMenuDataAndFilters now needs scrollToProductCardFn
                    businessIdentifier: venueContext?.businessIdentifierForAPI,
                }}
                categoryFilterProps={{
                    categoriesData: menu.categoriesData, activeCategoryId: menu.activeCategoryFilter,
                    onSelectCategory: menu.handleSelectCategory, isLoading: menu.isLoadingCategories,
                    isError: menu.isCategoriesError, error: menu.categoriesError,
                }}
                // tagFilterProps are passed to UserPageHeader to render TagFilterPills if needed
                tagFilterProps={{
                    tagsData: menu.displayedTagsData, activeTagIds: menu.activeTagFilters,
                    onToggleTag: menu.handleToggleTag, isLoading: menu.isLoadingAllPublicTags,
                    isError: menu.isAllPublicTagsError, error: menu.allPublicTagsError,
                }}
                animationProps={{ headerTargetY, headerTransition }}
                scrollToProductCardFn={scrollToProductCard} // Pass the actual scroll function
            />

            <div className={`container mx-auto flex flex-1 flex-col lg:flex-row ${MAIN_CONTENT_MARGIN_TOP_MOBILE} ${MAIN_CONTENT_MARGIN_TOP_DESKTOP} min-h-0 pb-16 sm:pb-0`}>
                {/* Spacer for Desktop Left Sidebar (if any planned, or just for centering main content) */}
                {isDesktop && (
                    <aside className="w-full lg:w-64 xl:w-72 p-4 pt-0 lg:pt-4 lg:pr-0 shrink-0 hidden lg:block" role="complementary" aria-label="Left sidebar spacer">
                        {/* Content for a potential left sidebar could go here, or it remains a spacer */}
                    </aside>
                )}

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
                    // Pass all financial details from useOrderManagement
                    orderFinancials={{
                        subtotal: order.subtotal,
                        finalTotal: order.finalTotal,
                        totalDiscountAmount: order.totalDiscountAmount,
                        appliedPromoUIDetails: order.appliedPromoUIDetails, // This is crucial for OrderSummaryPanel's display
                        itemLevelDiscountsMap: order.itemLevelDiscountsMap,
                    }}
                    // Pass promo validation result and setter callback
                    // promoValidationResult={promoValidationResult} // NO LONGER NEEDED TO PASS DOWN. Panel manages input, Userpage manages result.
                    // setPromoValidationResult={setPromoValidationResult} // NO LONGER NEEDED. Use onPromoValidationChange.
                    onPromoValidationChange={handlePromoValidationChange} // NEW: Pass this down

                    venueContext={venueContext}
                    isDesktop={isDesktop}
                    onUpdateQuantity={order.handleUpdateQuantity}
                    onConfirmOrderAction={handleConfirmOrderAction}
                    navigateToMenu={menu.clearAllFilters} // For empty state button in drawer
                    interactionAreaRef={orderInteractionAreaRef} // Ref for the drawer main element
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
            <Modal // Using animated Modal
                isOpen={userInteractionModal.isOpen}
                onClose={hideUserModal}
                title={userInteractionModal.title}
                type={userInteractionModal.type} // 'info', 'success', 'error', 'loading'
                isLoading={userInteractionModal.isLoading}
            >
                <p>{userInteractionModal.message}</p>
            </Modal>
            <GuestProfileModal
                isOpen={isGuestProfileModalOpen}
                onClose={() => setIsGuestProfileModalOpen(false)}
                currentUserName={venueContext?.userName}
                currentNumberOfPeople={venueContext?.numberOfPeople}
                onProfileUpdate={handleProfileUpdate}
            />
            {/* ToastContainer is already rendered by UserpageWrapper's ToastProvider */}
        </div>
    );
}

// Wrapper remains the same, ensuring ToastProvider wraps AppContent
export default function UserpageWrapper() {
    return (
        <ToastProvider>
            <AppContent />
            <ToastContainer />
        </ToastProvider>
    );
}