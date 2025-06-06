// FILE: src/features/dashboard/pages/ProductsPage.jsx
// MODIFIED: Implementing Products Page by integrating ProductsTable, AddProductModal, and CategoryList.
import React, { useState } from 'react';
import ProductsTable from '../../products_table/ProductsTable';
import AddProductModal from '../../add_product_modal/subcomponents/AddProductModal';
import CategoryList from '../../../components/CategoryCard/CategoryList'; // Corrected path based on structure
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';

const ProductsPage = () => {
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

    const handleOpenAddProductModal = () => setIsAddProductModalOpen(true);
    const handleCloseAddProductModal = () => setIsAddProductModalOpen(false);

    // This function would be passed to AddProductModal to refetch products after a new one is added.
    // For now, it's a placeholder. It would typically involve `queryClient.invalidateQueries`.
    const handleProductAddedOrUpdated = () => {
        console.log("Product added/updated, refetching products would happen here.");
        // Example: queryClient.invalidateQueries(queryKeys.products());
        handleCloseAddProductModal();
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 flex flex-col h-full">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Product Management</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Manage your product catalog, categories, and inventory associations.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleOpenAddProductModal}
                        className="w-full sm:w-auto"
                    >
                        <Icon name="add_circle_outline" className="mr-2 h-5 w-5" />
                        Add New Product
                    </Button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0"> {/* Added min-h-0 for flex child scroll */}
                {/* Main content area for ProductsTable - should take most space and be scrollable if needed */}
                <section aria-labelledby="products-table-section" className="flex-grow lg:w-3/4 xl:w-4/5 h-full flex flex-col min-h-0"> {/* min-h-0 ensures flex child can shrink and allow scroll */}
                    <h2 id="products-table-section" className="sr-only">Products Table</h2>
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                        {/* ProductsTable itself manages internal scrolling for its content */}
                        <ProductsTable />
                    </div>
                </section>

                {/* Sidebar area for CategoryList - less space, potentially scrollable if many categories */}
                <aside aria-labelledby="categories-section" className="lg:w-1/4 xl:w-1/5 lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
                    <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-lg h-full">
                        <h2 id="categories-section" className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                            Categories
                        </h2>
                        {/* CategoryList component integration */}
                        <CategoryList />
                    </div>
                </aside>
            </div>

            {/* Add Product Modal */}
            {isAddProductModalOpen && (
                <AddProductModal
                    isOpen={isAddProductModalOpen}
                    onClose={handleCloseAddProductModal}
                    onProductAdded={handleProductAddedOrUpdated} // Placeholder for actual refetch
                // initialProductData={null} // For new product
                />
            )}
        </div>
    );
};

export default ProductsPage;