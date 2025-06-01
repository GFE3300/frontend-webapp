// AdminMenuPreviewPage.jsx
// ... (imports and hooks remain the same as your previous output) ...

// Custom Hook for fetching products (useAdminMenuPreviewProducts)
// ... (remains the same) ...

// Animation variants
// ... (remains the same) ...

const AdminMenuPreviewPage = () => {
    const { user } = useAuth();
    const { theme } = useTheme();

    // States
    const [previewOrderItems, setPreviewOrderItems] = useState([]);
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null);
    const [flyingItem, setFlyingItem] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({ title: '', message: '', type: 'info', isLoading: false });

    const orderPanelRef = useRef(null);

    const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useAdminMenuPreviewProducts();

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
            cat.items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        });
        return categoriesMap;
    }, [productsData]);

    // Callbacks (addOrUpdatePreviewItem, triggerFlyingAnimation, handleOpenOptionsPopup, handleConfirmWithOptions, etc.)
    // ... (all callbacks from your previous output remain the same) ...
    // Callback to add/update item in the preview order (from Userpage.jsx)
    const addOrUpdatePreviewItem = useCallback((itemToAddWithConfig) => {
        setPreviewOrderItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === itemToAddWithConfig.id);
            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + itemToAddWithConfig.quantity,
                };
                return updatedItems;
            }
            return [...prevItems, itemToAddWithConfig];
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
        setStatusModalProps({ title: "Processing Preview...", message: "Simulating order submission. Details will be logged to console.", type: "info", isLoading: true });
        setIsStatusModalOpen(true);
        console.log("ADMIN MENU PREVIEW - SIMULATED ORDER SUBMISSION:");
        console.log(JSON.stringify(orderDetailsPayload, null, 2));
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatusModalProps({
            title: "Preview Order Actioned!",
            message: "This is a simulation. The order details have been logged to the console. No actual order was placed.",
            type: "success",
            isLoading: false,
        });
        setPreviewOrderItems([]);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (isOptionsPopupOpen) {
                    setIsOptionsPopupOpen(false);
                    setCurrentItemForOptions(null);
                } else if (isStatusModalOpen) {
                    if (!statusModalProps.isLoading) setIsStatusModalOpen(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOptionsPopupOpen, isStatusModalOpen, statusModalProps.isLoading]);


    // Loading and Error States
    if (isLoadingProducts) {
        // ... (same as before) ...
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900">
                <Spinner size="xl" />
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">Loading Menu Preview...</p>
            </div>
        );
    }

    if (productsError) {
        // ... (same as before) ...
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
        <motion.div
            className={`flex flex-col min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}
            variants={pageContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Header */}
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

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-100 dark:bg-neutral-900">
                {/* Menu Display Area */}
                <div
                    className="flex-1 md:w-2/3 lg:w-3/4 overflow-y-auto bg-gray-50 dark:bg-neutral-850 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
                    role="region"
                    aria-label="Menu items for preview"
                >
                    {/* INTEGRATE MenuDisplayLayout HERE */}
                    {productsData && Object.keys(categorizedProducts).length > 0 ? (
                        <MenuDisplayLayout
                            categorizedProducts={categorizedProducts}
                            onOpenOptionsPopup={handleOpenOptionsPopup}
                            pageTitle="Live Menu Preview"
                        />
                    ) : (
                        // Handle case where productsData is loaded but categorizedProducts is empty
                        // This could happen if products exist but none have valid category_details
                        // or if productsData is an empty array. MenuDisplayLayout itself has an empty state.
                        <MenuDisplayLayout
                            categorizedProducts={{}} // Pass empty to trigger its internal empty state
                            onOpenOptionsPopup={handleOpenOptionsPopup}
                            pageTitle="Live Menu Preview"
                        />
                    )}
                </div>

                {/* Order Summary Preview Area */}
                <aside
                    ref={orderPanelRef}
                    className="md:w-1/3 lg:w-1/4 bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-lg flex flex-col"
                    role="complementary"
                    aria-label="Simulated order summary"
                >
                    {/* Placeholder until OrderSummaryPanel is integrated */}
                    <div className="p-6 h-full flex flex-col">
                        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Order Summary Preview</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 flex-1">
                            <code>OrderSummaryPanel</code> (isSidebarVersion=true, isPreviewMode=true) will render here.
                        </p>
                        <div className="mt-auto pt-4 border-t border-neutral-300 dark:border-neutral-600">
                            <button className="w-full bg-blue-500 text-white py-2 rounded-md">Simulate Action</button>
                        </div>
                        {/* Example to test previewOrderItems:
                        <pre className="mt-4 p-2 bg-neutral-200 dark:bg-neutral-700 text-xs rounded overflow-x-auto max-h-60">
                            {JSON.stringify(previewOrderItems, null, 2)}
                        </pre> */}
                    </div>
                </aside>
            </main>

            {/* Status Modal */}
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

            {/* Footer */}
            <footer className="bg-white dark:bg-neutral-800 p-3 text-center text-xs text-gray-500 dark:text-neutral-400 border-t dark:border-neutral-700">
                Admin Preview Mode © {new Date().getFullYear()} Smore. All Rights Reserved.
            </footer>
        </motion.div>
    );
};

export default AdminMenuPreviewPage;