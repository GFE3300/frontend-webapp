// frontend/src/features/menu_view/Userpage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// ... other existing imports like API hooks, context, etc.
// import { useVenueContext } from '../../context/VenueContext'; // Assuming for Task 2.2
// import { fetchMenuItems, fetchCategories, fetchTags } from '../../api/menuApi'; // Example API calls

import MenuDisplayLayout from './subcomponents/MenuDisplayLayout';
import OrderSummaryPanel from './subcomponents/OrderSummaryPanel';
import ProductDetailModal from './subcomponents/ProductDetailModal'; // New Import
// import ProductOptionsPopup from './subcomponents/ProductOptionsPopup'; // REMOVE THIS
import CategoryFilterBar from './subcomponents/CategoryFilterBar';
import TagFilterPills from './subcomponents/TagFilterPills';
// import SearchBar from '../../components/common/SearchBar'; // Assuming

// Placeholder utilities (these should ideally be in a separate utils file)
const getEffectiveDisplayPrice = (product) => {
  // Placeholder logic, replace with actual implementation from your utils
  return { displayPrice: product?.price || 0, basePrice: product?.price || 0 };
};

// This utility is primarily used within ProductDetailModal, but addToOrder might need similar logic
// or can rely on the prices calculated by the modal.
// const calculateItemPriceWithSelectedOptions = (basePrice, selectedOptionsMap, product) => { ... };


// Mock data fetching functions for demonstration if not provided by existing hooks
const mockFetchData = (data, delay = 500) => new Promise(resolve => setTimeout(() => resolve(data), delay));
const mockFetchMenuItems = () => mockFetchData([
    // Example product structure
    { id: 'prod1', name: 'Pizza Margherita', subtitle: 'Classic and delicious', description: 'Fresh mozzarella, basil, and San Marzano tomatoes.', price: 1200, image_url: 'https://via.placeholder.com/300x200/pizza', category_id: 'cat1', tags: ['tag1'], editable_attribute_groups: [
        { id: 'group1', name: 'Size', display_order: 1, type: 'SINGLE_SELECT', is_required: true, options: [
            { id: 'opt1a', name: 'Small (10")', price_adjustment: -200, display_order: 1 },
            { id: 'opt1b', name: 'Medium (12")', price_adjustment: 0, display_order: 2 },
            { id: 'opt1c', name: 'Large (14")', price_adjustment: 300, display_order: 3 },
        ]},
        { id: 'group2', name: 'Crust', display_order: 2, type: 'SINGLE_SELECT', is_required: true, options: [
            { id: 'opt2a', name: 'Thin Crust', price_adjustment: 0, display_order: 1 },
            { id: 'opt2b', name: 'Thick Crust', price_adjustment: 100, display_order: 2 },
        ]},
        { id: 'group3', name: 'Extra Toppings', display_order: 3, type: 'MULTI_SELECT', is_required: false, options: [
            { id: 'opt3a', name: 'Pepperoni', price_adjustment: 150, display_order: 1 },
            { id: 'opt3b', name: 'Mushrooms', price_adjustment: 100, display_order: 2 },
            { id: 'opt3c', name: 'Olives', price_adjustment: 75, display_order: 3 },
        ]}
    ]},
    { id: 'prod2', name: 'Coca-Cola', subtitle: 'Refreshing drink', description: 'Classic Coca-Cola.', price: 250, image_url: 'https://via.placeholder.com/300x200/cola', category_id: 'cat2', tags: ['tag2'], editable_attribute_groups: [] },
    { id: 'prod3', name: 'Caesar Salad', subtitle: 'Healthy and Fresh', description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing.', price: 800, image_url: 'https://via.placeholder.com/300x200/salad', category_id: 'cat3', tags: ['tag1', 'tag3'], editable_attribute_groups: [
        { id: 'group4', name: 'Add Protein', display_order: 1, type: 'SINGLE_SELECT', is_required: false, options: [
            { id: 'opt4a', name: 'Grilled Chicken', price_adjustment: 300, display_order: 1 },
            { id: 'opt4b', name: 'Shrimp', price_adjustment: 400, display_order: 2 },
        ]}
    ]},
]);
const mockFetchCategories = () => mockFetchData([{ id: 'cat1', name: 'Pizza' }, { id: 'cat2', name: 'Drinks' }, { id: 'cat3', name: 'Salads' }]);
const mockFetchTags = () => mockFetchData([{ id: 'tag1', name: 'Vegetarian' }, { id: 'tag2', name: 'Beverage' }, { id: 'tag3', name: 'Healthy' }]);


function Userpage() {
  // --- Existing State (examples) ---
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  
  const [isLoadingProductsInitial, setIsLoadingProductsInitial] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [menuError, setMenuError] = useState(null);

  // --- State for ProductDetailModal ---
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [currentProductForDetailModal, setCurrentProductForDetailModal] = useState(null);

  // --- State for Setup Stage Data (Task 2.2 - anticipating) ---
  // const { venueContext, setVenueContext } = useVenueContext(); // Or dedicated state
  const [userName, setUserName] = useState(''); // To be populated from SetupStage
  const [numberOfPeople, setNumberOfPeople] = useState(1); // To be populated from SetupStage

  // --- Data Fetching (Example) ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingProductsInitial(true);
        setIsLoadingCategories(true);
        setIsLoadingTags(true);
        setMenuError(null);

        // Replace with actual API calls
        const [productsData, categoriesData, tagsData] = await Promise.all([
          mockFetchMenuItems(), 
          mockFetchCategories(),
          mockFetchTags()
        ]);

        setMenuItems(productsData || []);
        setCategories(categoriesData || []);
        setTags(tagsData || []);

      } catch (error) {
        console.error("Error fetching menu data:", error);
        setMenuError("Could not load menu. Please try again later.");
      } finally {
        setIsLoadingProductsInitial(false);
        setIsLoadingCategories(false);
        setIsLoadingTags(false);
      }
    };
    loadInitialData();
  }, []);

  // --- Core Logic for Adding to Order ---
  const addToOrder = useCallback((product, configuredItemDetails) => {
    // configuredItemDetails: { quantity, selectedOptions (detailed array), finalPricePerItem, totalPriceForQuantity }
    console.log("Adding to order:", product.name, configuredItemDetails);

    const orderItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // More robust unique ID
    
    const newOrderItem = {
      id: orderItemId, // Unique ID for this specific instance in the order
      productId: product.id,
      name: product.name,
      notes: configuredItemDetails.notes || "", // Assuming notes might be part of configuredItemDetails in future
      quantity: configuredItemDetails.quantity,
      
      // Prices are from the modal, which already calculated them with options
      basePrice: getEffectiveDisplayPrice(product).basePrice, // Original base price of the product
      pricePerItem: configuredItemDetails.finalPricePerItem, // Price for one item with selected options
      totalPrice: configuredItemDetails.totalPriceForQuantity, // Total for the quantity of this item with options
      
      selectedOptions: configuredItemDetails.selectedOptions, // Array: [{ group_id, group_name, option_id, option_name, price_adjustment }]
      image_url: product.image_url, // For display in order summary
      // Potentially store product.category_id or other metadata if needed for order summary grouping/analytics
    };

    setOrderItems(prevItems => [...prevItems, newOrderItem]);
  }, []); // Add dependencies if addToOrder uses state/props not listed (e.g., from context)


  // --- Handlers for ProductDetailModal ---
  const handleOpenProductDetailModal = useCallback((product) => {
    setCurrentProductForDetailModal(product);
    setIsProductDetailModalOpen(true);
  }, []);

  const handleCloseProductDetailModal = useCallback(() => {
    setIsProductDetailModalOpen(false);
    // Delay clearing to allow for exit animation if needed, though modal internal state resets on open.
    // setCurrentProductForDetailModal(null); // Can be cleared immediately or on next open
  }, []);

  const handleConfirmProductDetailModal = useCallback((originalProduct, configuredItemDetails) => {
    // originalProduct is the product passed to the modal
    // configuredItemDetails is { quantity, selectedOptions (detailed array), finalPricePerItem, totalPriceForQuantity }
    addToOrder(originalProduct, configuredItemDetails);
    // Modal handles its own closing via its onConfirmWithOptions -> onClose sequence.
    // handleCloseProductDetailModal(); // Not strictly necessary if modal calls its onClose
  }, [addToOrder]);


  // --- Filter/Search State & Logic (Placeholder) ---
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeTagIds, setActiveTagIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [isFetchingWhileFiltered, setIsFetchingWhileFiltered] = useState(false); // For Task 2.3

  const filteredMenuItems = useMemo(() => {
    // Placeholder: Actual filtering logic based on activeCategoryId, activeTagIds, searchTerm
    // This logic will be more complex in a real app, potentially involving API calls for server-side filtering.
    return menuItems.filter(item => {
        const categoryMatch = !activeCategoryId || item.category_id === activeCategoryId;
        const tagMatch = activeTagIds.length === 0 || activeTagIds.every(tagId => item.tags?.includes(tagId));
        const searchMatch = !searchTerm || 
                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && tagMatch && searchMatch;
    });
  }, [menuItems, activeCategoryId, activeTagIds, searchTerm]);
  

  // --- Setup Stage Data Integration (Task 2.2 - placeholder) ---
  const handleSetupComplete = ({ userName: uName, numberOfPeople: numP, tableNumber }) => {
    setUserName(uName);
    setNumberOfPeople(numP);
    // Assuming tableNumber is already handled by venueContext or similar
    // if (setVenueContext) {
    //   setVenueContext(prev => ({ ...prev, publicTableInfoData: { ...prev.publicTableInfoData, tableNumber }}));
    // }
    console.log(`Setup complete: User: ${uName}, Guests: ${numP}, Table: ${tableNumber}`);
  };

  // Simulate setup completion for testing
  useEffect(() => {
    // In a real app, this would come from SetupStage.jsx
    // For now, let's mock it. Remove this in production.
    // handleSetupComplete({ userName: 'Test User', numberOfPeople: 2, tableNumber: 'T5' });
  }, []);


  // --- Render ---
  return (
    <div className="userpage-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header/Navbar placeholder */}
      <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h1>CrumbData Menu</h1>
        {/* For Task 2.2, this info might also appear here or elsewhere */}
        {userName && <p>Ordering for: {userName} ({numberOfPeople} guests)</p>}
      </header>

      {/* Main content area */}
      <div className="menu-content-area" style={{ display: 'flex', flexGrow: 1, padding: '1rem' }}>
        <div className="menu-main-column" style={{ flex: 3, marginRight: '1rem' }}>
          {/* <SearchBar value={searchTerm} onChange={setSearchTerm} /> */}
          <CategoryFilterBar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            isLoading={isLoadingCategories} // For Task 2.3
          />
          <TagFilterPills
            tags={tags}
            activeTagIds={activeTagIds}
            onToggleTag={ (tagId) => 
                setActiveTagIds(prev => 
                    prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
                )
            }
            isLoading={isLoadingTags} // For Task 2.3
          />

          {menuError && <div style={{ color: 'red', padding: '1rem' }}>{menuError}</div>}
          
          <MenuDisplayLayout
            menuItems={filteredMenuItems}
            isLoading={isLoadingProductsInitial} // For Task 2.3 (initial load)
            // isFetchingWhileFiltered={isFetchingWhileFiltered} // For Task 2.3 (updates)
            onMenuItemClick={handleOpenProductDetailModal} // Updated handler
            // For Task 2.3: Pass enhanced empty/error state props if needed
          />
        </div>

        <div className="menu-sidebar-column" style={{ flex: 1 }}>
          <OrderSummaryPanel
            orderItems={orderItems}
            setOrderItems={setOrderItems} // Allow OrderSummaryPanel to modify order (e.g., remove item, change quantity)
            // Props for Task 2.2
            userName={userName}
            numberOfPeople={numberOfPeople}
            // tableNumber={venueContext?.publicTableInfoData?.tableNumber} // Example
            // onConfirmOrder={handleActualConfirmOrder} // Function to submit order to backend
          />
        </div>
      </div>

      {/* Product Detail Modal */}
      {currentProductForDetailModal && ( // Ensure product is loaded before rendering modal
        <ProductDetailModal
          isOpen={isProductDetailModalOpen}
          onClose={handleCloseProductDetailModal}
          product={currentProductForDetailModal}
          onConfirmWithOptions={handleConfirmProductDetailModal}
        />
      )}

      {/* Footer placeholder */}
      <footer style={{ padding: '1rem', backgroundColor: '#f0f0f0', textAlign: 'center', marginTop: 'auto' }}>
        <p>© 2025 CrumbData</p>
      </footer>
    </div>
  );
}

export default Userpage;