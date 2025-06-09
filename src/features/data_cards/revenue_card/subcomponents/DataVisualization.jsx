import React, { memo } from 'react';
import PropTypes from 'prop-types';
import GraphHoverInspector from "../../GraphHoverInspector";
import DualGraphRenderer from "./DualGraphRenderer";

/**
 * Data visualization component for dual metric presentation
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.size - Container dimensions { width: number, height: number }
 * @param {number[]} props.hourlyRevenue - Array of hourly revenue values
 * @param {number[]} props.hourlyCustomers - Array of hourly customer counts
 * @param {Array} props.enrichedRevenueVectors - Processed revenue vectors for visualization
 * @param {Array} props.enrichedCustomerVectors - Processed customer vectors for visualization
 * @param {Function} props.generateTooltipContent - Tooltip content generator function
 */
const DataVisualization = ({
    size,
    hourlyRevenue,
    hourlyCustomers,
    enrichedRevenueVectors,
    enrichedCustomerVectors,
    generateTooltipContent
}) => {
    // ===========================================================================
    // Validation & Fallbacks
    // ===========================================================================
    const hasValidDimensions = size?.width > 0 && size?.height > 0;
    const hasRevenueData = hourlyRevenue?.length > 0;
    const hasCustomerData = hourlyCustomers?.length > 0;

    // ===========================================================================
    // Render Conditions
    // ===========================================================================
    if (!hasValidDimensions) {
        return <div className="data-viz-loading"></div>;
    }

    return (
        <div
            className="data-visualization-container"
            style={{
                height: `${size.height}px`,
                width: `${size.width}px`
            }}
        >
            <DualGraphRenderer
                size={size}
                revenueVectors={hourlyRevenue}
                customerVectors={hourlyCustomers}
            />

            {hasRevenueData && hasCustomerData && (
                <GraphHoverInspector
                    size={size}
                    primaryVectors={enrichedRevenueVectors}
                    secondaryVectors={enrichedCustomerVectors}
                    generateTooltipContent={generateTooltipContent}
                    interactionConfig={{
                        tolerance: 15,
                        tooltipOffsets: { x: 20, y: -20 },
                        animationDuration: 300
                    }}
                    tooltipSize={{
                        primary: { width: 200, height: 160 },
                        secondary: { width: 96, height: 40 }
                    }}
                />
            )}
        </div>
    );
};

DataVisualization.propTypes = {
    size: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired,
    hourlyRevenue: PropTypes.arrayOf(PropTypes.number),
    hourlyCustomers: PropTypes.arrayOf(PropTypes.number),
    enrichedRevenueVectors: PropTypes.arrayOf(
        PropTypes.shape({
            path: PropTypes.string.isRequired,
            area: PropTypes.number.isRequired,
            centroid: PropTypes.object.isRequired
        })
    ),
    enrichedCustomerVectors: PropTypes.arrayOf(
        PropTypes.shape({
            path: PropTypes.string.isRequired,
            points: PropTypes.array.isRequired
        })
    ),
    generateTooltipContent: PropTypes.func.isRequired
};

DataVisualization.defaultProps = {
    hourlyRevenue: [],
    hourlyCustomers: [],
    enrichedRevenueVectors: [],
    enrichedCustomerVectors: []
};

export default memo(DataVisualization);