import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../utils/ThemeProvider';
import Icon from '../components/common/Icon';
import Spinner from '../components/common/Spinner'; // For loading state
import Modal from '../components/animated_alerts/Modal'; // For confirmation/error modals

// Import TanStack Query hook for fetching products (assuming ProductDataContext is updated or a new hook exists)
// For this example, let's assume a hook `useAdminMenuPreviewProducts` exists or is adapted.
// import { useAdminMenuPreviewProducts } from '../contexts/ProductDataContext'; // Or similar
// MOCKING the hook for now as its exact implementation isn't the focus here
const useAdminMenuPreviewProducts = () => {
    // This would typically fetch from /api/products/?is_active=true, scoped by business
    // and include all necessary related data (category_details, tags, attributes, discounts)
    // For now, simulate a loading state and then some mock data based on backend structure
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Simulate successful data fetch matching backend ProductSerializer
            // This mock data should be more representative of actual API output
            setData({
                results: [
                    // Example Product 1 (Adapt from your DummyData or backend structure)
                    {
                        id: "prod_uuid_1",
                        name: "Gourmet Croissant Deluxe",
                        subtitle: "Flaky & Buttery Perfection",
                        description: "Our signature croissant, made with premium European butter and a meticulous lamination process, resulting in unparalleled flakiness and a rich, buttery flavor. A true classic elevated.",
                        image_url: "https://images.pexels.com/photos/266946/pexels-photo-266946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                        selling_price_excl_tax: "3.75",
                        category: "cat_uuid_bread", // PK of category
                        category_details: { id: "cat_uuid_bread", name: "Artisan Breads", color_class: "bg-amber-500", icon_name: "bakery_dining", display_order: 0 },
                        product_tags_details: [
                            { id: "tag_uuid_veg", name: "Vegetarian", icon_name: "eco" },
                            { id: "tag_uuid_new", name: "New!", icon_name: "new_releases" }
                        ],
                        tax_rate_details: { id: "tax_uuid_std", name: "Standard VAT", rate_percentage: "21.00" },
                        editable_attribute_groups: [
                            {
                                id: "grp_uuid_size_croissant", name: "Size", type: "single_select", is_required: true, display_order: 0,
                                options: [
                                    { id: "opt_uuid_reg_c", name: "Regular", price_adjustment: "0.00", is_default: true, display_order: 0 },
                                    { id: "opt_uuid_lrg_c", name: "Large", price_adjustment: "1.25", is_default: false, display_order: 1 }
                                ]
                            },
                            {
                                id: "grp_uuid_fill_croissant", name: "Filling", type: "multi_select", is_required: false, display_order: 1,
                                options: [
                                    { id: "opt_uuid_choc_c", name: "Chocolate", price_adjustment: "0.75", is_default: false, display_order: 0 },
                                    { id: "opt_uuid_almond_c", name: "Almond Paste", price_adjustment: "0.90", is_default: false, display_order: 1 }
                                ]
                            }
                        ],
                        active_applied_product_discounts: [
                            // Example: A 10% discount on this specific croissant
                            // {
                            //     id: "pad_uuid_1", discount_master: "dm_uuid_promo10", discount_percentage_override: null,
                            //     discount_master_code_name: "CROISSANTLOVE", discount_master_type: "percentage",
                            //     discount_master_default_value: "10.00", effective_discount_value: "0.375", // 10% of 3.75
                            //     discount_master_is_active: true
                            // }
                        ],
                        product_type: "made_in_house",
                        // ... other fields
                    },
                    // Add more mock product objects here, especially in different categories
                    {
                        id: "prod_uuid_2",
                        name: "Iced Latte Supreme",
                        subtitle: "Cool & Refreshing",
                        description: "A perfect blend of rich espresso, cold milk, and your choice of syrup, served over ice. Customize it your way!",
                        image_url: "https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                        selling_price_excl_tax: "4.50",
                        category: "cat_uuid_drinks",
                        category_details: { id: "cat_uuid_drinks", name: "Beverages", color_class: "bg-sky-500", icon_name: "local_cafe", display_order: 1 },
                        product_tags_details: [{ id: "tag_uuid_cold", name: "Cold Drink", icon_name: "ac_unit" }],
                        tax_rate_details: { id: "tax_uuid_std", name: "Standard VAT", rate_percentage: "21.00" },
                        editable_attribute_groups: [
                            {
                                id: "grp_uuid_milk_latte", name: "Milk Choice", type: "single_select", is_required: true, display_order: 0,
                                options: [
                                    { id: "opt_uuid_dairy_l", name: "Dairy Milk", price_adjustment: "0.00", is_default: true, display_order: 0 },
                                    { id: "opt_uuid_oat_l", name: "Oat Milk", price_adjustment: "0.60", is_default: false, display_order: 1 },
                                    { id: "opt_uuid_almond_l", name: "Almond Milk", price_adjustment: "0.60", is_default: false, display_order: 2 }
                                ]
                            },
                            {
                                id: "grp_uuid_syrup_latte", name: "Syrup (Optional)", type: "multi_select", is_required: false, display_order: 1,
                                options: [
                                    { id: "opt_uuid_van_l", name: "Vanilla", price_adjustment: "0.50", is_default: false, display_order: 0 },
                                    { id: "opt_uuid_car_l", name: "Caramel", price_adjustment: "0.50", is_default: false, display_order: 1 }
                                ]
                            }
                        ],
                        active_applied_product_discounts: [],
                        product_type: "made_in_house",
                    }
                ]
            });
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    return {
        data: data?.results || [], isLoading, error, // Assuming API returns { results: [...] }
        refetch: () => { /* mock refetch */ setIsLoading(true); setTimeout(() => setIsLoading(false), 500); }
    };
};


// Import refactored components
import MenuDisplayLayout from '../features/menu_view/subcomponents/MenuDisplayLayout';
import ProductOptionsPopup from '../features/menu_view/subcomponents/ProductOptionsPopup';
import OrderSummaryPanel from '../features/menu_view/subcomponents/OrderSummaryPanel';
import FlyingItemAnimator from '../features/menu_view/subcomponents/FlyingItemAnimator'; // If used, though less relevant for admin preview

const AdminMenuPreviewPage = () => {
    const { user } = useAuth();
    const { theme } = useTheme(); // Provides 'light' or 'dark'

    // State for the preview "order"
    const [previewOrderItems, setPreviewOrderItems] = useState([]);
    // State for ProductOptionsPopup
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null); // Stores { product, imageRect }
    // State for FlyingItemAnimator (optional for admin preview, but shown for completeness)
    const [flyingItem, setFlyingItem] = useState(null);
    // State for general modals (e.g., order confirmation)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({ title: '', message: '', type: 'info' });


    // Fetch product data using TanStack Query (or the mock hook)
    const { data: products, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useAdminMenuPreviewProducts();

    // Prepare categorizedProducts for MenuDisplayLayout
    const categorizedProducts = useMemo(() => {
        if (!products) return {};
        const categories = {};
        products.forEach(product => {
            const catId = product.category; // Assuming product.category is the ID
            const catDetails = product.category_details || { name: "Uncategorized", color_class: "bg-gray-500", icon_name: "label", display_order: 99 };

            if (!categories[catId]) {
                categories[catId] = {
                    id: catId,
                    name: catDetails.name,
                    color_class: catDetails.color_class,
                    icon_name: catDetails.icon_name,
                    display_order: catDetails.display_order,
                    items: []
                };
            }
            categories[catId].items.push(product);
        });
        // Sort items within each category if needed, e.g., by product.display_order
        Object.values(categories).forEach(cat => {
            cat.items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        });
        return categories;
    }, [products]);

    // Handler to open the ProductOptionsPopup
    const handleOpenOptionsPopup = useCallback((product, imageRect) => {
        // If product has no editable_attribute_groups, add directly to preview order
        if (!product.editable_attribute_groups || product.editable_attribute_groups.length === 0) {
            const { displayPrice: effectiveBasePrice } = getEffectiveDisplayPrice(product);
            const simpleItemToAdd = {
                id: `${product.id}-base-${Date.now()}`, // Simple unique ID for preview
                originalId: product.id,
                name: product.name,
                imageUrl: product.image_url,
                price: effectiveBasePrice, // Price after product-level discounts
                quantity: 1,
                selectedSizeName: null,
                selectedExtrasNames: [],
            };
            setPreviewOrderItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === simpleItemToAdd.id && !item.selectedSizeName && item.selectedExtrasNames.length === 0); // Basic check
                if (existingItem) {
                    return prevItems.map(item => item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item);
                }
                return [...prevItems, simpleItemToAdd];
            });
            // Optionally trigger flying animation here if imageRect is available
            if (imageRect) { /* ... trigger flying item ... */ }
        } else {
            setCurrentItemForOptions({ product, imageRect });
            setIsOptionsPopupOpen(true);
        }
    }, []);

    // Handler for when options are confirmed in the popup
    const handleConfirmWithOptions = useCallback((originalProduct, selectedOptionsPayload) => {
        const newItem = {
            id: `${originalProduct.id}-${Date.now()}`, // Generate a unique ID for the preview order item
            originalId: originalProduct.id,
            name: originalProduct.name,
            imageUrl: originalProduct.image_url,
            price: selectedOptionsPayload.finalPricePerItem,
            quantity: selectedOptionsPayload.quantity,
            selectedSizeName: selectedOptionsPayload.selectedOptions.find(opt => opt.groupType === 'single_select')?.optionName || null, // Simplified
            selectedExtrasNames: selectedOptionsPayload.selectedOptions.filter(opt => opt.groupType === 'multi_select').map(opt => opt.optionName),
            // Could also store the full selectedOptionsPayload.selectedOptions if needed for detailed display in OrderItem
        };

        setPreviewOrderItems(prevItems => {
            // For simplicity in preview, we'll just add as a new item.
            // A real cart might try to find and update an identical configuration.
            return [...prevItems, newItem];
        });

        // Trigger flying animation
        if (currentItemForOptions?.imageRect) {
            // This needs a target ref for the OrderSummaryPanel
            // For admin preview, flying animation might be less critical or simplified
            console.log("Flying animation would trigger here if target is defined.");
        }

        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    }, [currentItemForOptions]);

    // Handler to update quantity in the preview order
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

    // Handler for confirming the preview order (simulated)
    const handleConfirmPreviewOrder = useCallback((orderDetails) => {
        console.log("Admin Preview Order Confirmed (Simulated):", orderDetails);
        setStatusModalProps({
            title: "Preview Order Confirmed!",
            message: "This is a simulation. The order details have been logged to the console. In a live system, this would be sent to the kitchen/POS.",
            type: "success"
        });
        setIsStatusModalOpen(true);
        // Optionally clear previewOrderItems after "confirmation"
        // setPreviewOrderItems([]);
    }, []);


    if (isLoadingProducts) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900">
                <Spinner size="xl" />
                <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading Menu Preview...</p>
            </div>
        );
    }

    if (productsError) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900 p-6 text-center">
                <Icon name="error" className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Failed to Load Menu</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    There was an error fetching the product data: {productsError.message || "Unknown error"}
                </p>
                <button
                    onClick={() => refetchProducts()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Header */}
            <header className="bg-white dark:bg-neutral-800 shadow-md p-4 sticky top-0 z-30">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-neutral-100 mb-2 sm:mb-0">
                        Admin Menu Preview
                    </h1>
                    {user && (
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 text-center sm:text-right">
                            <p>
                                Viewing as: <span className="font-semibold">{user.firstName || user.email || 'Admin User'}</span>
                            </p>
                            <p>
                                Business: <span className="font-semibold">{user.activeBusinessName || 'N/A'}</span>
                            </p>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area - Two Column Layout for Desktop */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Column: Menu Display */}
                <div className="flex-1 md:w-2/3 lg:w-3/4 overflow-y-auto bg-gray-50 dark:bg-neutral-850">
                    <MenuDisplayLayout
                        categorizedProducts={categorizedProducts}
                        onOpenOptionsPopup={handleOpenOptionsPopup}
                        pageTitle="Live Menu Preview"
                    />
                </div>

                {/* Right Column: Order Summary Panel (Desktop) */}
                <div className="md:w-1/3 lg:w-1/4 bg-neutral-100 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-lg overflow-y-auto">
                    <OrderSummaryPanel
                        orderItems={previewOrderItems}
                        onUpdateQuantity={handleUpdatePreviewQuantity}
                        onConfirmOrderAction={handleConfirmPreviewOrder}
                        isSidebarVersion={true} // Important for its internal layout
                        isPreviewMode={true}
                        tableNumber={user?.activeBusinessId ? "Admin Preview" : undefined} // Example dynamic data
                        userName={user?.firstName || user?.email || undefined}
                    />
                </div>
            </main>

            {/* Mobile: Order Summary as a separate view, not shown here but would use BottomNav */}
            {/* For admin preview, the right panel might always be visible on larger screens,
                and mobile might not have an "order" tab, focusing solely on menu item interaction.
                If mobile needs an order summary, a modal or a separate "preview cart" page would be typical.
                For this task, we assume the OrderSummaryPanel is for the desktop right column in Admin Preview.
            */}

            {/* Modals and Popups */}
            {currentItemForOptions && (
                <ProductOptionsPopup
                    isOpen={isOptionsPopupOpen}
                    onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }}
                    product={currentItemForOptions.product} // Pass the actual product object
                    onConfirmWithOptions={handleConfirmWithOptions}
                />
            )}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={statusModalProps.title}
                type={statusModalProps.type}
            >
                <p>{statusModalProps.message}</p>
            </Modal>

            {/* Flying Animator (Optional for admin preview) */}
            {/* <AnimatePresence>
                {flyingItem && (
                    <FlyingItemAnimator
                        key={flyingItem.id}
                        imageUrl={flyingItem.imageUrl}
                        startRect={flyingItem.startRect}
                        // endRect needs to be a ref to the OrderSummaryPanel or a specific target within it
                        onAnimationComplete={() => setFlyingItem(null)}
                    />
                )}
            </AnimatePresence> */}

            {/* Footer (Optional) */}
            <footer className="bg-white dark:bg-neutral-800 p-3 text-center text-xs text-gray-500 dark:text-neutral-400 border-t dark:border-neutral-700">
                Admin Preview Mode © {new Date().getFullYear()} Smore.
            </footer>
        </div>
    );
};

export default AdminMenuPreviewPage;