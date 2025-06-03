// src/pages/AdminMenuPreviewPage.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

// Subcomponents from menu_view (adapted paths for pages directory)
import MenuDisplayLayout from '../features/menu_view/subcomponents/MenuDisplayLayout.jsx';
import OrderSummaryPanel from '../features/menu_view/subcomponents/OrderSummaryPanel.jsx';
import FlyingItemAnimator from '../features/menu_view/subcomponents/FlyingItemAnimator.jsx';
import BottomNav from '../features/menu_view/subcomponents/BottomNav.jsx';
import SnakesGameComponent from '../features/menu_view/SnakesGame'; // index.tsx handles export

// Common Components
import Modal from '../components/animated_alerts/Modal.jsx';
import Icon from '../components/common/Icon.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Contexts, Theme, API
import { useTheme, ThemeProvider } from '../utils/ThemeProvider.jsx';
import { ThemeToggleButton } from '../utils/ThemeToggleButton.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiService from '../services/api.js';
import { queryKeys } from '../services/queryKeys.js';

// Assets
import LogoLight from '../assets/icons/Logo.png';
import LogoDark from '../assets/icons/LogoDark.png';

// Utils
import { getEffectiveDisplayPrice } from '../features/menu_view/utils/productUtils.js'; // productUtils.js needed

// Custom Hook for fetching admin menu preview products
const useAdminMenuPreviewProducts = (isEnabled, businessId) => {
    return useQuery({
        queryKey: queryKeys.adminMenuPreviewProducts(businessId),
        queryFn: async () => {
            const response = await apiService.getAdminMenuPreviewProducts();
            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            console.error("AdminMenuPreviewPage: Unexpected data structure for admin menu products:", response.data);
            throw new Error("Unexpected data structure for admin menu products.");
        },
        enabled: !!isEnabled && !!businessId, // Ensure businessId is present
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: true, // Good for admin context
    });
};

function AdminMenuPreviewPageContent() {
    const { theme } = useTheme();
    const { user: adminUser } = useAuth();

    const currentLogo = theme === 'dark' ? LogoDark : LogoLight;

    // State for UI and interactions
    const [currentPage, setCurrentPage] = useState('menu'); // Mobile nav: 'menu', 'order', 'deals', 'discounts'
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024); // lg breakpoint

    // Order and product option states
    const [previewOrderItems, setPreviewOrderItems] = useState([]);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null); // { product, imageRect }
    const [flyingItem, setFlyingItem] = useState(null);

    // Modal states
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalProps, setUserModalProps] = useState({ title: '', message: '', type: 'info', isLoading: false });

    // Snake game easter egg
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showSnakeGame, setShowSnakeGame] = useState(false);

    // Refs for animation targets
    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);

    // Fetching product data
    const businessId = adminUser?.activeBusinessId; // Get businessId from authenticated admin user
    const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useAdminMenuPreviewProducts(!!businessId, businessId);

    const categorizedProducts = useMemo(() => {
        if (!productsData) return {};
        const categoriesMap = {};
        productsData.forEach(product => {
            if (!product || !product.id || !product.category_details || !product.category_details.id) {
                console.warn("AdminMenuPreviewPage: Skipping product due to missing critical data for categorization:", product);
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

    // Effect for handling window resize (desktop/mobile switch)
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect for closing modals on Escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isOptionsPopupOpen) {
                    setIsOptionsPopupOpen(false); setCurrentItemForOptions(null);
                } else if (isUserModalOpen && !userModalProps.isLoading) {
                    setIsUserModalOpen(false);
                } else if (showSnakeGame) {
                    setShowSnakeGame(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOptionsPopupOpen, isUserModalOpen, userModalProps.isLoading, showSnakeGame]);

    const handleLogoClick = () => {
        const newClickCount = logoClickCount + 1;
        setLogoClickCount(newClickCount);
        if (newClickCount >= 7) {
            setShowSnakeGame(true);
            setLogoClickCount(0);
        }
    };

    const addToPreviewOrder = useCallback((itemToAdd, itemImageRect) => {
        setPreviewOrderItems(prevItems => {
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

        if (itemImageRect && targetRect && itemToAdd.imageUrl) {
            setFlyingItem({
                id: Date.now(),
                imageUrl: itemToAdd.imageUrl,
                startRect: itemImageRect,
                endRect: targetRect,
            });
        }
    }, [isDesktop]);

    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        if (!hasOptions) {
            const { displayPrice: effectiveBasePrice } = getEffectiveDisplayPrice(product);
            const simpleItemToAdd = {
                id: `${product.id}-base-${Date.now()}`, // Unique ID for preview order
                originalId: product.id,
                name: product.name,
                imageUrl: product.image_url,
                price: effectiveBasePrice,
                quantity: 1,
                selectedOptionsSummary: null,
            };
            addToPreviewOrder(simpleItemToAdd, imageRect);
        } else {
            setCurrentItemForOptions({ product, imageRect });
            setIsOptionsPopupOpen(true);
        }
    }, [addToPreviewOrder]);

    const handleConfirmWithOptions = useCallback((originalProduct, configuredItemDetailsPayload) => {
        const { quantity, selectedOptions, finalPricePerItem } = configuredItemDetailsPayload;
        const optionsSummary = selectedOptions
            .map(opt => `${opt.groupName ? opt.groupName + ': ' : ''}${opt.optionName}`)
            .join('; ') || null;

        const optionIdsString = selectedOptions.map(opt => opt.optionId).sort().join('_');
        const uniqueOrderItemId = `${originalProduct.id}-${optionIdsString || 'custombasepreview'}-${Date.now()}`;


        const newItem = {
            id: uniqueOrderItemId,
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: finalPricePerItem,
            quantity: quantity,
            selectedOptionsSummary: optionsSummary,
        };

        addToPreviewOrder(newItem, currentItemForOptions?.imageRect);
        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    }, [addToPreviewOrder, currentItemForOptions]);

    const updatePreviewQuantity = useCallback((itemId, newQuantity) => {
        if (newQuantity <= 0) {
            setPreviewOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } else {
            setPreviewOrderItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    }, []);

    const handleSimulatedConfirmOrderAction = useCallback(async (orderDetailsPayload) => {
        setUserModalProps({ title: "Simulating Order...", message: "Processing preview order details.", type: "info", isLoading: true });
        setIsUserModalOpen(true);

        console.log("ADMIN PREVIEW - SIMULATED ORDER PAYLOAD:", JSON.stringify(orderDetailsPayload, null, 2));

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setUserModalProps({
            title: "Preview Order Confirmed (Simulated)",
            message: `This is a simulation. The order details have been logged to the console. Order for: ${orderDetailsPayload.user_name || 'Admin Preview'}, Table: ${orderDetailsPayload.table_number || 'N/A'}. Total: $${orderDetailsPayload.total_amount.toFixed(2)}.`,
            type: "success",
            isLoading: false,
        });
        setPreviewOrderItems([]); // Clear the preview order
        if (!isDesktop) {
            setCurrentPage('menu'); // Navigate to menu on mobile after "order"
        }
    }, [isDesktop]);

    const handleUserModalClose = () => {
        setIsUserModalOpen(false);
        setUserModalProps({ title: '', message: '', type: 'info', isLoading: false });
    };

    // Loading and error states for product fetching
    if (isLoadingProducts && !productsData) { // Show full page loader only on initial load without data
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-neutral-900">
                <Spinner size="xl" />
                <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-lg">Loading Menu Preview...</p>
            </div>
        );
    }

    if (productsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-neutral-900 p-6">
                <Icon name="error_outline" className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Error Loading Menu</h2>
                <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md">
                    Could not fetch product data for the preview. Message: {productsError.message}. Please try refreshing the page or check your connection.
                </p>
            </div>
        );
    }

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-neutral-900 p-6">
                <Icon name="business_center" className="w-16 h-16 text-orange-500 dark:text-orange-400 mb-4" />
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2">No Active Business</h2>
                <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md">
                    An active business is required to preview the menu. Please ensure you have an active business selected in your profile.
                </p>
            </div>
        );
    }


    // Main page layout
    return (
        <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-neutral-900 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-30 px-4 py-2.5">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={currentLogo} alt="Smore Logo" className="h-9 md:h-10 object-contain cursor-pointer mr-3 md:mr-4" onClick={handleLogoClick} />
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-neutral-800 dark:text-neutral-100">Admin Menu Preview</h1>
                            {adminUser && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Previewing as: {adminUser.firstName || 'Admin'} for {adminUser.activeBusinessName || 'Current Business'}
                                </p>
                            )}
                        </div>
                    </div>
                    <ThemeToggleButton />
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex container mx-auto overflow-hidden max-w-full"> {/* Max-w-full to allow panels to take space */}
                {isDesktop ? (
                    <>
                        {/* Desktop: Main Menu Display Area */}
                        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                            {isLoadingProducts && productsData && <div className="flex justify-center py-4"><Spinner /> <span className="ml-2 dark:text-white">Updating menu...</span></div>}
                            <MenuDisplayLayout
                                categorizedProducts={categorizedProducts}
                                onOpenOptionsPopup={handleOpenOptionsPopup}
                                pageTitle="Interactive Menu Preview"
                            />
                        </main>

                        {/* Desktop: Order Summary Sidebar */}
                        <aside ref={orderPanelRefDesktop} className="w-full md:w-[320px] lg:w-[380px] xl:w-[420px] bg-neutral-800 text-white flex flex-col shadow-lg border-l border-neutral-700">
                            <OrderSummaryPanel
                                orderItems={previewOrderItems}
                                onUpdateQuantity={updatePreviewQuantity}
                                onConfirmOrderAction={handleSimulatedConfirmOrderAction}
                                isSidebarVersion={true}
                                isPreviewMode={true}
                                tableNumber="Admin Preview" // Example static values for admin
                                userName={adminUser?.firstName || "Admin"}
                            />
                        </aside>
                    </>
                ) : (
                    // Mobile: Single main content area, BottomNav switches content
                    <main className="flex-1 overflow-y-auto w-full pb-16"> {/* pb-16 for BottomNav */}
                        {isLoadingProducts && productsData && <div className="flex justify-center py-4"><Spinner /> <span className="ml-2 dark:text-white">Updating menu...</span></div>}
                        <AnimatePresence mode="wait">
                            {currentPage === 'menu' && (
                                <MenuDisplayLayout
                                    key="menuMobile"
                                    categorizedProducts={categorizedProducts}
                                    onOpenOptionsPopup={handleOpenOptionsPopup}
                                    pageTitle="Interactive Menu Preview"
                                />
                            )}
                            {currentPage === 'order' && (
                                <motion.div
                                    key="orderMobile"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                                    className="h-full" // Ensure it takes height for scrolling
                                >
                                    <OrderSummaryPanel
                                        orderItems={previewOrderItems}
                                        onUpdateQuantity={updatePreviewQuantity}
                                        onConfirmOrderAction={handleSimulatedConfirmOrderAction}
                                        isSidebarVersion={false}
                                        isPreviewMode={true}
                                        navigateToMenu={() => setCurrentPage('menu')}
                                        tableNumber="Admin Preview"
                                        userName={adminUser?.firstName || "Admin"}
                                    />
                                </motion.div>
                            )}
                            {/* Placeholder for Deals and Discounts for mobile */}
                            {(currentPage === 'deals' || currentPage === 'discounts') && (
                                <motion.div
                                    key={currentPage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6 text-center text-neutral-600 dark:text-neutral-300"
                                >
                                    <Icon name={currentPage === 'deals' ? "loyalty" : "local_offer"} className="w-12 h-12 mx-auto mb-3 text-neutral-400 dark:text-neutral-500" />
                                    <h2 className="text-xl font-semibold mb-2">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Preview</h2>
                                    <p>This section is for previewing {currentPage}. Content will be displayed here when available.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            {!isDesktop && (
                <BottomNav
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    orderItemCount={previewOrderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    orderTabRefProp={orderNavTabRefMobile}
                />
            )}

            {/* Modals and Animators */}
            <Modal isOpen={isUserModalOpen} onClose={handleUserModalClose} title={userModalProps.title} type={userModalProps.type} isLoading={userModalProps.isLoading}>
                <p>{userModalProps.message}</p>
            </Modal>

            <AnimatePresence>
                {flyingItem && <FlyingItemAnimator key={flyingItem.id} imageUrl={flyingItem.imageUrl} startRect={flyingItem.startRect} endRect={flyingItem.endRect} onAnimationComplete={() => setFlyingItem(null)} />}
            </AnimatePresence>

            {showSnakeGame && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}>
                    <div style={{ position: 'relative', borderRadius: '8px', width: '100%', height: `calc(100% - 70px)`, overflow: 'hidden', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

// Wrapper to provide ThemeContext and other global contexts if needed for this page
export default function AdminMenuPreviewPage() {
    return (
        <ThemeProvider> {/* Ensures useTheme works within AdminMenuPreviewPageContent */}
            <AdminMenuPreviewPageContent />
        </ThemeProvider>
    );
}