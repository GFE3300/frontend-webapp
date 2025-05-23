// frontend/src/components/common/SimpleToggle.jsx
import React from 'react';
import PropTypes from 'prop-types';

const SimpleToggle = ({ checked, onChange, disabled = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-9 h-5 after:w-3.5 after:h-3.5 after:top-[1.5px] after:start-[1.5px]',
        md: 'w-10 h-[22px] after:w-4 after:h-4 after:top-[3px] after:start-[3px]', // Adjusted for table cells
        lg: 'w-14 h-7 after:w-5 after:h-5 after:top-[4px] after:start-[4px]',
    };

    const handleToggle = (e) => {
        if (!disabled && onChange) {
            onChange(e);
        }
    };

    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={handleToggle}
                disabled={disabled}
                className="sr-only peer"
            />
            <div
                className={`
                    ${sizeClasses[size]}
                    bg-neutral-300 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-rose-400 
                    dark:peer-focus:ring-rose-600 rounded-full peer 
                    dark:bg-neutral-600 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white 
                    after:content-[''] after:absolute
                    after:bg-white after:border-neutral-300 after:border after:rounded-full 
                    after:transition-all dark:border-neutral-500 
                    peer-checked:bg-rose-600
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            ></div>
        </label>
    );
};

SimpleToggle.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default SimpleToggle;