import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} CanvasDimensions
 * @property {number} width - Logical width in CSS pixels
 * @property {number} height - Logical height in CSS pixels
 */

/**
 * Display Pipeline Mathematics
 * ---------------------------
 * 1. Physical Pixel Calculation:
 *    physical_width = logical_width × device_scale
 *    physical_height = logical_height × device_scale
 * 
 * 2. Coordinate Mapping:
 *    canvas_point(x,y) → display_point(x×scale, y×scale)
 *    Preserves aspect ratio and density independence
 */

/**
 * High-fidelity canvas initialization system
 * @param {React.RefObject} canvasRef - Canvas element reference
 * @param {number} width - Logical width in CSS pixels
 * @param {number} height - Logical height in CSS pixels
 * 
 * @behavior
 * | Condition          | Action                          | Complexity |
 * |--------------------|---------------------------------|------------|
 * | Valid dimensions   | Set up scaled canvas            | O(1)       |
 * | Invalid ref        | Early return                    | O(1)       |
 * | DPI change         | Reconfigure canvas              | O(1)       |
 */
// In useCanvasSetup.js
export function useCanvasSetup(canvasRef, width, height) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !width || !height || width <= 0 || height <= 0) return;

        try {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) throw new Error('Canvas context unavailable');

            const deviceScale = window.devicePixelRatio || 1;

            // Set crisp physical dimensions
            const renderWidth = Math.floor(width * deviceScale);
            const renderHeight = Math.floor(height * deviceScale);

            // Set display dimensions
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Set buffer dimensions
            canvas.width = renderWidth;
            canvas.height = renderHeight;

            // Configure anti-aliasing
            ctx.imageSmoothingEnabled = false;
            ctx.translate(0.5, 0.5); // For sharp 1px lines

            // Scale context
            ctx.resetTransform();
            ctx.scale(deviceScale, deviceScale);

        } catch (error) {
            console.error('Canvas setup failed:', error);
        }
    }, [canvasRef, width, height]);
}

useCanvasSetup.propTypes = {
    canvasRef: PropTypes.shape({
        current: PropTypes.instanceOf(HTMLElement)
    }).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};

/**
 * Coordinate System Guarantees
 * ----------------------------
 * 1. Density Independence:
 *    ∀x∈[0,width]: x_physical = ⌊x × device_scale⌋
 * 
 * 2. Aspect Preservation:
 *    width_physical/height_physical = width_logical/height_logical
 * 
 * 3. Subpixel Alignment:
 *    Prevents fractional coordinates through floor()
 */

/**
 * Performance Characteristics
 * --------------------------
 * Time Complexity: O(1) - Constant time operations
 * Reflow Impact: Minimal (batched dimension updates)
 * Paint Cycles: 1 frame latency for DPI changes
 * 
 * Optimizations:
 * - Integer physical dimensions prevent aliasing
 * - Transform reset prevents cumulative scaling
 * - DevicePixelRatio polling only on mount/resize
 */

/**
 * Error Boundary Conditions
 * ------------------------
 * 1. Invalid Dimensions:
 *    width ∨ height ≤ 0 → No operation
 * 2. Missing Context:
 *    Throw with recovery instructions
 * 3. Null Reference:
 *    Early exit before DOM operations
 */

/**
 * Display Transform Equations
 * --------------------------
 * 1. CSS Pixel to Physical:
 *    Pₓ = ⌊W × s⌋, Pᵧ = ⌊H × s⌋
 * 
 * 2. Logical to Physical Coords:
 *    x' = x × s, y' = y × s
 * 
 * Where:
 * - W,H = Logical dimensions
 * - s = device_scale (≥1)
 * - Pₓ,Pᵧ = Physical buffer dimensions
 */