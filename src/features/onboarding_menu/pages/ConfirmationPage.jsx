import { motion, AnimatePresence } from 'framer-motion';
import Icon from "../../../components/common/Icon";

export const ConfirmationPage = ({ userName }) => {
    const floatingIcons = ['bread', 'croissant', 'cake', 'muffin', 'cookie'];

    return (
        <motion.div
            className="h-full flex flex-col items-center justify-center p-6 space-y-6 text-center relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {floatingIcons.map((icon, index) => (
                    <motion.div
                        key={icon}
                        className="absolute text-[#FFE8D6] opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{
                            scale: 1,
                            rotate: 45,
                            y: [0, -50, 0],
                        }}
                        transition={{
                            duration: 4 + index,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.3
                        }}
                    >
                        <Icon name={icon} className="w-12 h-12" />
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center space-y-6"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Checkmark Animation */}
                <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-[#D4A373] to-[#C07A54] rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{
                        scale: 1,
                        rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                        duration: 0.5
                    }}
                >
                    <Icon
                        name="check"
                        className="text-4xl text-white"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    />
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold text-[#5A3E36] mb-2">
                        Oven Ready, {userName || 'Baker'}! 🎉
                    </h2>
                    <p className="text-[#7B5E57] max-w-md mx-auto">
                        Your profile is complete! Get ready to:
                    </p>
                </motion.div>

                {/* Interactive Timeline */}
                <motion.div
                    className="flex flex-col gap-3 w-full max-w-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center gap-3 p-3 bg-[#FFE8D6] rounded-lg hover:bg-[#F4DCC2] transition-colors">
                        <Icon name="recipe" className="text-[#D4A373] w-6 h-6" />
                        <span className="text-[#5A3E36]">Discover personalized recipes</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[#FFE8D6] rounded-lg hover:bg-[#F4DCC2] transition-colors">
                        <Icon name="community" className="text-[#D4A373] w-6 h-6" />
                        <span className="text-[#5A3E36]">Join our baking community</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[#FFE8D6] rounded-lg hover:bg-[#F4DCC2] transition-colors">
                        <Icon name="discount" className="text-[#D4A373] w-6 h-6" />
                        <span className="text-[#5A3E36]">Unlock exclusive discounts</span>
                    </div>
                </motion.div>

                {/* Action Button */}
                <motion.button
                    className="px-8 py-3 rounded-full bg-gradient-to-br from-[#D4A373] to-[#C07A54] text-white hover:shadow-lg transition-all relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="relative z-10">Start Baking Journey</span>
                    <motion.div
                        className="absolute inset-0 bg-white opacity-0"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.1 }}
                    />
                </motion.button>
            </motion.div>

            {/* Progress Celebration */}
            <AnimatePresence>
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                >
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-[#D4A373] rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            initial={{
                                opacity: 1,
                                scale: 0,
                            }}
                            animate={{
                                opacity: 0,
                                scale: 3,
                            }}
                            transition={{
                                duration: 1.5,
                                ease: 'easeOut'
                            }}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};