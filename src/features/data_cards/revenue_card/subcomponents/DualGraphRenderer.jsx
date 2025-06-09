import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { GraphGeneratorAnimated } from "../../GraphGeneratorAnimated";

/**
 * Dual-layer graph visualization component for revenue and customer metrics
 * @component
 * @param {Object} props - Component properties
 * @param {number[]} props.revenueVectors - Y-axis values for revenue bars
 * @param {number[]} props.customerVectors - Y-axis values for customer line
 * @param {Object} props.size - Container dimensions { width: number, height: number }
 */
const DualGraphRenderer = ({ revenueVectors, customerVectors, size }) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const layerConfig = {
        revenue: {
            design: 'default',
            zIndex: 'z-10',
            animationDuration: 1600,
            reduceBars: false
        },
        customers: {
            design: 'dashed',
            zIndex: 'z-20',
            animationDuration: 1600,
            reduceBars: true
        }
    };

    // ===========================================================================
    // Validation
    // ===========================================================================
    const hasValidDimensions = size?.width > 0 && size?.height > 0;
    const hasRevenueData = revenueVectors?.length > 0;
    const hasCustomerData = customerVectors?.length > 0;

    if (!hasValidDimensions) return null;

    return (
        <div className="dual-graph-renderer" style={{ height: size.height }}>
            {/* Revenue Bars Layer */}
            {hasRevenueData && (
                <div className={`absolute inset-0 ${layerConfig.revenue.zIndex}`}>
                    <GraphGeneratorAnimated
                        size={size}
                        graphBars={revenueVectors}
                        animationDuration={layerConfig.revenue.animationDuration}
                        design={layerConfig.revenue.design}
                        showVectors={false}
                        reduce={layerConfig.revenue.reduceBars}
                    />
                </div>
            )}

            {/* Customer Line Layer */}
            {hasCustomerData && (
                <div className={`absolute inset-0 ${layerConfig.customers.zIndex}`}>
                    <GraphGeneratorAnimated
                        size={size}
                        graphBars={customerVectors}
                        animationDuration={layerConfig.customers.animationDuration}
                        design={layerConfig.customers.design}
                        showVectors={false}
                        reduce={layerConfig.customers.reduceBars}
                    />
                </div>
            )}
        </div>
    );
};

DualGraphRenderer.propTypes = {
    revenueVectors: PropTypes.arrayOf(PropTypes.number),
    customerVectors: PropTypes.arrayOf(PropTypes.number),
    size: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired
};

DualGraphRenderer.defaultProps = {
    revenueVectors: [],
    customerVectors: []
};

export default memo(DualGraphRenderer);