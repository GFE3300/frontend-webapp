import React from 'react';
import Icon from '../../../../../components/common/Icon';

// Design Guideline Mappings for Decor
const DECOR_RENDERER_STYLES = {
    plantGradientLight: "bg-gradient-to-br from-green-300 to-green-400",
    plantGradientDark: "dark:from-green-500 dark:to-green-600",
    plantBorderLight: "border-green-500",
    plantBorderDark: "dark:border-green-400",
    plantIconColorLight: "text-green-700",
    plantIconColorDark: "dark:text-green-200",

    rugGradientLight: "bg-gradient-to-br from-sky-200 to-sky-300", // Example for rug
    rugGradientDark: "dark:from-sky-600 dark:to-sky-700",
    rugBorderLight: "border-sky-400",
    rugBorderDark: "dark:border-sky-300",
    rugIconColorLight: "text-sky-700",
    rugIconColorDark: "dark:text-sky-200",

    defaultGradientLight: "bg-gradient-to-br from-neutral-200 to-neutral-300",
    defaultGradientDark: "dark:from-neutral-600 dark:to-neutral-700",
    defaultBorderLight: "border-neutral-400",
    defaultBorderDark: "dark:border-neutral-500",
    defaultIconColorLight: "text-neutral-500",
    defaultIconColorDark: "dark:text-neutral-400",
};

const DecorRenderer = ({ item }) => {
    // item: { id, shape (e.g. 'plant-small'), decorType ('plant', 'rug'), rotation (handled by wrapper) }

    let content = null;
    let styleClasses = "";
    const borderRadiusClass = item.shape?.includes('round') ? 'rounded-full' : 'rounded-lg';

    switch (item.decorType) {
        case 'plant':
            styleClasses = `${DECOR_RENDERER_STYLES.plantGradientLight} ${DECOR_RENDERER_STYLES.plantGradientDark} border ${DECOR_RENDERER_STYLES.plantBorderLight} ${DECOR_RENDERER_STYLES.plantBorderDark}`;
            content = <Icon name="potted_plant" className={`w-3/5 h-3/5 ${DECOR_RENDERER_STYLES.plantIconColorLight} ${DECOR_RENDERER_STYLES.plantIconColorDark}`} />;
            break;
        case 'rug':
            styleClasses = `${DECOR_RENDERER_STYLES.rugGradientLight} ${DECOR_RENDERER_STYLES.rugGradientDark} border ${DECOR_RENDERER_STYLES.rugBorderLight} ${DECOR_RENDERER_STYLES.rugBorderDark}`;
            // For a rug, we might want a pattern or just color. An icon can represent it.
            content = <Icon name="texture" className={`w-1/2 h-1/2 opacity-70 ${DECOR_RENDERER_STYLES.rugIconColorLight} ${DECOR_RENDERER_STYLES.rugIconColorDark}`} />;
            break;
        default: // Generic decor
            styleClasses = `${DECOR_RENDERER_STYLES.defaultGradientLight} ${DECOR_RENDERER_STYLES.defaultGradientDark} border ${DECOR_RENDERER_STYLES.defaultBorderLight} ${DECOR_RENDERER_STYLES.defaultBorderDark}`;
            content = <Icon name="interests" className={`w-1/2 h-1/2 ${DECOR_RENDERER_STYLES.defaultIconColorLight} ${DECOR_RENDERER_STYLES.defaultIconColorDark}`} />; // Generic "interests" or "category" icon
            break;
    }

    return (
        <div
            className={`w-full h-full flex items-center justify-center 
                        ${styleClasses} ${borderRadiusClass}
                        transition-colors duration-150`}
        // Title attribute handled by PlacedItem.jsx
        >
            {content}
        </div>
    );
};

export default DecorRenderer;