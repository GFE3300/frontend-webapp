import { useEffect, useState } from 'react';
import React from 'react';
import useCart from '../../hooks/useCart';
import { getFeaturedProducts } from '../../utils/mockProducts';

const SurpriseButton = () => {
        const [products, setProducts] = useState([]);
    
        useEffect(() => {
            const loadProducts = async () => {
                try {
                    const data = await getFeaturedProducts();
                    setProducts(data);
                } catch (error) {
                    console.error('Error loading products:', error);
                }
            };
    
            loadProducts();
        }, []);

    const { addItem } = useCart();

    const handleSurprise = () => {
        const random = products[Math.floor(Math.random() * products.length)];
        addItem({ ...random, qty: 1 });
    };

    return (
        <button
            onClick={handleSurprise}
            className="mt-3 w-full bg-gradient-to-r from-[var(--color-rose)] to-[var(--color-blush)] text-white py-2 rounded-xl font-medium animate-pulse hover:animate-none hover:brightness-110 transition"
        >
            🎁 Surprise Me!
        </button>
    );
};

export default SurpriseButton;