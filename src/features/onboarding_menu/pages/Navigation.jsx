import React from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Icon from "../../../components/common/Icon";

export default function Navigation({ onNext, onBack, isRight, isMobile, error, className }) {
    return (
        <div
            className={`flex w-full flex-col items-center justify-center gap-2 ${className}`} 
        >
            {error && (
                <div className="text-red-500 text-sm animate-shake">
                    {error}
                </div>
            )}
            <div
                className="flex w-full"
                style={{
                    justifyContent: isMobile ? "space-between" : isRight ? "flex-end" : "flex-start",
                }}
            >
                {(!isRight || isMobile) && (
                    <motion.button
                        onClick={onBack}
                        className="
                        w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-cream)]
                        border-2 border-[var(--color-chocolate)] shadow-lg"
                        style={{
                            background: `linear-gradient(18deg,var(--color-chocolate) 0%,rgb(138, 106, 96) 95%)`,
                        }}
                        whileTap={{ scale: 0.95, translateZ: 5 }}
                    >
                        <Icon name="chevron_left" />
                    </motion.button>
                )}
                {(isRight || isMobile) && (
                    <motion.button
                        onClick={onNext}
                        className="
                        w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-cream)]
                        border-2 border-[var(--color-chocolate)] shadow-lg"
                        style={{
                            background: `linear-gradient(18deg,var(--color-chocolate) 0%,rgb(138, 106, 96) 95%)`,
                        }}
                        whileTap={{ scale: 0.95, translateZ: 5 }}
                    >
                        <Icon name="chevron_right" />
                    </motion.button>
                )}
            </div>
        </div>
    );
}
