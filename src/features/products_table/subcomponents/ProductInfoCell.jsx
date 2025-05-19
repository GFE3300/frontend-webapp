import React, { useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const ProductInfoCell = memo(({ product, id }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const nameRef = useRef(null);

    const truncatedName = product.name.length > 25 ? product.name.substring(0, 25) + "..." : product.name;

    return (
        <div
            className="flex items-center space-x-3 group relative"
            onMouseEnter={() => product.name.length > 25 && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <img
                src={product.thumbnailUrl || 'https://via.placeholder.com/32'}
                alt={product.name}
                className="w-8 h-8 rounded-md object-cover flex-shrink-0" // Changed to rounded-md for square option
            />
            <span
                id={id}
                ref={nameRef}
                className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
            >
                {truncatedName}
            </span>
            <AnimatePresence>
                {showTooltip && product.name.length > 25 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 left-0 top-full mt-2 w-64 p-3 bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded-lg shadow-xl"
                        role="tooltip"
                    >
                        <p className="font-semibold mb-1">{product.name}</p>
                        <p className="text-neutral-300 dark:text-neutral-400 line-clamp-3">{product.description}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

ProductInfoCell.propTypes = {
    product: PropTypes.shape({
        thumbnailUrl: PropTypes.string,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
    }).isRequired,
    id: PropTypes.string.isRequired,
};

export default ProductInfoCell;