import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../utils/ThemeProvider';
import Icon from '../components/common/Icon';
import Spinner from '../components/common/Spinner';
import Modal from '../components/animated_alerts/Modal';
import apiService from '../services/api';
import { queryKeys } from '../services/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

// Core Menu Subcomponents
import MenuDisplayLayout from '../features/menu_view/subcomponents/MenuDisplayLayout';
import ProductOptionsPopup from '../features/menu_view/subcomponents/ProductOptionsPopup';
import OrderSummaryPanel from '../features/menu_view/subcomponents/OrderSummaryPanel';
import FlyingItemAnimator from '../features/menu_view/subcomponents/FlyingItemAnimator';
import BottomNav from '../features/menu_view/subcomponents/BottomNav'; // Import BottomNav
import { getEffectiveDisplayPrice } from '../features/menu_view/utils/productUtils';

const useAdminMenuPreviewProducts = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: queryKeys.adminMenuPreviewProducts(user?.activeBusinessId || 'admin_default_preview'),
        queryFn: async () => {
            const response = await apiService.get('products/', { params: { is_active: 'true' } });
            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            console.error("AdminMenuPreview: Unexpected data structure for products:", response.data);
            throw new Error("Unexpected data structure for admin menu preview products.");
        },
        enabled: !!user && !!user.activeBusinessId,
        staleTime: 1000 * 60 * 1,
        refetchOnWindowFocus: true,
    });
};

const AdminMenuPreviewPage = () => {
    const { user } = useAuth();
    const { theme } = useTheme();

    const [previewOrderItems, setPreviewOrderItems] = useState([]);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null);
    const [flyingItem, setFlyingItem] = useState(null);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({ title: '', message: '', type: 'info', isLoading: false });

    const [currentPage, setCurrentPage] = useState('menu'); // 'menu', 'order' (more could be added if needed)
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024); // lg breakpoint

    const orderPanelRefDesktop = useRef(null); // For desktop animation target
    const orderNavTabRefMobile = useRef(null); // For mobile BottomNav animation target

    const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useAdminMenuPreviewProducts();

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const categorizedProducts = useMemo(() => {
        if (!productsData) return {};
        const categoriesMap = {};
        productsData.forEach(product => {
            if (!product || !product.id || !product.category_details || !product.category_details.id) {
                console.warn("AdminMenuPreview: Skipping product due to missing critical data for categorization:", product);
                return;
            }
            const catId = product.category_details.id;
            const catDetails = product.category_details;
            if (!categoriesMap[catId]) {
                categoriesMap[catId] = {
                    id: catId,
                    name: catDetails.name || "Uncategorized",
                    color_class: catDetails.color_class || "bg-gray-500 dark:bg-gray-600",
                    icon_name: catDetails.icon_name || "label",
                    display_order: typeof catDetails.display_order === 'number' ? catDetails.display_order : 999,
                    items: []
                };
            }
            const productWithOrder = { ...product, display_order: typeof product.display_order === 'number' ? product.display_order : 0 };
            categoriesMap[catId].items.push(productWithOrder);
        });
        Object.values(categoriesMap).forEach(cat => {
            cat.items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        });
        return categoriesMap;
    }, [productsData]);

    const addOrUpdatePreviewItem = useCallback((itemToAdd) => {
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
    }, []);

    const triggerFlyingAnimation = useCallback((imageUrl, imageRect) => {
        let targetRect = null;
        if (isDesktop && orderPanelRefDesktop.current) { // Corrected: orderPanelRefDesktop
            targetRect = orderPanelRefDesktop.current.getBoundingClientRect();
        } else if (!isDesktop && orderNavTabRefMobile.current) {
            targetRect = orderNavTabRefMobile.current.getBoundingClientRect();
        }

        if (imageRect && targetRect && imageUrl) {
            setFlyingItem({
                id: Date.now(),
                imageUrl: imageUrl,
                startRect: imageRect,
                endRect: targetRect,
            });
        }
    }, [isDesktop]);

    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        if (!hasOptions) {
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
            addOrUpdatePreviewItem(simpleItemToAdd);
            triggerFlyingAnimation(product.image_url, imageRect);
        } else {
            setCurrentItemForOptions({ product, imageRect });
            setIsOptionsPopupOpen(true);
        }
    }, [addOrUpdatePreviewItem, triggerFlyingAnimation]);

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

        addOrUpdatePreviewItem(newItem);
        triggerFlyingAnimation(originalProduct.image_url, currentItemForOptions?.imageRect);

        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    }, [addOrUpdatePreviewItem, triggerFlyingAnimation, currentItemForOptions]);

    const handleUpdatePreviewQuantity = useCallback((itemId, newQuantity) => {
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
        setStatusModalProps({ title: "Processing Preview...", message: "Simulating order submission...", type: "info", isLoading: true });
        setIsStatusModalOpen(true);

        console.log("Admin Menu Preview - Simulated Order Payload:", JSON.stringify(orderDetailsPayload, null, 2));
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatusModalProps({
            title: "Preview Order Actioned!",
            message: "This is a simulation. The order details have been logged to the console. No actual order was placed.",
            type: "success",
            isLoading: false,
        });
        setPreviewOrderItems([]);
        if (!isDesktop) {
            setCurrentPage('menu');
        }
    }, [isDesktop]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isOptionsPopupOpen) {
                    setIsOptionsPopupOpen(false); setCurrentItemForOptions(null);
                } else if (isStatusModalOpen) {
                    if (!statusModalProps.isLoading) setIsStatusModalOpen(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOptionsPopupOpen, isStatusModalOpen, statusModalProps.isLoading]);

    if (isLoadingProducts) { /* ... loading state ... */
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900">
                <Spinner size="xl" />
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">Loading Menu Preview...</p>
            </div>
        );
    }
    if (productsError) { /* ... error state ... */
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900 p-6 text-center">
                <Icon name="error_outline" className="w-20 h-20 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-3">Failed to Load Menu Data</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-md">
                    There was an error fetching product data: {productsError.message || "An unknown error occurred."}
                </p>
                <button
                    onClick={() => refetchProducts()}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                > Try Again </button>
            </div>
        );
    }

    const previewPageTitle = "Live Customer Menu Preview";

    // Define content for mobile view based on currentPage
    const mobileMenuContent = (
        <div className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-850 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 pb-16`}> {/* Added pb-16 for BottomNav */}
            {productsData && (
                <MenuDisplayLayout
                    categorizedProducts={categorizedProducts}
                    onOpenOptionsPopup={handleOpenOptionsPopup}
                    pageTitle={previewPageTitle}
                />
            )}
        </div>
    );

    const mobileOrderContent = (
        <div className="flex-1 flex flex-col overflow-y-auto bg-neutral-100 dark:bg-neutral-900 pb-16"> {/* Added pb-16 for BottomNav */}
            <OrderSummaryPanel
                orderItems={previewOrderItems}
                onUpdateQuantity={handleUpdatePreviewQuantity}
                onConfirmOrderAction={handleSimulatedConfirmOrderAction}
                isSidebarVersion={false}
                isPreviewMode={true}
                tableNumber="Preview Table"
                userName={user?.firstName || user?.email || 'Admin'}
                navigateToMenu={() => setCurrentPage('menu')}
            />
        </div>
    );

    return (
        <div className={`flex flex-col min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
            <header className="bg-white dark:bg-neutral-800 shadow-md p-3 sm:p-4 sticky top-0 z-30">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center max-w-screen-2xl px-2 sm:px-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-neutral-100 mb-2 sm:mb-0">
                        <Icon name="visibility" className="inline-block mr-2 align-text-bottom" />
                        Admin Menu Preview
                    </h1>
                    {user && (
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 text-center sm:text-right">
                            <p>Viewing as: <span className="font-semibold">{user.firstName || user.email || 'Admin'}</span></p>
                            {user.activeBusinessName && <p>Business: <span className="font-semibold">{user.activeBusinessName}</span></p>}
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {isDesktop ? (
                    <>
                        {/* Desktop: Menu Display Area */}
                        <div className="flex-1 lg:w-2/3 xl:w-3/4 overflow-y-auto bg-gray-50 dark:bg-neutral-850 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                            {productsData && (
                                <MenuDisplayLayout
                                    categorizedProducts={categorizedProducts}
                                    onOpenOptionsPopup={handleOpenOptionsPopup}
                                    pageTitle={previewPageTitle}
                                />
                            )}
                        </div>
                        {/* Desktop: Order Summary Panel */}
                        <aside
                            ref={orderPanelRefDesktop} // Corrected ref name
                            className="lg:w-1/3 xl:w-1/4 flex flex-col bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-lg"
                            role="complementary" aria-label="Simulated order summary"
                        >
                            <OrderSummaryPanel
                                orderItems={previewOrderItems}
                                onUpdateQuantity={handleUpdatePreviewQuantity}
                                onConfirmOrderAction={handleSimulatedConfirmOrderAction}
                                isSidebarVersion={true}
                                isPreviewMode={true}
                                tableNumber="Preview Table"
                                userName={user?.firstName || user?.email || 'Admin'}
                            />
                        </aside>
                    </>
                ) : (
                    // Mobile: Content switches based on currentPage
                    <div className="flex-1 flex flex-col overflow-hidden"> {/* Ensure mobile also has flex container */}
                        {currentPage === 'menu' && mobileMenuContent}
                        {currentPage === 'order' && mobileOrderContent}
                        {/* Add other pages like 'deals', 'discounts' here if needed for preview */}
                    </div>
                )}
            </main>

            {!isDesktop && (
                <BottomNav
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    orderItemCount={previewOrderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    orderTabRefProp={orderNavTabRefMobile}
                // For admin preview, we might only need 'Menu' and 'Order' tabs.
                // If 'Deals' and 'Discounts' pages are not part of this preview scope,
                // BottomNav could be simplified or configured to show fewer items.
                // For now, assuming full BottomNav for complete UX preview.
                />
            )}

            {/* Modals & Global Animators */}
            {currentItemForOptions && productsData && ( /* ... ProductOptionsPopup ... */
                <ProductOptionsPopup
                    isOpen={isOptionsPopupOpen}
                    onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                    product={currentItemForOptions.product}
                    onConfirmWithOptions={handleConfirmWithOptions}
                />
            )}
            <Modal isOpen={isStatusModalOpen} /* ... Status Modal ... */
                onClose={() => { if (!statusModalProps.isLoading) setIsStatusModalOpen(false); }}
                title={statusModalProps.title}
                type={statusModalProps.type}
                isLoading={statusModalProps.isLoading} >
                <p>{statusModalProps.message}</p>
            </Modal>
            <AnimatePresence>
                { flyingItem && (
                    <FlyingItemAnimator
                        key={flyingItem.id}
                        imageUrl={flyingItem.imageUrl}
                        startRect={flyingItem.startRect}
                        endRect={flyingItem.endRect}
                        onAnimationComplete={() => setFlyingItem(null)}
                    />
                )}
            </AnimatePresence>

            <footer className="bg-white dark:bg-neutral-800 p-3 text-center text-xs text-gray-500 dark:text-neutral-400 border-t dark:border-neutral-700">
                Admin Preview Mode © {new Date().getFullYear()} Smore. All Rights Reserved.
            </footer>
        </div>
    );
};

export default AdminMenuPreviewPage;