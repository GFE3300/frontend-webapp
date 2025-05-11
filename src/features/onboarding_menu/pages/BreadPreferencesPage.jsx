import React, { useState } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import RankingBadges from './templates/RankingGrid';
import Icon from '../../../components/common/Icon';
import Navigation from './Navigation';

// Bread type options
const BREAD_TYPES = [
    {
        key: 'sourdough',
        label: 'Sourdough',
        icon: 'bread-slice',
        gradient: ['#EAD2AC', '#C4A77D']
    },
    {
        key: 'baguette',
        label: 'Baguette',
        icon: 'baguette',
        gradient: ['#F7EFE5', '#E3C9A5']
    },
    {
        key: 'ciabatta',
        label: 'Ciabatta',
        icon: 'ciabatta',
        gradient: ['#D7CCC8', '#A9927E']
    },
    {
        key: 'wholegrain',
        label: 'Wholegrain',
        icon: 'grain',
        gradient: ['#BCAAA4', '#8D6E63']
    },
    {
        key: 'rye',
        label: 'Rye',
        icon: 'rye',
        gradient: ['#6D4C41', '#3E2723']
    },
    {
        key: 'brioche',
        label: 'Brioche',
        icon: 'croissant',
        gradient: ['#FFECB3', '#FFB300']
    },
];

export const BreadPreferencesPage = ({
    nextPage,
    prevPage,
    isRight,
    isMobile,
}) => {
    const [selectedBreads, setSelectedBreads] = useState([]);

    return (
        <div className="h-full w-full flex flex-col items-start justify-start max-w-3xl p-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-start w-full gap-4 mb-8">
                <div
                    className="w-15 h-15 rounded-full border-4 border-[var(--color-gold)]
                    flex items-center justify-center cursor-pointer text-[var(--color-cream)]"
                    style={{
                        background: `linear-gradient(18deg, var(--color-gold) 0%, rgb(238, 203, 89) 95%)`,
                    }}
                >
                    <Icon name="bread" className="w-8 h-8" />
                </div>

                <div className="font-playfair flex flex-col items-start justify-center gap-1 text-xl text-[var(--color-chocolate)]">
                    <h2 className='font-bold text-2xl'>Bread Preferences</h2>
                    <p className="text-[var(--color-chocolate)] text-[0.85rem]">
                        Choose your top 3 daily breads
                    </p>
                </div>
            </div>

            {/* Bread Selection Grid */}
            <RankingBadges
                options={BREAD_TYPES}
                value={selectedBreads}
                onChange={setSelectedBreads}
            />

            {/* Artisan Display Footer */}
            <motion.footer
                className="w-full mt-6 border-t border-[var(--color-cream)] pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex flex-col gap-3">
                    <h3 className="font-playfair text-lg text-[var(--color-chocolate)]">
                        Your Daily Loaf Selection
                    </h3>

                    <div className="flex items-center gap-2">
                        <div
                            className="h-2 rounded-full bg-[var(--color-cream)] transition-all duration-500"
                            style={{
                                width: `${(selectedBreads.length / 3) * 100}%`,
                                background: `linear-gradient(90deg, var(--color-gold) 0%, var(--color-caramel) 100%)`
                            }}
                        />
                        <span className="text-sm text-[var(--color-chocolate)]">
                            {selectedBreads.length}/3 selected
                        </span>
                    </div>

                    <AnimatePresence>
                        {selectedBreads.length > 0 && (
                            <motion.div
                                className="flex flex-wrap gap-2 mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {selectedBreads.map((bread, index) => (
                                    <motion.div
                                        key={bread.key}
                                        className="px-3 py-1 rounded-full bg-[var(--color-cream)] flex items-center gap-2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: 'spring' }}
                                    >
                                        <span className="text-sm text-[var(--color-chocolate)]">
                                            {index + 1}.
                                        </span>
                                        <Icon
                                            name={bread.icon}
                                            className="w-4 h-4 text-[var(--color-gold)]"
                                        />
                                        <span className="text-sm text-[var(--color-chocolate)]">
                                            {bread.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.footer>

            <Navigation
                className="mt-auto"
                onNext={nextPage}
                onBack={prevPage}
                isRight={isRight}
                isMobile={isMobile}
            />
        </div>
    );
};