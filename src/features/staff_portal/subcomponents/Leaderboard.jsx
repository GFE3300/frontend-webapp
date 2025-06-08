import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

/**
 * Renders a single row in the leaderboard with rank-specific styling.
 */
const LeaderboardRow = ({ rank, name, value }) => {
    const rankStyles = {
        1: { icon: 'emoji_events', color: 'text-amber-400', ring: 'ring-amber-400' },
        2: { icon: 'military_tech', color: 'text-slate-400', ring: 'ring-slate-400' },
        3: { icon: 'military_tech', color: 'text-amber-600', ring: 'ring-amber-600' },
    };

    const style = rankStyles[rank] || { icon: 'circle', color: 'text-slate-500', ring: 'ring-transparent' };

    return (
        <li className="flex items-center justify-between p-3 transition-colors duration-200 rounded-lg hover:bg-slate-700/50">
            <div className="flex items-center">
                <div className={`flex-shrink-0 w-8 text-center font-bold ${style.color}`}>
                    <Icon name={style.icon} className={`w-6 h-6 mx-auto`} />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-slate-100">{name}</p>
                </div>
            </div>
            <div className="text-sm font-semibold text-slate-300">
                {value} New <span className="hidden sm:inline">Referrals</span>
            </div>
        </li>
    );
};

LeaderboardRow.propTypes = {
    rank: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
};


/**
 * Displays a ranked list of top-performing affiliates.
 * Features a dark, elegant theme to stand out on the dashboard.
 */
const Leaderboard = ({ data }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
    };

    const renderContent = () => {
        if (!data || data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <Icon name="sentiment_dissatisfied" className="w-10 h-10 mb-2" />
                    <p className="text-sm">No affiliate data available to rank.</p>
                </div>
            );
        }

        return (
            <motion.ul
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {data.map((leader, index) => (
                    <motion.div key={leader.id || index} variants={itemVariants}>
                        <LeaderboardRow
                            rank={index + 1}
                            name={leader.name}
                            value={leader.new_referrals_this_month}
                        />
                    </motion.div>
                ))}
            </motion.ul>
        );
    }

    return (
        <div className="bg-slate-800 dark:bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Top Affiliates This Month</h3>
            {renderContent()}
        </div>
    );
};

Leaderboard.propTypes = {
    /** An array of affiliate objects, expected to be pre-sorted. */
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string.isRequired,
        new_referrals_this_month: PropTypes.number.isRequired,
    })),
};

Leaderboard.defaultProps = {
    data: [],
};

export default Leaderboard;