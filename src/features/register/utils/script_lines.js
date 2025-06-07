/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-07 11:26:40 UTC
 */

import i18n from '../../../i18n';

import { t } from '../../../i18n';

export const scriptLines_useFormState = {
    // Console Log Messages
    log: {
        failedToParseSessionStorage: i18n.t('register.useFormState.log.failedToParseSessionStorage'),  // "useFormState: Failed to parse state from session storage:"
        failedToSaveSessionStorage: i18n.t('register.useFormState.log.failedToSaveSessionStorage'), // "useFormState: Failed to save state to session storage:"
    },

    // Validation Messages - Step 0: Business Information
    validation: {
        businessNameRequired: i18n.t('register.useFormState.validation.businessNameRequired'), // "Business name is required."
        emailInvalid: i18n.t('register.useFormState.validation.emailInvalid'), // Reusable for other email fields // "Invalid email format."
        businessEmailRequired: i18n.t('register.useFormState.validation.businessEmailRequired'), // "Business email is required."
        businessUsernameInvalidFormat: i18n.t('register.useFormState.validation.businessUsernameInvalidFormat'), // "Username can only contain letters, numbers, and underscores."
        businessUsernameRequired: i18n.t('register.useFormState.validation.businessUsernameRequired'), // "Username is required."
        businessPhoneRequired: i18n.t('register.useFormState.validation.businessPhoneRequired'), // "Business phone number is required."
        businessTagsMin: i18n.t('register.useFormState.validation.businessTagsMin'), // "Please select at least one business tag."
        businessWebsiteInvalidUrl: i18n.t('register.useFormState.validation.businessWebsiteInvalidUrl'), // As per original, unusual message // "Please enter a valid URL (e.g., https://example.com).nullable()"

        // Validation Messages - Step 1: Business Location
        locationRequiredOnMap: i18n.t('register.useFormState.validation.locationRequiredOnMap'), // Used for both .required and .typeError // "Location is required. Please select on map."
        addressStreetRequired: i18n.t('register.useFormState.validation.addressStreetRequired'), // "Street address is required."
        addressCityRequired: i18n.t('register.useFormState.validation.addressCityRequired'), // "City is required."
        addressPostalCodeRequired: i18n.t('register.useFormState.validation.addressPostalCodeRequired'), // "Postal code is required."
        addressCountryRequired: i18n.t('register.useFormState.validation.addressCountryRequired'), // "Country is required."
        addressDetailsRequired: i18n.t('register.useFormState.validation.addressDetailsRequired'), // Used for both .required and .typeError // "Address details are required."

        // Validation Messages - Step 2: Business Logo (Strings for commented-out validations)
        logoFileSizeTooLarge: i18n.t('register.useFormState.validation.logoFileSizeTooLarge'), // "Logo file is too large (max 5MB)."
        logoFileTypeUnsupported: i18n.t('register.useFormState.validation.logoFileTypeUnsupported'), // "Unsupported logo format (PNG, JPG, GIF, WEBP)."

        // Validation Messages - Step 3: Your Profile
        profileNameRequired: i18n.t('register.useFormState.validation.profileNameRequired'), // "Your full name is required."
        // validation.emailInvalid is reused here
        profileEmailRequired: i18n.t('register.useFormState.validation.profileEmailRequired'), // "Your contact email is required."
        profilePhoneRequired: i18n.t('register.useFormState.validation.profilePhoneRequired'), // "Your contact phone number is required."
        passwordMinLength: i18n.t('register.useFormState.validation.passwordMinLength'), // "Password must be at least 8 characters."
        passwordRequiresUppercase: i18n.t('register.useFormState.validation.passwordRequiresUppercase'), // "Password must contain an uppercase letter."
        passwordRequiresLowercase: i18n.t('register.useFormState.validation.passwordRequiresLowercase'), // "Password must contain a lowercase letter."
        passwordRequiresNumber: i18n.t('register.useFormState.validation.passwordRequiresNumber'), // "Password must contain a number."
        passwordRequiresSpecialChar: i18n.t('register.useFormState.validation.passwordRequiresSpecialChar'), // "Password must contain a special character."
        passwordRequired: i18n.t('register.useFormState.validation.passwordRequired'), // "Password is required."
        confirmPasswordMatch: i18n.t('register.useFormState.validation.confirmPasswordMatch'), // "Passwords must match."
        confirmPasswordRequired: i18n.t('register.useFormState.validation.confirmPasswordRequired'), // "Please confirm your password."

        // Validation Messages - Step 4: Preferences
        timezoneRequired: i18n.t('register.useFormState.validation.timezoneRequired'), // "Timezone selection is required."
        currencyRequired: i18n.t('register.useFormState.validation.currencyRequired'), // "Currency selection is required."
        languageRequired: i18n.t('register.useFormState.validation.languageRequired'), // "Language selection is required."
        acceptTermsRequired: i18n.t('register.useFormState.validation.acceptTermsRequired'), // "You must accept the Terms of Service and Privacy Policy."

        // Validation Messages - Step 5: Profile Image (Strings for commented-out validations)
        profileImageFileSizeTooLarge: i18n.t('register.useFormState.validation.profileImageFileSizeTooLarge'), // "Profile image is too large (max 5MB)."
        profileImageFileTypeUnsupported: i18n.t('register.useFormState.validation.profileImageFileTypeUnsupported'), // "Unsupported image format."
    },

    // General Error Messages for Steps
    error: {
        form: {
            correctErrorsInStep: i18n.t('register.useFormState.error.form.correctErrorsInStep'), // Placeholder for step number // "Please correct the errors in step {stepNumber}."
            correctErrorsInStepTitleCase: i18n.t('register.useFormState.error.form.correctErrorsInStepTitleCase'), // Placeholder, different casing // "Please correct errors in Step {stepNumber}."
        }
    },

    // Password Strength Indicator Values
    // These are values returned by the hook. If displayed, they are now localized.
    // If they are keys for further lookup in a full i18n system, this structure would change.
    passwordStrength: {
        weak: i18n.t('register.useFormState.passwordStrength.weak'), // "weak"
        fair: i18n.t('register.useFormState.passwordStrength.fair'), // "fair"
        strong: i18n.t('register.useFormState.passwordStrength.strong'), // "strong"
    },
};

export const scriptLines_AddressForm = {

    // NEW: AddressForm Component Strings
    addressForm: {
        label: {
            streetAddress: i18n.t('register.addressForm.addressForm.label.streetAddress'), // "Street Address"
            city: i18n.t('register.addressForm.addressForm.label.city'), // "City"
            postalCode: i18n.t('register.addressForm.addressForm.label.postalCode'), // "Postal Code"
            country: i18n.t('register.addressForm.addressForm.label.country'), // "Country"
        },
        error: {
            placesImportFailed: i18n.t('register.addressForm.addressForm.error.placesImportFailed'), // Console error // "Places import failed"
            countryAutocompleteError: i18n.t('register.addressForm.addressForm.error.countryAutocompleteError'), // Console error // "Country autocomplete error"
        },
        // Localized names for the static fallback country list
        staticCountries: {
            US: i18n.t('register.addressForm.addressForm.staticCountries.US'), // "United States"
            ES: i18n.t('register.addressForm.addressForm.staticCountries.ES'), // "Spain"
            FR: i18n.t('register.addressForm.addressForm.staticCountries.FR'), // "France"
            DE: i18n.t('register.addressForm.addressForm.staticCountries.DE'), // "Germany"
            IT: i18n.t('register.addressForm.addressForm.staticCountries.IT'), // "Italy"
            GB: i18n.t('register.addressForm.addressForm.staticCountries.GB'), // "United Kingdom"
            CA: i18n.t('register.addressForm.addressForm.staticCountries.CA'), // "Canada"
            PT: i18n.t('register.addressForm.addressForm.staticCountries.PT'), // "Portugal"
            AU: i18n.t('register.addressForm.addressForm.staticCountries.AU'), // "Australia"
            BR: i18n.t('register.addressForm.addressForm.staticCountries.BR'), // "Brazil"
            JP: i18n.t('register.addressForm.addressForm.staticCountries.JP'), // "Japan"
            IN: i18n.t('register.addressForm.addressForm.staticCountries.IN'), // "India"
            MX: i18n.t('register.addressForm.addressForm.staticCountries.MX'), // "Mexico"
            CN: i18n.t('register.addressForm.addressForm.staticCountries.CN'), // "China"
            RU: i18n.t('register.addressForm.addressForm.staticCountries.RU'), // "Russia"
            ZA: i18n.t('register.addressForm.addressForm.staticCountries.ZA'), // "South Africa"
        }
    },
};

export const scriptLines_Header = {
    // Console Log Messages (from previous task)
    log: {
        failedToParseSessionStorage: i18n.t('register.useFormState.log.failedToParseSessionStorage'), // "useFormState: Failed to parse state from session storage:"
        failedToSaveSessionStorage: i18n.t('register.useFormState.log.failedToSaveSessionStorage'), // "useFormState: Failed to save state to session storage:"
    },

    // Validation Messages (from previous task)
    validation: {
        // ... existing validation messages from useFormState ...
        businessNameRequired: i18n.t('register.useFormState.validation.businessNameRequired'), // "Business name is required."
        emailInvalid: i18n.t('register.useFormState.validation.emailInvalid'), // "Invalid email format."
        businessEmailRequired: i18n.t('register.useFormState.validation.businessEmailRequired'), // "Business email is required."
        businessUsernameInvalidFormat: i18n.t('register.useFormState.validation.businessUsernameInvalidFormat'), // "Username can only contain letters, numbers, and underscores."
        businessUsernameRequired: i18n.t('register.useFormState.validation.businessUsernameRequired'), // "Username is required."
        businessPhoneRequired: i18n.t('register.useFormState.validation.businessPhoneRequired'), // "Business phone number is required."
        businessTagsMin: i18n.t('register.useFormState.validation.businessTagsMin'), // "Please select at least one business tag."
        businessWebsiteInvalidUrl: i18n.t('register.useFormState.validation.businessWebsiteInvalidUrl'), // "Please enter a valid URL (e.g., https://example.com).nullable()"
        locationRequiredOnMap: i18n.t('register.useFormState.validation.locationRequiredOnMap'), // "Location is required. Please select on map."
        addressStreetRequired: i18n.t('register.useFormState.validation.addressStreetRequired'), // "Street address is required."
        addressCityRequired: i18n.t('register.useFormState.validation.addressCityRequired'), // "City is required."
        addressPostalCodeRequired: i18n.t('register.useFormState.validation.addressPostalCodeRequired'), // "Postal code is required."
        addressCountryRequired: i18n.t('register.useFormState.validation.addressCountryRequired'), // "Country is required."
        addressDetailsRequired: i18n.t('register.useFormState.validation.addressDetailsRequired'), // "Address details are required."
        logoFileSizeTooLarge: i18n.t('register.useFormState.validation.logoFileSizeTooLarge'), // "Logo file is too large (max 5MB)."
        logoFileTypeUnsupported: i18n.t('register.useFormState.validation.logoFileTypeUnsupported'), // "Unsupported logo format (PNG, JPG, GIF, WEBP)."
        profileNameRequired: i18n.t('register.useFormState.validation.profileNameRequired'), // "Your full name is required."
        profileEmailRequired: i18n.t('register.useFormState.validation.profileEmailRequired'), // "Your contact email is required."
        profilePhoneRequired: i18n.t('register.useFormState.validation.profilePhoneRequired'), // "Your contact phone number is required."
        passwordMinLength: i18n.t('register.useFormState.validation.passwordMinLength'), // "Password must be at least 8 characters."
        passwordRequiresUppercase: i18n.t('register.useFormState.validation.passwordRequiresUppercase'), // "Password must contain an uppercase letter."
        passwordRequiresLowercase: i18n.t('register.useFormState.validation.passwordRequiresLowercase'), // "Password must contain a lowercase letter."
        passwordRequiresNumber: i18n.t('register.useFormState.validation.passwordRequiresNumber'), // "Password must contain a number."
        passwordRequiresSpecialChar: i18n.t('register.useFormState.validation.passwordRequiresSpecialChar'), // "Password must contain a special character."
        passwordRequired: i18n.t('register.useFormState.validation.passwordRequired'), // "Password is required."
        confirmPasswordMatch: i18n.t('register.useFormState.validation.confirmPasswordMatch'), // "Passwords must match."
        confirmPasswordRequired: i18n.t('register.useFormState.validation.confirmPasswordRequired'), // "Please confirm your password."
        timezoneRequired: i18n.t('register.useFormState.validation.timezoneRequired'), // "Timezone selection is required."
        currencyRequired: i18n.t('register.useFormState.validation.currencyRequired'), // "Currency selection is required."
        languageRequired: i18n.t('register.useFormState.validation.languageRequired'), // "Language selection is required."
        acceptTermsRequired: i18n.t('register.useFormState.validation.acceptTermsRequired'), // "You must accept the Terms of Service and Privacy Policy."
        profileImageFileSizeTooLarge: i18n.t('register.useFormState.validation.profileImageFileSizeTooLarge'), // "Profile image is too large (max 5MB)."
        profileImageFileTypeUnsupported: i18n.t('register.useFormState.validation.profileImageFileTypeUnsupported'), // "Unsupported image format."
    },

    // General Error Messages for Steps (from previous task)
    error: {
        form: {
            correctErrorsInStep: i18n.t('register.useFormState.error.form.correctErrorsInStep'), // "Please correct the errors in step {stepNumber}."
            correctErrorsInStepTitleCase: i18n.t('register.useFormState.error.form.correctErrorsInStepTitleCase'), // "Please correct errors in Step {stepNumber}."
        }
    },

    // Password Strength Indicator Values (from previous task)
    passwordStrength: {
        weak: i18n.t('register.useFormState.passwordStrength.weak'), // "weak"
        fair: i18n.t('register.useFormState.passwordStrength.fair'), // "fair"
        strong: i18n.t('register.useFormState.passwordStrength.strong'), // "strong"
    },

    // AddressForm Component Strings (from previous task)
    addressForm: {
        label: {
            streetAddress: i18n.t('register.addressForm.addressForm.label.streetAddress'), // "Street Address"
            city: i18n.t('register.addressForm.addressForm.label.city'), // "City"
            postalCode: i18n.t('register.addressForm.addressForm.label.postalCode'), // "Postal Code"
            country: i18n.t('register.addressForm.addressForm.label.country'), // "Country"
        },
        error: {
            placesImportFailed: i18n.t('register.addressForm.addressForm.error.placesImportFailed'), // "Places import failed"
            countryAutocompleteError: i18n.t('register.addressForm.addressForm.error.countryAutocompleteError'), // "Country autocomplete error"
        },
        staticCountries: {
            US: i18n.t('register.addressForm.addressForm.staticCountries.US'), // "United States"
            ES: i18n.t('register.addressForm.addressForm.staticCountries.ES'), // "Spain"
            FR: i18n.t('register.addressForm.addressForm.staticCountries.FR'), // "France"
            DE: i18n.t('register.addressForm.addressForm.staticCountries.DE'), // "Germany"
            IT: i18n.t('register.addressForm.addressForm.staticCountries.IT'), // "Italy"
            GB: i18n.t('register.addressForm.addressForm.staticCountries.GB'), // "United Kingdom"
            CA: i18n.t('register.addressForm.addressForm.staticCountries.CA'), // "Canada"
            PT: i18n.t('register.addressForm.addressForm.staticCountries.PT'), // "Portugal"
            AU: i18n.t('register.addressForm.addressForm.staticCountries.AU'), // "Australia"
            BR: i18n.t('register.addressForm.addressForm.staticCountries.BR'), // "Brazil"
            JP: i18n.t('register.addressForm.addressForm.staticCountries.JP'), // "Japan"
            IN: i18n.t('register.addressForm.addressForm.staticCountries.IN'), // "India"
            MX: i18n.t('register.addressForm.addressForm.staticCountries.MX'), // "Mexico"
            CN: i18n.t('register.addressForm.addressForm.staticCountries.CN'), // "China"
            RU: i18n.t('register.addressForm.addressForm.staticCountries.RU'), // "Russia"
            ZA: i18n.t('register.addressForm.addressForm.staticCountries.ZA'), // "South Africa"
        }
    },

    autocompleteInput: {
        label: {
            autoComplete: i18n.t('register.header.autocompleteInput.label.autoComplete'), // Label for the input field // "Auto Complete"
        },
        placeholder: {
            quickerSearch: i18n.t('register.header.autocompleteInput.placeholder.quickerSearch'), // Placeholder text for the input // "Here it is quicker..."
        },
        status: {
            findingLocations: i18n.t('register.header.autocompleteInput.status.findingLocations'), // Loading message // "Finding fresh locations..."
            noResults: i18n.t('register.header.autocompleteInput.status.noResults'),          // Message when no suggestions are found // "No fresh bakes found..."
        },
        error: {
            placesLibraryLoadFailed: i18n.t('register.header.autocompleteInput.error.placesLibraryLoadFailed'), // Console error // "Places library load failed"
            autocompleteError: i18n.t('register.header.autocompleteInput.error.autocompleteError'),                // Console error // "Autocomplete error"
            noMatchingAddresses: i18n.t('register.header.autocompleteInput.error.noMatchingAddresses'), // Error message displayed to user // "Could not find matching addresses"
        }
    },

    // NEW: GeolocationButton Component Strings
    geolocationButton: {
        label: {
            useMyLocation: i18n.t('register.header.geolocationButton.label.useMyLocation'), // Default button label and tooltip text // "Use my location"
        },
        aria: {
            locating: i18n.t('register.header.geolocationButton.aria.locating'), // ARIA label when loading // "Locating..."
        },
        error: {
            notSupported: i18n.t('register.header.geolocationButton.error.notSupported'), // "Geolocation is not supported by your browser"
            permissionDenied: i18n.t('register.header.geolocationButton.error.permissionDenied'), // "Enable location access in your browser"
            unableToDetermine: i18n.t('register.header.geolocationButton.error.unableToDetermine'), // "Unable to determine your location"
        }
    },
};

export const scriptLines_Steps = {

    step0BusinessInfo: {
        errors: {
            formDataMissing: i18n.t('register.steps.step0BusinessInfo.errors.formDataMissing'), // "Error: Form data is missing for this step."
            updateFieldMissing: i18n.t('register.steps.step0BusinessInfo.errors.updateFieldMissing'), // "Error: Form update mechanism is missing."
        },
        console: {
            invalidFormDataProp: i18n.t('register.steps.step0BusinessInfo.console.invalidFormDataProp'), // "Step0BusinessInfo: Invalid `formData` prop. Expected an object."
            invalidUpdateFieldProp: i18n.t('register.steps.step0BusinessInfo.console.invalidUpdateFieldProp'), // "Step0BusinessInfo: Invalid `updateField` prop. Expected a function."
            invalidErrorsProp: i18n.t('register.steps.step0BusinessInfo.console.invalidErrorsProp'), // "Step0BusinessInfo: Invalid `errors` prop. Expected an object or undefined."
        },
        label: {
            businessName: i18n.t('register.steps.step0BusinessInfo.label.businessName'), // "Business Name"
            businessUsername: i18n.t('register.steps.step0BusinessInfo.label.businessUsername'), // "Business Username"
            businessEmail: i18n.t('register.steps.step0BusinessInfo.label.businessEmail'), // "Business Email"
            businessPhone: i18n.t('register.steps.step0BusinessInfo.label.businessPhone'), // "Business Phone"
            businessWebsiteOptional: i18n.t('register.steps.step0BusinessInfo.label.businessWebsiteOptional'), // "Business Website (Optional)"
            businessTags: i18n.t('register.steps.step0BusinessInfo.label.businessTags'), // "Business Tags (Describe your business)"
            referralCodeOptional: i18n.t('register.steps.step0BusinessInfo.label.referralCodeOptional'), // "Referral Code (Optional)"
        },
        placeholder: {
            businessName: i18n.t('register.steps.step0BusinessInfo.placeholder.businessName'), // "e.g. The Artisan Corner"
            businessUsername: i18n.t('register.steps.step0BusinessInfo.placeholder.businessUsername'), // "e.g. @artisancorner"
            businessEmail: i18n.t('register.steps.step0BusinessInfo.placeholder.businessEmail'), // "e.g. contact@artisancorner.com"
            businessPhone: i18n.t('register.steps.step0BusinessInfo.placeholder.businessPhone'), // "e.g. +1 (555) 123-4567"
            businessWebsite: i18n.t('register.steps.step0BusinessInfo.placeholder.businessWebsite'), // "e.g. https://artisancorner.com"
            businessTags: i18n.t('register.steps.step0BusinessInfo.placeholder.businessTags'), // "Type and press Enter (e.g., Cafe, Handmade)"
            referralCode: i18n.t('register.steps.step0BusinessInfo.placeholder.referralCode'), // "Enter code if you have one"
        },
        helptext: {
            businessTags: i18n.t('register.steps.step0BusinessInfo.helptext.businessTags'), // "Select up to 7 tags that best describe your business."
        },
        /**
         * @constant {string[]} defaultBusinessTags
         * A predefined list of suggested tags to help users categorize their business.
         * These are provided as an array for direct use. For more granular translation or
         * if tags need to be contextually different, each tag could be its own key.
         */
        defaultBusinessTags: [
            // General Types
            i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.0'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.1'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.2'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.3'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.4'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.5'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.6'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.7'), // "Catering" // "Grocery" // "Bar" // "Bakery" // "Service" // "Retail" // "Cafe" // "Restaurant"
            // Food Specific
            i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.8'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.9'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.10'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.11'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.12'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.13'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.14'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.15'), // "Pizzeria" // "Food Truck" // "Juice Bar" // "Coffee Shop" // "Local Sourcing" // "Organic" // "Gluten-Free" // "Vegan"
            // Attributes
            i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.16'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.17'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.18'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.19'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.20'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.21'), i18n.t('register.steps.step0BusinessInfo.defaultBusinessTags.22') // "Pet-Friendly" // "Budget-Friendly" // "Luxury" // "Sustainable" // "Appointment Only" // "Online Only" // "Family-Owned"
        ]
    },

    locationStage: {
        label: {
            mapLocation: i18n.t('register.steps.locationStage.label.mapLocation'), // Label for the map section // "Location"
        },
        // No other direct text strings were found in LocationStage.jsx.
        // AutocompleteInput, GeolocationButton, and AddressForm have their own localized strings.
    },

    step2BusinessLogo: {
        title: i18n.t('register.steps.step2BusinessLogo.title'), // "Upload Your Business Logo"
        description: i18n.t('register.steps.step2BusinessLogo.description'), // "Your logo is key to your brand identity. Please upload a clear image. We recommend a square logo or one that crops well into a square."
        errors: {
            formDataUnavailable: i18n.t('register.steps.step2BusinessLogo.errors.formDataUnavailable'), // "Error: Form data is unavailable for the business logo step."
            updateMechanismImproperlyConfigured: i18n.t('register.steps.step2BusinessLogo.errors.updateMechanismImproperlyConfigured'), // "Error: Form update mechanism is improperly configured."
        },
        console: {
            invalidFormDataProp: i18n.t('register.steps.step2BusinessLogo.console.invalidFormDataProp'), // "Step2BusinessLogo: Invalid `formData` prop. Expected an object."
            invalidUpdateFieldProp: i18n.t('register.steps.step2BusinessLogo.console.invalidUpdateFieldProp'), // "Step2BusinessLogo: Invalid `updateField` prop. Expected a function."
            invalidErrorsProp: i18n.t('register.steps.step2BusinessLogo.console.invalidErrorsProp'), // "Step2BusinessLogo: Invalid `errors` prop. Expected an object or undefined. Error display might be affected."
        },
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault') // "rose"
    },

    step3Profile: {
        label: {
            fullName: i18n.t('register.steps.step3Profile.label.fullName'), // "Your Full Name"
            lastName: i18n.t('register.steps.step3Profile.label.lastName'), // "Your Full Last Name"
            roleAtBusiness: i18n.t('register.steps.step3Profile.label.roleAtBusiness'), // "Your Role/Title at Business"
            contactEmail: i18n.t('register.steps.step3Profile.label.contactEmail'), // "Contact Email"
            contactPhone: i18n.t('register.steps.step3Profile.label.contactPhone'), // "Contact Phone Number"
            createPassword: i18n.t('register.steps.step3Profile.label.createPassword'), // "Create Password"
            confirmPassword: i18n.t('register.steps.step3Profile.label.confirmPassword'), // "Confirm Password"
        },
        placeholder: {
            firstName: i18n.t('register.steps.step3Profile.placeholder.firstName'), // Assuming "Your Full Name" is for first name // "e.g. Alex"
            lastName: i18n.t('register.steps.step3Profile.placeholder.lastName'), // "e.g. Johnson"
            role: i18n.t('register.steps.step3Profile.placeholder.role'), // "e.g. Owner, Manager, Chef"
            contactEmail: i18n.t('register.steps.step3Profile.placeholder.contactEmail'), // "e.g. alex.johnson@example.com"
            contactPhone: i18n.t('register.steps.step3Profile.placeholder.contactPhone'), // "(555) 123-4567"
            passwordMinChars: i18n.t('register.steps.step3Profile.placeholder.passwordMinChars'), // "Minimum 8 characters"
            confirmPassword: i18n.t('register.steps.step3Profile.placeholder.confirmPassword'), // "Re-enter your password"
        },
        aria: {
            hidePassword: i18n.t('register.steps.step3Profile.aria.hidePassword'), // "Hide password"
            showPassword: i18n.t('register.steps.step3Profile.aria.showPassword'), // "Show password"
        },
        errors: {
            formDataMissing: i18n.t('register.steps.step0BusinessInfo.errors.formDataMissing'), // "Error: Form data is missing for this step."
            updateMechanismMissing: i18n.t('register.steps.step0BusinessInfo.errors.updateFieldMissing'), // "Error: Form update mechanism is missing."
            passwordStrengthMissing: i18n.t('register.steps.step3Profile.errors.passwordStrengthMissing'), // "Error: Password strength information is missing."
            passwordVisibilityControlMissing: i18n.t('register.steps.step3Profile.errors.passwordVisibilityControlMissing'), // "Error: Password visibility control is missing."
        },
        console: {
            invalidFormDataProp: i18n.t('register.steps.step3Profile.console.invalidFormDataProp'), // Note: Original log used Step2Profile // "Step3Profile: Invalid `formData` prop. Expected an object."
            invalidUpdateFieldProp: i18n.t('register.steps.step3Profile.console.invalidUpdateFieldProp'), // "Step3Profile: Invalid `updateField` prop. Expected a function."
            invalidPasswordStrengthProp: i18n.t('register.steps.step3Profile.console.invalidPasswordStrengthProp'), // "Step3Profile: Invalid or missing `passwordStrength` prop. Expected a string."
            invalidPasswordVisibilityProps: i18n.t('register.steps.step3Profile.console.invalidPasswordVisibilityProps'), // "Step3Profile: Invalid or missing password visibility props (`showPassword`, `setShowPassword`)."
        },
        // Note: The password strength indicator ('weak', 'fair', 'strong') itself
        // is likely localized in the PasswordStrength subcomponent or useFormState.
        // If PasswordStrength subcomponent expects localized strings for these,
        // they would be passed as props.
    },

    step4Preferences: {
        label: {
            timezone: i18n.t('register.steps.step4Preferences.label.timezone'), // "Timezone"
            preferredNotificationMethod: i18n.t('register.steps.step4Preferences.label.preferredNotificationMethod'), // "Preferred Notification Method"
            primaryCurrency: i18n.t('register.steps.step4Preferences.label.primaryCurrency'), // "Primary Currency"
            preferredDailySummaryTimeOptional: i18n.t('register.steps.step4Preferences.label.preferredDailySummaryTimeOptional'), // "Preferred Daily Summary Time (Optional)"
            preferredLanguage: i18n.t('register.steps.step4Preferences.label.preferredLanguage'), // "Preferred Language"
            referralSourcesOptional: i18n.t('register.steps.step4Preferences.label.referralSourcesOptional'), // "How did you hear about us? (Optional)"
            acceptTerms: i18n.t('register.steps.step4Preferences.label.acceptTerms'), // Placeholders for links // "I acknowledge and agree to the {termsLink} and the {privacyLink}."
        },
        placeholder: {
            selectTimezone: i18n.t('register.steps.step4Preferences.placeholder.selectTimezone'), // "Select your timezone"
            selectNotificationChannel: i18n.t('register.steps.step4Preferences.placeholder.selectNotificationChannel'), // "Select notification channel"
            selectCurrency: i18n.t('register.steps.step4Preferences.placeholder.selectCurrency'), // "Select your currency"
            referralSources: i18n.t('register.steps.step4Preferences.placeholder.referralSources'), // "e.g., Friend, Social Media, Advertisement"
        },
        helptext: {
            dailySummaryTime: i18n.t('register.steps.step4Preferences.helptext.dailySummaryTime'), // "Set a time to receive daily summaries, if applicable."
            referralSources: i18n.t('register.steps.step4Preferences.helptext.referralSources'), // "Let us know how you found us!"
        },
        linkText: {
            termsOfService: i18n.t('register.steps.step4Preferences.linkText.termsOfService'), // "Terms of Service"
            privacyPolicy: i18n.t('register.steps.step4Preferences.linkText.privacyPolicy'), // "Privacy Policy"
        },
        options: {
            timezones: [ // These labels are user-facing and should be translated.
                { value: i18n.t('register.steps.step4Preferences.options.timezones.0.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.0.label') }, // "America/New York (EST/EDT)" // "America/New_York"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.1.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.1.label') }, // "America/Chicago (CST/CDT)" // "America/Chicago"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.2.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.2.label') }, // "America/Denver (MST/MDT)" // "America/Denver"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.3.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.3.label') }, // "America/Los Angeles (PST/PDT)" // "America/Los_Angeles"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.4.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.4.label') }, // "America/Sao Paulo (BRT/BRST)" // "America/Sao_Paulo"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.5.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.5.label') }, // "Europe/London (GMT/BST)" // "Europe/London"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.6.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.6.label') }, // "Europe/Paris (CET/CEST)" // "Europe/Paris"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.7.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.7.label') }, // "Europe/Berlin (CET/CEST)" // "Europe/Berlin"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.8.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.8.label') }, // "Europe/Moscow (MSK)" // "Europe/Moscow"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.9.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.9.label') }, // "Asia/Tokyo (JST)" // "Asia/Tokyo"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.10.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.10.label') }, // "Asia/Dubai (GST)" // "Asia/Dubai"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.11.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.11.label') }, // "Asia/Kolkata (IST)" // "Asia/Kolkata"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.12.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.12.label') }, // "Asia/Shanghai (CST)" // "Asia/Shanghai"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.13.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.13.label') }, // "Australia/Sydney (AEST/AEDT)" // "Australia/Sydney"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.14.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.14.label') }, // "Australia/Perth (AWST)" // "Australia/Perth"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.15.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.15.label') }, // "Africa/Cairo (EET)" // "Africa/Cairo"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.16.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.16.label') }, // "Africa/Johannesburg (SAST)" // "Africa/Johannesburg"
                { value: i18n.t('register.steps.step4Preferences.options.timezones.17.value'), label: i18n.t('register.steps.step4Preferences.options.timezones.17.label') }, // "Coordinated Universal Time (UTC)" // "UTC"
            ],
            notificationMethods: [
                { value: i18n.t('register.steps.step4Preferences.options.notificationMethods.0.value'), label: i18n.t('register.steps.step4Preferences.options.notificationMethods.0.label') }, // "Email" // "email"
                { value: i18n.t('register.steps.step4Preferences.options.notificationMethods.1.value'), label: i18n.t('register.steps.step4Preferences.options.notificationMethods.1.label') }, // "SMS (Text Message)" // "sms"
                { value: i18n.t('register.steps.step4Preferences.options.notificationMethods.2.value'), label: i18n.t('register.steps.step4Preferences.options.notificationMethods.2.label') }, // "Push Notification" // "push"
                { value: i18n.t('register.steps.step4Preferences.options.notificationMethods.3.value'), label: i18n.t('register.steps.step4Preferences.options.notificationMethods.3.label') } // "None" // "none"
            ],
            currencies: [
                { value: i18n.t('register.steps.step4Preferences.options.currencies.0.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.0.label') }, // "USD - United States Dollar" // "USD"
                { value: i18n.t('register.steps.step4Preferences.options.currencies.1.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.1.label') }, // "EUR - Euro" // "EUR"
                { value: i18n.t('register.steps.step4Preferences.options.currencies.2.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.2.label') }, // "GBP - British Pound Sterling" // "GBP"
                { value: i18n.t('register.steps.step4Preferences.options.currencies.3.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.3.label') }, // "JPY - Japanese Yen" // "JPY"
                { value: i18n.t('register.steps.step4Preferences.options.currencies.4.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.4.label') }, // "CAD - Canadian Dollar" // "CAD"
                { value: i18n.t('register.steps.step4Preferences.options.currencies.5.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.5.label') }, // "AUD - Australian Dollar" // "AUD"
                { value: i18n.t('register.steps.step4Preferences.options.currencies.6.value'), label: i18n.t('register.steps.step4Preferences.options.currencies.6.label') }, // "CHF - Swiss Franc" // "CHF"
            ],
            languages: [
                { value: i18n.t('register.steps.step4Preferences.options.languages.0.value'), label: i18n.t('register.steps.step4Preferences.options.languages.0.label') }, // "English" // "en"
                { value: i18n.t('register.steps.step4Preferences.options.languages.1.value'), label: i18n.t('register.steps.step4Preferences.options.languages.1.label') }, // "Espa\u00f1ol (Spanish)" // "es"
                { value: i18n.t('register.steps.step4Preferences.options.languages.2.value'), label: i18n.t('register.steps.step4Preferences.options.languages.2.label') }, // "Fran\u00e7ais (French)" // "fr"
                { value: i18n.t('register.steps.step4Preferences.options.languages.3.value'), label: i18n.t('register.steps.step4Preferences.options.languages.3.label') }, // "Deutsch (German)" // "de"
                { value: i18n.t('register.steps.step4Preferences.options.languages.4.value'), label: i18n.t('register.steps.step4Preferences.options.languages.4.label') }, // "Italiano (Italian)" // "it"
                { value: i18n.t('register.steps.step4Preferences.options.languages.5.value'), label: i18n.t('register.steps.step4Preferences.options.languages.5.label') }, // "Portugu\u00eas (Portuguese)" // "pt"
                { value: i18n.t('register.steps.step4Preferences.options.languages.6.value'), label: i18n.t('register.steps.step4Preferences.options.languages.6.label') }, // "\u7b80\u4f53\u4e2d\u6587 (Simplified Chinese)" // "zh-CN"
                { value: i18n.t('register.steps.step4Preferences.options.languages.7.value'), label: i18n.t('register.steps.step4Preferences.options.languages.7.label') }, // "\u65e5\u672c\u8a9e (Japanese)" // "ja"
                { value: i18n.t('register.steps.step4Preferences.options.languages.8.value'), label: i18n.t('register.steps.step4Preferences.options.languages.8.label') }, // "\ud55c\uad6d\uc5b4 (Korean)" // "ko"
                { value: i18n.t('register.steps.step4Preferences.options.languages.9.value'), label: i18n.t('register.steps.step4Preferences.options.languages.9.label') }, // "\u0420\u0443\u0441\u0441\u043a\u0438\u0439 (Russian)" // "ru"
                { value: i18n.t('register.steps.step4Preferences.options.languages.10.value'), label: i18n.t('register.steps.step4Preferences.options.languages.10.label') }, // "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Arabic)" // "ar"
                { value: i18n.t('register.steps.step4Preferences.options.languages.11.value'), label: i18n.t('register.steps.step4Preferences.options.languages.11.label') }, // "\u0939\u093f\u0928\u094d\u0926\u0940 (Hindi)" // "hi"
            ],
        },
        errors: {
            formDataMissing: i18n.t('register.steps.step4Preferences.errors.formDataMissing'), // "Error: Form data is missing for preferences."
            updateMechanismMissing: i18n.t('register.steps.step0BusinessInfo.errors.updateFieldMissing'), // "Error: Form update mechanism is missing."
        },
        console: {
            invalidFormDataProp: i18n.t('register.steps.step4Preferences.console.invalidFormDataProp'), // "Step4Preferences: Invalid `formData` prop. Expected an object."
            invalidUpdateFieldProp: i18n.t('register.steps.step4Preferences.console.invalidUpdateFieldProp'), // "Step4Preferences: Invalid `updateField` prop. Expected a function."
            invalidErrorsProp: i18n.t('register.steps.step4Preferences.console.invalidErrorsProp'), // "Step4Preferences: Invalid `errors` prop. Expected an object or undefined."
        }
    },

    step5ProfileImage: {
        title: i18n.t('register.steps.step5ProfileImage.title'), // "Set Your Profile Picture"
        description: i18n.t('register.steps.step5ProfileImage.description'), // "A clear and friendly profile picture helps build trust and recognition. Choose an image that represents your personality and is visually appealing."
        errors: { // User-facing error messages for prop validation failures
            formDataUnavailable: i18n.t('register.steps.step5ProfileImage.errors.formDataUnavailable'), // "Error: Form data is unavailable for the profile image step."
            updateMechanismImproperlyConfigured: i18n.t('register.steps.step2BusinessLogo.errors.updateMechanismImproperlyConfigured'), // "Error: Form update mechanism is improperly configured."
        },
        console: { // Internal console messages for developers
            invalidFormDataProp: i18n.t('register.steps.step5ProfileImage.console.invalidFormDataProp'), // "Step5ProfileImage: Invalid `formData` prop. Expected an object."
            invalidUpdateFieldProp: i18n.t('register.steps.step5ProfileImage.console.invalidUpdateFieldProp'), // "Step5ProfileImage: Invalid `updateField` prop. Expected a function."
            invalidErrorsProp: i18n.t('register.steps.step5ProfileImage.console.invalidErrorsProp'), // "Step5ProfileImage: Invalid `errors` prop. Expected an object or undefined. Error display might be affected."
        },
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault') // Default theme color, can be localized if needed for specific themes per language // "rose"
    },
};

export const scriptLines_Components = {

    planSelection: {
        title: i18n.t('payments.components.planSelection.title'), // "Unlock Your Potential"
        subtitle: i18n.t('payments.components.planSelection.subtitle'), // "You're one step away! Choose the plan that aligns with your ambition and let's start baking success together."
        footerNote: i18n.t('payments.components.planSelection.footerNote'), // "All plans are billed monthly or annually. You can upgrade, downgrade, or cancel your plan at any time from your account settings."
        buttons: {
            chooseThisPlan: i18n.t('payments.components.planSelection.buttons.chooseThisPlan'), // "Choose This Plan"
            processing: i18n.t('payments.components.planSelection.buttons.processing'), // "Processing..."
            planSelected: i18n.t('payments.components.planSelection.buttons.planSelected'), // "Plan Selected!"
        },
        badges: {
            mostPopular: i18n.t('payments.components.planSelection.badges.mostPopular'), // "Most Popular"
            recommended: i18n.t('payments.components.planSelection.badges.recommended'), // Fallback if plan.badgeText is not set for a highlighted plan // "Recommended"
            specialOffer: i18n.t('payments.components.planSelection.badges.specialOffer'), // Default for discount badge if not specified in plan data // "SPECIAL OFFER"
        },
        errors: {
            functionalityUnavailable: i18n.t('payments.components.planSelection.errors.functionalityUnavailable'), // "Error: Plan selection functionality is unavailable."
        },
        console: {
            invalidOnPlanSelectProp: i18n.t('payments.components.planSelection.console.invalidOnPlanSelectProp'), // "PlanSelection: Invalid `onPlanSelect` prop. Expected a function."
        },
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault'), // Default theme color if not provided // "rose"

        // Plan Data - This is the most complex part for i18n.
        // Each plan's name, description, features, whyThisPlan, etc., needs to be localizable.
        // The structure below mirrors PLANS_DATA from the component.
        plans: [
            {
                id: i18n.t('register.components.planSelection.plans.0.id'), // Keep ID static for logic // "basic"
                name: i18n.t('register.components.planSelection.plans.0.name'), // "The First Batch"
                price: i18n.t('payments.components.planSelection.plans.0.price'), // Price might be handled differently if currency formatting is complex // "29.99"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: [i18n.t('payments.components.planSelection.plans.0.description.0'), i18n.t('payments.components.planSelection.plans.0.description.1')], // "Get up and running fast with essential order & inventory tools." // "Perfect for solo and micro-shops."
                features: [
                    { text: i18n.t('payments.components.planSelection.plans.0.features.0.text') }, // `check` boolean is logic, not text // "Unlimited Orders"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.1.text') }, // "Menu-Style Order Entry"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.2.text') }, // "Live Low-Stock Alerts"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.3.text') }, // "Basic Consumption Charts"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.4.text') }, // Note: "48 hr" might need specific localization // "Email Support (48 hr response)"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.5.text') }, // "Advanced Forecasting"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.6.text') }, // "Custom Feature Requests"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.7.text') } // "Dedicated Account Manager"
                ],
                iconName: i18n.t('payments.components.planSelection.plans.0.iconName'), // Icon name is usually not localized // "bolt"
                whyThisPlan: i18n.t('register.components.planSelection.plans.0.whyThisPlan'), // "Lightweight, powerful, and cost-effective\u2014First Batch gives independent bakers core tools to manage orders, track key ingredients, and see basic usage trends. Ideal if you\u2019re just starting or run a very small operation."
                // Theme related properties are typically not part of i18n text strings.
                // highlight and discount.isActive are also logic.
            },
            {
                id: i18n.t('register.components.planSelection.plans.1.id'), // "standard"
                name: i18n.t('register.components.planSelection.plans.1.name'), // "The Artisan Oven"
                price: i18n.t('register.components.planSelection.plans.1.price'), // "49.99"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: [i18n.t('payments.components.planSelection.plans.1.description.0'), i18n.t('payments.components.planSelection.plans.1.description.1')], // "All-in-one order management + deep insights to optimize and grow." // "For growing businesses ready to scale."
                features: [
                    { text: i18n.t('register.components.planSelection.plans.1.features.0.text') }, // "Everything in First Batch"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.1.text') }, // "Advanced Cost & Consumption Forecasts"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.2.text') }, // "Monthly Performance Reports"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.3.text') }, // "2 shops" might need localization // "Multi-Location Support (2 shops)"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.4.text') }, // "Priority Email & Chat Support"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.5.text') }, // "Access to Beta Features"
                    { text: i18n.t('payments.components.planSelection.plans.0.features.7.text') }, // "Dedicated Account Manager"
                    { text: i18n.t('payments.components.planSelection.plans.1.features.7.text') } // "Custom Integrations"
                ],
                iconName: i18n.t('payments.components.planSelection.plans.1.iconName'), // "mode_heat"
                whyThisPlan: i18n.t('register.components.planSelection.plans.1.whyThisPlan'), // "You\u2019re beyond the basics\u2014now you need real data to plan purchases, optimize recipes, orders, and spot sales trends. Artisan Oven brings forecasting, polished reports, and faster support so you bake bigger profits and expand efficiently."
                badgeText: i18n.t('payments.components.planSelection.badges.mostPopular'), // This specific badge text can be localized here // "Most Popular"
                discount: {
                    offerTitle: i18n.t('register.components.planSelection.plans.1.discount.offerTitle'), // "First Month FREE!"
                    displayPrice: i18n.t('register.components.planSelection.plans.1.discount.displayPrice'), // Could be part of plan data or dynamically generated // "0.00"
                    priceSuffix: i18n.t('payments.components.planSelection.plans.1.discount.priceSuffix'), // "/first month"
                    originalPriceText: i18n.t('register.components.planSelection.plans.1.discount.originalPriceText'), // Strikethrough text // "$49.99/month"
                    details: i18n.t('register.components.planSelection.plans.1.discount.details'), // "Then $49.99/month. Renews automatically, cancel anytime."
                    badgeText: i18n.t('payments.components.planSelection.badges.specialOffer'), // Can override the default 'SPECIAL OFFER' // "SPECIAL OFFER"
                }
            },
            {
                id: i18n.t('register.components.planSelection.plans.2.id'), // "premium"
                name: i18n.t('register.components.planSelection.plans.2.name'), // "Master Baker Suite"
                price: i18n.t('register.components.planSelection.plans.2.price'), // "99.99"
                frequency: i18n.t('payments.components.planSelection.plans.0.frequency'), // "/month"
                description: [i18n.t('payments.components.planSelection.plans.2.description.0'), i18n.t('payments.components.planSelection.plans.2.description.1')], // "Full-featured, white-glove service, and limitless scalability." // "For established bakeries that demand excellence."
                features: [
                    { text: i18n.t('register.components.planSelection.plans.2.features.0.text') }, // "Everything in Artisan Oven, plus:"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.1.text') }, // "Unlimited Locations & Team Users"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.2.text') }, // "Personalized Onboarding & Training"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.3.text') }, // "Custom Feature Roadmap Input"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.4.text') }, // "24/7" might need localization // "24/7 Priority Phone & Emergency Support"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.5.text') }, // "Bespoke API & System Integrations"
                    { text: i18n.t('payments.components.planSelection.plans.2.features.6.text') } // "SLA-backed Uptime & Performance"
                ],
                iconName: i18n.t('payments.components.planSelection.plans.2.iconName'), // "verified"
                whyThisPlan: i18n.t('register.components.planSelection.plans.2.whyThisPlan'), // "If you\u2019re running multiple sites, handling high order volume, or need bespoke workflows\u2014Master Baker is your all-inclusive suite, complete with real-time SLAs, hands-on training, and a dedicated team that evolves the app around your unique needs."
            }
        ]
    },

    Dropdown: {
        line1: i18n.t('register.components.Dropdown.line1'), // "No options available."
    },

    formStep: {
        progress: {
            step: i18n.t('register.components.formStep.progress.step'), // e.g., "Step 1" // "Step"
            of: i18n.t('register.components.formStep.progress.of'),     // e.g., "of 6" // "of"
        },
        buttons: {
            back: i18n.t('register.components.formStep.buttons.back'), // "Back"
            continue: i18n.t('register.components.formStep.buttons.continue'), // "Continue"
            submitting: i18n.t('register.components.formStep.buttons.submitting'), // "Submitting..."
            completeRegistration: i18n.t('register.components.formStep.buttons.completeRegistration'), // "Complete Registration"
        },
        errors: { // User-facing error messages for prop validation failures
            stepConfigurationInvalid: i18n.t('register.components.formStep.errors.stepConfigurationInvalid'), // "Error: Step configuration is invalid."
            stepContentMissing: i18n.t('register.components.formStep.errors.stepContentMissing'), // "Error: Step content is missing."
            formContextUnavailable: i18n.t('register.components.formStep.errors.formContextUnavailable'), // "Error: Form context is unavailable."
            navigationHandlersMissing: i18n.t('register.components.formStep.errors.navigationHandlersMissing'), // "Error: Navigation handlers are missing."
            unexpectedError: i18n.t('register.components.formStep.errors.unexpectedError'), // Generic fallback error // "An unexpected error occurred. Please try again."
        },
        console: { // Internal console messages for developers
            invalidStepIndexProp: i18n.t('register.components.formStep.console.invalidStepIndexProp'), // "FormStep: Invalid `stepIndex` prop. Expected a non-negative number."
            invalidTitleProp: i18n.t('register.components.formStep.console.invalidTitleProp'), // "FormStep: Invalid or missing `title` prop. Expected a string."
            missingChildrenProp: i18n.t('register.components.formStep.console.missingChildrenProp'), // "FormStep: Missing `children` prop."
            invalidFormStateProp: i18n.t('register.components.formStep.console.invalidFormStateProp'), // "FormStep: Invalid or missing `formState` prop or `formState.validateStep` function."
            missingNavigationHandlers: i18n.t('register.components.formStep.console.missingNavigationHandlers'), // "FormStep: Missing `onProceed` or `onBack` prop. Expected functions."
            invalidOnSubmitProp: i18n.t('register.components.formStep.console.invalidOnSubmitProp'), // "FormStep: `onSubmit` prop provided for final step but is not a function. `onProceed` will be used."
            validationOrProceedError: i18n.t('register.components.formStep.console.validationOrProceedError'), // "FormStep: Error during step validation or proceeding:"
        },
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault'), // "rose"
        // TOTAL_FORM_STEPS might be better configured globally or passed as a prop if it's dynamic,
        // but if it's truly fixed for this form context, it can be a constant.
        // For i18n, if "Step X of Y" needs different phrasing per language, the whole string might need localization.
    },

    imageUploader: {
        dropzone: {
            ctaActive: i18n.t('register.components.imageUploader.dropzone.ctaActive'), // "Drop image here!"
            ctaDefault: i18n.t('register.components.imageUploader.dropzone.ctaDefault'), // Placeholder for clickable part // "<span class='font-bold'>{clickToUpload}</span> or drag & drop"
            clickToUploadText: i18n.t('register.components.imageUploader.dropzone.clickToUploadText'), // Text for the clickable part of ctaDefault // "Click to upload"
            fileTypes: i18n.t('register.components.imageUploader.dropzone.fileTypes'), // Placeholder for max size // "PNG, JPG, GIF, WEBP up to {maxFileSizeMB}MB"
        },
        cropper: {
            title: i18n.t('register.components.imageUploader.cropper.title'), // "Adjust Your Image"
            buttons: {
                applyCrop: i18n.t('register.components.imageUploader.cropper.buttons.applyCrop'), // "Apply Crop"
                processing: i18n.t('payments.components.planSelection.buttons.processing'), // "Processing..."
                resetCrop: i18n.t('register.components.imageUploader.cropper.buttons.resetCrop'), // When initialSrc is being re-cropped // "Reset Crop"
                changeImage: i18n.t('register.components.imageUploader.cropper.buttons.changeImage'), // When a new file was uploaded // "Change Image"
            },
        },
        preview: {
            title: i18n.t('register.components.imageUploader.preview.title'), // Or "Current Logo:" if context known // "Current Profile Image:"
            uploadNew: i18n.t('register.components.imageUploader.preview.uploadNew'), // "Upload new image?"
        },
        errors: {
            fileTooLarge: i18n.t('register.components.imageUploader.errors.fileTooLarge'), // "File is too large. Max size: {maxFileSizeMB}MB."
            invalidFileType: i18n.t('register.components.imageUploader.errors.invalidFileType'), // "Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP)."
            fileNotAccepted: i18n.t('register.components.imageUploader.errors.fileNotAccepted'), // "File could not be accepted. Please try again."
            errorReadingFile: i18n.t('register.components.imageUploader.errors.errorReadingFile'), // "Error reading file."
            cropSaveError: i18n.t('register.components.imageUploader.errors.cropSaveError'), // "Could not save crop. Please select a valid area."
            canvasContextError: i18n.t('register.components.imageUploader.errors.canvasContextError'), // "Failed to process image. Canvas context not available."
            blobCreationError: i18n.t('register.components.imageUploader.errors.blobCreationError'), // "Failed to create image blob. Please try again."
            handlerMissing: i18n.t('register.components.imageUploader.errors.handlerMissing'), // For prop validation // "Error: Image upload handler is missing."
        },
        console: {
            invalidOnImageUploadProp: i18n.t('register.components.imageUploader.console.invalidOnImageUploadProp'), // "ImageUploader: Invalid `onImageUpload` prop. Expected a function."
            initialSrcWarning: i18n.t('register.components.imageUploader.console.initialSrcWarning'), // "ImageUploader: initialSrc prop does not appear to be a valid image URL or data URL."
        },
        themeColorDefault: i18n.t('payments.components.planSelection.themeColorDefault'), // "rose"
    },

    trustFooter: {
        securityMessage: i18n.t('register.components.trustFooter.securityMessage'), // "Your information is secure. We prioritize your privacy and data protection."
        links: {
            privacyPolicy: i18n.t('register.steps.step4Preferences.linkText.privacyPolicy'), // "Privacy Policy"
            termsOfUse: i18n.t('register.components.trustFooter.links.termsOfUse'), // Or "Terms of Service" depending on naming convention // "Terms of Use"
        },
        copyright: i18n.t('register.components.trustFooter.copyright'), // Placeholders for dynamic values // "\u00a9 {year} {companyName}. All rights reserved."
        // Default values, if needed for props, can also be here.
        // Example: themeColorDefault: "rose"
        // Default URLs are usually app config, not i18n, but could be if regional sites differ.
    },
};

