import React from 'react';
import Icon from '../../../components/common/Icon';

/**
 * Placeholder for the Top Affiliates Leaderboard.
 * This will later display a ranked list of affiliates.
 */
const Leaderboard = () => {
    // This will be replaced with props and dynamic rendering later.
    const dummyLeaders = [
        { name: 'John Doe', earnings: '€1,250.50' },
        { name: 'Jane Smith', earnings: '€980.00' },
        { name: 'Affiliate Co.', earnings: '€760.75' },
    ];

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Top Affiliates</h3>
            <ul className="space-y-4">
                {dummyLeaders.map((leader, index) => (
                    <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Icon name="emoji_events" className={`w-6 h-6 mr-3 ${index === 0 ? 'text-amber-400' :
                                    index === 1 ? 'text-slate-400' :
                                        'text-amber-600'
                                }`} />
                            <span className="font-medium text-neutral-700 dark:text-neutral-200">{leader.name}</span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">{leader.earnings}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;