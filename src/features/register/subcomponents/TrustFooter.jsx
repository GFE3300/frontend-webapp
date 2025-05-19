import React, { memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, useReducedMotion } from 'framer-motion';
import Icon from "../../../components/common/Icon";
import { scriptLines_Components as scriptLines } from '../utils/script_lines';

/**
 * TrustFooter component displays security assurances and links to legal documents (Privacy Policy, Terms of Use).
 * It is designed to be flexible, allowing for fixed or static positioning, theme customization,
 * and internationalization of its text content. This component aims to build user trust by
 * providing clear access to important legal information and reinforcing security commitment.
 * It is memoized for performance and includes prop validation.
 *
 * @component TrustFooter
 * @param {Object} props - Component properties.
 * @param {string} [props.privacyPolicyUrl="/privacy-policy"] - URL for the Privacy Policy link.
 *        Defaults to "/privacy-policy".
 * @param {string} [props.termsOfUseUrl="/terms-of-use"] - URL for the Terms of Use link.
 *        Defaults to "/terms-of-use".
 * @param {string} [props.securityMessage=scriptLines.trustFooter.securityMessage] - Custom security message displayed.
 *        Defaults to a localized string.
 * @param {boolean} [props.isFixed=true] - Determines if the footer is fixed to the bottom of the viewport.
 *        Defaults to `true`.
 * @param {string} [props.themeColor="rose"] - The primary theme color for link accents and icons (e.g., "rose", "blue").
 *        Defaults to "rose".
 * @param {string} [props.className=""] - Additional CSS classes to apply to the root footer element for custom styling.
 *        Defaults to an empty string.
 * @param {string} [props.companyName="Your Company Name"] - The name of the company for the copyright notice.
 *        This should ideally be configured globally or passed from a higher-level context.
 */

const TrustFooter = ({
    privacyPolicyUrl = "/privacy-policy", // Default URLs provided here
    termsOfUseUrl = "/terms-of-use",
    securityMessage = '',
    isFixed = true,
    themeColor = "rose",
    className = '',
    companyName = "Your Company Name", // Default company name
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const prefersReducedMotion = useReducedMotion(); // Hook to respect user's motion preferences.

    // Theme classes for dynamic styling based on `themeColor` prop.
    // This allows for easy visual customization of links and icons.
    const THEME_CLASSES = {
        rose: {
            linkText: 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 focus-visible:text-rose-700 dark:focus-visible:text-rose-300',
            iconColor: 'text-rose-600 dark:text-rose-400',
        },
        blue: { // Example of an alternative theme
            linkText: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus-visible:text-blue-700 dark:focus-visible:text-blue-300',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        // Add other themes (e.g., green, teal) as needed.
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose; // Fallback to 'rose' theme if an invalid themeColor is provided.

    // Framer Motion animation configuration for the footer's appearance.
    // Animation is subtle and respects `prefersReducedMotion`.
    const footerAnimation = {
        initial: { opacity: 0, y: prefersReducedMotion ? 0 : 15 }, // Start slightly offset and faded if motion is enabled.
        animate: { opacity: 1, y: 0 },
        transition: { delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }
    };

    // Base CSS classes for the footer container.
    const baseContainerClasses = "w-full border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-inter"; // Using a common font like Inter
    // CSS classes for fixed positioning.
    const fixedContainerClasses = "fixed inset-x-0 bottom-0 z-40"; // z-index to keep it above most content but below modals.
    // CSS classes for static positioning (applied when `isFixed` is false).
    const staticContainerClasses = "mt-12 sm:mt-16"; // Provides top margin when not fixed.

    // ===========================================================================
    // Validation (Prop Validation)
    // ===========================================================================
    // This component's props are mostly strings or booleans with defaults, reducing critical validation needs here.
    // PropTypes (defined below) handle type checking during development.
    // Runtime validation for URL formats could be added if URLs were more dynamic or user-inputted,
    // but for props with defaults, this is less critical for initial render.
    // Example (if URLs were critical and could be invalid):
    // if (!privacyPolicyUrl || !URL.canParse(privacyPolicyUrl)) { // URL.canParse is a newer API
    //     console.warn('TrustFooter: Invalid `privacyPolicyUrl`. Using default.');
    //     privacyPolicyUrl = "/privacy-policy"; // Fallback to default
    // }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <motion.footer
            className={`trust-footer font-montserrat ${baseContainerClasses} ${isFixed ? fixedContainerClasses : staticContainerClasses} ${className}`}
            variants={footerAnimation}
            initial="initial"
            animate="animate"
            role="contentinfo" // Semantic HTML5 role for footer content.
            data-testid="trust-footer"
            aria-label="Site legal information and security statement" // Overall ARIA label for the footer
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6"> {/* Slightly reduced padding */}
                {/* Security Message Section: Reassures users about data security. */}
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-center">
                    <Icon
                        name="shield_lock" // Icon visually representing security and trust.
                        className={`w-6 h-6 flex-shrink-0 ${currentTheme.iconColor}`}
                        aria-hidden="true" // Decorative icon.
                    />
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                        {securityMessage} {/* Localized security message */}
                    </p>
                </div>

                {/* Legal Links Section: Provides access to Privacy Policy and Terms of Use. */}
                <nav className="flex flex-col sm:flex-row items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm" aria-label={scriptLines.trustFooter.links.legalLinksLabel || "Legal links"}> {/* Localized ARIA label if needed */}
                    <a
                        href={privacyPolicyUrl}
                        target="_blank" // Opens link in a new tab.
                        rel="noopener noreferrer" // Security best practice for `target="_blank"`.
                        className={`font-medium ${currentTheme.linkText} hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-current rounded-sm transition-colors duration-150`}
                        data-testid="privacy-policy-link"
                    >
                        {scriptLines.trustFooter.links.privacyPolicy} {/* Localized link text */}
                    </a>
                    {/* Visual separator for links on larger screens. */}
                    <span className="hidden sm:inline-block text-neutral-400 dark:text-neutral-500" aria-hidden="true">|</span>
                    <a
                        href={termsOfUseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-medium ${currentTheme.linkText} hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-current rounded-sm transition-colors duration-150`}
                        data-testid="terms-of-use-link"
                    >
                        {scriptLines.trustFooter.links.termsOfUse} {/* Localized link text */}
                    </a>
                </nav>

                {/* Copyright Information: Standard copyright notice. */}
                <p className="mt-4 sm:mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    {/* Localized copyright string with dynamic year and company name. */}
                    {scriptLines.trustFooter.copyright
                        .replace('{year}', new Date().getFullYear().toString())
                        .replace('{companyName}', companyName)}
                </p>
            </div>
        </motion.footer>
    );
};

// Define prop types for type safety, improved documentation, and developer experience.
TrustFooter.propTypes = {
    /** URL for the Privacy Policy link. */
    privacyPolicyUrl: PropTypes.string,
    /** URL for the Terms of Use link. */
    termsOfUseUrl: PropTypes.string,
    /** Custom security message displayed in the footer. */
    securityMessage: PropTypes.string,
    /** Determines if the footer is fixed to the bottom of the viewport. */
    isFixed: PropTypes.bool,
    /** The primary theme color for link accents and icons (e.g., "rose", "blue"). */
    themeColor: PropTypes.oneOf(['rose', 'blue']), // Extend if more themes are added to THEME_CLASSES
    /** Additional CSS classes to apply to the root footer element. */
    className: PropTypes.string,
    /** The name of the company for the copyright notice. */
    companyName: PropTypes.string,
};

// Specify default props for optional props, ensuring the component has defined values to work with.
// Defaults are sourced from `scriptLines` for localizable text, or sensible fallbacks for URLs/behavior.
TrustFooter.defaultProps = {
    privacyPolicyUrl: "/privacy-policy",
    termsOfUseUrl: "/terms-of-use",
    securityMessage: '',
    isFixed: true,
    themeColor: "rose", // Corresponds to a key in THEME_CLASSES
    className: '',
    companyName: "Your Company", // Generic default, should be configured appropriately for the application
};

// Export the component, memoized for performance optimization.
// `React.memo` performs a shallow comparison of props, preventing re-renders
// if the props have not changed. This is useful for a static/semi-static component like a footer.
export default memo(TrustFooter);