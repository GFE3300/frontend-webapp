import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';

/**
 * Renders a stack of badges in the top-left corner of a product card.
 * 
 * Props:
 * - badges: Array of { type, label }.
 *    type controls the color & icon mapping.
 */

const BADGE_CONFIG = {
    lowStock: {
        style: 'bg-red-500 text-white',
        icon: 'error',            // ⚠️
    },
    bestseller: {
        style: 'bg-yellow-400 text-[var(--color-chocolate)]',
        icon: 'star',             // ⭐
    },
    newArrival: {
        style: 'bg-green-300 text-white',
        icon: 'fiber_new',        // 🆕
    },
    limitedTime: {
        style: 'bg-orange-400 text-white',
        icon: 'schedule',         // ⏳
    },
    freeShipping: {
        style: 'bg-blue-300 text-white',
        icon: 'local_shipping',   // 🚚
    },
};

const ProductBadges = ({ badges }) => {
    if (!badges || badges.length === 0) return null;

    return (
        <div className="flex flex-col gap-1 z-10">
            {badges.map(({ type, label }, idx) => {
                const cfg = BADGE_CONFIG[type];
                if (!cfg) return null;
                return (
                    <span
                        key={idx}
                        className={`inline-flex h-6 items-center rounded-full text-xs font-semibold ${cfg.style} shadow-sm`}
                        style={{ opacity: 0.9 }}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-full pl-1`}
                        >
                            <Icon
                                name={cfg.icon}
                                className="w-5 h-5 text-white"
                                style={{ fontSize: '1.2rem' }}
                                variations={{ fill: 1, weight: 400, grade: 0, opsz: 18 }}
                            />
                        </div>
                        <span className='flex items-center h-full px-2 py-0.5'>
                            {label}
                        </span>
                    </span>
                );
            })}
        </div>
    );
};

ProductBadges.propTypes = {
    badges: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(Object.keys(BADGE_CONFIG)).isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
};

ProductBadges.defaultProps = {
    badges: [],
};

export default ProductBadges;
