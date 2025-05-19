import { useEffect, useRef } from "react";
//eslint-disable-next-line  
import { motion } from "framer-motion";
import Icon from "../../../components/common/Icon";

const sizeStyles = {
    sm: {
        box: "h-4 w-4",
        label: "text-sm",
        gap: "gap-2",
    },
    md: {
        box: "h-5 w-5",
        label: "text-base",
        gap: "gap-3",
    },
    lg: {
        box: "h-6 w-6",
        label: "text-lg",
        gap: "gap-4",
    },
};

export const Checkbox = ({ label, checked, onChange, size = "md" }) => {
    const sizeStyles = {
        sm: { box: "w-4 h-4", gap: "gap-2", label: "text-sm" },
        md: { box: "w-5 h-5", gap: "gap-2.5", label: "text-base" },
        lg: { box: "w-6 h-6", gap: "gap-3", label: "text-lg" },
    };
    const s = sizeStyles[size];

    return (
        <label className={`flex items-center ${s.gap} cursor-pointer select-none`}>
            <div className={`relative flex items-center bg-white justify-center rounded border-2 border-rose-400 focus-within:ring-1 focus-within:ring-rose-500 ${s.box}`}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer appearance-none w-full h-full cursor-pointer rounded opacity-0"
                />
                <Icon
                    name="check"
                    style={{ fontSize: `1rem` }}
                    className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-rose-500"
                />
            </div>
            <span className={`${s.label} text-gray-800 dark:text-gray-100`}>{label}</span>
        </label>
    );
};

export const CheckboxGroup = ({
    label,
    options,
    selected = [],
    onChange,
    size = "md",
    color = "rose",
    selectAll = false,
}) => {
    const toggleOption = (option) => {
        const newSelected = selected.includes(option)
            ? selected.filter((o) => o !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const toggleAll = () => {
        const allSelected = selected.length === options.length;
        onChange(allSelected ? [] : [...options]);
    };

    const selectAllRef = useRef();

    useEffect(() => {
        if (!selectAllRef.current) return;
        if (selected.length === 0) {
            selectAllRef.current.indeterminate = false;
            selectAllRef.current.checked = false;
        } else if (selected.length === options.length) {
            selectAllRef.current.indeterminate = false;
            selectAllRef.current.checked = true;
        } else {
            selectAllRef.current.indeterminate = true;
        }
    }, [selected, options.length]);

    const s = sizeStyles[size];

    return (
        <div className="space-y-3">
            {label && (
                <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    {label}
                </label>
            )}

            {selectAll && (
                <label
                    className={`flex items-center ${s.gap} cursor-pointer select-none`}
                >
                    <input
                        ref={selectAllRef}
                        type="checkbox"
                        onChange={toggleAll}
                        className={`${s.box} rounded border-gray-300 text-${color}-500 focus:ring-${color}-500`}
                    />
                    <span className={`${s.label} font-medium text-gray-800 dark:text-gray-100`}>
                        Select All
                    </span>
                </label>
            )}

            <div className="flex flex-wrap gap-4">
                {options.map((option) => (
                    <motion.label
                        key={option}
                        className={`flex items-center ${s.gap} cursor-pointer select-none`}
                        whileHover={{ scale: 1.03 }}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={() => toggleOption(option)}
                            className={`${s.box} rounded border-gray-300 text-${color}-500 focus:ring-${color}-500`}
                        />
                        <span className={`${s.label} text-gray-700 dark:text-gray-100`}>
                            {option}
                        </span>
                    </motion.label>
                ))}
            </div>
        </div>
    );
};

export default Checkbox;
