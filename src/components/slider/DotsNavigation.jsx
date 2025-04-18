const DotsNavigation = ({ total, currentIndex, visibleCount, onDotClick }) => {
    return (
        <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: total }).map((_, index) => {
                const isActive = index >= currentIndex && index < currentIndex + visibleCount;
                return (
                    <button
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[var(--color-caramel)] scale-110' : 'bg-gray-300'
                            }`}
                        onClick={() => onDotClick(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                );
            })}
        </div>
    );
};

export default DotsNavigation;