// frontend/src/features/menu_view/Userpage.jsx
// (Path from your frontend.txt)

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// eslint-disable-next-line
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

// Core Menu Subcomponents from ./subcomponents/
// REVIEW: Ensure all these import paths are correct for your project structure.
import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
import OrderSummaryPanel from './subcomponents/OrderSummaryPanel';
import ProductOptionsPopup from './subcomponents/ProductOptionsPopup';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import BottomNav from './subcomponents/BottomNav';
import SetupStage from './subcomponents/SetupStage';

// Utilities
// REVIEW: Ensure this path is correct.
import { getEffectiveDisplayPrice } from './utils/productUtils';

// Common Components (assuming paths from project root)
// REVIEW: Ensure these paths are correct.
import Modal from '../../components/animated_alerts/Modal.jsx';
import Icon from '../../components/common/Icon.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import SnakesGameComponent from './SnakesGame'; // REVIEW: Path to Snake Game.

// Contexts & Theme
// REVIEW: Ensure these paths are correct.
import { useTheme, ThemeProvider } from '../../utils/ThemeProvider.jsx';
import { ThemeToggleButton } from '../../utils/ThemeToggleButton.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx'; // May not be strictly needed if customer view is public
import apiService from '../../services/api.js'; // REVIEW: Path to your api service.
import { queryKeys } from '../../services/queryKeys.js'; // REVIEW: Path to your query keys.

// --- Logo Imports ---
// REVIEW: Ensure these paths are correct and images exist.
import LogoLight from '../../assets/icons/Logo.png';
import LogoDark from '../../assets/icons/LogoDark.png';

// REVIEW: Default table number. If dynamic (QR, URL), logic to set `userDetails.tableNumber` needs to be implemented.
const TABLE_NUMBER_DEFAULT = "N/A";

// Custom Hook for fetching products for the customer menu
const useCustomerMenuProducts = (isEnabled) => {
    // const { user } = useAuth(); // Access user if needed for businessId from auth context
    // For a true customer app, businessId might come from URL, QR scan, a global "current venue" context.
    // For this exercise, let's assume a public/default business or a specific one if context provides it.
    // REVIEW: placeholderBusinessId might need to be dynamic (e.g., from URL param, global state).
    const placeholderBusinessId = 'public_menu_business_id';

    return useQuery({
        // REVIEW: Ensure queryKey is appropriate and `productsList` from `queryKeys.js` is correct.
        queryKey: queryKeys.productsList({ scope: 'customer', businessId: placeholderBusinessId, active: true }),
        queryFn: async () => {
            // REVIEW: Endpoint for customer menu. Ensure it returns products filtered for active status.
            // Backend should handle scoping by businessId if applicable, possibly via JWT.
            const response = await apiService.get('products/', { params: { is_active: 'true' } });
            // CRITICAL: Ensure backend response structure matches one of these:
            // 1. { results: [], ...pagination } -> response.data.results
            // 2. [] (simple list) -> response.data
            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            console.error("Userpage: Unexpected data structure for customer menu products:", response.data);
            throw new Error("Unexpected data structure for customer menu products.");
        },
        enabled: isEnabled, // Controlled by `appStage === 'main'`
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};


function AppContent() {
    const { theme } = useTheme(); // REVIEW: Ensure ThemeProvider is wrapping this.
    const { user: authenticatedUser } = useAuth(); // REVIEW: Ensure AuthProvider is wrapping if auth context is used.

    const currentLogo = theme === 'dark' ? LogoDark : LogoLight;

    const [appStage, setAppStage] = useState('setup'); // 'setup', 'main'
    const [userDetails, setUserDetails] = useState({
        name: '',
        numberOfPeople: 1,
        tableNumber: TABLE_NUMBER_DEFAULT, // Initialized with default
    });

    const [currentPage, setCurrentPage] = useState('menu'); // Mobile nav state
    const [activeSidebarTab, setActiveSidebarTab] = useState('deals'); // Desktop sidebar state

    const [orderItems, setOrderItems] = useState([]);
    const [flyingItem, setFlyingItem] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalProps, setUserModalProps] = useState({ title: '', message: '', type: 'info', isLoading: false });

    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null); // { product, imageRect }

    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);

    // REVIEW: Tailwind 'lg' breakpoint is 1024px. Adjust if your 'lg' is different.
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showSnakeGame, setShowSnakeGame] = useState(false);

    // Product Data Fetching - enabled only when appStage is 'main'
    const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useCustomerMenuProducts(appStage === 'main');

    // CRITICAL: Memoized categorized products. This relies HEAVILY on backend data structure.
    const categorizedProducts = useMemo(() => {
        if (!productsData) return {};
        const categoriesMap = {};
        productsData.forEach(product => {
            // REVIEW: Essential product fields for categorization.
            if (!product || !product.id || !product.category_details || !product.category_details.id) {
                console.warn("Userpage: Skipping product due to missing critical data for categorization:", product);
                return;
            }
            const catId = product.category_details.id;
            const catDetails = product.category_details; // Expects: id, name, color_class, icon_name, display_order
            if (!categoriesMap[catId]) {
                categoriesMap[catId] = {
                    id: catId,
                    name: catDetails.name || "Uncategorized",
                    color_class: catDetails.color_class || "bg-gray-500",
                    icon_name: catDetails.icon_name || "label",
                    display_order: typeof catDetails.display_order === 'number' ? catDetails.display_order : 999,
                    items: []
                };
            }
            // Expects: product.display_order for sorting items within category
            const productWithOrder = { ...product, display_order: typeof product.display_order === 'number' ? product.display_order : 0 };
            categoriesMap[catId].items.push(productWithOrder);
        });
        Object.values(categoriesMap).forEach(cat => {
            cat.items.sort((a, b) => a.display_order - b.display_order);
        });
        return categoriesMap;
    }, [productsData]);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => { // Close modals on Esc
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isOptionsPopupOpen) {
                    setIsOptionsPopupOpen(false); setCurrentItemForOptions(null);
                } else if (isUserModalOpen) {
                    if (!userModalProps.isLoading) setIsUserModalOpen(false);
                } else if (showSnakeGame) {
                    setShowSnakeGame(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOptionsPopupOpen, isUserModalOpen, userModalProps.isLoading, showSnakeGame]);


    const handleSetupComplete = useCallback((details) => {
        setUserDetails(prev => ({
            ...prev,
            name: details.userName,
            numberOfPeople: details.numberOfPeople,
            // REVIEW: `tableNumber` from `SetupStage` is now passed back and used.
            tableNumber: details.tableNumber || TABLE_NUMBER_DEFAULT,
        }));
        // CRITICAL: This must happen to show main content and BottomNav on mobile.
        setAppStage('main');
    }, []);

    const handleLogoClick = () => {
        const newClickCount = logoClickCount + 1;
        setLogoClickCount(newClickCount);
        if (newClickCount >= 7) { // REVIEW: Click count for Snake game.
            setShowSnakeGame(true);
            setLogoClickCount(0);
        }
    };

    const addToCustomerOrder = useCallback((itemToAdd, itemImageRect) => {
        setOrderItems(prevItems => { /* ... (logic seems fine) ... */
            const existingItemIndex = prevItems.findIndex(item => item.id === itemToAdd.id);
            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + itemToAdd.quantity,
                };
                return updatedItems;
            }
            return [...prevItems, itemToAdd];
        });

        let targetRect = null;
        if (isDesktop && orderPanelRefDesktop.current) {
            targetRect = orderPanelRefDesktop.current.getBoundingClientRect();
        } else if (!isDesktop && orderNavTabRefMobile.current) {
            targetRect = orderNavTabRefMobile.current.getBoundingClientRect();
        }

        if (itemImageRect && targetRect) {
            setFlyingItem({
                id: Date.now(),
                imageUrl: itemToAdd.imageUrl,
                startRect: itemImageRect,
                endRect: targetRect,
            });
        }
    }, [isDesktop]); // isDesktop is a dependency here

    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        // CRITICAL: Depends on `product.editable_attribute_groups` from backend.
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        if (!hasOptions) {
            // CRITICAL: `getEffectiveDisplayPrice` depends on `product.selling_price_excl_tax` and `product.active_applied_product_discounts`.
            const { displayPrice: effectiveBasePrice } = getEffectiveDisplayPrice(product);
            const simpleItemToAdd = {
                id: `${product.id}-base-${Date.now()}`,
                originalId: product.id,
                name: product.name,
                imageUrl: product.image_url,
                price: effectiveBasePrice,
                quantity: 1,
                selectedOptionsSummary: null,
            };
            addToCustomerOrder(simpleItemToAdd, imageRect);
        } else {
            setCurrentItemForOptions({ product, imageRect });
            setIsOptionsPopupOpen(true);
        }
    }, [addToCustomerOrder]);

    const handleConfirmWithOptions = useCallback((originalProduct, configuredItemDetailsPayload) => {
        const { quantity, selectedOptions, finalPricePerItem } = configuredItemDetailsPayload;
        // `selectedOptions` here is `detailedSelectedOptions` from ProductOptionsPopup
        // which includes `groupName` and `optionName`.
        const optionsSummary = selectedOptions
            .map(opt => `${opt.groupName ? opt.groupName + ': ' : ''}${opt.optionName}`)
            .join('; ') || null;

        // Create a unique ID based on product ID and sorted option IDs for cart item identification
        const optionIdsString = selectedOptions.map(opt => opt.optionId).sort().join('_');
        const uniqueOrderItemId = `${originalProduct.id}-${optionIdsString || 'custombase'}`;

        const newItem = {
            id: uniqueOrderItemId, // This ID is used for cart management
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: finalPricePerItem, // Price per item *with options*
            quantity: quantity,
            selectedOptionsSummary: optionsSummary, // For display in OrderItem
        };

        addToCustomerOrder(newItem, currentItemForOptions?.imageRect);
        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    }, [addToCustomerOrder, currentItemForOptions]);

    const updateCustomerQuantity = useCallback((itemId, newQuantity) => {
        /* ... (logic seems fine) ... */
        if (newQuantity <= 0) {
            setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } else {
            setOrderItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    }, []);

    const handleConfirmActualOrder = useCallback(async (orderDetailsPayload) => {
        // orderDetailsPayload comes from OrderSummaryPanel and includes items, totals, notes, promo.
        setUserModalProps({ title: "Placing Order...", message: "Submitting your order, please wait.", type: "info", isLoading: true });
        setIsUserModalOpen(true);

        // REVIEW: SIMULATED API CALL. Replace with actual `apiService.post('/orders/', orderDetailsPayload);`
        console.log("CUSTOMER ORDER TO BE SUBMITTED (Simulated):", JSON.stringify(orderDetailsPayload, null, 2));
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        setUserModalProps({
            title: "Order Confirmed!",
            // Uses `userDetails` which should be up-to-date from `handleSetupComplete`
            message: `Thank you, ${userDetails.name}! Your order for table ${userDetails.tableNumber} (${userDetails.numberOfPeople} guest${userDetails.numberOfPeople > 1 ? 's' : ''}) has been placed.`,
            type: "success",
            isLoading: false,
        });
        setOrderItems([]); // Clear cart
        if (!isDesktop) {
            setCurrentPage('menu'); // Navigate to menu on mobile
        }
    }, [userDetails, isDesktop]); // userDetails, isDesktop are dependencies

    const handleUserModalClose = () => { /* ... (logic seems fine) ... */
        setIsUserModalOpen(false);
        setUserModalProps({ title: '', message: '', type: 'info', isLoading: false });
    };

    // SidebarNavItem component for Desktop
    const SidebarNavItem = ({ label, iconName, isActive, onClick }) => ( /* ... (styling seems fine) ... */
        <button
            onClick={onClick}
            className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                        ${isActive
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
        >
            <Icon name={iconName} className="w-5 h-5 mr-3 shrink-0" />
            <span>{label}</span>
        </button>
    );

    // === STAGE 1: SETUP ===
    if (appStage === 'setup') {
        return (
            <SetupStage
                // `userDetails.tableNumber` is passed, which is `TABLE_NUMBER_DEFAULT` initially.
                tableNumber={userDetails.tableNumber}
                onSetupComplete={handleSetupComplete}
                theme={theme}
            />
        );
    }

    // === STAGE 2: MAIN APP CONTENT ===
    return (
        // REVIEW: Main layout structure. Ensure `min-h-screen`, `flex`, `dark:bg-neutral-900` are desired.
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-sans flex flex-col lg:flex-row">
            {/* DESKTOP SIDEBAR (LG and up) */}
            {isDesktop && (
                // REVIEW: Sidebar width (w-64), background, padding, shadow.
                <aside className="lg:flex lg:flex-col lg:w-64 bg-white dark:bg-neutral-800 p-4 border-r border-neutral-200 dark:border-neutral-700 shadow-lg shrink-0">
                    <div className="mb-6 flex items-center justify-start h-10"> {/* Fixed height logo area */}
                        <img src={currentLogo} alt="Smore Logo" className="h-full object-contain cursor-pointer" onClick={handleLogoClick} />
                    </div>
                    {userDetails.name && ( // REVIEW: User details display in sidebar.
                        <div className="mb-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
                            <p>Table: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{userDetails.tableNumber}</span></p>
                            <p>Guest: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{userDetails.name}</span></p>
                            <p>Party: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{userDetails.numberOfPeople}</span></p>
                        </div>
                    )}
                    <nav className="space-y-2 mt-2">
                        {/* REVIEW: Sidebar navigation items, icons, active state styling. */}
                        <SidebarNavItem label="Deals" iconName="loyalty" isActive={activeSidebarTab === 'deals'} onClick={() => setActiveSidebarTab('deals')} />
                        <SidebarNavItem label="Discounts" iconName="local_offer" isActive={activeSidebarTab === 'discounts'} onClick={() => setActiveSidebarTab('discounts')} />
                    </nav>
                    <div className="mt-auto text-xs text-center text-neutral-400 dark:text-neutral-500 pt-4">
                        <p>© {new Date().getFullYear()} Smore Inc.</p>
                        <p>All rights reserved.</p>
                    </div>
                </aside>
            )}

            {/* MAIN CONTENT AREA (Mobile full width, Desktop center + right panel) */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                {/* MOBILE TOP HEADER (Not LG) */}
                {!isDesktop && (
                    // REVIEW: Mobile header height, background, shadow, logo size.
                    <header className="h-14 bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center px-4 shrink-0 sticky top-0 z-30">
                        <img src={currentLogo} alt="Smore Logo" className="h-9 object-contain cursor-pointer" onClick={handleLogoClick} />
                    </header>
                )}

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Desktop Left Panel (Deals/Discounts) OR Mobile main content area */}
                    <main className={`flex-1 overflow-y-auto ${isDesktop ? 'lg:w-auto bg-gray-50 dark:bg-neutral-850' : 'pb-16'}`}> {/* pb-16 for mobile bottom nav */}
                        {isLoadingProducts && ( /* Loading state for products */
                            <div className="flex items-center justify-center h-[calc(100vh-150px)]">
                                <Spinner size="lg" /> <p className="ml-3 text-neutral-600 dark:text-neutral-300">Loading menu...</p>
                            </div>
                        )}
                        {productsError && ( /* Error state for products */
                            <div className="p-6 text-center text-red-600 dark:text-red-400">
                                <Icon name="error" className="w-12 h-12 mx-auto mb-2" />
                                Error loading menu: {productsError.message}. Please try refreshing.
                            </div>
                        )}

                        {/* Desktop Left Panel Content (Deals/Discounts) */}
                        {isDesktop && productsData && (
                            // REVIEW: "Coming soon" content for Deals/Discounts. Replace with actual features.
                            <AnimatePresence mode="wait">
                                {activeSidebarTab === 'deals' && (
                                    <motion.div key="dealsContentDesktop" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="p-6 h-full">
                                        <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Today's Deals</h2>
                                        <div className="text-neutral-600 dark:text-neutral-400">Deals content coming soon! For now, enjoy browsing the main menu to your right.</div>
                                    </motion.div>
                                )}
                                {activeSidebarTab === 'discounts' && (
                                    <motion.div key="discountsContentDesktop" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="p-6 h-full">
                                        <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Exclusive Discounts</h2>
                                        <div className="text-neutral-600 dark:text-neutral-400">Discounts information coming soon! Check out the menu items in the center panel.</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* Mobile Current Page Content (Menu, Deals, Discounts, Order) */}
                        {!isDesktop && productsData && (
                            <AnimatePresence mode="wait">
                                {/* MenuDisplayLayout for 'menu' page */}
                                {currentPage === 'menu' && <MenuDisplayLayout key="menuPageMobile" categorizedProducts={categorizedProducts} onOpenOptionsPopup={handleOpenOptionsPopup} pageTitle="Our Menu" />}
                                {/* REVIEW: "Coming soon" content for Deals/Discounts mobile pages. Replace. */}
                                {currentPage === 'deals' && (
                                    <motion.div key="dealsPageMobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="p-4 pt-8 text-neutral-700 dark:text-neutral-300">
                                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Deals</h1>
                                        <p className="mt-2">Deals page content coming soon!</p>
                                    </motion.div>
                                )}
                                {currentPage === 'discounts' && (
                                    <motion.div key="discountsPageMobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="p-4 pt-8 text-neutral-700 dark:text-neutral-300">
                                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Discounts</h1>
                                        <p className="mt-2">Discounts page content coming soon!</p>
                                    </motion.div>
                                )}
                                {/* OrderSummaryPanel for 'order' page on mobile */}
                                {currentPage === 'order' && (
                                    <OrderSummaryPanel
                                        key="orderPageMobile"
                                        orderItems={orderItems}
                                        onUpdateQuantity={updateCustomerQuantity}
                                        onConfirmOrderAction={handleConfirmActualOrder}
                                        isSidebarVersion={false} // Important: this is mobile view
                                        isPreviewMode={false} // Customer view, not admin preview
                                        navigateToMenu={() => setCurrentPage('menu')}
                                        tableNumber={userDetails.tableNumber}
                                        userName={userDetails.name}
                                    />
                                )}
                            </AnimatePresence>
                        )}
                    </main>

                    {/* Desktop Central Menu Area */}
                    {isDesktop && (
                        // REVIEW: Desktop menu area width, background, borders, shadow, scrollbar.
                        <div className="lg:flex-1 lg:max-w-2xl xl:max-w-3xl bg-white dark:bg-neutral-900 lg:border-l lg:border-r border-neutral-200 dark:border-neutral-700 lg:shadow-xl md:overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                            {isLoadingProducts && ( /* ... (loader, same as above) ... */
                                <div className="flex items-center justify-center h-full">
                                    <Spinner size="lg" /> <p className="ml-3 text-neutral-600 dark:text-neutral-300">Loading menu...</p>
                                </div>
                            )}
                            {productsError && ( /* ... (error, same as above) ... */
                                <div className="p-6 text-center text-red-600 dark:text-red-400 h-full flex flex-col justify-center items-center">
                                    <Icon name="error" className="w-12 h-12 mx-auto mb-2" />
                                    Error loading menu: {productsError.message}.
                                </div>
                            )}
                            {/* MenuDisplayLayout for Desktop center panel */}
                            {productsData && (
                                <MenuDisplayLayout categorizedProducts={categorizedProducts} onOpenOptionsPopup={handleOpenOptionsPopup} pageTitle="Our Menu" />
                            )}
                        </div>
                    )}

                    {/* Desktop Order Summary Panel */}
                    {isDesktop && (
                        // REVIEW: Desktop order panel width, background, border, shadow.
                        <aside ref={orderPanelRefDesktop} className="lg:flex lg:flex-col lg:w-[22rem] xl:w-[26rem] bg-neutral-50 dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-lg shrink-0">
                            {/* OrderSummaryPanel for Desktop right sidebar */}
                            {productsData && ( /* Render panel only if product data available, or always if independent */
                                <OrderSummaryPanel
                                    orderItems={orderItems}
                                    onUpdateQuantity={updateCustomerQuantity}
                                    onConfirmOrderAction={handleConfirmActualOrder}
                                    isSidebarVersion={true} // Important: this is desktop sidebar view
                                    isPreviewMode={false} // Customer view
                                    tableNumber={userDetails.tableNumber}
                                    userName={userDetails.name}
                                />
                            )}
                        </aside>
                    )}
                </div>
            </div>

            {/* MOBILE BOTTOM NAV */}
            {/* CRITICAL: This section renders the BottomNav */}
            {!isDesktop && appStage === 'main' && (
                <BottomNav
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    orderItemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    orderTabRefProp={orderNavTabRefMobile} // For flying animation target
                />
            )}

            {/* Modals and Animators - Global to Userpage context */}
            <Modal isOpen={isUserModalOpen} onClose={handleUserModalClose} title={userModalProps.title} type={userModalProps.type} isLoading={userModalProps.isLoading}>
                <p>{userModalProps.message}</p>
            </Modal>

            {/* ProductOptionsPopup - ensure productsData is loaded before trying to access product details */}
            {currentItemForOptions && productsData && (
                <ProductOptionsPopup
                    isOpen={isOptionsPopupOpen}
                    onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                    product={currentItemForOptions.product} // Pass the product object
                    onConfirmWithOptions={handleConfirmWithOptions}
                />
            )}

            <AnimatePresence>
                {flyingItem && <FlyingItemAnimator key={flyingItem.id} imageUrl={flyingItem.imageUrl} startRect={flyingItem.startRect} endRect={flyingItem.endRect} onAnimationComplete={() => setFlyingItem(null)} />}
            </AnimatePresence>

            {/* Snake Game Modal */}
            {showSnakeGame && (
                // REVIEW: Snake game modal styling.
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', }}>
                    <div style={{ position: 'relative', borderRadius: '8px', width: '100%', height: `calc(100% - 70px)`, overflow: 'auto', boxSizing: 'border-box', display: 'flex', }}>
                        <SnakesGameComponent />
                    </div>
                    <button onClick={() => setShowSnakeGame(false)} style={{ marginTop: '20px', padding: '12px 25px', fontSize: '1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                        Close Game
                    </button>
                </div>
            )}
        </div>
    );
}

// Wrapper to provide ThemeContext
function UserpageWrapper() {
    return (
        // CRITICAL: ThemeProvider must wrap AppContent for useTheme() to work.
        <ThemeProvider>
            <ThemeToggleButton /> {/* REVIEW: Placement and styling of ThemeToggleButton. */}
            <AppContent />
        </ThemeProvider>
    );
}

export default UserpageWrapper;