import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowButton from '../common/ArrowButton';
import DotsNavigation from '../common/DotsNavigation';
import useResponsiveSlider from '../../hooks/useResponsiveSlider';
import ProductCard from '../store/ProductCard';
import SkeletonProductCard from '../loaders/SkeletonProductCard';

const ProductSlider = ({
    products = [],
    loading = false,
    skeletonCount = 4
}) => {
    const containerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleCount = useResponsiveSlider(containerRef);
    const itemCount = loading ? skeletonCount : products.length;
    const maxIndex = Math.max(0, itemCount - visibleCount);

    const scrollToIndex = (index) => {
        const validIndex = Math.max(0, Math.min(index, maxIndex));
        setCurrentIndex(validIndex);

        if (containerRef.current?.firstChild) {
            const cardWidth = containerRef.current.firstChild.offsetWidth;
            containerRef.current.scrollTo({
                left: cardWidth * validIndex,
                behavior: 'smooth',
            });
        }
    };

    const handleNext = () => scrollToIndex(currentIndex + 1);
    const handlePrev = () => scrollToIndex(currentIndex - 1);

    return (
        <div className="relative w-full" aria-busy={loading}>
            <ArrowButton direction="left" onClick={handlePrev} />
            <ArrowButton direction="right" onClick={handleNext} />

            <div
                ref={containerRef}
                className="flex overflow-hidden scroll-smooth snap-x snap-mandatory px-4"
            >
                {(loading ? Array.from({ length: skeletonCount }) : products).map(
                    (item, index) => (
                        <div
                            key={loading ? `skeleton-${index}` : item.id}
                            className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] px-2"
                        >
                            {loading ? (
                                <SkeletonProductCard />
                            ) : (
                                <ProductCard product={item} />
                            )}
                        </div>
                    ))}
            </div>

            <DotsNavigation
                total={itemCount}
                currentIndex={currentIndex}
                visibleCount={visibleCount}
                onDotClick={scrollToIndex}
            />
        </div>
    );
};

ProductSlider.propTypes = {
    products: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    skeletonCount: PropTypes.number,
};

export default ProductSlider;