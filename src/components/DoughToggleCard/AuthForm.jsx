import { motion, AnimatePresence } from 'framer-motion';
import { InputField } from './InputField';
import Icon from '../common/Icon';

const formVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, y: 8 }
};

const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export const AuthForm = ({ isLogin, formData, errors, handleChange, isLoading, handleSubmit, apiError }) => {
    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key={isLogin ? 'login' : 'register'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
            >
                {/* Updated InputField with value and onChange */}
                <motion.div variants={inputVariants}>
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                    />
                </motion.div>

                <motion.div variants={inputVariants}>
                    <InputField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                </motion.div>

                {!isLogin && (
                    <motion.div variants={inputVariants}>
                        <InputField
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />
                    </motion.div>
                )}

                <motion.div variants={inputVariants}>
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        className="w-full mt-4 py-3 bg-[#D4A373] hover:bg-[#C07A54] text-white rounded-md font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Icon name="autorenew" className="animate-spin" />
                                Processing...
                            </div>
                        ) : isLogin ? 'Sign In' : 'Create Account'}
                    </motion.button>
                </motion.div>
                {apiError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm mb-4 text-center"
                    >
                        {apiError}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};