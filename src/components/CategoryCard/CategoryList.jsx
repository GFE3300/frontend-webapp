// FILE: C:/Users/maxda/Desktop/dads/data_cards/src/Category editor/CategoryList.jsx
// NAME: CategoryList.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryItem from './Subcomponents/CategoryItem';
import AddCategoryForm from './Subcomponents/AddCategoryForm';
import EditCategoryForm from './Subcomponents/EditCategoryForm';
import Modal from './Subcomponents/Modal';

// --- Icons --- (Keep existing icons: DropdownArrowIcon, PlusIcon, SearchIcon, SortAscIcon, SortDescIcon, TrashIcon)
const DropdownArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 dark:text-slate-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const SortAscIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h13.5M3 9h10.5M3 13.5h8.5M3 18h5.5m10-11.5L16 4m2.5 2.5V16" />
  </svg>
);
const SortDescIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="w-4 h-4">
     <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h13.5M3 9h10.5M3 13.5h8.5M3 18h5.5m10 2.5L16 18m2.5-2.5V4" />
  </svg>
);
const TrashIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.678-.112 1.017-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
// --- End Icons ---

const API_BASE_URL = 'http://localhost:8000/api/products'; 

const getAuthToken = () => {

    return "YOUR_ACCESS_TOKEN_HERE"; 
};

const CategoryList = ({
  // categories prop is no longer used for initial data, it will be fetched
  title = "Revenue by Category",
}) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'display_order', direction: 'asc' });
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token || token === "YOUR_ACCESS_TOKEN_HERE") {
        setError("Authentication token is missing or placeholder. Please configure.");
        setIsLoading(false);
        setCategoriesData([]); // Clear data if token is invalid
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      // Backend returns a paginated response or a direct list.
      // If paginated, data might be data.results. Adjust if needed.
      // For now, assuming it's a direct list from the ViewSet's default list action without pagination,
      // or you've adjusted the backend for a simpler list for this specific case.
      // Or, if your ViewSet uses pagination, use data.results
      const categories = Array.isArray(data) ? data : (data.results || []);

      // Add dummy 'value' and 'percentage' if needed for display, as backend doesn't store them
      // This is just to keep the UI somewhat consistent with previous state.
      // In a real app, these would be derived or handled differently.
      setCategoriesData(categories.map(cat => ({
          ...cat,
          value: cat.value !== undefined ? cat.value : Math.floor(Math.random() * 100000), // Example placeholder
          percentage: cat.percentage !== undefined ? cat.percentage : Math.floor(Math.random() * 50) // Example placeholder
      })));
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      setError(e.message);
      setCategoriesData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array: fetchCategories itself doesn't change

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Run once on mount and if fetchCategories reference changes (it won't here)


  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleOpenEditModal = (category) => setEditingCategory(category);
  const handleCloseEditModal = () => setEditingCategory(null);
  const handleOpenDeleteConfirmModal = (category) => setDeletingCategory(category);
  const handleCloseDeleteConfirmModal = () => setDeletingCategory(null);

  const handleAddCategorySubmit = async (newCategoryData) => {
    setIsLoading(true); // Or a more specific loading state for this action
    setError(null);
    const token = getAuthToken();
    // Backend expects: name, color_class, icon_name (optional), display_order
    // Frontend form provides: name, color_class, display_order (value, percentage are ignored for backend)
    const payload = {
        name: newCategoryData.name,
        color_class: newCategoryData.color_class,
        display_order: parseInt(newCategoryData.display_order, 10) || 0,
        // icon_name: newCategoryData.icon_name || null, // If you add icon_name to your form
    };

    try {
        const response = await fetch(`${API_BASE_URL}/categories/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || JSON.stringify(errorData) || `HTTP error ${response.status}`);
        }
        // const createdCategory = await response.json(); // Use if you want to optimistically update
        handleCloseAddModal();
        fetchCategories(); // Re-fetch to get the latest list including the new one
    } catch (e) {
        console.error("Failed to add category:", e);
        setError(`Add failed: ${e.message}`);
        // Potentially keep modal open and display error there
    } finally {
        setIsLoading(false); // Reset general loading or specific action loading
    }
  };

  const handleUpdateCategorySubmit = async (updatedCategoryData) => {
    if (!editingCategory || !editingCategory.id) return;
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    const payload = {
        name: updatedCategoryData.name,
        color_class: updatedCategoryData.color_class,
        display_order: parseInt(updatedCategoryData.display_order, 10) || 0,
        // icon_name: updatedCategoryData.icon_name || null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}/`, {
            method: 'PUT', // Or PATCH if you want partial updates
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || JSON.stringify(errorData) || `HTTP error ${response.status}`);
        }
        handleCloseEditModal();
        fetchCategories();
    } catch (e) {
        console.error("Failed to update category:", e);
        setError(`Update failed: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory || !deletingCategory.id) return;
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/categories/${deletingCategory.id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok && response.status !== 204) { // 204 No Content is success for DELETE
            const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
            throw new Error(errorData.detail || `HTTP error ${response.status}`);
        }
        handleCloseDeleteConfirmModal();
        fetchCategories();
    } catch (e) {
        console.error("Failed to delete category:", e);
        setError(`Delete failed: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const requestSort = (key) => { /* ... (sort logic remains same) ... */ 
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'; 
    }
    setSortConfig({ key, direction });
    setIsSortDropdownOpen(false);
  };
  const getSortIconForColumn = (key) => { /* ... (remains same) ... */
    if (sortConfig.key !== key) return <div className="w-4 h-4"></div>; 
    return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  const processedCategories = useMemo(() => {
    let filteredItems = [...categoriesData]; 
    if (searchTerm) {
      filteredItems = filteredItems.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) { /* ... (sort logic remains same) ... */ 
      filteredItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        let typeA = typeof valA;
        let typeB = typeof valB;

        if (typeA === 'string' && typeB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        } else { 
          valA = valA === undefined || valA === null ? (sortConfig.direction === 'asc' ? Infinity : -Infinity) : Number(valA);
          valB = valB === undefined || valB === null ? (sortConfig.direction === 'asc' ? Infinity : -Infinity) : Number(valB);
        }
        
        let comparison = 0;
        if (valA < valB) comparison = -1;
        else if (valA > valB) comparison = 1;

        if (comparison === 0) {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0; 
        }
        return sortConfig.direction === 'asc' ? comparison : comparison * -1;
      });
    }
    return filteredItems;
  }, [categoriesData, searchTerm, sortConfig]);

  const sortOptions = [ /* ... (remains same) ... */ 
    { key: 'display_order', label: 'Order' },
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value' }, // Note: 'value' is not from backend Category model
    { key: 'percentage', label: '%' }, // Note: 'percentage' is not from backend Category model
  ];

  // Main Card Render
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-lg mx-auto transition-colors duration-300">
      {/* Header: Title and Sort trigger */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 flex-shrink-0 mr-4">{title}</h2>
        {/* ... (Sort button and dropdown remain same) ... */}
        <div className="relative">
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 shadow-sm transition-all group whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-haspopup="true"
            aria-expanded={isSortDropdownOpen}
          >
            <span className="mr-1.5">Sort:</span>
            <span className="font-semibold mr-1">{sortOptions.find(opt => opt.key === sortConfig.key)?.label || 'Default'}</span>
            {sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />}
            <div className={`ml-1.5 transition-transform duration-200 ${isSortDropdownOpen ? 'transform rotate-180' : ''}`}>
                <DropdownArrowIcon />
            </div>
          </button>
          <AnimatePresence>
            {isSortDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 py-1 border border-slate-200 dark:border-slate-700 origin-top-right"
              >
                {sortOptions.map(option => (
                  <a
                    key={option.key}
                    onClick={() => requestSort(option.key)}
                    role="menuitem" 
                    className="flex justify-between items-center w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    <span>{option.label}</span>
                    <span className="ml-2 w-4 h-4 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      {getSortIconForColumn(option.key)}
                    </span>
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Input (remains same) */}
      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
        />
      </div>
      
      {/* "Add New Category" Button (remains same) */}
      <div className="mb-6">
        <button
          onClick={handleOpenAddModal}
          className="w-full group flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
        >
          <PlusIcon />
          Add New Category
        </button>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {/* Modals (Add, Edit, Delete Confirmation) - their props are updated to use new handlers */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Add New Category">
        <AddCategoryForm onAddCategory={handleAddCategorySubmit} onCancel={handleCloseAddModal} />
      </Modal>
      <Modal isOpen={!!editingCategory} onClose={handleCloseEditModal} title={`Edit: ${editingCategory?.name || ''}`}>
        {editingCategory && <EditCategoryForm categoryToEdit={editingCategory} onUpdateCategory={handleUpdateCategorySubmit} onCancel={handleCloseEditModal} />}
      </Modal>
      <Modal isOpen={!!deletingCategory} onClose={handleCloseDeleteConfirmModal} title="Confirm Deletion">
        {/* ... (Delete confirmation modal content remains same, but uses handleConfirmDelete) ... */}
        {deletingCategory && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete the category "<strong>{deletingCategory.name}</strong>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <button
                type="button"
                onClick={handleCloseDeleteConfirmModal}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete} // Updated
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-red-500 dark:focus:ring-red-400"
                autoFocus
              >
                Delete Category
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Category Items List / Loading / Empty State */}
      <AnimatePresence mode="wait">
        {isLoading ? (
            <motion.div key="loading" className="text-center py-10 text-slate-500 dark:text-slate-400">
                <svg className="animate-spin h-8 w-8 text-indigo-500 dark:text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Loading Categories...</p>
            </motion.div>
        ) : processedCategories.length > 0 ? (
          <motion.div key="list-container" layout initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="space-y-3">
            <AnimatePresence>
              {processedCategories.map((category, index) => (
                <CategoryItem 
                  key={category.id} 
                  category={category} 
                  index={index} 
                  onEditRequest={handleOpenEditModal}
                  onDeleteRequest={handleOpenDeleteConfirmModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="empty-list-state" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }} className="text-center text-slate-500 dark:text-slate-400 py-10 px-4">
            {/* ... (Empty state JSX remains same, but logic now depends on categoriesData and searchTerm) ... */}
            <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                {categoriesData.length === 0 && !searchTerm && !error // Check for error too
                    ? "No Categories Yet!"
                    : (error ? "Could Not Load Categories" : "No Matches Found")} 
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {categoriesData.length === 0 && !searchTerm && !error
                    ? 'Get started by adding a new category.'
                    : error ? 'Please check your connection or try again later.' 
                    : `Try adjusting your search or sort criteria, or add a new category that fits.`}
            </p>
             {categoriesData.length > 0 && searchTerm && !error && (
                 <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md"
                >
                    Clear Search
                 </button>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryList;