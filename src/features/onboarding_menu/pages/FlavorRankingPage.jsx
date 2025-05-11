import React, { useState } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import RankingBadges from './templates/RankingGrid';

import chocolate from '../../../assets/icons/chocolate.svg';
import vanilla from '../../../assets/icons/vanilla.svg';
import citrus from '../../../assets/icons/citrus.svg';
import berry from '../../../assets/icons/berry.svg';
import nuts from '../../../assets/icons/nuts.svg';
import cinnamon from '../../../assets/icons/cinnamon.svg';
import herbs from '../../../assets/icons/herbs.svg';
import dumpling from '../../../assets/icons/dumpling.svg';
import caramel from '../../../assets/icons/caramel.svg';
import Icon from '../../../components/common/Icon';
import Navigation from './Navigation';

// Flavor options with gradients
const FLAVORS = [
    { key: 'chocolate', label: 'Chocolate', icon: chocolate, gradient: ['#5A3E36', '#CBA47F'] },
    { key: 'vanilla', label: 'Vanilla', icon: vanilla, gradient: ['#F7EFE5', '#FFDADA'] },
    { key: 'citrus', label: 'Citrus', icon: citrus, gradient: ['#FDE68A', '#FBC02D'] },
    { key: 'berry', label: 'Berry', icon: berry, gradient: ['#F2D7D9', '#E91E63'] },
    { key: 'nutty', label: 'Nutty', icon: nuts, gradient: ['#D7CCC8', '#8D6E63'] },
    { key: 'spice', label: 'Spice', icon: cinnamon, gradient: ['#FFE0B2', '#FF7043'] },
    { key: 'herbaceous', label: 'Herbaceous', icon: herbs, gradient: ['#C8E6C9', '#4CAF50'] },
    { key: 'savory', label: 'Savory', icon: dumpling, gradient: ['#FFECB3', '#FFB300'] },
    { key: 'caramel', label: 'Caramel', icon: caramel, gradient: ['#FFE0B2', '#C68430'] },
];

export const FlavorRankingPage = ({
    nextPage,
    prevPage,
    isRight,
    isMobile,
}) => {
    // State now holds the full selected items array for ranking
    const [selectedItems, setSelectedItems] = useState([]);

    return (
        <div className="h-full w-full flex flex-col items-start justify-start max-w-3xl p-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-start w-full gap-4 mb-8">
                {/* Gold Source Badge */}
                <div
                    className="
                    w-15 h-15 rounded-full border-4 border-[var(--color-gold)]
                    flex items-center justify-center cursor-pointer text-[var(--color-cream)]"
                    style={{
                        background: `linear-gradient(18deg,var(--color-gold) 0%,rgb(238, 203, 89) 95%)`,
                    }}
                >
                    <Icon name={'grocery'} className="flex items-center justify-center w-8 h-8" style={{ fontSize: '2rem' }}/>
                </div>

                {/* Header Text */}
                <div className="font-playfair h-full flex flex-col items-start justify-center gap-1 text-xl text-[var(--color-chocolate)]">
                    <h2 className='font-bold text-2xl overflow-hidden text-ellipsis'>Flavor Ranking</h2>
                    <p className="text-[var(--color-chocolate)] text-[0.85rem] overflow-hidden text-ellipsis">
                        Select your top 3 favorite flavors
                    </p>
                </div>
            </div>

            {/* Badges */}
            <RankingBadges
                options={FLAVORS}
                value={selectedItems}
                onChange={setSelectedItems}
            />

            {/* Creative Footer */}
            <motion.footer
                className="w-full mt-6 border-t border-[var(--color-cream)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex flex-col">
                    <h3 className="font-playfair text-lg text-[var(--color-chocolate)]">
                        Your Flavor Journey
                    </h3>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mt-2">
                        <div
                            className="h-2 rounded-full bg-[var(--color-cream)] transition-all duration-500"
                            style={{
                                width: `${(selectedItems.length / 3) * 100}%`,
                                background: `linear-gradient(90deg, var(--color-gold) 0%, var(--color-caramel) 100%)`
                            }}
                        />
                    </div>
                </div>
            </motion.footer>

            {/* Navigation */}
            <Navigation className="mt-auto" onNext={nextPage} onBack={prevPage} isRight={isRight} isMobile={isMobile} />
        </div>
    );
};
