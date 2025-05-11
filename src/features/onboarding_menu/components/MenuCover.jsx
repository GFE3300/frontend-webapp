//eslint-disable-next-line no-unused-vars
import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import Icon from "../../../components/common/Icon";

const MenuCover = ({ isActive, zIndex }) => {
    const [delayedZIndex, setDelayedZIndex] = useState(zIndex * 10);

    useEffect(() => {
        if (isActive) {
            setTimeout(() => {
                setDelayedZIndex();
            }, 500);
        }
        return () => clearTimeout(delayedZIndex);
    }, [isActive, zIndex, setDelayedZIndex, delayedZIndex]);

    return (
        <div
            className="menu-cover relative h-full"
            style={{ perspective: '1200px', zIndex: delayedZIndex}}
        >
            {/* Main 3D Container */}
            <motion.div
                className="relative h-full w-relative origin-left"
                style={{
                    transform: 'perspective(1200px) rotateX(50deg)',
                    transformStyle: "preserve-3d",
                }}
                animate={{
                    rotateY: isActive ? -180 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 30,
                }}
            >
                {/* Front Cover */}
                <div
                    className="absolute h-full w-full p-4 rounded-md rounded-r-2xl shadow-2xl"
                    style={{
                        background: `linear-gradient(18deg,var(--color-chocolate) 0%, rgba(115, 87, 77, 1) 90%)`,
                    }}
                >
                    {/* Cover Design Elements */}
                    <div
                        className="border-2 border-[var(--color-gold)] h-full rounded-md flex flex-col items-center justify-center"
                    >

                        <h2 className="text-[var(--color-white)] font-playfair text-4xl mb-4">
                            Our Menu
                        </h2>
                        <div
                            className="
                                w-10 h-10 rounded-full 
                                flex items-center justify-center
                                border-2 border-[var(--color-gold)] mb-4"
                            style={{
                                background: `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`,
                            }}
                        >
                            <Icon
                                name="chef_hat"
                                className={'flex items-center justify-center'}
                                style={{ color: 'var(--color-cream)' }}
                            />
                        </div>
                        <p className="text-[var(--color-rose)] font-inter italic mb-4">
                            Baked just for you
                        </p>
                    </div>
                </div>

                {/* Back Cover (Inside Page) */}
                <div
                    className="absolute h-full w-full p-4 rounded-none rounded-l-2xl shadow-2xl"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)", // Pre-flipped to create back side
                        background: `linear-gradient(18deg,var(--color-chocolate) 0%, rgba(115, 87, 77, 1) 90%)`,
                    }}
                >
                    {/* Menu Content */}
                    <div className="border-2 border-[var(--color-gold)] h-full rounded-md flex flex-col items-center justify-center" >
                        <div className='h-[calc(100%-32px)] w-2 bg-[var(--color-gold)] rounded-md rounded-r-none absolute right-0 top-4' />

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MenuCover;