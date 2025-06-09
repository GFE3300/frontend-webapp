/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-07 23:10:01 UTC
 */

import i18n from '../../../i18n';


export const scriptLines_ProductsTable = {
    tableConfig: {
        headers: {
            actions: i18n.t('venue_management.actions'), // "Actions"
            image: i18n.t('products_table.productsTable.tableConfig.headers.image'), // "Image"
            name: i18n.t('add_product_modal.productName'), // "Product Name"
            sku: i18n.t('products_table.productsTable.tableConfig.headers.sku'), // "SKU"
            category: i18n.t('products_table.productsTable.tableConfig.headers.category'), // "Category"
            type: i18n.t('products_table.productsTable.tableConfig.headers.type'), // "Type"
            price: i18n.t('products_table.productsTable.tableConfig.headers.price'), // "Price"
            cost: i18n.t('products_table.productsTable.tableConfig.headers.cost'), // "Cost"
            stock: i18n.t('products_table.productsTable.tableConfig.headers.stock'), // "Stock Level"
            sales: i18n.t('products_table.productsTable.tableConfig.headers.sales'), // "Sales (7d)"
            status: i18n.t('products_table.productsTable.tableConfig.headers.status'), // "Status"
            tags: i18n.t('products_table.productsTable.tableConfig.headers.tags'), // "Tags"
            barcode: i18n.t('products_table.productsTable.tableConfig.headers.barcode'), // "Barcode"
            lastUpdated: i18n.t('products_table.productsTable.tableConfig.headers.lastUpdated'), // "Last Updated"
        },
        tooltips: {
            editProduct: i18n.t('products_table.productsTable.tableConfig.tooltips.editProduct'), // "Edit Product"
            deleteProduct: i18n.t('products_table.productsTable.tableConfig.tooltips.deleteProduct'), // "Delete Product"
        },
        alts: {
            productImage: i18n.t('add_product_modal.productImageUploaderFinalImageAlt'), // "Product"
        },
        errors: {
            invalidDate: i18n.t('products_table.productsTable.tableConfig.errors.invalidDate'), // "Invalid Date"
        },
        productTypes: {
            made_in_house: i18n.t('products_table.productsTable.tableConfig.productTypes.made_in_house'), // "Made In-House"
            resold_item: i18n.t('products_table.productsTable.tableConfig.productTypes.resold_item'), // "Resold Item"
        },
        filters: {
            allTypes: i18n.t('products_table.productsTable.tableConfig.filters.allTypes'), // "All Types"
            allStatuses: i18n.t('products_table.productsTable.tableConfig.filters.allStatuses'), // "All Statuses"
            active: i18n.t('venue_management.venueManagement.liveOrderDashboard.activeStatus'), // "Active"
            inactive: i18n.t('products_table.productsTable.tableConfig.filters.inactive'), // "Inactive"
        },
        sort: {
            default: i18n.t('products_table.productsTable.tableConfig.sort.default'), // "Default Sort"
            nameAsc: i18n.t('products_table.productsTable.tableConfig.sort.nameAsc'), // "Name (A-Z)"
            nameDesc: i18n.t('products_table.productsTable.tableConfig.sort.nameDesc'), // "Name (Z-A)"
            priceAsc: i18n.t('products_table.productsTable.tableConfig.sort.priceAsc'), // "Price (Low-High)"
            priceDesc: i18n.t('products_table.productsTable.tableConfig.sort.priceDesc'), // "Price (High-Low)"
            updatedAsc: i18n.t('products_table.productsTable.tableConfig.sort.updatedAsc'), // "Last Updated (Oldest)"
            updatedDesc: i18n.t('products_table.productsTable.tableConfig.sort.updatedDesc'), // "Last Updated (Newest)"
            stockAsc: i18n.t('products_table.productsTable.tableConfig.sort.stockAsc'), // "Stock (Low-High)"
            stockDesc: i18n.t('products_table.productsTable.tableConfig.sort.stockDesc'), // "Stock (High-Low)"
        },
        filterOptions: {
            product_type: [
                {
                    value: '',
                    label: i18n.t('products_table.productsTable.tableConfig.filters.allTypes') // "All Types"
                },
                {
                    value: '',
                    label: i18n.t('products_table.productsTable.tableConfig.productTypes.made_in_house') // "Made In-House"
                },
                {
                    value: '',
                    label: i18n.t('products_table.productsTable.tableConfig.productTypes.resold_item') // "Resold Item"
                },
            ],
            is_active: [
                {
                    value: '',
                    label: i18n.t('products_table.productsTable.tableConfig.filters.allStatuses') // "All Statuses"
                },
                {
                    value: '',
                    label: i18n.t('venue_management.venueManagement.liveOrderDashboard.activeStatus') // "Active"
                },
                {
                    value: '',
                    label: i18n.t('products_table.productsTable.tableConfig.filters.inactive') // "Inactive"
                },
            ],
        },
        sortOptions: [
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.default') // "Default Sort"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.nameAsc') // "Name (A-Z)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.nameDesc') // "Name (Z-A)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.priceAsc') // "Price (Low-High)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.priceDesc') // "Price (High-Low)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.updatedAsc') // "Last Updated (Oldest)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.updatedDesc') // "Last Updated (Newest)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.stockAsc') // "Stock (Low-High)"
            },
            {
                value: '',
                label: i18n.t('products_table.productsTable.tableConfig.sort.stockDesc') // "Stock (High-Low)"
            },
        ],
    },
    productsToolbar: {
        searchPlaceholder: i18n.t('products_table.productsTable.productsToolbar.searchPlaceholder'), // "Search name, SKU, tags..."
        buttons: {
            addProduct: i18n.t('products_table.productsTable.productsToolbar.buttons.addProduct'), // "Add Product"
            refreshTooltip: i18n.t('products_table.productsTable.productsToolbar.buttons.refreshTooltip'), // "Refresh Data"
        },
        filters: {
            allCategoriesLabel: i18n.t('products_table.productsTable.productsToolbar.filters.allCategoriesLabel'), // "All Categories"
            loadingCategoriesLabel: i18n.t('products_table.productsTable.productsToolbar.filters.loadingCategoriesLabel'), // "Loading Categories..."
            categoryPlaceholder: i18n.t('products_table.productsTable.tableConfig.headers.category'), // "Category"
            categoryAriaLabel: i18n.t('products_table.productsTable.productsToolbar.filters.categoryAriaLabel'), // "Filter by category"
            typePlaceholder: i18n.t('products_table.productsTable.tableConfig.headers.type'), // "Type"
            typeAriaLabel: i18n.t('products_table.productsTable.productsToolbar.filters.typeAriaLabel'), // "Filter by product type"
            statusPlaceholder: i18n.t('products_table.productsTable.tableConfig.headers.status'), // "Status"
            statusAriaLabel: i18n.t('products_table.productsTable.productsToolbar.filters.statusAriaLabel'), // "Filter by status"
        },
        sort: {
            placeholder: i18n.t('products_table.productsTable.productsToolbar.sort.placeholder'), // "Sort By"
            ariaLabel: i18n.t('products_table.productsTable.productsToolbar.sort.ariaLabel'), // "Sort by"
        },
    },
    customColumnDropdown: {
        triggerText: i18n.t('products_table.productsTable.customColumnDropdown.triggerText'), // "Columns"
        triggerTooltip: i18n.t('products_table.productsTable.customColumnDropdown.triggerTooltip'), // "Customize columns"
        headerTitle: i18n.t('products_table.productsTable.customColumnDropdown.headerTitle'), // "Customize Table Columns"
        headerSubtitle: i18n.t('products_table.productsTable.customColumnDropdown.headerSubtitle'), // "Toggle visibility or drag to reorder non-fixed columns."
        listTitles: {
            fixed: i18n.t('products_table.productsTable.customColumnDropdown.listTitles.fixed'), // "Fixed"
            visibleAndDraggable: i18n.t('products_table.productsTable.customColumnDropdown.listTitles.visibleAndDraggable'), // "Visible & Draggable"
            hidden: i18n.t('products_table.productsTable.customColumnDropdown.listTitles.hidden'), // "Hidden"
        },
        noColumnsAvailable: i18n.t('products_table.productsTable.customColumnDropdown.noColumnsAvailable'), // "No columns available."
        noDraggableColumns: i18n.t('products_table.productsTable.customColumnDropdown.noDraggableColumns'), // "No draggable columns to show."
        resetButton: i18n.t('products_table.productsTable.customColumnDropdown.resetButton'), // "Reset to Default"
    },
    draggableColumnItem: {
        tooltips: {
            dragReorder: i18n.t('products_table.productsTable.draggableColumnItem.tooltips.dragReorder'), // "Drag to reorder"
            fixedColumn: i18n.t('products_table.productsTable.draggableColumnItem.tooltips.fixedColumn'), // "Fixed column (cannot reorder or hide)"
            hideColumn: i18n.t('products_table.productsTable.draggableColumnItem.tooltips.hideColumn'), // "Hide column"
            showColumn: i18n.t('products_table.productsTable.draggableColumnItem.tooltips.showColumn'), // "Show column"
        },
        aria: {
            hide: i18n.t('products_table.productsTable.draggableColumnItem.aria.hide'), // "Hide {{columnName}} column"
            show: i18n.t('products_table.productsTable.draggableColumnItem.aria.show'), // "Show {{columnName}} column"
        }
    },
    editableCell: {
        emptyPlaceholder: i18n.t('products_table.productsTable.editableCell.emptyPlaceholder'), // "\u2014"
        editTooltip: i18n.t('products_table.productsTable.editableCell.editTooltip'), // "Click to edit {{fieldKey}}"
        errors: {
            invalidNumber: i18n.t('products_table.productsTable.editableCell.errors.invalidNumber'), // "Invalid number."
            invalidNumberShort: i18n.t('products_table.productsTable.editableCell.errors.invalidNumberShort'), // "Invalid"
            negativeValue: i18n.t('products_table.productsTable.editableCell.errors.negativeValue'), // "Value cannot be negative."
            nameCannotBeEmpty: i18n.t('products_table.productsTable.editableCell.errors.nameCannotBeEmpty'), // "Name cannot be empty."
            saveFailed: i18n.t('products_table.productsTable.editableCell.errors.saveFailed'), // "Save failed."
        }
    },
    productsTableBody: {
        error: {
            title: i18n.t('products_table.productsTable.productsTableBody.error.title'), // "Oops! Something went wrong."
            message: i18n.t('products_table.productsTable.productsTableBody.error.message'), // "We couldn't load the products at this moment. Please try again."
            retryButton: i18n.t('payments.components.paymentCancelPage.buttons.tryAgain'), // "Try Again"
        },
        empty: {
            filteredTitle: i18n.t('products_table.productsTable.productsTableBody.empty.filteredTitle'), // "No Products Match Filters"
            noProductsTitle: i18n.t('products_table.productsTable.productsTableBody.empty.noProductsTitle'), // "No Products Yet"
            filteredMessage: i18n.t('products_table.productsTable.productsTableBody.empty.filteredMessage'), // "Try adjusting or clearing your filters to see more products."
            noProductsMessage: i18n.t('products_table.productsTable.productsTableBody.empty.noProductsMessage'), // "Get started by adding your first product to the inventory."
            clearFiltersButton: i18n.t('products_table.productsTable.productsTableBody.empty.clearFiltersButton'), // "Clear Filters"
            addProductButton: i18n.t('products_table.productsTable.productsToolbar.buttons.addProduct'), // "Add Product"
        }
    },
    productsTableHeader: {
        tooltips: {
            sortBy: i18n.t('products_table.productsTable.productsTableHeader.tooltips.sortBy'), // "Sort by {{headerText}}"
            ascending: i18n.t('products_table.productsTable.productsTableHeader.tooltips.ascending'), // "(Ascending)"
            descending: i18n.t('products_table.productsTable.productsTableHeader.tooltips.descending'), // "(Descending)"
        }
    },
    toolbarDropdown: {
        noOptions: i18n.t('products_table.productsTable.toolbarDropdown.noOptions'), // "No options available"
        errors: {
            optionsMissing: i18n.t('products_table.productsTable.toolbarDropdown.errors.optionsMissing'), // "Error: Dropdown options are missing."
            onChangeMissing: i18n.t('products_table.productsTable.toolbarDropdown.errors.onChangeMissing'), // "Error: Dropdown onChange missing."
        }
    },
    animatedSearchBar: {
        tooltips: {
            clearSearch: i18n.t('products_table.productsTable.animatedSearchBar.tooltips.clearSearch'), // "Clear search"
            search: i18n.t('venue_management.search'), // "Search"
            openSearch: i18n.t('products_table.productsTable.animatedSearchBar.tooltips.openSearch'), // "Open search"
        },
        status: {
            loading: i18n.t('products_table.productsTable.animatedSearchBar.status.loading'), // "Loading suggestions..."
            noSuggestions: i18n.t('products_table.productsTable.animatedSearchBar.status.noSuggestions'), // "No suggestions found."
        }
    },
    stockLevelDisplay: {
        outOfStock: i18n.t('products_table.productsTable.stockLevelDisplay.outOfStock'), // "Out of Stock"
        lowStock: i18n.t('products_table.productsTable.stockLevelDisplay.lowStock'), // "{{quantity}} (Low Stock)"
        inStock: i18n.t('products_table.productsTable.stockLevelDisplay.inStock'), // "{{quantity}} (In Stock)"
        lowStockStatus: i18n.t('products_table.productsTable.stockLevelDisplay.lowStockStatus'), // "Low Stock"
        inStockStatus: i18n.t('products_table.productsTable.stockLevelDisplay.inStockStatus') // "In Stock"
    },
    tagPills: {
        more: i18n.t('products_table.productsTable.tagPills.more') // "+{{count}} more"
    },
    productsTable: {
        toasts: {
            fieldUpdateSuccess: i18n.t('products_table.productsTable.productsTable.toasts.fieldUpdateSuccess'), // "Product field '{{fieldKey}}' updated."
            fieldUpdateError: i18n.t('products_table.productsTable.productsTable.toasts.fieldUpdateError'), // "Failed to update {{fieldKey}}."
            statusUpdateSuccess: i18n.t('products_table.productsTable.productsTable.toasts.statusUpdateSuccess'), // "Product status updated to {{status}}."
            statusUpdateError: i18n.t('products_table.productsTable.productsTable.toasts.statusUpdateError'), // "Failed to update status."
            deleteSuccess: i18n.t('products_table.productsTable.productsTable.toasts.deleteSuccess'), // "Product '{{productName}}' deleted successfully."
            deleteError: i18n.t('products_table.productsTable.productsTable.toasts.deleteError'), // "Failed to delete '{{productName}}'."
            filtersCleared: i18n.t('products_table.productsTable.productsTable.toasts.filtersCleared'), // "Filters cleared"
        },
        deleteModal: {
            title: i18n.t('products_table.productsTable.productsTable.deleteModal.title'), // "Confirm Deletion"
            message: i18n.t('products_table.productsTable.productsTable.deleteModal.message'), // "Are you sure you want to delete '{{productName}}'? This action cannot be undone."
        },
        pagination: {
            previous: i18n.t('products_table.productsTable.productsTable.pagination.previous'), // "Previous"
            next: i18n.t('venue_management.next'), // "Next"
            showingResults: i18n.t('products_table.productsTable.productsTable.pagination.showingResults'), // "Showing {{start}} to {{end}} of {{total}} results"
            pageOf: i18n.t('products_table.productsTable.productsTable.pagination.pageOf'), // "Page {{currentPage}} of {{totalPages}}"
            ariaLabel: i18n.t('products_table.productsTable.productsTable.pagination.ariaLabel'), // "Pagination"
            previousAriaLabel: i18n.t('products_table.productsTable.productsTable.pagination.previousAriaLabel'), // "Previous page"
            nextAriaLabel: i18n.t('products_table.productsTable.productsTable.pagination.nextAriaLabel'), // "Next page"
        },
        status: { // for toast messages
            active: i18n.t('venue_management.venueManagement.liveOrderDashboard.activeStatus'), // "Active"
            inactive: i18n.t('products_table.productsTable.tableConfig.filters.inactive'), // "Inactive"
        }
    },
    salesSparkline: {
        noData: i18n.t('products_table.productsTable.salesSparkline.noData'), // "No sales data"
        tooltip: i18n.t('products_table.productsTable.salesSparkline.tooltip') // "Sales trend: {{data}}"
    },
};