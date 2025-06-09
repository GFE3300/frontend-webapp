// eslint-disable-next-line
import { motion } from 'framer-motion';
import Icon from './Icon';

const BlockNumberSelector = ({ value, onChange, max = 14 }) => {
    const handleChange = (newValue) => {
        const clamped = Math.max(0, Math.min(max, newValue));
        onChange(clamped);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main blocks */}
            <div className="flex gap-1.5 items-center">
                {Array.from({ length: max }).map((_, index) => (
                    <motion.button
                        key={index}
                        className={`h-10 flex-1 rounded-xl shadow-xl
                                ${index < value
                                ? 'bg-radial-[at_50%_50%] from-rose-400/70 to-rose-400'
                                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                                }
                                transition duration-200 ease-in-out
                            `}
                        initial
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onTap={() => handleChange(index < value ? index : index + 1)}
                        aria-label={`Set to ${index + 1}`}
                    >
                        {index < value && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-full h-full"
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Control buttons */}
            <div 
                className="
                    flex justify-between items-center gap-3 rounded-full"
            >
                <motion.button
                    className="
                        flex items-center justify-center w-8 h-8 
                        rounded-full bg-neutral-300 transition duration-200 ease-in-out
                        hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChange(value - 1)}
                    disabled={value >= max}
                >
                    <Icon name="remove" className="w-5 h-5" style={{ fontSize: 20 }} />
                </motion.button>

                <motion.div
                    className="text-lg font-medium w-8 text-center"
                    key={value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {value}
                </motion.div>

                <motion.button
                    className="
                        flex items-center justify-center w-8 h-8 
                        rounded-full bg-neutral-300 transition duration-200 ease-in-out
                        hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChange(value + 1)}
                    disabled={value >= max}
                >
                    <Icon name="add" className="w-5 h-5" style={{ fontSize: 20 }} />
                </motion.button>
            </div>
        </div>
    );
};

export default BlockNumberSelector;