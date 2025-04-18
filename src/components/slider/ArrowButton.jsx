import Icon from "../common/Icon";

const ArrowButton = ({ direction, onClick }) => {
    const isLeft = direction === 'left';
    const className = "flex items-center justify-center text-[var(--color-chocolate)]"
    return (
        <button
            onClick={onClick}
            className={`
                absolute top-1/2 z-10 
                w-10 h-10
                flex items-center justify-center
                transform -translate-y-1/2 
                p-2 bg-white shadow-lg rounded-full 
                hover:bg-[var(--color-caramel)] 
                transition duration-300 
                ${isLeft ? 'left-2' : 'right-2'}
                `}
            aria-label={isLeft ? 'Previous Slide' : 'Next Slide'}
        >
            {isLeft ? (
                <Icon name="chevron_left" className={className} />
            ) : (
                <Icon name="chevron_right" className={className} />
            )}
        </button>
    );
};

export default ArrowButton;