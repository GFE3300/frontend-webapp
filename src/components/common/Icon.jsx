import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ name, className, style, variations }) => {
    // Default variations if not provided
    const defaultVariations = {
        fill: 0,
        weight: 400,
        grade: 0,
        opsz: 24, // Using a more standard opsz for UI icons
    };

    // Merge provided variations with defaults
    const finalVariations = { ...defaultVariations, ...variations };

    return (
        <span
            className={`material-symbols-outlined select-none ${className}`}
            style={{
                ...style,
                fontVariationSettings: `'FILL' ${finalVariations.fill}, 'wght' ${finalVariations.weight}, 'GRAD' ${finalVariations.grade}, 'opsz' ${finalVariations.opsz}`
            }}
            aria-hidden="true" // Decorative icons should be hidden from screen readers
        >
            {name}
        </span>
    );
};

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    variations: PropTypes.shape({
        fill: PropTypes.oneOf([0, 1]),
        weight: PropTypes.number,
        grade: PropTypes.number,
        opsz: PropTypes.number,
    }),
};

export default Icon;