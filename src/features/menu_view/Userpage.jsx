import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

// Core Menu Subcomponents from ./subcomponents/
import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
import OrderSummaryPanel from './subcomponents/OrderSummaryPanel';
import ProductOptionsPopup from './subcomponents/ProductOptionsPopup';
import FlyingItemAnimator from './subcomponents/FlyingItemAnimator';
import BottomNav from './subcomponents/BottomNav';
import SetupStage from './subcomponents/SetupStage'; // Assuming this is also refactored

// Utilities
import { getEffectiveDisplayPrice } from './utils/productUtils';

// Common Components (assuming paths from project root)
import Modal from '../../components/animated_alerts/Modal';
import Icon from '../../components/common/Icon';
import Spinner from '../../components/common/Spinner';
import SnakesGameComponent from './SnakesGame';

// Contexts & Theme
import { useTheme, ThemeProvider } from '../../utils/ThemeProvider';
import { ThemeToggleButton } from '../../utils/ThemeToggleButton';
// useAuth might be needed if customer orders are tied to an authenticated user, or for user details if logged in
// import { useAuth } from '../../contexts/AuthContext'; 
import apiService from '../../services/api';
import { queryKeys } from '../../services/queryKeys';

// --- Logo Imports ---
import LogoLight from '../../assets/icons/Logo.png';
import LogoDark from '../../assets/icons/LogoDark.png';

const TABLE_NUMBER_DEFAULT = "N/A";

// Custom Hook for fetching products for the customer menu
const useCustomerMenuProducts = (isEnabled) => {
    // For a public menu, businessId might be implicit or from URL.
    // For this example, using a placeholder or assuming backend handles public menus without explicit ID.
    const targetBusinessId = 'public'; // Or derive from URL/context if applicable

    return useQuery({
        queryKey: queryKeys.productsList({ scope: 'customer', businessId: targetBusinessId, active: true, customerView: true }),
        queryFn: async () => {
            // Assuming backend endpoint /api/products/ can filter by is_active=true
            // and potentially by a 'scope=customer' or similar if needed.
            const response = await apiService.get('products/', { params: { is_active: 'true' /*, business_slug: 'some-venue-slug' */ } });
            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            console.error("Userpage: Unexpected data structure for customer menu products:", response.data);
            throw new Error("Unexpected data structure for customer menu products.");
        },
        enabled: isEnabled,
        staleTime: 1000 * 60 * 5, // 5 minutes for customer menu
        refetchOnWindowFocus: false, // Less aggressive for customer
    });
};


function AppContent() {
    const { theme } = useTheme();
    // const { user: authenticatedUser } = useAuth(); // Optional: if customer can be logged in

    const currentLogo = theme === 'dark' ? LogoDark : LogoLight;

    // --- State Variables ---
    const [appStage, setAppStage] = useState('setup'); // 'setup', 'main'
    const [userDetails, setUserDetails] = useState({
        name: '',
        numberOfPeople: 1,
        tableNumber: TABLE_NUMBER_DEFAULT,
    });

    // Navigation states
    const [currentPage, setCurrentPage] = useState('menu'); // Mobile: 'menu', 'deals', 'order', 'discounts'
    const [activeSidebarTab, setActiveSidebarTab] = useState('deals'); // Desktop: 'deals', 'discounts'

    // Order & Interaction states
    const [orderItems, setOrderItems] = useState([]);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null); // { product, imageRect }
    const [flyingItem, setFlyingItem] = useState(null);

    // Modal states
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalProps, setUserModalProps] = useState({ title: '', message: '', type: 'info', isLoading: false });

    // Easter Egg states
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showSnakeGame, setShowSnakeGame] = useState(false);

    // Refs for animation targets
    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);

    // Responsive layout detection
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024); // Tailwind 'lg'

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isOptionsPopupOpen) { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }
                else if (isUserModalOpen && !userModalProps.isLoading) { setIsUserModalOpen(false); }
                else if (showSnakeGame) { setShowSnakeGame(false); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOptionsPopupOpen, isUserModalOpen, userModalProps.isLoading, showSnakeGame]);

    // --- Data Fetching ---
    const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useCustomerMenuProducts(appStage === 'main');

    const categorizedProducts = useMemo(() => {
        if (!productsData) return {};
        const categoriesMap = {};
        productsData.forEach(product => {
            if (!product || !product.id || !product.category_details || !product.category_details.id) {
                console.warn("Userpage: Skipping product due to missing critical data:", product);
                return;
            }
            const catId = product.category_details.id;
            const catDetails = product.category_details;
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
            const productWithOrder = { ...product, display_order: typeof product.display_order === 'number' ? product.display_order : 0 };
            categoriesMap[catId].items.push(productWithOrder);
        });
        Object.values(categoriesMap).forEach(cat => {
            cat.items.sort((a, b) => a.display_order - b.display_order);
        });
        return categoriesMap;
    }, [productsData]);

    // --- Callbacks & Event Handlers ---
    const handleSetupComplete = useCallback((details) => {
        setUserDetails(prev => ({
            ...prev,
            name: details.userName,
            numberOfPeople: details.numberOfPeople,
            tableNumber: details.tableNumber || TABLE_NUMBER_DEFAULT,
        }));
        setAppStage('main');
    }, []);

    const handleLogoClick = () => {
        const newClickCount = logoClickCount + 1;
        setLogoClickCount(newClickCount);
        if (newClickCount >= 7) { setShowSnakeGame(true); setLogoClickCount(0); }
    };

    const addToCustomerOrder = useCallback((itemToAdd, itemImageRect) => {
        setOrderItems(prevItems => {
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
                id: Date.now(), imageUrl: itemToAdd.imageUrl,
                startRect: itemImageRect, endRect: targetRect,
            });
        }
    }, [isDesktop]);

    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        if (!hasOptions) {
            const { displayPrice: effectiveBasePrice } = getEffectiveDisplayPrice(product);
            const simpleItemToAdd = {
                id: `${product.id}-base-${Date.now()}`, originalId: product.id, name: product.name,
                imageUrl: product.image_url, price: effectiveBasePrice, quantity: 1,
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
        const optionsSummary = selectedOptions
            .map(opt => `${opt.groupName ? opt.groupName + ': ' : ''}${opt.optionName}`)
            .join('; ') || null;

        const optionIdsString = selectedOptions.map(opt => opt.optionId).sort().join('_');
        const uniqueOrderItemId = `${originalProduct.id}-${optionIdsString || 'custombase'}`;

        const newItem = {
            id: uniqueOrderItemId, originalId: originalProduct.id, name: originalProduct.name,
            imageUrl: originalProduct.image_url, price: finalPricePerItem, quantity: quantity,
            selectedOptionsSummary: optionsSummary,
        };

        addToCustomerOrder(newItem, currentItemForOptions?.imageRect);
        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    }, [addToCustomerOrder, currentItemForOptions]);

    const updateCustomerQuantity = useCallback((itemId, newQuantity) => {
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
        setUserModalProps({ title: "Placing Order...", message: "Submitting your order, please wait.", type: "info", isLoading: true });
        setIsUserModalOpen(true);

        console.log("CUSTOMER ORDER TO BE SUBMITTED (Simulated):", JSON.stringify(orderDetailsPayload, null, 2));
        // Simulate API call
        // In a real app:
        // try {
        //   await apiService.post('/orders/customer-orders/', orderDetailsPayload);
        //   // Success handling
        // } catch (error) {
        //   // Error handling
        // }
        await new Promise(resolve => setTimeout(resolve, 2000));

        setUserModalProps({
            title: "Order Confirmed!",
            message: `Thank you, ${userDetails.name}! Your order for table ${userDetails.tableNumber} (${userDetails.numberOfPeople} guest${userDetails.numberOfPeople > 1 ? 's' : ''}) has been placed.`,
            type: "success", isLoading: false,
        });

        setOrderItems([]);
        if (!isDesktop) { setCurrentPage('menu'); }
    }, [userDetails, isDesktop]);

    const handleUserModalClose = () => {
        setIsUserModalOpen(false);
        setUserModalProps({ title: '', message: '', type: 'info', isLoading: false });
    };

    // --- Sidebar Nav Item (Desktop) ---
    const SidebarNavItem = ({ label, iconName, isActive, onClick }) => (
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

    // --- Render Logic ---
    if (appStage === 'setup') {
        return <SetupStage tableNumber={userDetails.tableNumber} onSetupComplete={handleSetupComplete} theme={theme} />;
    }

    // Main Application View (after setup)
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-sans flex flex-col lg:flex-row">
            {/* DESKTOP LEFT SIDEBAR */}
            {isDesktop && (
                <aside className="lg:flex lg:flex-col lg:w-64 bg-white dark:bg-neutral-800 p-4 border-r border-neutral-200 dark:border-neutral-700 shadow-lg shrink-0">
                    <div className="mb-6 flex items-center justify-start h-10">
                        <img src={currentLogo} alt="Smore Logo" className="h-full object-contain cursor-pointer" onClick={handleLogoClick} />
                    </div>
                    {userDetails.name && (
                        <div className="mb-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
                            <p>Table: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{userDetails.tableNumber}</span></p>
                            <p>Guest: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{userDetails.name}</span></p>
                            <p>Party: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{userDetails.numberOfPeople}</span></p>
                        </div>
                    )}
                    <nav className="space-y-2 mt-2">
                        <SidebarNavItem label="Deals" iconName="loyalty" isActive={activeSidebarTab === 'deals'} onClick={() => setActiveSidebarTab('deals')} />
                        <SidebarNavItem label="Special Offers" iconName="local_offer" isActive={activeSidebarTab === 'discounts'} onClick={() => setActiveSidebarTab('discounts')} />
                    </nav>
                    <div className="mt-auto text-xs text-center text-neutral-400 dark:text-neutral-500 pt-4">
                        <p>© {new Date().getFullYear()} Smore Inc.</p>
                    </div>
                </aside>
            )}

            {/* MAIN CONTENT AREA CONTAINER */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                {!isDesktop && ( // Mobile Header
                    <header className="h-14 bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center px-4 shrink-0 sticky top-0 z-30">
                        <img src={currentLogo} alt="Smore Logo" className="h-9 object-contain cursor-pointer" onClick={handleLogoClick} />
                    </header>
                )}

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left/Main Content Panel (Desktop: Deals/Discounts; Mobile: Current Page View) */}
                    <main className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 
                                     ${isDesktop ? 'lg:w-auto bg-gray-50 dark:bg-neutral-850' : 'pb-16' /* padding for mobile bottom nav */}`}>
                        {isLoadingProducts && (
                            <div className="flex items-center justify-center h-[calc(100vh-150px)]">
                                <Spinner size="lg" /> <p className="ml-3 text-neutral-600 dark:text-neutral-300">Loading deliciousness...</p>
                            </div>
                        )}
                        {productsError && (
                            <div className="p-6 text-center text-red-500 dark:text-red-400 h-full flex flex-col justify-center items-center">
                                <Icon name="error_outline" className="w-16 h-16 mx-auto mb-3" />
                                <p className="text-lg font-semibold">Oops! Couldn't load the menu.</p>
                                <p className="text-sm">{productsError.message}. Please try again later.</p>
                            </div>
                        )}

                        {productsData && (<>
                            {/* Desktop: Deals/Discounts in left-most panel */}
                            {isDesktop && (
                                <AnimatePresence mode="wait">
                                    {activeSidebarTab === 'deals' && (
                                        <motion.div key="dealsContentDesktop" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="p-6 h-full">
                                            <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Today's Deals</h2>
                                            <p className="text-neutral-600 dark:text-neutral-400">Special deals just for you! (Content coming soon)</p>
                                        </motion.div>
                                    )}
                                    {activeSidebarTab === 'discounts' && (
                                        <motion.div key="discountsContentDesktop" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="p-6 h-full">
                                            <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Special Offers</h2>
                                            <p className="text-neutral-600 dark:text-neutral-400">Check out our amazing offers! (Content coming soon)</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}

                            {/* Mobile: Current Page (Menu, Deals, Discounts - Order is separate) */}
                            {!isDesktop && (
                                <AnimatePresence mode="wait">
                                    {currentPage === 'menu' && <MenuDisplayLayout key="menuPageMobile" categorizedProducts={categorizedProducts} onOpenOptionsPopup={handleOpenOptionsPopup} pageTitle="Our Menu" />}
                                    {currentPage === 'deals' && (
                                        <motion.div key="dealsPageMobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="p-4 pt-8">
                                            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Deals</h1>
                                            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Exciting deals coming soon!</p>
                                        </motion.div>
                                    )}
                                    {currentPage === 'discounts' && (
                                        <motion.div key="discountsPageMobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="p-4 pt-8">
                                            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Special Offers</h1>
                                            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Special offers are on their way!</p>
                                        </motion.div>
                                    )}
                                    {currentPage === 'order' && (
                                        <OrderSummaryPanel key="orderPageMobile" orderItems={orderItems} onUpdateQuantity={updateCustomerQuantity}
                                            onConfirmOrderAction={handleConfirmActualOrder} isSidebarVersion={false} isPreviewMode={false}
                                            navigateToMenu={() => setCurrentPage('menu')} tableNumber={userDetails.tableNumber} userName={userDetails.name}
                                        />
                                    )}
                                </AnimatePresence>
                            )}
                        </>)}
                    </main>

                    {/* Desktop: Center Menu Panel */}
                    {isDesktop && productsData && (
                        <div className="lg:flex-1 lg:max-w-2xl xl:max-w-3xl bg-white dark:bg-neutral-900 lg:border-l lg:border-r border-neutral-200 dark:border-neutral-700 lg:shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                            <MenuDisplayLayout categorizedProducts={categorizedProducts} onOpenOptionsPopup={handleOpenOptionsPopup} pageTitle="Our Menu" />
                        </div>
                    )}

                    {/* Desktop: Right Order Summary Panel */}
                    {isDesktop && (
                        <aside ref={orderPanelRefDesktop} className="lg:flex lg:flex-col lg:w-[22rem] xl:w-[26rem] bg-neutral-50 dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-lg shrink-0">
                            <OrderSummaryPanel orderItems={orderItems} onUpdateQuantity={updateCustomerQuantity}
                                onConfirmOrderAction={handleConfirmActualOrder} isSidebarVersion={true} isPreviewMode={false}
                                tableNumber={userDetails.tableNumber} userName={userDetails.name}
                            />
                        </aside>
                    )}
                </div>
            </div>

            {/* MOBILE BOTTOM NAVIGATION */}
            {!isDesktop && appStage === 'main' && (
                <BottomNav
                    currentPage={currentPage} setCurrentPage={setCurrentPage}
                    orderItemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    orderTabRefProp={orderNavTabRefMobile}
                />
            )}

            {/* MODALS & ANIMATORS (Global to AppContent) */}
            <Modal isOpen={isUserModalOpen} onClose={handleUserModalClose} title={userModalProps.title} type={userModalProps.type} isLoading={userModalProps.isLoading}>
                <p>{userModalProps.message}</p>
            </Modal>

            {currentItemForOptions && productsData && (
                <ProductOptionsPopup
                    isOpen={isOptionsPopupOpen}
                    onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                    product={currentItemForOptions.product}
                    onConfirmWithOptions={handleConfirmWithOptions}
                />
            )}

            <AnimatePresence>
                {flyingItem && <FlyingItemAnimator key={flyingItem.id} imageUrl={flyingItem.imageUrl} startRect={flyingItem.startRect} endRect={flyingItem.endRect} onAnimationComplete={() => setFlyingItem(null)} />}
            </AnimatePresence>

            {showSnakeGame && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}>
                    <div style={{ position: 'relative', borderRadius: '8px', width: '100%', height: 'calc(100% - 70px)', overflow: 'hidden', display: 'flex' }}>
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

function UserpageWrapper() {
    return (
        <ThemeProvider>
            <ThemeToggleButton />
            <AppContent />
        </ThemeProvider>
    );
}

export default UserpageWrapper;