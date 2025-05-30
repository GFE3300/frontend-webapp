// src/components/register/subcomponents/BubbleAnimation.jsx
import { cn } from "./utils";
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";
// eslint-disable-next-line
import { motion } from "framer-motion";

const BubbleAnimation = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Configuration (props with defaults)
    const particleCount = props.particleCount || 300;
    // MODIFIED: particlePropCount from 9 to 10 (added selectedColorIndex)
    const particlePropCount = 10; // x, y, vx, vy, life, ttl, speed, radius, hue, selectedColorIndex
    const particlePropsLength = particleCount * particlePropCount;
    const rangeY = props.rangeY || 200;
    const baseTTL = 50;
    const rangeTTL = 150;
    const baseSpeed = props.baseSpeed || 0.05;
    const rangeSpeed = props.rangeSpeed || 0.1;
    const baseRadius = props.baseRadius || 1;
    const rangeRadius = props.rangeRadius || 2;
    const baseHue = props.baseHue || 220;
    const rangeHue = 100;
    const noiseSteps = 3;
    const xOff = 0.00125;
    const yOff = 0.00125;
    const zOff = 0.0002;
    const backgroundColor = props.backgroundColor || "rgba(0, 0, 0, 0.01)";
    // NEW: Get particleColors prop
    const particleColors = props.particleColors || null;

    // Refs for animation state and stable values
    const particlePropsArr = useRef(new Float32Array(particlePropsLength)).current;
    const centerArr = useRef([0, 0]).current;
    const tickRef = useRef(0);
    const lastFrameTimeRef = useRef(Date.now());
    const animationFrameIdRef = useRef(null);
    const turbulenceTimeoutRef = useRef(null);
    const drawLogicRef = useRef(null);

    const noise3D = useRef(createNoise3D()).current;
    const [turbulenceIntensity, setTurbulenceIntensity] = useState(0);

    const TAU = 2 * Math.PI;
    const rand = useCallback(n => n * Math.random(), []);
    const randRange = useCallback(n => n - rand(2 * n), [rand]);
    const fadeInOut = useCallback((t, m) => {
        const hm = 0.5 * m;
        return Math.abs(((t + hm) % m) - hm) / hm;
    }, []);
    const lerp = useCallback((n1, n2, speed) => (1 - speed) * n1 + speed * n2, []);

    useImperativeHandle(ref, () => ({
        addTurbulence(intensity = 1) {
            setTurbulenceIntensity(Math.min(intensity, 3.0));
            if (turbulenceTimeoutRef.current) clearTimeout(turbulenceTimeoutRef.current);
            turbulenceTimeoutRef.current = setTimeout(() => {
                setTurbulenceIntensity(0);
            }, 1000);
        }
    }), []);

    const initParticle = useCallback((i) => {
        const { innerWidth } = window;
        const x = rand(innerWidth);
        const y = centerArr[1] + randRange(rangeY);
        // MODIFIED: Added selectedColorIndex
        const selectedColorIndex = (particleColors && particleColors.length > 0)
            ? Math.floor(rand(particleColors.length))
            : -1; // -1 indicates fallback to hue-based color

        particlePropsArr.set([
            x, y, 0, 0, 0, baseTTL + rand(rangeTTL), // ttl
            baseSpeed + rand(rangeSpeed), // speed
            baseRadius + rand(rangeRadius), // radius
            baseHue + rand(rangeHue), // hue (fallback)
            selectedColorIndex // selectedColorIndex
        ], i);
    }, [centerArr, rangeY, baseTTL, rangeTTL, baseSpeed, rangeSpeed, baseRadius, rangeRadius, baseHue, rangeHue, particlePropsArr, rand, randRange, particleColors]);

    const initParticles = useCallback(() => {
        tickRef.current = 0;
        for (let i = 0; i < particlePropsLength; i += particlePropCount) {
            initParticle(i);
        }
    }, [particlePropsLength, initParticle]);

    const checkBounds = useCallback((x, y) => {
        const { innerWidth, innerHeight } = window;
        return x > innerWidth || x < 0 || y > innerHeight || y < 0;
    }, []);

    // MODIFIED: Added selectedColorIndex to parameters
    const drawSingleParticle = useCallback((x, y, x2, y2, life, ttl, radius, hue, selectedColorIndex, ctx) => {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = radius;
        
        const alpha = fadeInOut(life, ttl);

        // MODIFIED: Color logic
        if (particleColors && particleColors.length > 0 && selectedColorIndex >= 0 && selectedColorIndex < particleColors.length) {
            const baseColor = particleColors[selectedColorIndex];
            ctx.globalAlpha = alpha; // Apply dynamic alpha
            ctx.strokeStyle = baseColor;
        } else {
            // Fallback to original hue-based color, alpha is part of hsla
            ctx.strokeStyle = `hsla(${hue},100%,60%,${alpha})`;
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        ctx.restore(); // Restores globalAlpha if it was set
    }, [fadeInOut, particleColors]);

    const updateParticle = useCallback((i, ctx) => {
        // MODIFIED: Indices adjusted for 10 properties
        let x = particlePropsArr[i];
        let y = particlePropsArr[i + 1];
        let prevVx = particlePropsArr[i + 2];
        let prevVy = particlePropsArr[i + 3];
        let life = particlePropsArr[i + 4];
        let ttl = particlePropsArr[i + 5];
        let pBaseSpeed = particlePropsArr[i + 6];
        let radius = particlePropsArr[i + 7];
        let hue = particlePropsArr[i + 8]; // Fallback hue
        let selectedColorIndex = particlePropsArr[i + 9]; // New: selected color index
        
        const ti = turbulenceIntensity;

        const noiseEvoFactor = 1 + ti * 0.1;
        const noiseDispFactor = noiseSteps * (1 + ti * 0.6);
        const n = noise3D(x * xOff, y * yOff, tickRef.current * zOff * noiseEvoFactor) * noiseDispFactor * TAU;
        
        let targetVx = Math.cos(n);
        let targetVy = Math.sin(n);
        let vx = lerp(prevVx, targetVx, 0.5);
        let vy = lerp(prevVy, targetVy, 0.5);

        if (ti > 0.01) {
            const jitterMag = ti * 0.4;
            vx += (Math.random() - 0.5) * jitterMag * 2;
            vy += (Math.random() - 0.5) * jitterMag * 2;
        }
        
        const inherentSpeed = pBaseSpeed * 0.6;
        const dynamicBoost = 1 + ti * 0.5;
        const effectiveSpeed = inherentSpeed * dynamicBoost;
        const x2 = x + vx * effectiveSpeed;
        const y2 = y + vy * effectiveSpeed;

        // MODIFIED: Pass selectedColorIndex to drawSingleParticle
        drawSingleParticle(x, y, x2, y2, life, ttl, radius, hue, selectedColorIndex, ctx);

        life++;
        particlePropsArr[i] = x2;
        particlePropsArr[i + 1] = y2;
        particlePropsArr[i + 2] = vx;
        particlePropsArr[i + 3] = vy;
        particlePropsArr[i + 4] = life;

        if (checkBounds(x2, y2) || life > ttl) {
            initParticle(i);
        }
    }, [particlePropsArr, turbulenceIntensity, noise3D, drawSingleParticle, checkBounds, initParticle, lerp, xOff, yOff, zOff, noiseSteps, TAU]);

    const drawAllParticles = useCallback((ctx) => {
        for (let i = 0; i < particlePropsLength; i += particlePropCount) {
            updateParticle(i, ctx);
        }
    }, [particlePropsLength, updateParticle]);
    
    const renderGlowEffect = useCallback((canvas, ctx) => {
        ctx.save();
        ctx.filter = "blur(8px) brightness(200%)";
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
        ctx.save();
        ctx.filter = "blur(4px) brightness(200%)";
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
    }, []);

    const frameRenderer = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const now = Date.now();
        if (now - lastFrameTimeRef.current < 32) { 
            return; 
        }
        lastFrameTimeRef.current = now;
        tickRef.current++;

        const { innerWidth, innerHeight } = window;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, innerWidth, innerHeight);

        drawAllParticles(ctx);
        renderGlowEffect(canvas, ctx);
    }, [backgroundColor, drawAllParticles, renderGlowEffect]);

    useEffect(() => {
        drawLogicRef.current = frameRenderer;
    }, [frameRenderer]);

    const handleCanvasResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { innerWidth, innerHeight } = window;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        canvas.style.width = `${innerWidth}px`;
        canvas.style.height = `${innerHeight}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        centerArr[0] = 0.5 * innerWidth;
        centerArr[1] = 0.5 * innerHeight;
        initParticles();
    }, [centerArr, initParticles]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        handleCanvasResize();

        const animationLoop = () => {
            if (drawLogicRef.current) {
                drawLogicRef.current();
            }
            animationFrameIdRef.current = requestAnimationFrame(animationLoop);
        };
        animationFrameIdRef.current = requestAnimationFrame(animationLoop);
        
        window.addEventListener("resize", handleCanvasResize);

        return () => {
            window.removeEventListener("resize", handleCanvasResize);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (turbulenceTimeoutRef.current) {
                clearTimeout(turbulenceTimeoutRef.current);
            }
        };
    }, [handleCanvasResize]);

    return (
        <div 
            className={cn(
                "bubble-container fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden -z-10",
                "bg-gradient-to-br from-rose-100 to-purple-100 dark:bg-gradient-to-br dark:from-purple-950 dark:to-neutral-900", 
                props.containerClassName)
            }>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                ref={containerRef}
                className="absolute inset-0 w-full h-full"
            >
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    aria-hidden="true"
                />
            </motion.div>
            <div className={cn("relative z-0", props.className)}>
                {props.children}
            </div>
        </div>
    );
});

BubbleAnimation.displayName = "BubbleAnimation";
export default React.memo(BubbleAnimation);