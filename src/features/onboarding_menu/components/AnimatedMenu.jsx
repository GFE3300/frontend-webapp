import { useState } from "react";
import { motion } from "framer-motion";
import BookContainer from "./BookContainer";

const AnimatedMenu = ({ pages, currentPage, setCurrentPage }) => {
    const [enableShift, setEnableShift] = useState(false);
    const size = { width: 380, height: 600 };

    const calculatePosition = () => {
        if (!enableShift  || currentPage < 1) return 0;
        return currentPage % 2 === 1 ? size.width : 0;
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* Scrollbar hiding styles */}
            <style jsx global>{`
                ::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Control Panel */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={() => setEnableShift(!enableShift)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    {enableShift ? "Disable Shift" : "Enable Shift"}
                </button>
            </div>

            <div className="flex items-center justify-center h-screen w-full"
                style={{ perspective: '1200px', overflow: 'hidden' }}>
                <motion.div
                    className="flex items-center justify-center h-screen w-full"
                    initial={{
                        x: '100vw',
                        y: '70vh',
                        rotateZ: -25,
                        rotateX: 45,
                        scale: 0.8,
                        opacity: 0
                    }}
                    animate={{
                        x: calculatePosition(),
                        y: 0,
                        rotateZ: 0,
                        rotateX: 0,
                        scale: 1,
                        opacity: 1
                    }}
                    transition={{
                        type: "spring",
                        mass: 1.2,
                        stiffness: 80,
                        damping: 15,
                        velocity: 2
                    }}
                    style={{
                        transformOrigin: 'center bottom',
                        perspectiveOrigin: 'center center',
                        width: `${size.width}px`,
                        height: `${size.height}px`
                    }}
                >
                    <BookContainer
                        pages={pages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        size={size}
                    />
                </motion.div>
            </div>
        </div>
    )
}

export default AnimatedMenu;