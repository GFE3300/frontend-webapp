import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAnimation, useCanvasSetup } from './hooks';

/**
 * Wave Dynamics Core:
 * Implements damped wave propagation with phase synchronization
 * @typedef {Object} WaveParams
 * @property {number} amplitude - Base oscillation magnitude (px)
 * @property {number} cycleInterval - Full animation cycle duration (ms)
 * @property {number} propagationSpeed - Wavefront velocity (px/ms)
 * @property {string|string[]} lineColor - Stroke color(s)
 * @property {number} lineWidth - Stroke thickness (px)
 * @property {number} inclinationAngle - Canvas shear angle (degrees)
 * @property {number} waveSpacing - Vertical distance between waves (px)
 * @property {number} waveVariation - Phase randomness factor (0-1)
 */

/**
 * Coordinate Transformation System:
 * 1. Canvas Space: [x, y] ∈ [0, width] × [0, height]
 * 2. Sheared Space: x' = x + y·tan(θ), y' = y
 * 3. Wave Space: y_wave = y_shear + A·sin(ωt - kx + φ)
 * 
 * Boundary Conditions:
 * - Wave amplitude clamped to 95% vertical bounds
 * - Phase continuity across cycle boundaries
 * - Automatic wave count for full coverage
 */

function WavingBackground({
    amplitude = 25,
    cycleInterval = 8000,
    propagationSpeed = 0.3,
    lineColor = ['#4a90e2', '#50e3c2', '#9013fe'],
    lineWidth = 4,
    inclinationAngle = -30,
    waveSpacing = 20,
    waveVariation = 0.2,
    width = 200,
    height = 200,
    pushDown = 0
}) {
    const canvasRef = useRef(null);
    const { registerDrawFunction } = useAnimation(cycleInterval);
    useCanvasSetup(canvasRef, width, height);

    /**
     * Wave Parameter Generator:
     * Computes time-dependent wave properties with safety checks
     * @param {number} tGlobal - Animation timestamp (ms)
     * @returns {Object} Current wave state
     */
    const getWaveState = useCallback((tGlobal) => {
        const safeCycleInterval = Math.max(cycleInterval, 1);
        const cyclePhase = (tGlobal % safeCycleInterval) / safeCycleInterval;
        const energy = Math.sin(Math.PI * cyclePhase) ** 2;

        return {
            energy,
            angleRad: (Math.min(inclinationAngle, 89) * Math.PI) / 180,
            waveCount: Math.ceil(height / Math.max(waveSpacing, 1)) * 2
        };
    }, [cycleInterval, inclinationAngle, waveSpacing, height]);

    /**
     * Wave Path Generator:
     * Computes vertical displacement using damped oscillation equation
     * @param {number} x - Horizontal position (px)
     * @param {number} params - Wave parameters
     * @returns {number} Vertical displacement (px)
     */
    const calculateWaveDisplacement = useCallback((x, {
        tGlobal,
        ω,
        waveAmp,
        wavePhase,
        positionDelay
    }) => {
        const effectiveTime = tGlobal - positionDelay;
        return effectiveTime > 0
            ? waveAmp * Math.sin(ω * effectiveTime + wavePhase)
            : 0;
    }, []);

    const drawWaves = useCallback((ctx, tGlobal) => {
        if (!ctx) return;

        try {
            ctx.clearRect(0, 0, width, height);
            const { energy, angleRad, waveCount } = getWaveState(tGlobal);

            // Apply affine shear transformation
            ctx.transform(1, Math.tan(angleRad), 0, 1, 0, 0);

            // Wave generation loop
            const baseY = -height * 0.5;
            for (let i = 0; i < waveCount; i++) {
                ctx.beginPath();

                // Phase-varied wave parameters
                const waveAmp = amplitude * energy * (0.8 + 0.2 * Math.sin(i * 0.5));
                const waveFreq = 1 + 0.2 * Math.cos(i * 0.3);
                const ω = (2 * Math.PI * waveFreq) / Math.max(cycleInterval, 1);

                // Path construction
                for (let x = 0; x <= width; x += 3) {
                    const yPos = (baseY + i * waveSpacing) + pushDown;
                    const displacement = calculateWaveDisplacement(x, {
                        tGlobal,
                        ω,
                        waveAmp: Math.min(waveAmp, height * 0.475),
                        wavePhase: i * (Math.PI * waveVariation),
                        positionDelay: x / width * (width / Math.max(propagationSpeed, 0.01))
                    });

                    const y = yPos + displacement;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }

                // Style application
                ctx.strokeStyle = Array.isArray(lineColor)
                    ? lineColor[i % lineColor.length]
                    : lineColor;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        } catch (error) {
            console.error('Wave rendering error:', error);
        }
    }, [
        amplitude,
        cycleInterval,
        propagationSpeed,
        lineColor,
        lineWidth,
        waveSpacing,
        waveVariation,
        width,
        height,
        getWaveState,
        calculateWaveDisplacement,
        pushDown
    ]);

    useEffect(() => {
        const unregister = registerDrawFunction((tGlobal) => {
            const ctx = canvasRef.current?.getContext('2d');
            drawWaves(ctx, tGlobal);
        });
        return () => unregister?.();
    }, [registerDrawFunction, drawWaves]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                background: 'transparent'
            }}
            aria-label="Animated wave background"
        />
    );
}

WavingBackground.propTypes = {
    amplitude: PropTypes.number,
    cycleInterval: PropTypes.number,
    propagationSpeed: PropTypes.number,
    lineColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    lineWidth: PropTypes.number,
    inclinationAngle: PropTypes.number,
    waveSpacing: PropTypes.number,
    waveVariation: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
};

export default WavingBackground;