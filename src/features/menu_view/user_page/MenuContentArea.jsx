import React from 'react';
import MenuDisplayLayout from '../subcomponents/MenuDisplayLayout'; 

const CONTAINER_PADDING_X = "px-0 md:px-6";

const MenuContentArea = ({
    menuDisplayProps, 
    isDesktop,
    scrollContainerRef,
    preventScroll,
    clearAllFilters 
}) => {
    const mainClasses = `flex-1 ${CONTAINER_PADDING_X} py-4 min-h-0 
        ${preventScroll && !isDesktop ? 'overflow-hidden fixed inset-0 pt-[calc(var(--header-height,9rem)+2.75rem)]' 
            : 'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent'
        }`;

    return (
        <div ref={scrollContainerRef} id="main-menu-content" className={mainClasses} role="main">
            <MenuDisplayLayout
                categorizedProducts={menuDisplayProps.categorizedProducts}
                onOpenProductDetailModal={menuDisplayProps.onOpenProductDetailModal}
                isFiltered={menuDisplayProps.isFiltered}
                isFetchingWhileFiltered={menuDisplayProps.isFetchingWhileFiltered}
                isLoadingProductsInitial={menuDisplayProps.isLoadingProductsInitial}
                isError={menuDisplayProps.isError} 
                error={menuDisplayProps.error} 
                clearAllFilters={clearAllFilters} 
            />
        </div>
    );
};

export default MenuContentArea;