import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { InputField, Dropdown } from '../subcomponents'; // Assuming InputField and Dropdown are in this path
// import { scriptLines_AddressForm } from '../utils/script_lines'; // Assuming you have localized strings

// Placeholder for localized strings. Replace with your actual localization setup.
const scriptLines_AddressForm = {
    addressForm: {
        label: {
            streetAddress: "Street Address",
            city: "City",
            postalCode: "Postal Code",
            country: "Country",
        },
        staticCountries: {
            US: "United States",
            CA: "Canada",
            GB: "United Kingdom",
            AU: "Australia",
            ES: "Spain",
            FR: "France",
            DE: "Germany",
            IT: "Italy",
            PT: "Portugal",
            BR: "Brazil",
            MX: "Mexico",
            IN: "India",
            JP: "Japan",
            CN: "China",
            RU: "Russia",
            ZA: "South Africa",
            VE: "Venezuela",
        }
    }
};

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
    return Object.entries(scriptLines_AddressForm.addressForm.staticCountries).map(([code, name]) => ({
        label: name,
        value: code,
        key: code,
    }));
};

/**
 * AddressForm Component
 *
 * A fully controlled component for displaying and editing address fields.
 * It receives address data and validation errors as props and emits changes
 * for individual fields upwards via the `onFieldChange` callback.
 *
 * This component does not manage its own internal state for address values.
 *
 * @component
 * @param {object} props
 * @param {AddressData | null} props.addressData - The current address data to display.
 * @param {(fieldName: keyof AddressData, value: string) => void} props.onFieldChange - Callback when an address field changes.
 * @param {object} [props.validationErrors] - Validation errors for address fields (e.g., { street: "Street is required" }).
 * @param {CountryOption[]} [props.countryOptions] - Options for the country dropdown. Defaults to a static list.
 * @param {boolean} [props.disabled] - If true, all fields are disabled.
 */
const AddressForm = memo(({
    addressData,
    onFieldChange,
    validationErrors = {},
    countryOptions,
    disabled = false,
}) => {
    // Memoize country options to prevent re-computation if props.countryOptions is not provided
    // or if the provided array reference is stable.
    const memoizedCountryOptions = useMemo(() => {
        return countryOptions || getDefaultCountryOptions();
    }, [countryOptions]);

    const handleInputChange = (fieldName) => (event) => {
        onFieldChange(fieldName, event.target.value);
    };

    const handleDropdownChange = (fieldName) => (selectedValue) => {
        onFieldChange(fieldName, selectedValue);
    };

    // Ensure addressData is not null for safe access, provide empty strings as fallbacks.
    const currentAddress = addressData || { street: '', city: '', postalCode: '', country: '' };

    return (
        <div className="flex flex-col gap-y-12"> {/* Adjusted gap for consistency */}
            <InputField
                label={scriptLines_AddressForm.addressForm.label.streetAddress}
                name="street"
                value={currentAddress.street || ''}
                onChange={handleInputChange('street')}
                error={validationErrors?.street}
                disabled={disabled}
                autoComplete="street-address"
            // required // Visual indicator can be handled by label or InputField itself
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12"> {/* Responsive layout for city/postal */}
                <InputField
                    label={scriptLines_AddressForm.addressForm.label.city}
                    name="city"
                    value={currentAddress.city || ''}
                    onChange={handleInputChange('city')}
                    error={validationErrors?.city}
                    disabled={disabled}
                    autoComplete="address-level2" // More specific autocomplete hint for city
                />
                <InputField
                    label={scriptLines_AddressForm.addressForm.label.postalCode}
                    name="postalCode"
                    value={currentAddress.postalCode || ''}
                    onChange={handleInputChange('postalCode')}
                    error={validationErrors?.postalCode}
                    disabled={disabled}
                    autoComplete="postal-code"
                />
            </div>
            <Dropdown
                label={scriptLines_AddressForm.addressForm.label.country}
                name="country"
                options={memoizedCountryOptions}
                value={currentAddress.country || null}
                onChange={handleDropdownChange('country')}
                error={validationErrors?.country}
                disabled={disabled}
                autoComplete="country-name" // Hint for browser autocomplete
                placeholder="Select a country" // Optional: if your Dropdown supports it
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
        country: PropTypes.string, // Should be a country code
        formattedAddress: PropTypes.string, // Optional
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