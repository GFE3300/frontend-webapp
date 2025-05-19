// src/components/register/subcomponents/BubbleAnimation.jsx
import { cn } from "../utils/utils";
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";
// eslint-disable-next-line
import { motion } from "framer-motion";

const BubbleAnimation = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Configuration (props with defaults)
    const particleCount = props.particleCount || 300;
    const particlePropCount = 9; // x, y, vx, vy, life, ttl, speed, radius, hue
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

    // Refs for animation state and stable values
    const particlePropsArr = useRef(new Float32Array(particlePropsLength)).current;
    const centerArr = useRef([0, 0]).current; // Use descriptive name to avoid conflict with 'center' prop if any
    const tickRef = useRef(0);
    const lastFrameTimeRef = useRef(Date.now());
    const animationFrameIdRef = useRef(null);
    const turbulenceTimeoutRef = useRef(null);
    const drawLogicRef = useRef(null); // Ref to hold the latest draw function

    // Noise instance (stable)
    const noise3D = useRef(createNoise3D()).current;

    // State
    const [turbulenceIntensity, setTurbulenceIntensity] = useState(0);

    // Math and utility constants (stable)
    const TAU = 2 * Math.PI;
    const rand = useCallback(n => n * Math.random(), []);
    const randRange = useCallback(n => n - rand(2 * n), [rand]);
    const fadeInOut = useCallback((t, m) => {
        const hm = 0.5 * m;
        return Math.abs(((t + hm) % m) - hm) / hm;
    }, []);
    const lerp = useCallback((n1, n2, speed) => (1 - speed) * n1 + speed * n2, []);

    // Exposed method via ref
    useImperativeHandle(ref, () => ({
        addTurbulence(intensity = 1) {
            setTurbulenceIntensity(Math.min(intensity, 3.0));
            if (turbulenceTimeoutRef.current) clearTimeout(turbulenceTimeoutRef.current);
            turbulenceTimeoutRef.current = setTimeout(() => {
                setTurbulenceIntensity(0);
            }, 1000);
        }
    }), []); // Empty dependency array ensures this is stable

    // Particle initialization logic
    const initParticle = useCallback((i) => {
        const { innerWidth } = window;
        const x = rand(innerWidth);
        const y = centerArr[1] + randRange(rangeY);
        particlePropsArr.set([
            x, y, 0, 0, 0, baseTTL + rand(rangeTTL),
            baseSpeed + rand(rangeSpeed),
            baseRadius + rand(rangeRadius),
            baseHue + rand(rangeHue)
        ], i);
    }, [centerArr, rangeY, baseTTL, rangeTTL, baseSpeed, rangeSpeed, baseRadius, rangeRadius, baseHue, rangeHue, particlePropsArr, rand, randRange]);

    const initParticles = useCallback(() => {
        tickRef.current = 0;
        for (let i = 0; i < particlePropsLength; i += particlePropCount) {
            initParticle(i);
        }
    }, [particlePropsLength, initParticle]);

    // Bounds checking (stable)
    const checkBounds = useCallback((x, y) => {
        const { innerWidth, innerHeight } = window;
        return x > innerWidth || x < 0 || y > innerHeight || y < 0;
    }, []);

    // Drawing a single particle (stable if its own deps are stable)
    const drawSingleParticle = useCallback((x, y, x2, y2, life, ttl, radius, hue, ctx) => {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = radius;
        ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }, [fadeInOut]);

    // Particle update logic - this depends on turbulenceIntensity (state)
    const updateParticle = useCallback((i, ctx) => {
        let idx = i, i2 = i + 1, i3 = i + 2, i4 = i + 3, i5 = i + 4, i6 = i + 5, i7 = i + 6, i8 = i + 7, i9 = i + 8;
        
        let x = particlePropsArr[idx];
        let y = particlePropsArr[i2];
        let prevVx = particlePropsArr[i3];
        let prevVy = particlePropsArr[i4];
        let life = particlePropsArr[i5];
        let ttl = particlePropsArr[i6];
        let pBaseSpeed = particlePropsArr[i7];
        let radius = particlePropsArr[i8];
        let hue = particlePropsArr[i9];

        const ti = turbulenceIntensity; // Current turbulence intensity

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

        drawSingleParticle(x, y, x2, y2, life, ttl, radius, hue, ctx);

        life++;
        particlePropsArr[idx] = x2;
        particlePropsArr[i2] = y2;
        particlePropsArr[i3] = vx;
        particlePropsArr[i4] = vy;
        particlePropsArr[i5] = life;

        if (checkBounds(x2, y2) || life > ttl) {
            initParticle(i);
        }
    }, [particlePropsArr, turbulenceIntensity, noise3D, drawSingleParticle, checkBounds, initParticle, lerp, xOff, yOff, zOff, noiseSteps, TAU]);

    // Drawing all particles
    const drawAllParticles = useCallback((ctx) => {
        for (let i = 0; i < particlePropsLength; i += particlePropCount) {
            updateParticle(i, ctx);
        }
    }, [particlePropsLength, updateParticle]);
    
    // Glow effect (stable)
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

    // The core drawing logic for a single frame
    // This function will be recreated when its dependencies change (e.g., backgroundColor, drawAllParticles)
    // and drawLogicRef.current will be updated.
    const frameRenderer = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const now = Date.now();
        if (now - lastFrameTimeRef.current < 32) { // FPS Cap ~30fps
            // Skip frame if too early, but rAF loop continues
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

    // Update the ref to the latest frameRenderer function whenever it changes
    useEffect(() => {
        drawLogicRef.current = frameRenderer;
    }, [frameRenderer]);

    // Canvas resize handler (stable because its deps are stable)
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
        initParticles(); // Re-initialize particles on resize
    }, [centerArr, initParticles]); // initParticles is stable

    // Main setup useEffect: runs ONCE on mount for animation loop and resize listener
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        handleCanvasResize(); // Initial setup

        const animationLoop = () => {
            if (drawLogicRef.current) {
                drawLogicRef.current(); // Execute the latest drawing logic
            }
            animationFrameIdRef.current = requestAnimationFrame(animationLoop);
        };
        animationFrameIdRef.current = requestAnimationFrame(animationLoop);
        
        window.addEventListener("resize", handleCanvasResize);

        return () => { // Cleanup
            window.removeEventListener("resize", handleCanvasResize);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (turbulenceTimeoutRef.current) { // Clear any pending turbulence reset
                clearTimeout(turbulenceTimeoutRef.current);
            }
        };
    }, [handleCanvasResize]); // handleCanvasResize is stable

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
                transition={{ duration: 0.5 }} // Controls the initial fade-in of the canvas container
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