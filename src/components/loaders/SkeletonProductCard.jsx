// src/components/loaders/SkeletonProductCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader for product cards
 * @param {Object} props - Component props
 * @param {number} [props.descriptionLines=2] - Number of description placeholder lines
 * @returns {JSX.Element} Product card skeleton
 */
const SkeletonProductCard = ({ descriptionLines = 2 }) => {
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
        <div className="w-full px-2" aria-hidden="true">
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full ${!prefersReducedMotion ? 'animate-pulse' : ''
                }`}>
                {/* Image placeholder */}
                <div className="relative aspect-square bg-gray-100 rounded-t-2xl">
                    {/* Badges placeholder */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                        <div className="h-5 w-12 bg-gray-200 rounded-full" />
                    </div>

                    {/* Stock indicator */}
                    <div className="absolute top-3 right-3 h-5 w-16 bg-gray-200 rounded-full" />

                    {/* Wishlist button */}
                    <div className="absolute bottom-3 right-3 h-10 w-10 bg-gray-200 rounded-full" />
                </div>

                {/* Details placeholder */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        {Array.from({ length: descriptionLines }).map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                        ))}
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                        <div className="space-y-1">
                            <div className="h-6 w-16 bg-gray-200 rounded" />
                            <div className="h-4 w-12 bg-gray-200 rounded" />
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

SkeletonProductCard.propTypes = {
    descriptionLines: PropTypes.number,
};

export default SkeletonProductCard;