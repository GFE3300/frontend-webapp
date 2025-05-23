import React from 'react';
import PropTypes from 'prop-types';

const StockProgressBar = ({ percentage }) => {
    // Ensure percentage is between 0 and 100
    const validPercentage = Math.max(0, Math.min(100, percentage));
    let bgColorClass = 'bg-green-500';
    if (validPercentage < 25) bgColorClass = 'bg-red-500';
    else if (validPercentage < 50) bgColorClass = 'bg-yellow-500';

    return (
        <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2.5 relative">
            <div
                className={`${bgColorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${validPercentage}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white mix-blend-difference">
                {/* Display only if there's enough space or on hover */}
                {/* {`${Math.round(validPercentage)}%`} */}
            </span>
        </div>
    );
};

StockProgressBar.propTypes = {
    percentage: PropTypes.number, // Stock level as a percentage
};

StockProgressBar.defaultProps = {
    percentage: 0,
};


export default StockProgressBar;