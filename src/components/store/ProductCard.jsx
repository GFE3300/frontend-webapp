import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';
import useCart from '../../hooks/useCart';
import useFlyingImage from '../../hooks/useFlyingImage';
import ProductBadges from './ProductBadges';

const ProductCard = ({ product }) => {
    const {
        id,
        name = 'Product Name',
        description = 'Product description',
        price = 0,
        weight,
        stock = 0,
        isBestseller = false,
        isNew = false,
        image = '',
        icon = '',
        badges = [],
    } = product || {};

    const { wishlist, addItem, toggleWishlist } = useCart();
    const imageRef = useRef(null);
    const isLowStock = stock <= 15;
    const isLiked = wishlist.some(item => item.id === id);
    const { triggerFlyingImage, activeAnimation } = useFlyingImage();

    if (isBestseller) badges.push({ type: 'bestseller', label: 'Bestseller' });
    if (isNew) badges.push({ type: 'newArrival', label: 'New Arrival' });
    if (stock > 0 && stock <= 5) badges.push({ type: 'lowStock', label: `Only ${stock} left` });

    const handleAddToCart = () => {
        addItem(product);
        triggerFlyingImage(imageRef, icon);
    };

    const handleToggleWishlist = () => {
        toggleWishlist(product);
    };

    return (
        <div className="w-full px-2">
            <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-b-none">
                    <img
                        src={image}
                        ref={imageRef}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Badges */}
                    <span className="absolute top-3 left-3">
                        <ProductBadges badges={badges} />
                    </span>


                    {/* Stock Indicator */}
                    <span className="absolute top-3 right-3 bg-white/90 text-xs font-medium px-3 py-1 rounded-full text-[var(--color-chocolate)] shadow-sm">
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className={`absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition active:scale-95`}
                        aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Icon
                            name={isLiked ? 'favorite' : 'favorite_border'}
                            className={`text-lg text-[var(--color-caramel)] transition-all duration-200 ${isLiked ? 'animate-pulse fill-[var(--color-caramel)]' : ''}`}
                            variations={{ fill: isLiked ? 1 : 0, weight: 400, grade: 0, opsz: 24 }}
                        />
                    </button>
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4 bg-white rounded-t-none rounded-b-2xl">
                    <div className="space-y-2 flex-1">
                        <h3 className="font-playfair text-xl font-semibold text-[var(--color-chocolate)] leading-snug">
                            {name}
                        </h3>
                        <p className="text-sm text-[var(--color-charcoal)] line-clamp-2 opacity-80">
                            {description}
                        </p>
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                        <div>
                            <p className="text-[var(--color-caramel)] font-bold text-lg">
                                ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                            </p>
                            {weight && (
                                <p className="text-xs text-[var(--color-charcoal)] opacity-60">
                                    {weight}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="cart-icon bg-gradient-to-r from-[var(--color-caramel)] to-[var(--color-chocolate)] text-white text-sm px-4 py-2 rounded-full hover:scale-[1.03] active:scale-95 transition-transform shadow-md flex items-center gap-2"
                            aria-label={`Add ${name} to cart`}
                        >
                            <Icon name="shopping_cart" className="shopping_cart h-4 w-4" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 400, grade: 0, opsz: 24 }} />
                            Add
                        </button>
                    </div>
                </div>
            </div>
            {activeAnimation}
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        description: PropTypes.string,
        price: PropTypes.number,
        weight: PropTypes.string,
        stock: PropTypes.number,
        isBestseller: PropTypes.bool,
        isNew: PropTypes.bool,
        image: PropTypes.string,
    }).isRequired,
};

export default ProductCard;
