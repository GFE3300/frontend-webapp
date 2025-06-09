import React, { useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';


/**
 * GraphGenerator: draws a smooth, tangent-continuous curve over bar-top data using HTML5 Canvas.
 * 
 * Stages:
 * 1) Map discrete heights to 2D canvas coordinates (data ➔ screen space).
 * 2) Compute five anchor points (A–E) per adjacent bar-pair to outline a roofline.
 * 3) Break those into four raw segments (vectors) per pair.
 * 4) Enrich each segment with direction, magnitude (Euclidean length), and unit vector.
 * 5) Pair segments to place cubic Bézier control points ensuring C¹ continuity (tangent matching).
 * 6) Render raw vectors (blue/red), Bézier curves (black), and control handles (red/green).
 */


/**
 * 1. computeBarPoints(i, graphBars, units, height)
 *    Given bar-index i and graphBars array, compute five points:
 *    A = left corner of bar i top,
 *    B = halfway across bar i top,
 *    C = midpoint in height between bar i and i+1,
 *    D = halfway across bar i+1 top,
 *    E = right corner of bar i+1 top.
 *
 *    Coordinates:
 *      x_i = i * units.x
 *      y_i = height - graphBars[i] * units.y  // invert Y so 0 is at bottom
 *    y_C = height - (min(h_i,h_{i+1}) + |h_{i+1}-h_i|/2) * units.y
 *
 *    This centers C vertically between A.y and D.y, enabling smooth curves.
 */
export function computeBarPoints(i, graphBars, units, height) {
    const curr = graphBars[i] * units.y;
    const next = (graphBars[i + 1] ?? graphBars[i]) * units.y;
    const yDiff = Math.abs(next - curr); // Height of the bar
    const xDiff = (units.x / 2) * 1.1; // Width of the bar

    const isDownwards = curr > next;
    const isRound = yDiff >= units.x;

    const changeRatio = (y) => height - (y * 0.9 + 10);  // Ratio for height calculation

    const A = {
        x: i * units.x,
        y: changeRatio(curr),
    };
    const B = {
        x: (i + 0.5) * units.x,
        y: A.y
    };
    const C = {
        x: B.x,
        y: changeRatio(curr - (isDownwards ? 1 : -1) * (isRound ? xDiff : yDiff / 2)),
    };
    const D = {
        x: B.x,
        y: changeRatio(next + (isDownwards ? 1 : -1) * (isRound ? xDiff : yDiff / 2)),

    };
    const E = {
        x: B.x,
        y: changeRatio(next),
    };
    const F = {
        x: (i + 1) * units.x,
        y: (E.y) // E is same height as D (flat right)
    };

    return [A, B, C, D, E, F]
}

/**
 * 2. computeVectors(points)
 *    Turn five anchor points [A,B,C,D,E] into four directed segments:
 *      V1 = B ➔ A (flat left)
 *      V2 = B ➔ C (flat middle)
 *      V3 = Midpoint between C and D ➔ C (flat middle)
 *      V4 = Midpoint between C and D ➔ D (flat middle)
 *      V5 = E ➔ D (flat middle)
 *      V6 = E ➔ F (flat right)
 *    These form the piecewise-linear skeleton of the roofline.
 */
export function computeVectors(points) {
    const [A, B, C, D, E, F] = points;
    // Mid point between C and D
    const midPoint = {
        x: (C.x + D.x) / 2,
        y: (C.y + D.y) / 2,
    };
    // Adjust C to be the mid-point between A and D
    return [
        { start: B, end: A },
        { start: B, end: C },
        { start: midPoint, end: C },
        { start: midPoint, end: D },
        { start: E, end: D },
        { start: E, end: F },
    ];
}

/**
 * 3. enrichVectors(vectors)
 *    For each raw segment V = (start ➔ end), compute:
 *      Δx = end.x - start.x,  Δy = end.y - start.y
 *      magnitude L = sqrt(Δx² + Δy²)  // Euclidean length
 *      unitVector = (Δx/L, Δy/L)     // normalize direction
 *    Returns enriched data with geometry used for Bézier control placement.
 */
export function enrichVectors(vectors) {
    return vectors.map(({ start, end }) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const mag = Math.hypot(dx, dy);
        return {
            start, end,
            direction: { x: dx, y: dy },
            unitVector: { x: dx / mag, y: dy / mag },
            magnitude: mag,
        };
    });
}


/**
 * 4. drawVectors(ctx, enriched)
 *    Draw raw segments in alternating colors:
 *      even-indexed: blue, odd-indexed: red
 *    Useful for debugging the underlying skeleton before smoothing.
 */
export function drawVectors(ctx, enriched, lineWidth = 5) {
    enriched.forEach((v, idx) => {
        ctx.beginPath();
        ctx.moveTo(v.start.x, v.start.y);
        ctx.lineTo(v.end.x, v.end.y);
        ctx.strokeStyle = idx % 2 === 0 ? 'blue' : 'red';
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    });
}

/**
 * 5. drawCurves(ctx, enriched)
 *    For each consecutive pair of segments (s1 = enriched[i], s2 = enriched[i+1]):
 *      P0 = s1.end  (start of Bézier)
 *      P3 = s2.end  (end of Bézier)
 *
 *    Place control points P1, P2 to enforce tangent continuity:
 *      P1 = P0 - α1 * L1 * u1
 *      P2 = P3 - α2 * L2 * u2
 *    where Lk = segment length, uk = unit vector,
 *          α1, α2 determine handle length relative to segment.
 *
 *    The Bézier curve
 *      B(t) = (1-t)^3P0 + 3(1-t)^2t P1 + 3(1-t)t^2 P2 + t^3 P3
 *    has derivative at t=0 parallel to P1-P0 (thus parallel to s1.direction),
 *    and at t=1 parallel to P3-P2 (parallel to s2.direction), ensuring C¹.
 *
 *    We then stroke the curve (black) and draw small circles at P1 (red) and P2 (green).
 */
export function drawCurves(ctx, enriched, units, size) {
    // Early exit
    if (!units || !enriched || !enriched.length) return; 

    if (units.y < 1) units.y = 1; // prevent divide-by-zero

    let lastPoint = null;
    const gradient = ctx.createLinearGradient(0, 0, 0, size.height);

    gradient.addColorStop(0, 'rgba(173, 70, 255, 0.75)'); // Top: semi-transparent purple
    gradient.addColorStop(1, 'rgba(172, 70, 255, 0.1)');    // Bottom: fully transparent

    // Prepare a shared path for filling under the entire curve
    const fillPath = new Path2D();
    let firstPoint = null;

    // Also prepare stroke path (for perfect alignment)
    const strokePath = new Path2D();

    for (let i = 0; i < enriched.length; i += 2) {
        if (!enriched[i + 1]) break;

        const s1 = enriched[i];
        const s2 = enriched[i + 1];

        let P0 = { ...s1.end };
        const P3 = s2.end;
        lastPoint = P3;

        // Align P0 with the previous curve’s endpoint to avoid gaps
        if (i > 0) {
            const prevP3 = enriched[i - 1].end;
            if (Math.abs(P0.x - prevP3.x) > 0.001) {
                P0.x = prevP3.x;
            }
        }

        const CP1 = {
            x: P0.x - (s1.magnitude) * s1.unitVector.x * 0,
            y: P0.y - (s1.magnitude) * s1.unitVector.y,
        };

        const CP2 = {
            x: P3.x - (s2.magnitude) * s2.unitVector.x * 0,
            y: P3.y - (s2.magnitude) * s2.unitVector.y,
        };

        // Start the stroke/fill path from the first point
        if (i === 0) {
            strokePath.moveTo(P0.x, P0.y);
            fillPath.moveTo(P0.x, P0.y);
            firstPoint = { ...P0 };
        }

        strokePath.bezierCurveTo(CP1.x, CP1.y, CP2.x, CP2.y, P3.x, P3.y);
        fillPath.bezierCurveTo(CP1.x, CP1.y, CP2.x, CP2.y, P3.x, P3.y);

        // Optional: draw Bézier handles (debugging/visualization)
    }

    // Close the fill path (from end to base to start)
    fillPath.lineTo(lastPoint.x, size.height);              // Down to base from end
    fillPath.lineTo(firstPoint.x, size.height);      // Across the base
    fillPath.closePath();                            // Back up to starting point

    // Fill under the curve
    ctx.fillStyle = gradient;
    ctx.fill(fillPath);

    // Stroke over the curve (clean, bold)
    ctx.strokeStyle = 'rgb(173, 70, 255)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(strokePath);
}

export function drawDashedCurve(ctx, enriched, units, size) {
    if (units.y < 1) units.y = 1;

    // Set dashed line pattern: [dashLength, gapLength]
    ctx.setLineDash([10, 8]); // tweak for your design
    ctx.strokeStyle = 'rgb(251, 113, 133)'; // bold purple
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const path = new Path2D();

    for (let i = 0; i < enriched.length; i += 2) {
        if (!enriched[i + 1]) break;

        const s1 = enriched[i];
        const s2 = enriched[i + 1];

        let P0 = { ...s1.end };
        const P3 = s2.end;

        if (i > 0) {
            const prevP3 = enriched[i - 1].end;
            if (Math.abs(P0.x - prevP3.x) > 0.001) {
                P0.x = prevP3.x;
            }
        }

        const CP1 = {
            x: P0.x - (s1.magnitude) * s1.unitVector.x * 0,
            y: P0.y - (s1.magnitude) * s1.unitVector.y,
        };

        const CP2 = {
            x: P3.x - (s2.magnitude) * s2.unitVector.x * 0,
            y: P3.y - (s2.magnitude) * s2.unitVector.y,
        };

        if (i === 0) {
            path.moveTo(P0.x, P0.y);
        }

        path.bezierCurveTo(CP1.x, CP1.y, CP2.x, CP2.y, P3.x, P3.y);
    }

    ctx.stroke(path);

    // Reset dash pattern to solid in case it's reused elsewhere
    ctx.setLineDash([]);
}

export function drawPoints(ctx, points, color = 'red') {
    ctx.fillStyle = color;
    points.forEach(({ x, y }, idx) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        // label points with their index with an angle
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px sans-serif';

        ctx.fillStyle = 'black';
        ctx.fillText(`(${x.toFixed(2)}, ${y.toFixed(2)})`, x + 40, y - 50 * idx);
        ctx.fillStyle = color; // reset color for next point
    });
}


/**
 * Main React component: sets up high-DPI canvas, memoizes geometry, and draws.
 */
export function GraphGenerator({
    size = { width: 1000, height: 300 },
    graphBars = [5, 1, 3, 4, 2, 6, 1, 2, 3, 4, 5, 6],
    design = 'default', // 'default' or 'dashed'
    showVectors = false,
}) {
    const graphVectors = useRef(graphBars);

    // Fallback to prevent a misconfigured graph from pixels larger than the screen
    if (Math.max(...graphBars) > size.height) {
        graphVectors.current = graphBars.map(x => x / Math.max(...graphBars) * size.height);
    };

    const units = useMemo(() => ({
        x: size.width / (graphBars.length - 1),
        y: (size.height / (Math.max(...graphBars)))
    }), [size.width, size.height, graphBars]);

    const canvasRef = useRef(null);
    // devicePixelRatio for crisp rendering on retina displays
    const dpr = window.devicePixelRatio || 1;

    // Memoize enriched vectors: recompute only when data or size change
    const enrichedVectors = useMemo(() => {
        if (graphVectors.length < 2) return [];
        // FlatMap: for each index, compute points, vectors, then enrich them
        return graphVectors.flatMap((_, i) => {
            const pts = computeBarPoints(i, graphVectors, units, size.height);
            const raw = computeVectors(pts);
            return enrichVectors(raw);
        });
    }, [graphVectors, size.height, units]);

    useEffect(() => {
        const canvas = canvasRef.current;

        // Set actual pixel dimensions
        canvas.width = size.width * dpr;
        canvas.height = size.height * dpr;
        // Keep CSS dimensions logical
        canvas.style.width = `${size.width}px`;
        canvas.style.height = `${size.height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Clear and draw both raw segments and smooth curves
        ctx.clearRect(0, 0, size.width, size.height);
        if (showVectors) drawVectors(ctx, enrichedVectors);
        if (design === 'default') {
            drawCurves(ctx, enrichedVectors, units, size)
        } else if (design === 'dashed') {
            drawDashedCurve(ctx, enrichedVectors, units, size);
        }
    }, [enrichedVectors, size.width, size.height, dpr, units, size, design, showVectors]);

    return <canvas ref={canvasRef} className="mt-10" />;
}

GraphGenerator.propTypes = {
    size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
    graphBars: PropTypes.arrayOf(PropTypes.number),
};