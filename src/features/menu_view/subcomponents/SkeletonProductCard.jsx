// frontend/src/features/menu_view/subcomponents/skeletons/SkeletonProductCard.jsx
// (Create this file if it doesn't exist, or adapt if it does)
import React from 'react';
import PropTypes from 'prop-types';

// Example: Using a simple CSS-in-JS for styling the shimmer, or use a utility class
const shimmerStyle = {
    background: '#f6f7f8',
    backgroundImage: 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '800px 104px', // Adjust size to fit card dimensions
    display: 'inline-block',
    position: 'relative',
    animationDuration: '1s',
    animationFillMode: 'forwards',
    animationIterationCount: 'infinite',
    animationName: 'shimmerAnimation', // Define @keyframes shimmerAnimation
    animationTimingFunction: 'linear',
};

// Define @keyframes shimmerAnimation in your global CSS or a styled-component
/*
@keyframes shimmerAnimation {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}
*/

const SkeletonProductCard = ({ className = '' }) => {
    // These styles should ideally come from design_guidelines.txt or match MenuItemCard.jsx structure
    // Using inline styles for simplicity in this example.
    // TODO: Replace with CSS classes from design_guidelines.txt and match MenuItemCard structure.
    return (
        <div
            className={`skeleton-product-card ${className}`}
            aria-hidden="true"
            style={{
                border: '1px solid #e0e0e0', // design_guidelines.txt (Card styles)
                borderRadius: '8px', // design_guidelines.txt (Radii)
                padding: '16px', // design_guidelines.txt (Spacing)
                background: '#fff',
                width: '100%', // Assuming it takes full width of its grid cell
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // design_guidelines.txt (Shadows)
            }}
        >
            {/* Skeleton for Image */}
            <div
                style={{
                    ...shimmerStyle,
                    height: '140px', // Match MenuItemCard image height
                    borderRadius: '4px', // design_guidelines.txt
                    marginBottom: '12px'
                }}
            />
            {/* Skeleton for Title */}
            <div
                style={{
                    ...shimmerStyle,
                    height: '20px', // Match MenuItemCard title height
                    borderRadius: '4px',
                    marginBottom: '8px',
                    width: '80%'
                }}
            />
            {/* Skeleton for Subtitle/Description line 1 */}
            <div
                style={{
                    ...shimmerStyle,
                    height: '16px', // Match MenuItemCard text line height
                    borderRadius: '4px',
                    marginBottom: '6px',
                    width: '90%'
                }}
            />
            {/* Skeleton for Subtitle/Description line 2 */}
            <div
                style={{
                    ...shimmerStyle,
                    height: '16px', // Match MenuItemCard text line height
                    borderRadius: '4px',
                    marginBottom: '12px',
                    width: '60%'
                }}
            />
            {/* Skeleton for Price/Button area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                    style={{
                        ...shimmerStyle,
                        height: '24px',
                        borderRadius: '4px',
                        width: '30%'
                    }}
                />
                <div
                    style={{
                        ...shimmerStyle,
                        height: '36px', // Match button height
                        borderRadius: '4px',
                        width: '40%'
                    }}
                />
            </div>
        </div>
    );
};

SkeletonProductCard.propTypes = {
    className: PropTypes.string,
};

export default SkeletonProductCard;