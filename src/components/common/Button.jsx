import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Icon from './Icon'; // Assuming Icon component is in the same directory
import Spinner from './Spinner'; // Assuming Spinner component is in the same directory

/**
 * A versatile and themeable button component.
 * @component Button
 */
const Button = forwardRef(
    (
        {
            children,
            variant = 'solid', // 'solid', 'outline', 'ghost', 'link'
            themeColor = 'rose', // 'rose', 'neutral', 'danger'
            size = 'md', // 'xs', 'sm', 'md', 'lg'
            leftIcon,
            rightIcon,
            isLoading = false,
            loadingText,
            disabled = false,
            fullWidth = false,
            className = '',
            type = 'button',
            onClick,
            ...restProps
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading;

        // =======================================================================
        // Theme and Style Configuration
        // =======================================================================
        const baseClasses = `
            inline-flex items-center justify-center font-montserrat font-medium 
            border border-transparent rounded-full shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            dark:focus:ring-offset-neutral-800
            transition-all duration-150 ease-in-out
        `;

        const sizeClasses = {
            xs: 'px-2.5 py-1.5 text-xs',
            sm: 'px-3 py-2 text-sm leading-4',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        const iconSizeClasses = {
            xs: 'w-3.5 h-3.5',
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-5 h-5',
        }

        const themeConfig = {
            rose: {
                focusRing: 'focus:ring-rose-500 dark:focus:ring-rose-400',
                solid: `bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600`,
                outline: `border-rose-600 text-rose-600 hover:bg-rose-50 dark:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-900/30`,
                ghost: `text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30`,
                link: `text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 underline-offset-4 hover:underline`,
                spinner: 'text-white', // For solid variant
                spinnerOutlineGhost: 'text-rose-600 dark:text-rose-400', // For outline/ghost
            },
            neutral: {
                focusRing: 'focus:ring-neutral-500 dark:focus:ring-neutral-400',
                solid: `bg-neutral-600 text-white hover:bg-neutral-700 dark:bg-neutral-500 dark:hover:bg-neutral-600`,
                outline: `border-neutral-400 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-700/50`,
                ghost: `text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/50`,
                link: `text-neutral-700 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-200 underline-offset-4 hover:underline`,
                spinner: 'text-white',
                spinnerOutlineGhost: 'text-neutral-700 dark:text-neutral-300',
            },
            danger: {
                focusRing: 'focus:ring-red-500 dark:focus:ring-red-400',
                solid: `bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600`,
                outline: `border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30`,
                ghost: `text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30`,
                link: `text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline-offset-4 hover:underline`,
                spinner: 'text-white',
                spinnerOutlineGhost: 'text-red-600 dark:text-red-400',
            },
        };

        const currentTheme = themeConfig[themeColor] || themeConfig.rose;
        const variantClasses = currentTheme[variant] || currentTheme.solid;
        const focusClasses = currentTheme.focusRing;

        const spinnerColor = (variant === 'solid') ? currentTheme.spinner : currentTheme.spinnerOutlineGhost;

        // =======================================================================
        // Icon and Loading Content
        // =======================================================================
        const renderLeftIcon = leftIcon && !isLoading && (
            <Icon name={leftIcon} className={`${iconSizeClasses[size]} ${children ? '-ml-0.5 mr-2' : ''}`} aria-hidden="true" />
        );

        const renderRightIcon = rightIcon && !isLoading && (
            <Icon name={rightIcon} className={`${iconSizeClasses[size]} ${children ? '-mr-0.5 ml-2' : ''}`} aria-hidden="true" />
        );

        const buttonContent = (
            <>
                {isLoading && (
                    <div className="inline-flex items-center justify-center" aria-live="polite" aria-busy="true">
                        <Spinner
                            size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'}
                            color="currentColor" // The parent text color will handle this
                            className={`${loadingText ? 'mr-2' : ''}`}
                        />
                        {loadingText || <span className="sr-only">Loading</span>}
                    </div>
                )}
                {!isLoading && (
                    <>
                        {renderLeftIcon}
                        {children}
                        {renderRightIcon}
                    </>
                )}
            </>
        );

        // =======================================================================
        // Render
        // =======================================================================
        return (
            <motion.button
                ref={ref}
                type={type}
                onClick={onClick}
                disabled={isDisabled}
                className={`
                    ${baseClasses}
                    ${sizeClasses[size]}
                    ${variantClasses}
                    ${focusClasses}
                    ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 active:opacity-100 active:scale-[0.98]'}
                    ${fullWidth ? 'w-full' : ''}
                    ${isLoading ? spinnerColor : ''} // Apply spinner color wrapper for current text color
                    ${className}
                `}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                {...restProps}
                aria-disabled={isDisabled}
            >
                {buttonContent}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

Button.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'link']),
    themeColor: PropTypes.oneOf(['rose', 'neutral', 'danger']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    leftIcon: PropTypes.string, // Name of the icon for Icon component
    rightIcon: PropTypes.string, // Name of the icon for Icon component
    isLoading: PropTypes.bool,
    loadingText: PropTypes.string,
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    onClick: PropTypes.func,
};

export default Button;