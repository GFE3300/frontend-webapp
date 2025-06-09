import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModeTabs from './ModeTabs';
import OptionBar from './OptionBar';

/**
 * Time range selection controller combining mode tabs and scrollable options
 * @component
 * @param {Object} props - Component properties
 * @param {'day'|'week'|'month'} props.mode - Current temporal granularity
 * @param {Function} props.setMode - Mode change handler
 * @param {Array} props.options - Available time options
 * @param {number} props.selectedOption - Currently selected option index
 * @param {Function} props.setSelectedOption - Selection index handler
 * @param {Date} [props.referenceDate] - Base date for option calculations
 * @returns {JSX.Element} Unified time selection interface
 */
const TimeSelector = ({
    mode,
    setMode,
    options,
    selectedOption,
    setSelectedOption,
    referenceDate = new Date()
}) => {
    // ===========================================================================
    // State Management
    // ===========================================================================
    const [centerDate, setCenterDate] = useState(referenceDate);

    // ===========================================================================
    // Event Handlers
    // ===========================================================================

    /**
     * Handle temporal granularity changes with state reset
     * @param {string} newMode - Updated temporal granularity
     */
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setSelectedOption(0);
        setCenterDate(referenceDate);
    };

    // ===========================================================================
    // Render
    // ===========================================================================
    return (
        <div className="w-full flex flex-col space-y-2" role="region" aria-label="Time selection controls">
            {/* Control Header */}
            {/* TODO: Revisit header and make sure it works with different modes
            <header className="flex flex-row items-center justify-between text-sm text-gray-500">
                <h2 className="font-semibold font-montserrat tracking-wider text-xl uppercase">
                    {`This ${mode}`}
                </h2>
                <ModeTabs
                    mode={mode}
                    onChange={handleModeChange}
                    aria-label="Temporal granularity selector"
                />
            </header>
            */}

            {/* Content Area */}
            <OptionBar
                granularity={mode}
                options={options}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
                initialDate={centerDate}
                aria-label="Date selection scrollbar"
            />
        </div>
    );
};

// =============================================================================
// Prop Type Validation
// =============================================================================
TimeSelector.propTypes = {
    mode: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    setMode: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            start: PropTypes.instanceOf(Date).isRequired,
            end: PropTypes.instanceOf(Date).isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    selectedOption: PropTypes.number.isRequired,
    setSelectedOption: PropTypes.func.isRequired,
    referenceDate: PropTypes.instanceOf(Date),
};

export default React.memo(TimeSelector);