//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Icon from "../../../components/common/Icon";

export const WelcomePage = ({ nextPage }) => {
    return (
        <div
            className="w-full h-full relative"
        >
            {/* Emblem / Monogram */}
            <div
                className="
                absolute top-6 left-1/2 -translate-x-1/2
                w-10 h-10 rounded-full 
                flex items-center justify-center
                border-2 border-[var(--color-gold)] mb-4"
                style={{
                    background: `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`,
                }}
            >
                <Icon
                    name="chef_hat"
                    className={'flex items-center justify-center'}
                    style={{ color: 'var(--color-cream)' }}
                />
            </div>

            {/* Main Content */}
            <div className="px-4 pt-20 pb-8 flex flex-col items-center text-center space-y-4">
                <motion.h1
                    className="text-[var(--color-chocolate)] font-playfair text-2xl font-semibold leading-snug"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Welcome to Your<br />Tasting Menu
                </motion.h1>

                <motion.p
                    className="text-[var(--color-mauve)] italic font-inter text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    Let's discover your perfect taste…
                </motion.p>

                <motion.div
                    className="text-[var(--color-charcoal)] font-inter text-sm space-y-3 max-w-[280px] mt-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                >
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        We believe every sweet tooth is unique. In just a few pages, we’ll learn your favorite flavors, moods, and moments.
                    </motion.p>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        By the end, you’ll unlock a custom experience—and a few surprises too.
                    </motion.p>
                </motion.div>

                {/* Bullet List */}
                <motion.ul
                    className="mt-4 space-y-2 text-left"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: { staggerChildren: 0.15 }
                        }
                    }}
                >
                    {[
                        { icon: "local_dining", text: "Curated recommendations" },
                        { icon: "cake", text: "Exclusive rewards" },
                        { icon: "event", text: "Monthly flavor drops" }
                    ].map((item, i) => (
                        <motion.li
                            key={i}
                            className="flex items-center gap-2 text-[var(--color-caramel)] font-inter text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Icon name={item.icon} className="w-6 h-6" />
                            {item.text}
                        </motion.li>
                    ))}
                </motion.ul>

                {/* CTA Button */}
                <motion.button
                    onClick={nextPage}
                    className="
                    mt-8 text-[var(--color-cream)] w-50 h-10
                    flex items-center justify-center
                    font-inter font-semibold rounded-full shadow-md 
                    hover:bg-[var(--color-chocolate)] hover:shadow-lg transition-all
                    border-2 border-[var(--color-gold)] text-sm"
                    whileTap={{ scale: 0.95, rotateX: 5 }}
                    style={{
                        background: `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`,
                    }}
                >
                    Begin Your Journey
                </motion.button>
            </div>
        </div>
    );
};