import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon';
import Navigation from './Navigation';
import chocolate from '../../assets/icons/chocolate.svg';
import vanilla from '../../assets/icons/vanilla.svg';
import citrus from '../../assets/icons/citrus.svg';
import berry from '../../assets/icons/berry.svg';
import nuts from '../../assets/icons/nuts.svg';
import cinnamon from '../../assets/icons/cinnamon.svg';
import herbs from '../../assets/icons/herbs.svg';
import dumpling from '../../assets/icons/dumpling.svg';
import caramel from '../../assets/icons/caramel.svg';

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

export const FlavorDNAPage = ({ prevPage: onBack, nextPage: onNext, isMobile, isRight, formData }) => {
    const initial = formData.flavors || [];
    const [stage, setStage] = useState('select'); // 'select' or 'rank'
    const [selected, setSelected] = useState(initial);
    const [ranking, setRanking] = useState([null, null, null]);

    // Initialize ranking slots when entering ranking stage
    useEffect(() => {
        if (stage === 'rank') {
            setRanking([null, null, null]);
        }
    }, [stage]);

    // Selection toggling
    const toggleFlavor = (key) => {
        setSelected(prev => prev.includes(key)
            ? (prev.length > 3 ? prev.filter(k => k !== key) : prev)
            : (prev.length < 5 ? [...prev, key] : prev)
        );
    };

    // Pool of unranked flavors
    const pool = selected.filter(k => !ranking.includes(k));

    // Assign badge to first empty slot
    const assignToSlot = (key) => {
        const emptyIndex = ranking.indexOf(null);
        if (emptyIndex !== -1) {
            setRanking(prev => prev.map((v, i) => i === emptyIndex ? key : v));
        }
    };
    // Remove from slot back to pool
    const removeFromSlot = (index) => {
        setRanking(prev => prev.map((v, i) => i === index ? null : v));
    };

    const canSelectProceed = selected.length >= 3;
    const canRankProceed = ranking.filter(Boolean).length >= 3;

    const handleNext = () => {
        if (stage === 'select') {
            if (canSelectProceed) setStage('rank');
        } else {
            if (canRankProceed) {
                onNext({ ...formData, flavors: selected, top3: ranking.filter(Boolean) });
            }
        }
    };

    return (
        <div className="w-full max-w-[800px] h-144 py-6 px-6 mx-auto flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-12 h-12 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                    <Icon name="grocery" className="text-[var(--color-cream)]" />
                </motion.div>
                <div className="font-playfair">
                    <h2 className="font-bold text-2xl text-[var(--color-chocolate)]">
                        {stage === 'select' ? 'Your Flavor DNA' : 'Place Your Top 3'}
                    </h2>
                    <p className="text-sm text-[var(--color-charcoal)]">
                        {stage === 'select'
                            ? 'Select 3–5 flavors you love most.'
                            : 'Click or drag a badge into a slot to rank your favorites!'}
                    </p>
                </div>
            </div>

            {/* Content */}
            {stage === 'select' ? (
                // Selection Grid
                <>
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm font-medium text-[var(--color-chocolate)]">
                            <span>{selected.length} / 5</span>
                            <span className="text-xs">Select at least 3</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--color-cream)] rounded-full mt-1 overflow-hidden">
                            <motion.div className="h-full bg-[var(--color-caramel)]" initial={{ width: 0 }} animate={{ width: `${(selected.length / 5) * 100}%` }} transition={{ type: 'spring', stiffness: 100 }} />
                        </div>
                    </div>
                    <motion.div layout className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {FLAVORS.map((flav, idx) => {
                            const isActive = selected.includes(flav.key);
                            const [start, end] = flav.gradient;
                            return (
                                <motion.button
                                    onClick={() => toggleFlavor(flav.key)}
                                    role="button"
                                    aria-pressed={isActive}
                                    className={`w-full h-14 rounded-full flex flex-col items-center justify-center cursor-pointer text-xs font-medium focus:outline-none uppercase tracking-wider ${isActive ? 'shadow-[0_0_8px_2px_rgba(0,0,0,0.1)]' : ''}`}
                                    style={{
                                        background: isActive
                                            ? `linear-gradient(135deg, ${start}, ${end})`
                                            : 'var(--color-cream)',
                                        color: isActive
                                            ? 'var(--color-white)'
                                            : 'var(--color-chocolate)',
                                        border: isActive
                                            ? 'none'
                                            : `2px solid ${start}33`,
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <img src={flav.icon} alt={flav.label} className="w-8 h-8 mb-1" />
                                    <span className="mt-1">{flav.label}</span>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </>
            ) : (
                // Ranking Slots & Pool
                <div className="flex flex-col space-y-6">
                    {/* Slots */}
                    <div className="grid grid-cols-3 gap-4">
                        {ranking.map((key, idx) => {
                            if (key) {
                                const flav = FLAVORS.find(f => f.key === key);
                                const [start, end] = flav.gradient;
                                return (
                                    <motion.div key={idx} className="h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer"
                                        style={{ background: `linear-gradient(135deg, ${start}, ${end})`, color: 'white' }}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => removeFromSlot(idx)}
                                    >
                                        <img src={flav.icon} alt={flav.label} className="w-10 h-10 mb-1" />
                                        <span>{['🥇', '🥈', '🥉'][idx]} {flav.label}</span>
                                    </motion.div>
                                );
                            } else {
                                return (
                                    <motion.div key={idx} className="h-24 rounded-2xl border-2 border-dashed border-[var(--color-charcoal)] flex items-center justify-center text-[var(--color-charcoal)] cursor-pointer"
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => { /* user can click pool to assign */ }}
                                    >
                                        <span className="text-xl">{['🥇', '🥈', '🥉'][idx]}</span>
                                    </motion.div>
                                );
                            }
                        })}
                    </div>
                    {/* Pool */}
                    <div className="grid gap-4 ${isMobile?'grid-cols-2':'grid-cols-3'}">
                        {pool.map((key, idx) => {
                            const flav = FLAVORS.find(f => f.key === key);
                            return (
                                <motion.div key={key} className="h-20 rounded-lg flex items-center justify-center p-2 bg-[var(--color-cream)] border border-[var(--color-charcoal)] cursor-pointer"
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => assignToSlot(key)}
                                >
                                    <img src={flav.icon} alt={flav.label} className="w-8 h-8 mr-2" />
                                    <span className="font-playfair font-medium text-[var(--color-chocolate)]">{flav.label}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end mt-6">
                <Navigation onBack={() => stage === 'select' ? onBack() : setStage('select')} onNext={handleNext} isRight={isRight} isMobile={isMobile} disabledNext={stage === 'select' ? !canSelectProceed : !canRankProceed} />
            </div>
        </div>
    );
};

export default FlavorDNAPage;
