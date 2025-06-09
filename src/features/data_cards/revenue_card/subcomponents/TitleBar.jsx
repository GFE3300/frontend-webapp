import React from "react";
import { motion } from "framer-motion";
import Icon from "../../../../components/common/Icon";
import { TitleBar as sl } from "../language_script/script_lines";

const TitleBar = () => {
    return (
        <motion.div
            className="flex w-full justify-between items-center gap-4 mb-1 px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    className="flex items-center justify-center h-10 w-10 p-2 rounded-xl bg-white dark:bg-neutral-800"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Icon
                        name="trending_up"
                        className="w-5 h-5 text-purple-500"
                        variations={{ fill: 1, weight: 700, grade: 0, opsz: 48 }}
                        style={{ fontSize: '20px' }}
                    />
                </motion.div>
                <div className="flex h-full justify-center items-end">
                    <h2 className="text-xl font-montserrat font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
                        {sl.title}
                    </h2>
                </div>
            </div>
        </motion.div>
    );
};

export default TitleBar;