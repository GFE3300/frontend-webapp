//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { set } from "lodash";
import { useRef, useEffect, useState } from 'react';

const AnimatedPage = ({ frontContent, backContent, activePage, isActive, zIndex, index }) => {
    const pageRef = useRef(null);
    const [delayedZIndex, setDelayedZIndex] = useState(zIndex);

    useEffect(() => {
        if (isActive) {
            setTimeout(() => {
                setDelayedZIndex(index);
            }, 500);
        } else {
            setDelayedZIndex(zIndex);
        }

        return () => clearTimeout(delayedZIndex);
    }, [isActive, zIndex, index, setDelayedZIndex, delayedZIndex]);

    useEffect(() => {
        console.log('Page Ref:', index);
        console.log('Active:', isActive);
        console.log('Delayed ZIndex:', delayedZIndex);
        console.log('ZIndex:', zIndex);
    }, [isActive, delayedZIndex, zIndex, index]);

    return (
        <div
            className={`animated-page n-${index} absolute h-full w-full duration-300`}
            style={{
                zIndex: delayedZIndex * 10,
                perspective: '1200px',
                pointerEvents: 'auto',
            }}
        >
            <motion.div
                className="relative h-full w-full origin-left"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isActive ? -180 : 0 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 30,
                }}
            >
                <motion.div
                    ref={pageRef}
                    className="h-full w-full relative origin-left"
                    style={{
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Front Page */}
                    <div
                        className="absolute h-full w-full p-4 pl-0 rounded-md"
                    >
                        <div
                            className="h-full flex flex-col items-center justify-center space-y-4 rounded-r-md shadow-2xl"
                            style={{
                                background: `var(--color-cream)`,
                            }}
                        >
                            {frontContent || <DefaultContent side="front" />}
                        </div>
                    </div>

                    {/* Back Page */}
                    <div
                        className="absolute h-full w-full p-4 pr-0 rounded-md"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div
                            className="h-full flex flex-col items-center justify-center space-y-4 rounded-l-md shadow-2xl"
                            style={{
                                background: `var(--color-cream)`,
                            }}
                        >
                            {backContent || <DefaultContent side="back" />}
                        </div>
                    </div>

                    {/* Page Curl Effect */}
                    <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-[var(--color-chocolate)/30] to-transparent" />
                </motion.div>
            </motion.div>
        </div>
    );
};

// Default styling for empty content areas
const DefaultContent = ({ side }) => (
    <>
        <h3 className="font-playfair text-2xl text-[var(--color-chocolate)]">
            {side === 'front' ? 'Front Page' : 'Back Page'}
        </h3>
        <p className="font-inter text-[var(--color-charcoal)] text-center px-6">
            {side === 'front'
                ? 'Click to flip →'
                : '← Click to return'}
        </p>
        <div className="h-px w-32 bg-[var(--color-caramel)] my-4" />
        <div className="grid grid-cols-2 gap-4 w-full px-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-[var(--color-white)] rounded-lg border border-[var(--color-caramel)/30]" />
            ))}
        </div>
    </>
);

export default AnimatedPage;