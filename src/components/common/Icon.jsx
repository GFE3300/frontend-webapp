const Icon = ({ name, className, style, variations }) => {
    // Default variations if not provided
    const defaultVariations = {
        fill: 0,
        weight: 400,
        grade: 0,
        opsz: 48,
    };
    variations = variations || defaultVariations;

    return (
        <span
            className={`material-symbols-outlined select-none ${className}`}
            style={{
                ...style,
                fontVariationSettings: `'FILL' ${variations.fill}, 'wght' ${variations.weight}, 'GRAD' ${variations.grade}, 'opsz' ${variations.opsz}`
            }}
        >
            {name}
        </span>
    );
};

export default Icon;