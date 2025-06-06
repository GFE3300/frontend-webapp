// FILE: src/features/dashboard/pages/InventoryPage.jsx
// MODIFIED: Implementing Inventory Page with placeholders.
import React from 'react';
import Icon from '../../../components/common/Icon'; // Assuming Icon component exists
import Button from '../../../components/common/Button'; // Assuming Button component exists

const InventoryPage = () => {
    // Placeholder for future state (e.g., for opening "Add New Ingredient" modal)
    // const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Inventory Management</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Track ingredients, manage stock levels, and view costings.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    {/* Placeholder for "Add New Ingredient" button */}
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={() => alert('[Add New Ingredient Button Placeholder Clicked]')}
                        className="w-full sm:w-auto"
                    >
                        <Icon name="add_shopping_cart" className="mr-2 h-5 w-5" /> {/* Using shopping cart icon as a generic add for inventory */}
                        Add New Ingredient
                    </Button>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 text-center sm:text-left">
                        [Add New Ingredient Button Placeholder]
                    </p>
                </div>
            </header>

            {/* Inventory Items Table Placeholder Section */}
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h2 className="sr-only">Inventory Items Table</h2>
                <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md">
                    <Icon name="inventory" className="mx-auto h-12 w-12 mb-3 text-primary-500 dark:text-primary-400" />
                    <p className="text-lg font-semibold mb-2">[Inventory Items Table Placeholder]</p>
                    <p className="text-sm">
                        Expected features: Search, Filters (Low Stock, Category), Sortable Columns, Pagination, Add/Edit Ingredient Actions.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default InventoryPage;