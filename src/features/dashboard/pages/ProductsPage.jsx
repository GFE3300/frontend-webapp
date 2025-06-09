import React, { useState } from 'react';
import ProductsTable from '../../products_table/ProductsTable';
import AddProductModal from '../../add_product_modal/subcomponents/AddProductModal';
import CategoryList from '../../../components/CategoryCard/CategoryList';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { useTableSettings } from '../../products_table/hooks/useTableSettings'; // Import the hook here

const ProductsPage = () => {
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Instantiate the table settings hook here, in the parent component.
    const tableSettings = useTableSettings();
    const { setFilters, refetchProducts } = tableSettings; // Destructure what's needed for this level

    const handleOpenAddProductModal = (product = null) => {
        setEditingProduct(product);
        setIsAddProductModalOpen(true);
    };

    const handleCloseAddProductModal = () => {
        setEditingProduct(null);
        setIsAddProductModalOpen(false);
    };

    // This function will be passed to both the modal and the table for refreshing data.
    const handleProductAddedOrUpdated = () => {
        if (refetchProducts) {
            refetchProducts(); // Assuming the hook will expose this
        }
        handleCloseAddProductModal();
    };

    const handleCategorySelect = (categoryId) => {
        // If the same category is clicked, deselect it. Otherwise, set the new filter.
        if (tableSettings.filters.category === categoryId) {
            setFilters({ category: '' });
        } else {
            setFilters({ category: categoryId });
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 flex flex-col h-full">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Product Command Center</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Oversee your entire product catalog, manage categories, and perform bulk actions.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={() => handleOpenAddProductModal()}
                        className="w-full sm:w-auto"
                    >
                        <Icon name="add_circle" className="mr-2 h-5 w-5" />
                        Add New Product
                    </Button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
                <section aria-labelledby="products-table-section" className="flex-grow lg:w-3/4 xl:w-4/5 h-full flex flex-col min-h-0">
                    <h2 id="products-table-section" className="sr-only">Products Table</h2>
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                        <ProductsTable
                            tableSettings={tableSettings}
                            onEditProduct={handleOpenAddProductModal}
                        />
                    </div>
                </section>

                <aside aria-labelledby="categories-section" className="lg:w-1/4 xl:w-1/5 lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
                    <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-lg h-full">
                        <h2 id="categories-section" className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                            Categories
                        </h2>
                        <CategoryList
                            onSelectCategory={handleCategorySelect}
                            selectedCategoryId={tableSettings.filters.category}
                        />
                    </div>
                </aside>
            </div>

            {isAddProductModalOpen && (
                <AddProductModal
                    isOpen={isAddProductModalOpen}
                    onClose={handleCloseAddProductModal}
                    onProductAdded={handleProductAddedOrUpdated}
                    initialProductData={editingProduct}
                />
            )}
        </div>
    );
};

export default ProductsPage;