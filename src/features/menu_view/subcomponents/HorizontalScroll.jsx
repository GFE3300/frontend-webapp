import React from 'react';
// Assuming 'cn' utility is available from this path, as seen in other components like BubbleAnimation.
// This utility helps merge Tailwind classes. If it's not available or you prefer a simpler approach,
import { cn } from '../../../components/animations/bubble/utils.js';

/**
 * A component that provides a horizontally scrollable area for its children.
 * It uses Tailwind CSS for styling, including scrollbar customizations.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The content to be scrolled horizontally.
 * @param {string} [props.className] - Additional CSS classes to apply to the scroll container.
 * @param {string} [props.ariaLabel] - ARIA label for accessibility, describing the scrollable region.
 * @param {React.Ref} ref - Forwarded ref to the underlying div element.
 * @returns {React.ReactElement} The HorizontalScroll component.
 */
const HorizontalScroll = React.forwardRef(({ children, className, ariaLabel, ...props }, ref) => {
    return (
        <div
            ref={ref} // Forwarding ref allows parent components to get a reference to this div
            role="region" // Defines the element as a region, useful for ARIA landmarks
            aria-label={ariaLabel} // Provides a label for screen readers
            className={cn(
                "flex overflow-x-auto overflow-y-hidden space-x-8", // Base styles: flex layout, enable horizontal scroll, hide vertical scroll.
                // Children will be laid out in a row by default.
                // Tailwind scrollbar utility classes. Ensure `tailwind-scrollbar` plugin is installed or custom CSS is provided.
                "scrollbar-thin",
                "scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400",
                "dark:scrollbar-thumb-neutral-600 dark:hover:scrollbar-thumb-neutral-500",
                "scrollbar-track-transparent", // Or use a specific color like "scrollbar-track-neutral-100 dark:scrollbar-track-neutral-800"
                "scrollbar-thumb-rounded-full", // Makes the scrollbar thumb rounded
                className // Allows passing custom classes to override or extend defaults
            )}
            {...props} // Spreads any other HTML attributes (id, style, etc.)
        >
            {children}
        </div>
    );
});

HorizontalScroll.displayName = 'HorizontalScroll'; // Helps in debugging with React DevTools

export default HorizontalScroll;