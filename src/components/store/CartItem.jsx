import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../common/Icon';
import useCart from '../../hooks/useCart';

/**
 * CartItem: Renders an individual item in the cart drawer with aesthetic + accessible controls.
 */
const CartItem = ({ item }) => {
    const { id, name, price, image, qty } = item;
    const { updateItemQty, removeItem } = useCart();

    const prevQtyRef = useRef(qty);
    const direction = qty > prevQtyRef.current ? 'up' : 'down';

    useEffect(() => {
        prevQtyRef.current = qty;
    }, [qty]);

    const handleDecrease = () => {
        if (qty > 1) updateItemQty(id, qty - 1);
    };

    const handleIncrease = () => {
        updateItemQty(id, qty + 1);
    };

    const handleRemove = () => {
        removeItem(id);
    };

    return (
        <div className="flex items-start h-30 gap-4 bg-white rounded-xl shadow-sm border border-[var(--color-blush)] relative overflow-hidden">
            {/* Thumbnail */}
            <img
                src={image}
                alt={name}
                className="w-25 h-full object-cover shadow-sm overflow-hidden"
                loading="lazy"
            />

            {/* Details */}
            <div className="flex-1 py-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <h4 className="text-[var(--color-chocolate)] font-playfair text-lg leading-tight">
                        {name}
                    </h4>
                </div>

                <p className="text-sm text-[var(--color-caramel)] font-medium mt-1">
                    ${price.toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center mt-3 gap-2">
                    <button
                        onClick={handleDecrease}
                        className={`
                            flex items-center justify-center w-6 h-6 rounded-full
                            bg-[var(--color-rose)] text-[var(--color-charcoal)] hover:bg-[var(--color-blush)] 
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] disabled:opacity-50 transition
                        `}
                        aria-label="Decrease quantity"
                        disabled={qty <= 1}
                    >
                        <Icon name="remove" className="w-4 h-4" style={{ fontSize: '1em' }} />
                    </button>
                    <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.span
                                key={qty}
                                custom={direction}
                                initial={{ y: direction === 'up' ? 10 : -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: direction === 'up' ? -10 : 10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute text-sm font-medium text-[var(--color-charcoal)]"
                            >
                                {qty}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={handleIncrease}
                        className={`
                            flex items-center justify-center w-6 h-6 rounded-full
                            bg-[var(--color-rose)] text-[var(--color-charcoal)] hover:bg-[var(--color-blush)] 
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] disabled:opacity-50 transition
                        `}
                        aria-label="Increase quantity"
                    >
                        <Icon name="add" className="w-4 h-4" style={{ fontSize: '1em' }} />
                    </button>
                </div>
            </div>
            {/* Remove Button */}
            <button
                onClick={handleRemove}
                className="p-1 pr-4 h-full text-red-500 hover:text-red-700 focus:outline-none rounded-full transition duration-200"
                aria-label={`Remove ${name} from cart`}
            >
                <Icon name="delete" className="w-6 h-6" variations={{ fill: 1, weight: 400, opsz: 48, grade: 0 }} />
            </button>
        </div>
    );
};

CartItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        image: PropTypes.string,
        qty: PropTypes.number.isRequired,
    }).isRequired,
};

export default CartItem;
