import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value }) {
    const safeValue = parseFloat(value);
    const displayValue = isNaN(safeValue) ? 0 : safeValue;

    let spring = useSpring(displayValue, { mass: 0.8, stiffness: 75, damping: 15 });
    let display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString()
    );

    useEffect(() => {
        // Use the sanitized value to update the spring
        spring.set(displayValue);
    }, [spring, displayValue]);

    return <motion.span>{display}</motion.span>;
}

export default AnimatedNumber;