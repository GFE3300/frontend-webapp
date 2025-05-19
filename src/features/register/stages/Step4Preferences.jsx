import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, InputField, Checkbox, TagInput } from '../subcomponents';
import {scriptLines_Steps as scriptLines} from '../utils/script_lines'; 

/**
 * Preferences step (Step 4) for the registration form.
 * Allows users to configure settings like timezone, notifications, currency,
 * language, referral information, and agree to terms.
 * @component
 * @param {Object} props - Component properties.
 * @param {Object} props.formData - The current state of the form data for this step.
 *        Expected to contain fields like `timezone`, `preferredChannel`, `currency`,
 *        `dailySummaryTime`, `language`, `referralSources`, and `acceptTerms`.
 * @param {Function} props.updateField - Callback function to update a specific field in the formData.
 *        This function should be stable (e.g., memoized by its parent hook) to prevent unnecessary re-renders.
 * @param {Object} [props.errors] - An object containing validation errors for fields in this step.
 *        Keys should correspond to field names (e.g., `errors.timezone`).
 */
const Step4Preferences = ({ formData, updateField, errors }) => {

	// ===========================================================================
	// Configuration (Sourced from scriptLines for i18n)
	// ===========================================================================
	// Dropdown options are now fetched from the localized scriptLines.
	// This allows the labels within these options to be translated.
	const TIMEZONE_OPTIONS = scriptLines.step4Preferences.options.timezones;
	const NOTIFICATION_OPTIONS = scriptLines.step4Preferences.options.notificationMethods;
	const CURRENCY_OPTIONS = scriptLines.step4Preferences.options.currencies;
	const LANGUAGE_OPTIONS = scriptLines.step4Preferences.options.languages;

	// ===========================================================================
	// Handlers (Memoized for performance)
	// ===========================================================================

	/**
	 * Memoized handler for Dropdown component changes.
	 * @param {string} field - The name of the form field to update.
	 * @returns {Function} A handler that accepts the selected value and calls `updateField`.
	 */
	const handleDropdownChange = useCallback((field) => (value) => {
		updateField(field, value);
	}, [updateField]);

	/**
	 * Memoized event handler for standard HTML input element changes (e.g., for InputField).
	 * @param {string} field - The name of the form field to update.
	 * @returns {Function} An event handler that extracts the value and calls `updateField`.
	 */
	const handleInputChange = useCallback((field) => (e) => {
		updateField(field, e.target.value);
	}, [updateField]);

	/**
	 * Memoized handler for Checkbox component changes, specifically for 'acceptTerms'.
	 * @param {boolean} isChecked - The new checked state of the checkbox.
	 */
	const handleCheckboxChange = useCallback((isChecked) => {
		updateField('acceptTerms', isChecked);
	}, [updateField]);

	/**
	 * Memoized handler for TagInput component changes, specifically for 'referralSources'.
	 * @param {string[]} tags - The new array of tags.
	 */
	const handleReferralTagsChange = useCallback((tags) => {
		updateField('referralSources', tags);
	}, [updateField]);

	// ===========================================================================
	// Rendering Logic
	// ===========================================================================

	// For React, to render HTML, we'd use dangerouslySetInnerHTML or map over parts.
	// A safer approach for i18n with embedded links is to use a library like react-i18next with Trans component,
	// or split the string and render components. For simplicity with current setup:
	const renderTermsLabel = () => {
		const parts = scriptLines.step4Preferences.label.acceptTerms.split(/(\{termsLink\}|\{privacyLink\})/g);
		return parts.map((part, index) => {
			if (part === '{termsLink}') {
				return (
					<a key={`terms-${index}`} href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 underline transition-colors">
						{scriptLines.step4Preferences.linkText.termsOfService}
					</a>
				);
			}
			if (part === '{privacyLink}') {
				return (
					<a key={`privacy-${index}`} href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 underline transition-colors">
						{scriptLines.step4Preferences.linkText.privacyPolicy}
					</a>
				);
			}
			return part;
		});
	};

	// ===========================================================================
	// Validation (Prop Validation - Critical for component operation)
	// ===========================================================================
	// Ensure essential props are provided and are of the correct type.
	// This prevents runtime errors and ensures the component has what it needs.
	if (typeof formData !== 'object' || formData === null) {
		console.error(scriptLines.step4Preferences.console.invalidFormDataProp);
		// Fallback UI: Display a user-friendly error message if critical data is missing.
		return <p className="text-red-500 p-4 text-center">{scriptLines.step4Preferences.errors.formDataMissing}</p>;
	}
	if (typeof updateField !== 'function') {
		console.error(scriptLines.step4Preferences.console.invalidUpdateFieldProp);
		// Fallback UI: Indicates a configuration or setup issue.
		return <p className="text-red-500 p-4 text-center">{scriptLines.step4Preferences.errors.updateMechanismMissing}</p>;
	}
	// Optional prop check: `errors` can be undefined, but if provided, it should be an object.
	if (errors !== undefined && (typeof errors !== 'object' || errors === null)) {
		console.warn(scriptLines.step4Preferences.console.invalidErrorsProp);
		// The component can still render, but error display might be compromised.
	}

	return (
		<div className="space-y-12" data-testid="step4-preferences"> {/* Corrected data-testid */}
			{/* Timezone Dropdown */}
			<Dropdown
				label={scriptLines.step4Preferences.label.timezone}
				name="timezone"
				options={TIMEZONE_OPTIONS} // Localized options
				value={formData.timezone || ''}
				onChange={handleDropdownChange('timezone')}
				error={errors?.timezone}
				placeholder={scriptLines.step4Preferences.placeholder.selectTimezone}
				required
			/>

			{/* Notification and Currency Row */}
			<div className='relative w-full flex md:flex-row flex-col items-start gap-x-8 gap-y-12'>
				<Dropdown
					className='w-full'
					label={scriptLines.step4Preferences.label.preferredNotificationMethod}
					name="preferredChannel"
					options={NOTIFICATION_OPTIONS} // Localized options
					value={formData.preferredChannel || ''}
					onChange={handleDropdownChange('preferredChannel')}
					error={errors?.preferredChannel}
					placeholder={scriptLines.step4Preferences.placeholder.selectNotificationChannel}
				/>
				<Dropdown
					className='w-full'
					label={scriptLines.step4Preferences.label.primaryCurrency}
					name="currency"
					options={CURRENCY_OPTIONS} // Localized options
					value={formData.currency || ''}
					onChange={handleDropdownChange('currency')}
					error={errors?.currency}
					placeholder={scriptLines.step4Preferences.placeholder.selectCurrency}
					required
				/>
			</div>

			{/* Daily Summary Time Input */}
			<InputField
				label={scriptLines.step4Preferences.label.preferredDailySummaryTimeOptional}
				name="dailySummaryTime"
				type="time"
				value={formData.dailySummaryTime || ''}
				onChange={handleInputChange('dailySummaryTime')}
				error={errors?.dailySummaryTime}
				helptext={scriptLines.step4Preferences.helptext.dailySummaryTime}
			/>

			{/* Language Dropdown */}
			<Dropdown
				label={scriptLines.step4Preferences.label.preferredLanguage}
				name="language"
				options={LANGUAGE_OPTIONS} // Localized options
				value={formData.language || ''}
				onChange={handleDropdownChange('language')}
				error={errors?.language}
				placeholder={scriptLines.step4Preferences.placeholder.selectTimezone} // Re-use or create specific
				required
			/>

			{/* Referral Sources TagInput */}
			<TagInput
				label={scriptLines.step4Preferences.label.referralSourcesOptional}
				name="referralSources"
				value={formData.referralSources || []}
				onTagsChange={handleReferralTagsChange}
				placeholder={scriptLines.step4Preferences.placeholder.referralSources}
				error={errors?.referralSources}
				maxTags={3}
				helptext={scriptLines.step4Preferences.helptext.referralSources}
			/>

			{/* Terms and Conditions Checkbox */}
			<Checkbox
				label={renderTermsLabel()} // Use the function to render label with links
				name="acceptTerms"
				checked={!!formData.acceptTerms}
				onChange={handleCheckboxChange}
				error={errors?.acceptTerms}
				required
				data-testid="accept-terms-checkbox"
			/>
		</div>
	);
};

// Define prop types for type safety and improved documentation.
Step4Preferences.propTypes = {
	/** The current state of the form data for this step. */
	formData: PropTypes.shape({
		timezone: PropTypes.string,
		preferredChannel: PropTypes.string,
		currency: PropTypes.string,
		dailySummaryTime: PropTypes.string,
		language: PropTypes.string,
		referralSources: PropTypes.arrayOf(PropTypes.string),
		acceptTerms: PropTypes.bool,
	}).isRequired,
	/** Callback function to update a specific field in the formData. */
	updateField: PropTypes.func.isRequired,
	/** An object containing validation errors for fields in this step. */
	errors: PropTypes.object,
};

// Specify default props for optional props.
Step4Preferences.defaultProps = {
	errors: null, // Errors object is optional and defaults to null.
};

// Export the component, memoized for performance optimization.
// memo prevents re-renders if props haven't changed.
export default memo(Step4Preferences);