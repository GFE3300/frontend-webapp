import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext'; // For user context (admin details)
import { useTheme } from '../utils/ThemeProvider'; // For consistent theme
import Icon from '../components/common/Icon';
import Spinner from '../components/common/Spinner';
import Modal from '../components/animated_alerts/Modal';
import apiService from '../services/api'; // For fetching products
import { queryKeys } from '../services/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

// Core Menu Subcomponents from features/menu_view/subcomponents/
import MenuDisplayLayout from '../features/menu_view/subcomponents/MenuDisplayLayout';
import ProductOptionsPopup from '../features/menu_view/subcomponents/ProductOptionsPopup';
import OrderSummaryPanel from '../features/menu_view/subcomponents/OrderSummaryPanel';
import FlyingItemAnimator from '../features/menu_view/subcomponents/FlyingItemAnimator';
import { getEffectiveDisplayPrice } from '../features/menu_view/utils/productUtils';

// Custom Hook for fetching products for the admin menu preview.
const useAdminMenuPreviewProducts = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: queryKeys.adminMenuPreviewProducts(user?.activeBusinessId || 'admin_default_preview'),
        queryFn: async () => {
            // Endpoint should fetch products relevant for admin preview (e.g., all active, or all regardless of stock for config testing)
            // For now, assuming it fetches all active products for the business.
            const response = await apiService.get('products/', { params: { is_active: 'true' } });

            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) { // Handle non-paginated if backend returns that
                return response.data;
            }
            console.error("AdminMenuPreview: Unexpected data structure for products:", response.data);
            throw new Error("Unexpected data structure for admin menu preview products.");
        },
        enabled: !!user && !!user.activeBusinessId,
        staleTime: 1000 * 60 * 1, // Cache for 1 minute for admin preview (shorter than customer)
        refetchOnWindowFocus: true, // Good for admins who might be editing products elsewhere
    });
};

const AdminMenuPreviewPage = () => {
    const { user } = useAuth();
    const { theme } = useTheme(); // Not directly used for styling here, but good for context if sub-components need it

    const [previewOrderItems, setPreviewOrderItems] = useState([]);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null); // { product, imageRect }
    const [flyingItem, setFlyingItem] = useState(null);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({ title: '', message: '', type: 'info', isLoading: false });

    const orderPanelRef = useRef(null); // Ref for the order summary panel (animation target)

    const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useAdminMenuPreviewProducts();

    const categorizedProducts = useMemo(() => {
        if (!productsData) return {};
        const categoriesMap = {};
        productsData.forEach(product => {
            if (!product || !product.id || !product.category_details || !product.category_details.id) {
                console.warn("AdminMenuPreview: Skipping product due to missing critical data:", product);
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
        if (imageRect && orderPanelRef.current) {
            setFlyingItem({
                id: Date.now(),
                imageUrl: imageUrl,
                startRect: imageRect,
                endRect: orderPanelRef.current.getBoundingClientRect(),
            });
        }
    }, []);

    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        const hasOptions = product.editable_attribute_groups && product.editable_attribute_groups.length > 0;
        if (!hasOptions) { // Direct add for items without configurable options
            const { displayPrice: effectiveBasePrice } = getEffectiveDisplayPrice(product);
            const simpleItemToAdd = {
                id: `${product.id}-base-${Date.now()}`, // Unique ID for simple items
                originalId: product.id,
                name: product.name,
                imageUrl: product.image_url,
                price: effectiveBasePrice,
                quantity: 1, // Always add one quantity
                selectedOptionsSummary: null,
            };
            addOrUpdatePreviewItem(simpleItemToAdd);
            triggerFlyingAnimation(product.image_url, imageRect);
        } else {
            setCurrentItemForOptions({ product, imageRect }); // Store product and imageRect
            setIsOptionsPopupOpen(true);
        }
    }, [addOrUpdatePreviewItem, triggerFlyingAnimation]);

    const handleConfirmWithOptions = useCallback((originalProduct, configuredItemDetailsPayload) => {
        const { quantity, selectedOptions, finalPricePerItem } = configuredItemDetailsPayload;
        const optionsSummary = selectedOptions
            .map(opt => `${opt.groupName ? opt.groupName + ': ' : ''}${opt.optionName}`)
            .join('; ') || null;

        const optionIdsString = selectedOptions.map(opt => opt.optionId).sort().join('_');
        // Unique ID for this specific configuration in the preview order
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
        // Use imageRect from state that was stored when popup opened
        triggerFlyingAnimation(originalProduct.image_url, currentItemForOptions?.imageRect);

        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null); // Clear current item after handling
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
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        setStatusModalProps({
            title: "Preview Order Actioned!",
            message: "This is a simulation. The order details have been logged to the console. No actual order was placed.",
            type: "success",
            isLoading: false,
        });
        // isStatusModalOpen remains true for admin to see the message
        setPreviewOrderItems([]); // Clear items after "confirmation" for the preview
        // OrderSummaryPanel internal state (promo, notes) will be reset next time it gets items if it's keyed, or manually.
        // For this preview, it's acceptable for it to retain its state until new items are added.
    }, []);

    useEffect(() => { // Close modals on Esc
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

    if (isLoadingProducts) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900">
                <Spinner size="xl" />
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">Loading Menu Preview...</p>
            </div>
        );
    }

    if (productsError) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900 p-6 text-center">
                <Icon name="error_outline" className="w-20 h-20 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-3">Failed to Load Menu Data</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-md">
                    There was an error fetching product data: {productsError.message || "An unknown error occurred."}
                    <br />Ensure the backend service is running and you are properly authenticated with an active business.
                </p>
                <button
                    onClick={() => refetchProducts()}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
            <header className="bg-white dark:bg-neutral-800 shadow-md p-3 sm:p-4 sticky top-0 z-30">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center max-w-screen-2xl px-2 sm:px-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-neutral-100 mb-2 sm:mb-0">
                        Admin Menu Preview
                    </h1>
                    {user && (
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 text-center sm:text-right">
                            <p>
                                Viewing as: <span className="font-semibold">{user.firstName || user.email || 'Admin'}</span>
                            </p>
                            {user.activeBusinessName && <p>
                                Business: <span className="font-semibold">{user.activeBusinessName}</span>
                            </p>}
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Menu Display Area - Always takes up the main portion */}
                <div className="flex-1 md:w-2/3 lg:w-3/4 overflow-y-auto bg-gray-50 dark:bg-neutral-850 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700" role="region" aria-label="Menu items for preview">
                    {productsData && ( // Render only if product data is available
                        <MenuDisplayLayout
                            categorizedProducts={categorizedProducts}
                            onOpenOptionsPopup={handleOpenOptionsPopup}
                            pageTitle="Live Menu Preview"
                        />
                    )}
                </div>

                {/* Order Summary Preview Area - Fixed width sidebar */}
                <aside
                    ref={orderPanelRef}
                    className="md:w-1/3 lg:w-1/4 bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-lg flex flex-col"
                    role="complementary"
                    aria-label="Simulated order summary"
                >
                    {/* OrderSummaryPanel will manage its own internal scroll if content exceeds its height */}
                    <OrderSummaryPanel
                        orderItems={previewOrderItems}
                        onUpdateQuantity={handleUpdatePreviewQuantity}
                        onConfirmOrderAction={handleSimulatedConfirmOrderAction}
                        isSidebarVersion={true} // Ensures it uses full height of its container
                        isPreviewMode={true}   // Critical prop for admin context behavior
                        tableNumber="Admin Preview"
                        userName={user?.firstName || user?.email || 'Admin'}
                    />
                </aside>
            </main>

            {/* Product Options Popup - Rendered conditionally */}
            {currentItemForOptions && productsData && (
                <ProductOptionsPopup
                    isOpen={isOptionsPopupOpen}
                    onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                    product={currentItemForOptions.product}
                    onConfirmWithOptions={handleConfirmWithOptions}
                />
            )}

            {/* Status Modal for feedback */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => { if (!statusModalProps.isLoading) setIsStatusModalOpen(false); }}
                title={statusModalProps.title}
                type={statusModalProps.type}
                isLoading={statusModalProps.isLoading}
            >
                <p>{statusModalProps.message}</p>
            </Modal>

            {/* Flying Item Animation */}
            <AnimatePresence>
                {flyingItem && (
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