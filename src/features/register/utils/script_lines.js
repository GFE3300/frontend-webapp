import { t } from '../../../i18n';

export const scriptLines_useFormState = {
    // Console Log Messages
    log: {
        failedToParseSessionStorage: t('register.useFormState.log.failedToParseSessionStorage'),
        failedToSaveSessionStorage: t('register.useFormState.log.failedToSaveSessionStorage'),
    },

    // Validation Messages - Step 0: Business Information
    validation: {
        businessNameRequired: t('register.useFormState.validation.businessNameRequired'),
        emailInvalid: t('register.useFormState.validation.emailInvalid'), // Reusable for other email fields
        businessEmailRequired: t('register.useFormState.validation.businessEmailRequired'),
        businessUsernameInvalidFormat: t('register.useFormState.validation.businessUsernameInvalidFormat'),
        businessUsernameRequired: t('register.useFormState.validation.businessUsernameRequired'),
        businessPhoneRequired: t('register.useFormState.validation.businessPhoneRequired'),
        businessTagsMin: t('register.useFormState.validation.businessTagsMin'),
        businessWebsiteInvalidUrl: t('register.useFormState.validation.businessWebsiteInvalidUrl'), // As per original, unusual message

        // Validation Messages - Step 1: Business Location
        locationRequiredOnMap: t('register.useFormState.validation.locationRequiredOnMap'), // Used for both .required and .typeError
        addressStreetRequired: t('register.useFormState.validation.addressStreetRequired'),
        addressCityRequired: t('register.useFormState.validation.addressCityRequired'),
        addressPostalCodeRequired: t('register.useFormState.validation.addressPostalCodeRequired'),
        addressCountryRequired: t('register.useFormState.validation.addressCountryRequired'),
        addressDetailsRequired: t('register.useFormState.validation.addressDetailsRequired'), // Used for both .required and .typeError

        // Validation Messages - Step 2: Business Logo (Strings for commented-out validations)
        logoFileSizeTooLarge: t('register.useFormState.validation.logoFileSizeTooLarge'),
        logoFileTypeUnsupported: t('register.useFormState.validation.logoFileTypeUnsupported'),

        // Validation Messages - Step 3: Your Profile
        profileNameRequired: t('register.useFormState.validation.profileNameRequired'),
        // validation.emailInvalid is reused here
        profileEmailRequired: t('register.useFormState.validation.profileEmailRequired'),
        profilePhoneRequired: t('register.useFormState.validation.profilePhoneRequired'),
        passwordMinLength: t('register.useFormState.validation.passwordMinLength'),
        passwordRequiresUppercase: t('register.useFormState.validation.passwordRequiresUppercase'),
        passwordRequiresLowercase: t('register.useFormState.validation.passwordRequiresLowercase'),
        passwordRequiresNumber: t('register.useFormState.validation.passwordRequiresNumber'),
        passwordRequiresSpecialChar: t('register.useFormState.validation.passwordRequiresSpecialChar'),
        passwordRequired: t('register.useFormState.validation.passwordRequired'),
        confirmPasswordMatch: t('register.useFormState.validation.confirmPasswordMatch'),
        confirmPasswordRequired: t('register.useFormState.validation.confirmPasswordRequired'),

        // Validation Messages - Step 4: Preferences
        timezoneRequired: t('register.useFormState.validation.timezoneRequired'),
        currencyRequired: t('register.useFormState.validation.currencyRequired'),
        languageRequired: t('register.useFormState.validation.languageRequired'),
        acceptTermsRequired: t('register.useFormState.validation.acceptTermsRequired'),

        // Validation Messages - Step 5: Profile Image (Strings for commented-out validations)
        profileImageFileSizeTooLarge: t('register.useFormState.validation.profileImageFileSizeTooLarge'),
        profileImageFileTypeUnsupported: t('register.useFormState.validation.profileImageFileTypeUnsupported'),
    },

    // General Error Messages for Steps
    error: {
        form: {
            correctErrorsInStep: t('register.useFormState.error.form.correctErrorsInStep'), // Placeholder for step number
            correctErrorsInStepTitleCase: t('register.useFormState.error.form.correctErrorsInStepTitleCase'), // Placeholder, different casing
        }
    },

    // Password Strength Indicator Values
    // These are values returned by the hook. If displayed, they are now localized.
    // If they are keys for further lookup in a full i18n system, this structure would change.
    passwordStrength: {
        weak: t('register.useFormState.passwordStrength.weak'),
        fair: t('register.useFormState.passwordStrength.fair'),
        strong: t('register.useFormState.passwordStrength.strong'),
    },
};

export const scriptLines_AddressForm = {

    // NEW: AddressForm Component Strings
    addressForm: {
        label: {
            streetAddress: t('register.addressForm.addressForm.label.streetAddress'),
            city: t('register.addressForm.addressForm.label.city'),
            postalCode: t('register.addressForm.addressForm.label.postalCode'),
            country: t('register.addressForm.addressForm.label.country'),
        },
        error: {
            placesImportFailed: t('register.addressForm.addressForm.error.placesImportFailed'), // Console error
            countryAutocompleteError: t('register.addressForm.addressForm.error.countryAutocompleteError'), // Console error
        },
        // Localized names for the static fallback country list
        staticCountries: {
            US: t('register.addressForm.addressForm.staticCountries.US'),
            ES: t('register.addressForm.addressForm.staticCountries.ES'),
            FR: t('register.addressForm.addressForm.staticCountries.FR'),
            DE: t('register.addressForm.addressForm.staticCountries.DE'),
            IT: t('register.addressForm.addressForm.staticCountries.IT'),
            GB: t('register.addressForm.addressForm.staticCountries.GB'),
            CA: t('register.addressForm.addressForm.staticCountries.CA'),
            PT: t('register.addressForm.addressForm.staticCountries.PT'),
            AU: t('register.addressForm.addressForm.staticCountries.AU'),
            BR: t('register.addressForm.addressForm.staticCountries.BR'),
            JP: t('register.addressForm.addressForm.staticCountries.JP'),
            IN: t('register.addressForm.addressForm.staticCountries.IN'),
            MX: t('register.addressForm.addressForm.staticCountries.MX'),
            CN: t('register.addressForm.addressForm.staticCountries.CN'),
            RU: t('register.addressForm.addressForm.staticCountries.RU'),
            ZA: t('register.addressForm.addressForm.staticCountries.ZA'),
        }
    },
};

export const scriptLines_Header = {
    // Console Log Messages (from previous task)
    log: {
        failedToParseSessionStorage: t('register.useFormState.log.failedToParseSessionStorage'),
        failedToSaveSessionStorage: t('register.useFormState.log.failedToSaveSessionStorage'),
    },

    // Validation Messages (from previous task)
    validation: {
        // ... existing validation messages from useFormState ...
        businessNameRequired: t('register.useFormState.validation.businessNameRequired'),
        emailInvalid: t('register.useFormState.validation.emailInvalid'),
        businessEmailRequired: t('register.useFormState.validation.businessEmailRequired'),
        businessUsernameInvalidFormat: t('register.useFormState.validation.businessUsernameInvalidFormat'),
        businessUsernameRequired: t('register.useFormState.validation.businessUsernameRequired'),
        businessPhoneRequired: t('register.useFormState.validation.businessPhoneRequired'),
        businessTagsMin: t('register.useFormState.validation.businessTagsMin'),
        businessWebsiteInvalidUrl: t('register.useFormState.validation.businessWebsiteInvalidUrl'),
        locationRequiredOnMap: t('register.useFormState.validation.locationRequiredOnMap'),
        addressStreetRequired: t('register.useFormState.validation.addressStreetRequired'),
        addressCityRequired: t('register.useFormState.validation.addressCityRequired'),
        addressPostalCodeRequired: t('register.useFormState.validation.addressPostalCodeRequired'),
        addressCountryRequired: t('register.useFormState.validation.addressCountryRequired'),
        addressDetailsRequired: t('register.useFormState.validation.addressDetailsRequired'),
        logoFileSizeTooLarge: t('register.useFormState.validation.logoFileSizeTooLarge'),
        logoFileTypeUnsupported: t('register.useFormState.validation.logoFileTypeUnsupported'),
        profileNameRequired: t('register.useFormState.validation.profileNameRequired'),
        profileEmailRequired: t('register.useFormState.validation.profileEmailRequired'),
        profilePhoneRequired: t('register.useFormState.validation.profilePhoneRequired'),
        passwordMinLength: t('register.useFormState.validation.passwordMinLength'),
        passwordRequiresUppercase: t('register.useFormState.validation.passwordRequiresUppercase'),
        passwordRequiresLowercase: t('register.useFormState.validation.passwordRequiresLowercase'),
        passwordRequiresNumber: t('register.useFormState.validation.passwordRequiresNumber'),
        passwordRequiresSpecialChar: t('register.useFormState.validation.passwordRequiresSpecialChar'),
        passwordRequired: t('register.useFormState.validation.passwordRequired'),
        confirmPasswordMatch: t('register.useFormState.validation.confirmPasswordMatch'),
        confirmPasswordRequired: t('register.useFormState.validation.confirmPasswordRequired'),
        timezoneRequired: t('register.useFormState.validation.timezoneRequired'),
        currencyRequired: t('register.useFormState.validation.currencyRequired'),
        languageRequired: t('register.useFormState.validation.languageRequired'),
        acceptTermsRequired: t('register.useFormState.validation.acceptTermsRequired'),
        profileImageFileSizeTooLarge: t('register.useFormState.validation.profileImageFileSizeTooLarge'),
        profileImageFileTypeUnsupported: t('register.useFormState.validation.profileImageFileTypeUnsupported'),
    },

    // General Error Messages for Steps (from previous task)
    error: {
        form: {
            correctErrorsInStep: t('register.useFormState.error.form.correctErrorsInStep'),
            correctErrorsInStepTitleCase: t('register.useFormState.error.form.correctErrorsInStepTitleCase'),
        }
    },

    // Password Strength Indicator Values (from previous task)
    passwordStrength: {
        weak: t('register.useFormState.passwordStrength.weak'),
        fair: t('register.useFormState.passwordStrength.fair'),
        strong: t('register.useFormState.passwordStrength.strong'),
    },

    // AddressForm Component Strings (from previous task)
    addressForm: {
        label: {
            streetAddress: t('register.addressForm.addressForm.label.streetAddress'),
            city: t('register.addressForm.addressForm.label.city'),
            postalCode: t('register.addressForm.addressForm.label.postalCode'),
            country: t('register.addressForm.addressForm.label.country'),
        },
        error: {
            placesImportFailed: t('register.addressForm.addressForm.error.placesImportFailed'),
            countryAutocompleteError: t('register.addressForm.addressForm.error.countryAutocompleteError'),
        },
        staticCountries: {
            US: t('register.addressForm.addressForm.staticCountries.US'),
            ES: t('register.addressForm.addressForm.staticCountries.ES'),
            FR: t('register.addressForm.addressForm.staticCountries.FR'),
            DE: t('register.addressForm.addressForm.staticCountries.DE'),
            IT: t('register.addressForm.addressForm.staticCountries.IT'),
            GB: t('register.addressForm.addressForm.staticCountries.GB'),
            CA: t('register.addressForm.addressForm.staticCountries.CA'),
            PT: t('register.addressForm.addressForm.staticCountries.PT'),
            AU: t('register.addressForm.addressForm.staticCountries.AU'),
            BR: t('register.addressForm.addressForm.staticCountries.BR'),
            JP: t('register.addressForm.addressForm.staticCountries.JP'),
            IN: t('register.addressForm.addressForm.staticCountries.IN'),
            MX: t('register.addressForm.addressForm.staticCountries.MX'),
            CN: t('register.addressForm.addressForm.staticCountries.CN'),
            RU: t('register.addressForm.addressForm.staticCountries.RU'),
            ZA: t('register.addressForm.addressForm.staticCountries.ZA'),
        }
    },

    autocompleteInput: {
        label: {
            autoComplete: t('register.header.autocompleteInput.label.autoComplete'), // Label for the input field
        },
        placeholder: {
            quickerSearch: t('register.header.autocompleteInput.placeholder.quickerSearch'), // Placeholder text for the input
        },
        status: {
            findingLocations: t('register.header.autocompleteInput.status.findingLocations'), // Loading message
            noResults: t('register.header.autocompleteInput.status.noResults'),          // Message when no suggestions are found
        },
        error: {
            placesLibraryLoadFailed: t('register.header.autocompleteInput.error.placesLibraryLoadFailed'), // Console error
            autocompleteError: t('register.header.autocompleteInput.error.autocompleteError'),                // Console error
            noMatchingAddresses: t('register.header.autocompleteInput.error.noMatchingAddresses'), // Error message displayed to user
        }
    },

    // NEW: GeolocationButton Component Strings
    geolocationButton: {
        label: {
            useMyLocation: t('register.header.geolocationButton.label.useMyLocation'), // Default button label and tooltip text
        },
        aria: {
            locating: t('register.header.geolocationButton.aria.locating'), // ARIA label when loading
        },
        error: {
            notSupported: t('register.header.geolocationButton.error.notSupported'),
            permissionDenied: t('register.header.geolocationButton.error.permissionDenied'),
            unableToDetermine: t('register.header.geolocationButton.error.unableToDetermine'),
        }
    },
};

export const scriptLines_Steps = {

    step0BusinessInfo: {
        errors: {
            formDataMissing: t('register.steps.step0BusinessInfo.errors.formDataMissing'),
            updateFieldMissing: t('register.steps.step0BusinessInfo.errors.updateFieldMissing'),
        },
        console: {
            invalidFormDataProp: t('register.steps.step0BusinessInfo.console.invalidFormDataProp'),
            invalidUpdateFieldProp: t('register.steps.step0BusinessInfo.console.invalidUpdateFieldProp'),
            invalidErrorsProp: t('register.steps.step0BusinessInfo.console.invalidErrorsProp'),
        },
        label: {
            businessName: t('register.steps.step0BusinessInfo.label.businessName'),
            businessUsername: t('register.steps.step0BusinessInfo.label.businessUsername'),
            businessEmail: t('register.steps.step0BusinessInfo.label.businessEmail'),
            businessPhone: t('register.steps.step0BusinessInfo.label.businessPhone'),
            businessWebsiteOptional: t('register.steps.step0BusinessInfo.label.businessWebsiteOptional'),
            businessTags: t('register.steps.step0BusinessInfo.label.businessTags'),
            referralCodeOptional: t('register.steps.step0BusinessInfo.label.referralCodeOptional'),
        },
        placeholder: {
            businessName: t('register.steps.step0BusinessInfo.placeholder.businessName'),
            businessUsername: t('register.steps.step0BusinessInfo.placeholder.businessUsername'),
            businessEmail: t('register.steps.step0BusinessInfo.placeholder.businessEmail'),
            businessPhone: t('register.steps.step0BusinessInfo.placeholder.businessPhone'),
            businessWebsite: t('register.steps.step0BusinessInfo.placeholder.businessWebsite'),
            businessTags: t('register.steps.step0BusinessInfo.placeholder.businessTags'),
            referralCode: t('register.steps.step0BusinessInfo.placeholder.referralCode'),
        },
        helptext: {
            businessTags: t('register.steps.step0BusinessInfo.helptext.businessTags'),
        },
        /**
         * @constant {string[]} defaultBusinessTags
         * A predefined list of suggested tags to help users categorize their business.
         * These are provided as an array for direct use. For more granular translation or
         * if tags need to be contextually different, each tag could be its own key.
         */
        defaultBusinessTags: [
            // General Types
            t('register.steps.step0BusinessInfo.defaultBusinessTags.0'), t('register.steps.step0BusinessInfo.defaultBusinessTags.1'), t('register.steps.step0BusinessInfo.defaultBusinessTags.2'), t('register.steps.step0BusinessInfo.defaultBusinessTags.3'), t('register.steps.step0BusinessInfo.defaultBusinessTags.4'), t('register.steps.step0BusinessInfo.defaultBusinessTags.5'), t('register.steps.step0BusinessInfo.defaultBusinessTags.6'), t('register.steps.step0BusinessInfo.defaultBusinessTags.7'),
            // Food Specific
            t('register.steps.step0BusinessInfo.defaultBusinessTags.8'), t('register.steps.step0BusinessInfo.defaultBusinessTags.9'), t('register.steps.step0BusinessInfo.defaultBusinessTags.10'), t('register.steps.step0BusinessInfo.defaultBusinessTags.11'), t('register.steps.step0BusinessInfo.defaultBusinessTags.12'), t('register.steps.step0BusinessInfo.defaultBusinessTags.13'), t('register.steps.step0BusinessInfo.defaultBusinessTags.14'), t('register.steps.step0BusinessInfo.defaultBusinessTags.15'),
            // Attributes
            t('register.steps.step0BusinessInfo.defaultBusinessTags.16'), t('register.steps.step0BusinessInfo.defaultBusinessTags.17'), t('register.steps.step0BusinessInfo.defaultBusinessTags.18'), t('register.steps.step0BusinessInfo.defaultBusinessTags.19'), t('register.steps.step0BusinessInfo.defaultBusinessTags.20'), t('register.steps.step0BusinessInfo.defaultBusinessTags.21'), t('register.steps.step0BusinessInfo.defaultBusinessTags.22')
        ]
    },

    locationStage: {
        label: {
            mapLocation: t('register.steps.locationStage.label.mapLocation'), // Label for the map section
        },
        // No other direct text strings were found in LocationStage.jsx.
        // AutocompleteInput, GeolocationButton, and AddressForm have their own localized strings.
    },

    step2BusinessLogo: {
        title: t('register.steps.step2BusinessLogo.title'),
        description: t('register.steps.step2BusinessLogo.description'),
        errors: {
            formDataUnavailable: t('register.steps.step2BusinessLogo.errors.formDataUnavailable'),
            updateMechanismImproperlyConfigured: t('register.steps.step2BusinessLogo.errors.updateMechanismImproperlyConfigured'),
        },
        console: {
            invalidFormDataProp: t('register.steps.step2BusinessLogo.console.invalidFormDataProp'),
            invalidUpdateFieldProp: t('register.steps.step2BusinessLogo.console.invalidUpdateFieldProp'),
            invalidErrorsProp: t('register.steps.step2BusinessLogo.console.invalidErrorsProp'),
        },
        themeColorDefault: t('payments.components.planSelection.themeColorDefault')
    },

    step3Profile: {
        label: {
            fullName: t('register.steps.step3Profile.label.fullName'),
            lastName: t('register.steps.step3Profile.label.lastName'),
            roleAtBusiness: t('register.steps.step3Profile.label.roleAtBusiness'),
            contactEmail: t('register.steps.step3Profile.label.contactEmail'),
            contactPhone: t('register.steps.step3Profile.label.contactPhone'),
            createPassword: t('register.steps.step3Profile.label.createPassword'),
            confirmPassword: t('register.steps.step3Profile.label.confirmPassword'),
        },
        placeholder: {
            firstName: t('register.steps.step3Profile.placeholder.firstName'), // Assuming "Your Full Name" is for first name
            lastName: t('register.steps.step3Profile.placeholder.lastName'),
            role: t('register.steps.step3Profile.placeholder.role'),
            contactEmail: t('register.steps.step3Profile.placeholder.contactEmail'),
            contactPhone: t('register.steps.step3Profile.placeholder.contactPhone'),
            passwordMinChars: t('register.steps.step3Profile.placeholder.passwordMinChars'),
            confirmPassword: t('register.steps.step3Profile.placeholder.confirmPassword'),
        },
        aria: {
            hidePassword: t('register.steps.step3Profile.aria.hidePassword'),
            showPassword: t('register.steps.step3Profile.aria.showPassword'),
        },
        errors: {
            formDataMissing: t('register.steps.step0BusinessInfo.errors.formDataMissing'),
            updateMechanismMissing: t('register.steps.step0BusinessInfo.errors.updateFieldMissing'),
            passwordStrengthMissing: t('register.steps.step3Profile.errors.passwordStrengthMissing'),
            passwordVisibilityControlMissing: t('register.steps.step3Profile.errors.passwordVisibilityControlMissing'),
        },
        console: {
            invalidFormDataProp: t('register.steps.step3Profile.console.invalidFormDataProp'), // Note: Original log used Step2Profile
            invalidUpdateFieldProp: t('register.steps.step3Profile.console.invalidUpdateFieldProp'),
            invalidPasswordStrengthProp: t('register.steps.step3Profile.console.invalidPasswordStrengthProp'),
            invalidPasswordVisibilityProps: t('register.steps.step3Profile.console.invalidPasswordVisibilityProps'),
        },
        // Note: The password strength indicator ('weak', 'fair', 'strong') itself
        // is likely localized in the PasswordStrength subcomponent or useFormState.
        // If PasswordStrength subcomponent expects localized strings for these,
        // they would be passed as props.
    },

    step4Preferences: {
        label: {
            timezone: t('register.steps.step4Preferences.label.timezone'),
            preferredNotificationMethod: t('register.steps.step4Preferences.label.preferredNotificationMethod'),
            primaryCurrency: t('register.steps.step4Preferences.label.primaryCurrency'),
            preferredDailySummaryTimeOptional: t('register.steps.step4Preferences.label.preferredDailySummaryTimeOptional'),
            preferredLanguage: t('register.steps.step4Preferences.label.preferredLanguage'),
            referralSourcesOptional: t('register.steps.step4Preferences.label.referralSourcesOptional'),
            acceptTerms: t('register.steps.step4Preferences.label.acceptTerms'), // Placeholders for links
        },
        placeholder: {
            selectTimezone: t('register.steps.step4Preferences.placeholder.selectTimezone'),
            selectNotificationChannel: t('register.steps.step4Preferences.placeholder.selectNotificationChannel'),
            selectCurrency: t('register.steps.step4Preferences.placeholder.selectCurrency'),
            referralSources: t('register.steps.step4Preferences.placeholder.referralSources'),
        },
        helptext: {
            dailySummaryTime: t('register.steps.step4Preferences.helptext.dailySummaryTime'),
            referralSources: t('register.steps.step4Preferences.helptext.referralSources'),
        },
        linkText: {
            termsOfService: t('register.steps.step4Preferences.linkText.termsOfService'),
            privacyPolicy: t('register.steps.step4Preferences.linkText.privacyPolicy'),
        },
        options: {
            timezones: [ // These labels are user-facing and should be translated.
                { value: t('register.steps.step4Preferences.options.timezones.0.value'), label: t('register.steps.step4Preferences.options.timezones.0.label') },
                { value: t('register.steps.step4Preferences.options.timezones.1.value'), label: t('register.steps.step4Preferences.options.timezones.1.label') },
                { value: t('register.steps.step4Preferences.options.timezones.2.value'), label: t('register.steps.step4Preferences.options.timezones.2.label') },
                { value: t('register.steps.step4Preferences.options.timezones.3.value'), label: t('register.steps.step4Preferences.options.timezones.3.label') },
                { value: t('register.steps.step4Preferences.options.timezones.4.value'), label: t('register.steps.step4Preferences.options.timezones.4.label') },
                { value: t('register.steps.step4Preferences.options.timezones.5.value'), label: t('register.steps.step4Preferences.options.timezones.5.label') },
                { value: t('register.steps.step4Preferences.options.timezones.6.value'), label: t('register.steps.step4Preferences.options.timezones.6.label') },
                { value: t('register.steps.step4Preferences.options.timezones.7.value'), label: t('register.steps.step4Preferences.options.timezones.7.label') },
                { value: t('register.steps.step4Preferences.options.timezones.8.value'), label: t('register.steps.step4Preferences.options.timezones.8.label') },
                { value: t('register.steps.step4Preferences.options.timezones.9.value'), label: t('register.steps.step4Preferences.options.timezones.9.label') },
                { value: t('register.steps.step4Preferences.options.timezones.10.value'), label: t('register.steps.step4Preferences.options.timezones.10.label') },
                { value: t('register.steps.step4Preferences.options.timezones.11.value'), label: t('register.steps.step4Preferences.options.timezones.11.label') },
                { value: t('register.steps.step4Preferences.options.timezones.12.value'), label: t('register.steps.step4Preferences.options.timezones.12.label') },
                { value: t('register.steps.step4Preferences.options.timezones.13.value'), label: t('register.steps.step4Preferences.options.timezones.13.label') },
                { value: t('register.steps.step4Preferences.options.timezones.14.value'), label: t('register.steps.step4Preferences.options.timezones.14.label') },
                { value: t('register.steps.step4Preferences.options.timezones.15.value'), label: t('register.steps.step4Preferences.options.timezones.15.label') },
                { value: t('register.steps.step4Preferences.options.timezones.16.value'), label: t('register.steps.step4Preferences.options.timezones.16.label') },
                { value: t('register.steps.step4Preferences.options.timezones.17.value'), label: t('register.steps.step4Preferences.options.timezones.17.label') },
            ],
            notificationMethods: [
                { value: t('register.steps.step4Preferences.options.notificationMethods.0.value'), label: t('register.steps.step4Preferences.options.notificationMethods.0.label') },
                { value: t('register.steps.step4Preferences.options.notificationMethods.1.value'), label: t('register.steps.step4Preferences.options.notificationMethods.1.label') },
                { value: t('register.steps.step4Preferences.options.notificationMethods.2.value'), label: t('register.steps.step4Preferences.options.notificationMethods.2.label') },
                { value: t('register.steps.step4Preferences.options.notificationMethods.3.value'), label: t('register.steps.step4Preferences.options.notificationMethods.3.label') }
            ],
            currencies: [
                { value: t('register.steps.step4Preferences.options.currencies.0.value'), label: t('register.steps.step4Preferences.options.currencies.0.label') },
                { value: t('register.steps.step4Preferences.options.currencies.1.value'), label: t('register.steps.step4Preferences.options.currencies.1.label') },
                { value: t('register.steps.step4Preferences.options.currencies.2.value'), label: t('register.steps.step4Preferences.options.currencies.2.label') },
                { value: t('register.steps.step4Preferences.options.currencies.3.value'), label: t('register.steps.step4Preferences.options.currencies.3.label') },
                { value: t('register.steps.step4Preferences.options.currencies.4.value'), label: t('register.steps.step4Preferences.options.currencies.4.label') },
                { value: t('register.steps.step4Preferences.options.currencies.5.value'), label: t('register.steps.step4Preferences.options.currencies.5.label') },
                { value: t('register.steps.step4Preferences.options.currencies.6.value'), label: t('register.steps.step4Preferences.options.currencies.6.label') },
            ],
            languages: [
                { value: t('register.steps.step4Preferences.options.languages.0.value'), label: t('register.steps.step4Preferences.options.languages.0.label') },
                { value: t('register.steps.step4Preferences.options.languages.1.value'), label: t('register.steps.step4Preferences.options.languages.1.label') },
                { value: t('register.steps.step4Preferences.options.languages.2.value'), label: t('register.steps.step4Preferences.options.languages.2.label') },
                { value: t('register.steps.step4Preferences.options.languages.3.value'), label: t('register.steps.step4Preferences.options.languages.3.label') },
                { value: t('register.steps.step4Preferences.options.languages.4.value'), label: t('register.steps.step4Preferences.options.languages.4.label') },
                { value: t('register.steps.step4Preferences.options.languages.5.value'), label: t('register.steps.step4Preferences.options.languages.5.label') },
                { value: t('register.steps.step4Preferences.options.languages.6.value'), label: t('register.steps.step4Preferences.options.languages.6.label') },
                { value: t('register.steps.step4Preferences.options.languages.7.value'), label: t('register.steps.step4Preferences.options.languages.7.label') },
                { value: t('register.steps.step4Preferences.options.languages.8.value'), label: t('register.steps.step4Preferences.options.languages.8.label') },
                { value: t('register.steps.step4Preferences.options.languages.9.value'), label: t('register.steps.step4Preferences.options.languages.9.label') },
                { value: t('register.steps.step4Preferences.options.languages.10.value'), label: t('register.steps.step4Preferences.options.languages.10.label') },
                { value: t('register.steps.step4Preferences.options.languages.11.value'), label: t('register.steps.step4Preferences.options.languages.11.label') },
            ],
        },
        errors: {
            formDataMissing: t('register.steps.step4Preferences.errors.formDataMissing'),
            updateMechanismMissing: t('register.steps.step0BusinessInfo.errors.updateFieldMissing'),
        },
        console: {
            invalidFormDataProp: t('register.steps.step4Preferences.console.invalidFormDataProp'),
            invalidUpdateFieldProp: t('register.steps.step4Preferences.console.invalidUpdateFieldProp'),
            invalidErrorsProp: t('register.steps.step4Preferences.console.invalidErrorsProp'),
        }
    },

    step5ProfileImage: {
        title: t('register.steps.step5ProfileImage.title'),
        description: t('register.steps.step5ProfileImage.description'),
        errors: { // User-facing error messages for prop validation failures
            formDataUnavailable: t('register.steps.step5ProfileImage.errors.formDataUnavailable'),
            updateMechanismImproperlyConfigured: t('register.steps.step2BusinessLogo.errors.updateMechanismImproperlyConfigured'),
        },
        console: { // Internal console messages for developers
            invalidFormDataProp: t('register.steps.step5ProfileImage.console.invalidFormDataProp'),
            invalidUpdateFieldProp: t('register.steps.step5ProfileImage.console.invalidUpdateFieldProp'),
            invalidErrorsProp: t('register.steps.step5ProfileImage.console.invalidErrorsProp'),
        },
        themeColorDefault: t('payments.components.planSelection.themeColorDefault') // Default theme color, can be localized if needed for specific themes per language
    },
};

export const scriptLines_Components = {

    planSelection: {
        title: t('payments.components.planSelection.title'),
        subtitle: t('payments.components.planSelection.subtitle'),
        footerNote: t('payments.components.planSelection.footerNote'),
        buttons: {
            chooseThisPlan: t('payments.components.planSelection.buttons.chooseThisPlan'),
            processing: t('payments.components.planSelection.buttons.processing'),
            planSelected: t('payments.components.planSelection.buttons.planSelected'),
        },
        badges: {
            mostPopular: t('payments.components.planSelection.badges.mostPopular'),
            recommended: t('payments.components.planSelection.badges.recommended'), // Fallback if plan.badgeText is not set for a highlighted plan
            specialOffer: t('payments.components.planSelection.badges.specialOffer'), // Default for discount badge if not specified in plan data
        },
        errors: {
            functionalityUnavailable: t('payments.components.planSelection.errors.functionalityUnavailable'),
        },
        console: {
            invalidOnPlanSelectProp: t('payments.components.planSelection.console.invalidOnPlanSelectProp'),
        },
        themeColorDefault: t('payments.components.planSelection.themeColorDefault'), // Default theme color if not provided

        // Plan Data - This is the most complex part for i18n.
        // Each plan's name, description, features, whyThisPlan, etc., needs to be localizable.
        // The structure below mirrors PLANS_DATA from the component.
        plans: [
            {
                id: t('register.components.planSelection.plans.0.id'), // Keep ID static for logic
                name: t('register.components.planSelection.plans.0.name'),
                price: t('payments.components.planSelection.plans.0.price'), // Price might be handled differently if currency formatting is complex
                frequency: t('payments.components.planSelection.plans.0.frequency'),
                description: [t('payments.components.planSelection.plans.0.description.0'), t('payments.components.planSelection.plans.0.description.1')],
                features: [
                    { text: t('payments.components.planSelection.plans.0.features.0.text') }, // `check` boolean is logic, not text
                    { text: t('payments.components.planSelection.plans.0.features.1.text') },
                    { text: t('payments.components.planSelection.plans.0.features.2.text') },
                    { text: t('payments.components.planSelection.plans.0.features.3.text') },
                    { text: t('payments.components.planSelection.plans.0.features.4.text') }, // Note: "48 hr" might need specific localization
                    { text: t('payments.components.planSelection.plans.0.features.5.text') },
                    { text: t('payments.components.planSelection.plans.0.features.6.text') },
                    { text: t('payments.components.planSelection.plans.0.features.7.text') }
                ],
                iconName: t('payments.components.planSelection.plans.0.iconName'), // Icon name is usually not localized
                whyThisPlan: t('register.components.planSelection.plans.0.whyThisPlan'),
                // Theme related properties are typically not part of i18n text strings.
                // highlight and discount.isActive are also logic.
            },
            {
                id: t('register.components.planSelection.plans.1.id'),
                name: t('register.components.planSelection.plans.1.name'),
                price: t('register.components.planSelection.plans.1.price'),
                frequency: t('payments.components.planSelection.plans.0.frequency'),
                description: [t('payments.components.planSelection.plans.1.description.0'), t('payments.components.planSelection.plans.1.description.1')],
                features: [
                    { text: t('register.components.planSelection.plans.1.features.0.text') },
                    { text: t('payments.components.planSelection.plans.1.features.1.text') },
                    { text: t('payments.components.planSelection.plans.1.features.2.text') },
                    { text: t('payments.components.planSelection.plans.1.features.3.text') }, // "2 shops" might need localization
                    { text: t('payments.components.planSelection.plans.1.features.4.text') },
                    { text: t('payments.components.planSelection.plans.1.features.5.text') },
                    { text: t('payments.components.planSelection.plans.0.features.7.text') },
                    { text: t('payments.components.planSelection.plans.1.features.7.text') }
                ],
                iconName: t('payments.components.planSelection.plans.1.iconName'),
                whyThisPlan: t('register.components.planSelection.plans.1.whyThisPlan'),
                badgeText: t('payments.components.planSelection.badges.mostPopular'), // This specific badge text can be localized here
                discount: {
                    offerTitle: t('register.components.planSelection.plans.1.discount.offerTitle'),
                    displayPrice: t('register.components.planSelection.plans.1.discount.displayPrice'), // Could be part of plan data or dynamically generated
                    priceSuffix: t('payments.components.planSelection.plans.1.discount.priceSuffix'),
                    originalPriceText: t('register.components.planSelection.plans.1.discount.originalPriceText'), // Strikethrough text
                    details: t('register.components.planSelection.plans.1.discount.details'),
                    badgeText: t('payments.components.planSelection.badges.specialOffer'), // Can override the default 'SPECIAL OFFER'
                }
            },
            {
                id: t('register.components.planSelection.plans.2.id'),
                name: t('register.components.planSelection.plans.2.name'),
                price: t('register.components.planSelection.plans.2.price'),
                frequency: t('payments.components.planSelection.plans.0.frequency'),
                description: [t('payments.components.planSelection.plans.2.description.0'), t('payments.components.planSelection.plans.2.description.1')],
                features: [
                    { text: t('register.components.planSelection.plans.2.features.0.text') },
                    { text: t('payments.components.planSelection.plans.2.features.1.text') },
                    { text: t('payments.components.planSelection.plans.2.features.2.text') },
                    { text: t('payments.components.planSelection.plans.2.features.3.text') },
                    { text: t('payments.components.planSelection.plans.2.features.4.text') }, // "24/7" might need localization
                    { text: t('payments.components.planSelection.plans.2.features.5.text') },
                    { text: t('payments.components.planSelection.plans.2.features.6.text') }
                ],
                iconName: t('payments.components.planSelection.plans.2.iconName'),
                whyThisPlan: t('register.components.planSelection.plans.2.whyThisPlan'),
            }
        ]
    },

    Dropdown: {
        line1: t('register.components.Dropdown.line1'),
    },

    formStep: {
        progress: {
            step: t('register.components.formStep.progress.step'), // e.g., "Step 1"
            of: t('register.components.formStep.progress.of'),     // e.g., "of 6"
        },
        buttons: {
            back: t('register.components.formStep.buttons.back'),
            continue: t('register.components.formStep.buttons.continue'),
            submitting: t('register.components.formStep.buttons.submitting'),
            completeRegistration: t('register.components.formStep.buttons.completeRegistration'),
        },
        errors: { // User-facing error messages for prop validation failures
            stepConfigurationInvalid: t('register.components.formStep.errors.stepConfigurationInvalid'),
            stepContentMissing: t('register.components.formStep.errors.stepContentMissing'),
            formContextUnavailable: t('register.components.formStep.errors.formContextUnavailable'),
            navigationHandlersMissing: t('register.components.formStep.errors.navigationHandlersMissing'),
            unexpectedError: t('register.components.formStep.errors.unexpectedError'), // Generic fallback error
        },
        console: { // Internal console messages for developers
            invalidStepIndexProp: t('register.components.formStep.console.invalidStepIndexProp'),
            invalidTitleProp: t('register.components.formStep.console.invalidTitleProp'),
            missingChildrenProp: t('register.components.formStep.console.missingChildrenProp'),
            invalidFormStateProp: t('register.components.formStep.console.invalidFormStateProp'),
            missingNavigationHandlers: t('register.components.formStep.console.missingNavigationHandlers'),
            invalidOnSubmitProp: t('register.components.formStep.console.invalidOnSubmitProp'),
            validationOrProceedError: t('register.components.formStep.console.validationOrProceedError'),
        },
        themeColorDefault: t('payments.components.planSelection.themeColorDefault'),
        // TOTAL_FORM_STEPS might be better configured globally or passed as a prop if it's dynamic,
        // but if it's truly fixed for this form context, it can be a constant.
        // For i18n, if "Step X of Y" needs different phrasing per language, the whole string might need localization.
    },

    imageUploader: {
        dropzone: {
            ctaActive: t('register.components.imageUploader.dropzone.ctaActive'),
            ctaDefault: t('register.components.imageUploader.dropzone.ctaDefault'), // Placeholder for clickable part
            clickToUploadText: t('register.components.imageUploader.dropzone.clickToUploadText'), // Text for the clickable part of ctaDefault
            fileTypes: t('register.components.imageUploader.dropzone.fileTypes'), // Placeholder for max size
        },
        cropper: {
            title: t('register.components.imageUploader.cropper.title'),
            buttons: {
                applyCrop: t('register.components.imageUploader.cropper.buttons.applyCrop'),
                processing: t('payments.components.planSelection.buttons.processing'),
                resetCrop: t('register.components.imageUploader.cropper.buttons.resetCrop'), // When initialSrc is being re-cropped
                changeImage: t('register.components.imageUploader.cropper.buttons.changeImage'), // When a new file was uploaded
            },
        },
        preview: {
            title: t('register.components.imageUploader.preview.title'), // Or "Current Logo:" if context known
            uploadNew: t('register.components.imageUploader.preview.uploadNew'),
        },
        errors: {
            fileTooLarge: t('register.components.imageUploader.errors.fileTooLarge'),
            invalidFileType: t('register.components.imageUploader.errors.invalidFileType'),
            fileNotAccepted: t('register.components.imageUploader.errors.fileNotAccepted'),
            errorReadingFile: t('register.components.imageUploader.errors.errorReadingFile'),
            cropSaveError: t('register.components.imageUploader.errors.cropSaveError'),
            canvasContextError: t('register.components.imageUploader.errors.canvasContextError'),
            blobCreationError: t('register.components.imageUploader.errors.blobCreationError'),
            handlerMissing: t('register.components.imageUploader.errors.handlerMissing'), // For prop validation
        },
        console: {
            invalidOnImageUploadProp: t('register.components.imageUploader.console.invalidOnImageUploadProp'),
            initialSrcWarning: t('register.components.imageUploader.console.initialSrcWarning'),
        },
        themeColorDefault: t('payments.components.planSelection.themeColorDefault'),
    },

    trustFooter: {
        securityMessage: t('register.components.trustFooter.securityMessage'),
        links: {
            privacyPolicy: t('register.steps.step4Preferences.linkText.privacyPolicy'),
            termsOfUse: t('register.components.trustFooter.links.termsOfUse'), // Or "Terms of Service" depending on naming convention
        },
        copyright: t('register.components.trustFooter.copyright'), // Placeholders for dynamic values
        // Default values, if needed for props, can also be here.
        // Example: themeColorDefault: "rose"
        // Default URLs are usually app config, not i18n, but could be if regional sites differ.
    },
};

