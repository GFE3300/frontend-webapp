import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { InputField, Dropdown } from '../subcomponents';
// MODIFICATION: Import the centralized script lines
import { scriptLines_Registration as scriptLines } from '../utils/script_lines';

/**
 * @typedef {object} AddressData
 * @property {string} [street]
 * @property {string} [city]
 * @property {string} [postalCode]
 * @property {string} [country] - Should be a country code (e.g., 'US', 'CA')
 * @property {string} [formattedAddress] - Optional, might come from geocoding/autocomplete
 */

/**
 * @typedef {object} CountryOption
 * @property {string} label - The display name of the country.
 * @property {string} value - The country code (e.g., 'US').
 * @property {string} key - A unique key for the option, often same as value.
 */

/**
 * Generates a default list of country options.
 * In a real application, this might be fetched or be more extensive.
 * @returns {CountryOption[]}
 */
const getDefaultCountryOptions = () => {
    // MODIFICATION: Use centralized script lines
    return Object.entries(scriptLines.addressForm.staticCountries).map(([code, name]) => ({
        label: name,
        value: code,
        key: code,
    }));
};

/**
 * AddressForm Component
 * ... (docstring remains the same) ...
 */
const AddressForm = memo(({
    addressData,
    onFieldChange,
    validationErrors = {},
    countryOptions,
    disabled = false,
}) => {
    const memoizedCountryOptions = useMemo(() => {
        return countryOptions || getDefaultCountryOptions();
    }, [countryOptions]);

    const handleInputChange = (fieldName) => (event) => {
        onFieldChange(fieldName, event.target.value);
    };

    const handleDropdownChange = (fieldName) => (selectedValue) => {
        onFieldChange(fieldName, selectedValue);
    };

    const currentAddress = addressData || { street: '', city: '', postalCode: '', country: '' };

    return (
        <div className="flex flex-col gap-y-12">
            <InputField
                label={scriptLines.addressForm.label.streetAddress}
                name="street"
                value={currentAddress.street || ''}
                onChange={handleInputChange('street')}
                error={validationErrors?.street}
                disabled={disabled}
                autoComplete="street-address"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                <InputField
                    label={scriptLines.addressForm.label.city}
                    name="city"
                    value={currentAddress.city || ''}
                    onChange={handleInputChange('city')}
                    error={validationErrors?.city}
                    disabled={disabled}
                    autoComplete="address-level2"
                />
                <InputField
                    label={scriptLines.addressForm.label.postalCode}
                    name="postalCode"
                    value={currentAddress.postalCode || ''}
                    onChange={handleInputChange('postalCode')}
                    error={validationErrors?.postalCode}
                    disabled={disabled}
                    autoComplete="postal-code"
                />
            </div>
            <Dropdown
                label={scriptLines.addressForm.label.country}
                name="country"
                options={memoizedCountryOptions}
                value={currentAddress.country || null}
                onChange={handleDropdownChange('country')}
                error={validationErrors?.country}
                disabled={disabled}
                autoComplete="country-name"
                placeholder={scriptLines.addressForm.placeholder.selectCountry}
            />
        </div>
    );
});

AddressForm.displayName = 'AddressForm';

AddressForm.propTypes = {
    addressData: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        postalCode: PropTypes.string,
        country: PropTypes.string,
        formattedAddress: PropTypes.string,
    }),
    onFieldChange: PropTypes.func.isRequired,
    validationErrors: PropTypes.object,
    countryOptions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
    })),
    disabled: PropTypes.bool,
};

export default AddressForm;