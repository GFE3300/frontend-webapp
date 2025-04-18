import { motion } from 'framer-motion';

export const RollingPin = ({ isAnimating }) => {
    return (
        <motion.div
            className={`
                absolute -bottom-8 left-1/2  z-1000
                w-[100%] h-16 -translate-x-1/2 
                flex flex-row items-center justify-center
                pointer-events-none
            `}
            initial={{ y: '0%', rotate: -5 }}
            animate={isAnimating ? "rolling" : "idle"}
            variants={{
                rolling: {
                    y: ['0%', '-400%', '-420%', '0%'],
                    rotate: [0, 10, -5, 0],
                    transition: {
                        duration: 1.6,
                        ease: [0.4, 0, 0.2, 1],
                        times: [0, 0.4, 0.6, 1]
                    }
                },
                idle: {
                    y: '0%',
                    rotate: -2,
                    transition: { type: 'spring', stiffness: 50 }
                }
            }}
        >
                <div className="absolute z-9 -left-8 w-16 h-8 bg-[#C07A54] rounded-full" />
                <div className="absolute z-10 w-full h-12 bg-[#D4A373] rounded-md shadow-lg relative"/>
                <div className="absolute z-9 -right-8 w-16 h-8 bg-[#C07A54] rounded-full" />
        </motion.div>
    );
};