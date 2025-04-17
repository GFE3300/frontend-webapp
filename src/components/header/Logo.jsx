import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ className = '', onClick }) => (
    <button onClick={onClick} className={`flex items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${className}`} aria-label="Artisan Bakehouse Home">
        <svg
            width="32"
            height="32"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <circle cx="32" cy="32" r="30" fill="var(--color-caramel)" />
            <path
                d="M20 44 L32 20 L44 44 Z"
                fill="var(--color-chocolate)"
            />
        </svg>
        <span className="ml-2 text-xl font-serif font-bold text-[var(--color-chocolate)]">Artisan Bakehouse</span>
    </button>
);

Logo.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Logo;