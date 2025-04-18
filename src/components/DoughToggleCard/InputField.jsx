import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon';

export const InputField = ({ label, type, name, value, onChange, error }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">{label}</label>
            <motion.div className="relative">
                <input
                    type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-[#EBD8B7]'
                        } focus:ring-2 focus:ring-[#D4A373]/50 pr-12 transition-all`}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center absolute right-3 top-1/2 -translate-y-1/2 text-[#6F4E37]"
                    >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} variations={{ fill: 0, weight: 400, grade: 0, opsz: 32 }} />
                    </button>
                )}
            </motion.div>
            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-500 text-sm"
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
};