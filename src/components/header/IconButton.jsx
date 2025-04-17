import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../common/Icon';

const IconButton = React.forwardRef(({ 
    iconName, ariaLabel, onClick, badgeCount, className 
  }, ref) => {

    return (
        <button
            ref={ref}
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow bg-[var(--color-cream)] text-[var(--color-chocolate)] hover:bg-[var(--color-caramel)/20] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]
                    } ${className}`}
            aria-label={ariaLabel}
        >
            <motion.div
                className={`flex items-center justify-center`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Icon name={iconName} className="w-6 h-6" />
            </motion.div>
            {badgeCount > 0 && (
                <div className={`h-0 w-0`}>
                    <span className="relative bg-[var(--color-caramel)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {badgeCount}
                    </span>
                </div>
            )}
        </button>
    )
});

IconButton.propTypes = {
    iconName: PropTypes.string.isRequired,
    ariaLabel: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    badgeCount: PropTypes.number,
    isActive: PropTypes.bool,
    className: PropTypes.string,
};

IconButton.defaultProps = {
    badgeCount: 0,
    isActive: false,
};

export default IconButton;
