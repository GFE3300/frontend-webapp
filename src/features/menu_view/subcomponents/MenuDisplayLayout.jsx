// frontend/src/features/menu_view/subcomponents/MenuDisplayLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import MenuItemCard from './MenuItemCard'; // Assuming this is your actual card
import SkeletonProductCard from './SkeletonProductCard'; // New Import

// Placeholder for an engaging icon for empty/error states (Task 2.3.3)
// import { MenuIcon, SadFaceIcon } from 'your-icon-library'; 

const MenuDisplayLayout = ({
    menuItems,
    isLoading, // Renamed from isLoadingProductsInitial for clarity if used for other loading too
    isFetchingWhileFiltered, // For Task 2.3.5
    onMenuItemClick,
    // Props for enhanced empty/error states (Task 2.3.3)
    // searchTerm, // If needed for "no results for X"
    // activeFilters, // If needed for "no results with current filters"
}) => {

    // --- Task 2.3.1: Skeleton Loaders ---
    if (isLoading) {
        const skeletonCount = 6; // Or a number appropriate for typical view (e.g., 3-5 or more if grid)
        return (
            <div
                className="menu-display-grid-loading"
                style={{
                    /* design_guidelines.txt for grid layout (same as below) */
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px', /* design_guidelines.txt for spacing */
                    padding: '16px 0',
                }}
            >
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <SkeletonProductCard key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    // --- Task 2.3.3: Enhanced Empty/Error States (Initial structure) ---
    if (!menuItems || menuItems.length === 0) {
        // This will be enhanced further in Task 2.3.3
        // For now, a basic message. We'll check for specific error props later.
        return (
            <div
                className="menu-empty-state"
                style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#555' /* design_guidelines.txt for text color */
                    // Apply styles from Design Guidelines 2.3 (Illustrations/Icons), Typography, Spacing
                }}
            >
                {/* <SadFaceIcon size={64} style={{ marginBottom: '16px' }} />  Placeholder Icon */}
                <h3 style={{ /* design_guidelines.txt for typography */ }}>No Menu Items Found</h3>
                <p style={{ /* design_guidelines.txt for typography */ }}>
                    {/* Enhance this message based on context, e.g., active filters or search term */}
                    There are currently no items matching your selection. Try adjusting your filters or search.
                </p>
                {/* Consider adding a subtle CTA like a button to clear filters if applicable */}
            </div>
        );
    }

    // --- Task 2.3.5: Loading Indicator for Filter/Search Updates ---
    // This is a simple overlay approach. design_guidelines.txt Section 4.5 (Feedback)
    // might suggest a more integrated spinner or specific style.
    const overlayStyle = isFetchingWhileFiltered ? {
        position: 'relative', // Or on the parent if this component isn't already positioned
        opacity: 0.5, // Dim the content
        pointerEvents: 'none', // Prevent interaction while loading
        // transition: 'opacity 0.3s ease', // Smooth transition
    } : {};

    const spinnerStyle = isFetchingWhileFiltered ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        // Add spinner styles from design_guidelines.txt (e.g., using a Spinner component)
        // For now, a text placeholder:
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    } : { display: 'none' };


    return (
        <div style={{ position: 'relative' /* For spinner positioning */ }}>
            {isFetchingWhileFiltered && (
                <div style={spinnerStyle}>
                    {/* Replace with actual spinner component */}
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Loading...</p>
                    {/* Message: "Updating menu..." or "Loading..." */}
                </div>
            )}
            <div
                className="menu-display-grid"
                style={{
                    /* design_guidelines.txt for grid layout */
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid
                    gap: '16px', /* design_guidelines.txt for spacing */
                    padding: '16px 0', // Adjust padding as needed
                    ...overlayStyle
                }}
            >
                {menuItems.map(item => (
                    <MenuItemCard
                        key={item.id}
                        product={item}
                        onCardClick={() => onMenuItemClick(item)} // Ensure MenuItemCard uses onCardClick
                    />
                ))}
            </div>
        </div>
    );
};

MenuDisplayLayout.propTypes = {
    menuItems: PropTypes.array.isRequired,
    isLoading: PropTypes.bool,
    isFetchingWhileFiltered: PropTypes.bool,
    onMenuItemClick: PropTypes.func.isRequired,
    // searchTerm: PropTypes.string,
    // activeFilters: PropTypes.object,
};

MenuDisplayLayout.defaultProps = {
    isLoading: false,
    isFetchingWhileFiltered: false,
    // searchTerm: '',
    // activeFilters: {},
};

export default MenuDisplayLayout;