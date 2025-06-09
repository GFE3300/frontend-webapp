import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import GraphHoverGuides from './GraphHoverGuides';
import GraphHoverTooltip from './GraphHoverTooltip';

// Utility function with binary search optimization
export function solveBezierYAtX(P0, CP1, CP2, P3, targetX) {
    let low = 0;
    let high = 1;
    let epsilon = 0.001;

    // Binary search for optimal t value
    while (high - low > epsilon) {
        const mid = (low + high) / 2;
        const x = Math.pow(1 - mid, 3) * P0.x +
            3 * Math.pow(1 - mid, 2) * mid * CP1.x +
            3 * (1 - mid) * Math.pow(mid, 2) * CP2.x +
            Math.pow(mid, 3) * P3.x;

        if (x < targetX) {
            low = mid;
        } else {
            high = mid;
        }
    }

    // Calculate final Y at optimal t
    const t = (low + high) / 2;
    return Math.pow(1 - t, 3) * P0.y +
        3 * Math.pow(1 - t, 2) * t * CP1.y +
        3 * (1 - t) * Math.pow(t, 2) * CP2.y +
        Math.pow(t, 3) * P3.y;
}

const findNearestDataPoint = (x, vectors) => {
    if (!vectors?.length) return null;
    return vectors.reduce((prev, curr) =>
        Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
    );
};

const calculateCurvePosition = (x, vectors, tension = 0.2) => {
    if (!vectors?.length || !vectors[0]?.end) return null; // Check for curve vectors
    if (!vectors?.length || vectors.length % 2 !== 0) return null;
    // Add vector structure validation
    if (!vectors[0]?.end || !vectors[0]?.unitVector) return null;

    for (let i = 0; i < vectors.length; i += 2) {
        const s1 = vectors[i];
        const s2 = vectors[i + 1];
        if (!s1 || !s2) break;

        const P0 = s1.end;
        const P3 = s2.end;
        if (x < P0.x || x > P3.x) continue;

        const CP1 = {
            x: P0.x - tension * s1.magnitude * s1.unitVector.x,
            y: P0.y - tension * s1.magnitude * s1.unitVector.y,
        };
        const CP2 = {
            x: P3.x - tension * s2.magnitude * s2.unitVector.x,
            y: P3.y - tension * s2.magnitude * s2.unitVector.y,
        };

        return solveBezierYAtX(P0, CP1, CP2, P3, x);
    }
    return null;
};

const GraphHoverInspector = ({
    size,
    primaryVectors,
    secondaryVectors,
    generateTooltipContent,
    tooltipSize
}) => {
    const containerRef = useRef(null);
    const pointerRef = useRef({ x: null });
    const frameRef = useRef(null);
    const [hoverData, setHoverData] = useState({
        primary: null,   // For Bézier curve (revenue)
        secondary: null  // For linear data (customers)
    });

    const computeHoverInfo = useCallback((x) => {
        // Calculate both positions regardless of priority
        const secondaryY = findNearestDataPoint(x, secondaryVectors)?.y;
        const primaryY = calculateCurvePosition(x, primaryVectors);

        // Return both results simultaneously
        return {
            primary: primaryY !== null ? {
                x: x,
                y: primaryY,
                content: generateTooltipContent(x, false),
            } : null,
            secondary: secondaryY !== null ? {
                x: x,
                y: secondaryY,
                content: generateTooltipContent(x, true),
            } : null
        };
    }, [primaryVectors, secondaryVectors, generateTooltipContent]);

    const animationFrame = useCallback(() => {
        if (!containerRef.current) return; // Safety check
        frameRef.current = null;
        const { x } = pointerRef.current;

        if (x == null) {
            setHoverData({ primary: null, secondary: null });
            return;
        }

        const info = computeHoverInfo(x);

        if (info.primary || info.secondary) { // Only update if valid data
            setHoverData(info);
        }
        frameRef.current = requestAnimationFrame(animationFrame);
    }, [computeHoverInfo]);

    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;

        const bounds = containerRef.current.getBoundingClientRect();
        const rawX = e.clientX - bounds.left;
        const x = Math.max(0, Math.min(rawX, size.width));

        pointerRef.current.x = x;

        if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(animationFrame);
        }
    }, [size.width, animationFrame]);

    const handleMouseLeave = useCallback(() => {
        pointerRef.current.x = null;
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
        setHoverData({ primary: null, secondary: null });
    }, []);

    useEffect(() => () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: size.width,
                height: size.height,
                pointerEvents: 'auto',
                zIndex: 30
            }}
        >
            <GraphHoverGuides
                size={size}
                primaryHover={hoverData.primary}
                secondaryHover={hoverData.secondary}
            />

            {/* Primary Tooltip (Revenue) */}
            {hoverData.primary && (
                <GraphHoverTooltip
                    size={size}
                    tooltipSize={tooltipSize?.primary}
                    position={hoverData?.primary}
                    content={hoverData.primary?.content}
                    placement="top"
                />
            )}

            {/* Secondary Tooltip (Customers) */}
            {hoverData.secondary && (
                <GraphHoverTooltip
                    size={size}
                    tooltipSize={tooltipSize?.secondary}
                    position={hoverData.secondary}
                    placement="bottom"
                    content={hoverData.secondary?.content}
                    className="bg-emerald-100 border-emerald-500"
                />
            )}
        </div>
    );
};

GraphHoverInspector.propTypes = {
    size: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired,
    firstVectors: PropTypes.arrayOf(
        PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        })
    ).isRequired,
    secondVectors: PropTypes.arrayOf(
        PropTypes.shape({
            end: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }),
            magnitude: PropTypes.number.isRequired,
            unitVector: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            })
        })
    ).isRequired,
    generateTooltipContent: PropTypes.func.isRequired,
    tooltipSize: PropTypes.shape({
        primary: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        }),
        secondary: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        })
    })
};

export default GraphHoverInspector;