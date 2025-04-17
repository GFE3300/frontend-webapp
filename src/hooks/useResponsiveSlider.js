import { useEffect, useState } from 'react';

const useResponsiveSlider = (containerRef, cardWidth = 360) => {
    const [visibleCount, setVisibleCount] = useState(1);

    useEffect(() => {
        const updateVisible = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setVisibleCount(Math.floor(containerWidth / cardWidth));
            }
        };

        updateVisible();
        window.addEventListener('resize', updateVisible);
        return () => window.removeEventListener('resize', updateVisible);
    }, [containerRef, cardWidth]);

    return visibleCount;
};

export default useResponsiveSlider;