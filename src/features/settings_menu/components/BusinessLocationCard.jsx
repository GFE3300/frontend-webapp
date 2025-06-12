import React from 'react';
import PropTypes from 'prop-types';

// Wrapper to provide map contexts, but not UI
import Step1LocationWrapper from '../../register/stages/Step1Location';

// UI Primitives for the location section
import AutocompleteInput from '../../register/maps/AutocompleteInput';
import AddressForm from '../../register/maps/AddressForm';
import MapViewport from '../../register/maps/MapViewport';
import GeolocationButton from '../../register/maps/GeolocationButton';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A self-contained card for managing the business's physical location.
 * It provides an interactive map, address form, and autocomplete search,
 * all driven by a higher-level form management hook.
 */
const BusinessLocationCard = ({ formData, updateField, setFormData }) => {
    return (
        <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat">
            {/* Header */}
            <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    {sl.businessProfileCard.sectionTitleLocation || 'Business Location'}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Set your physical address and pin location on the map.
                </p>
            </header>

            {/* Content Body - The entire content is wrapped by the logic provider */}
            <div className="p-6 md:p-8">
                <Step1LocationWrapper
                    formData={formData}
                    updateField={updateField}
                    setFormData={setFormData}
                />
            </div>
        </div>
    );
};

BusinessLocationCard.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    setFormData: PropTypes.func.isRequired,
};

export default BusinessLocationCard;