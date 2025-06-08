import React from 'react';
import PropTypes from 'prop-types';
import { scriptLines_Registration as scriptLines } from '../utils/script_lines';

export const PasswordStrength = ({ strength, className = '' }) => {

    const strengthLevels = {
        weak: { width: '33%', color: 'bg-red-500', text: scriptLines.passwordStrengthIndicator.weak },
        fair: { width: '66%', color: 'bg-yellow-500', text: scriptLines.passwordStrengthIndicator.fair },
        strong: { width: '100%', color: 'bg-green-500', text: scriptLines.passwordStrengthIndicator.strong }
    };

    // If strength is null or invalid, don't render anything.
    if (!strength || !strengthLevels[strength]) {
        return null;
    }

    const level = strengthLevels[strength];

    return (
        <div className={`mt-2 mx-3 ${className}`}>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${level.color} transition-all duration-300`}
                    style={{ width: level.width }}
                    aria-valuenow={level.width.replace('%','')}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    role="progressbar"
                    aria-label={`Password strength: ${level.text}`}
                />
            </div>
            <span className={`text-xs ${level.color.replace('bg', 'text')} font-medium font-montserrat`}>
                {level.text}
            </span>
        </div>
    );
};

PasswordStrength.propTypes = {
    strength: PropTypes.oneOf(['weak', 'fair', 'strong']),
    className: PropTypes.string,
};