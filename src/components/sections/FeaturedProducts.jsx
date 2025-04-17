import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../../utils/mockProducts';
import ProductSlider from '../slider/ProductSlider';

const FeaturedProducts = ({ title = 'Seasonal Specialties' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getFeaturedProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    return (
        <section
            className="section-padding"
            aria-labelledby="featured-products-heading"
            aria-busy={loading}
        >
            <div className="container relative">
                <div className="flex justify-between items-end mb-8">
                    <h2 id="featured-products-heading" className="section-title">
                        {title}
                    </h2>
                    <Link
                        to="/products"
                        className="text-subheading hover:text-[var(--color-caramel)] transition-colors"
                        aria-disabled={loading}
                    >
                        View All →
                    </Link>
                </div>

                <ProductSlider
                    products={products}
                    loading={loading}
                    skeletonCount={6}
                />
            </div>
        </section>
    );
};

export default FeaturedProducts;