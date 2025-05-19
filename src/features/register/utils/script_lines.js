import { Dropdown } from "../subcomponents";

export const scriptLines_useFormState = {
    // Console Log Messages
    log: {
        failedToParseSessionStorage: "useFormState: Failed to parse state from session storage:",
        failedToSaveSessionStorage: "useFormState: Failed to save state to session storage:",
    },

    // Validation Messages - Step 0: Business Information
    validation: {
        businessNameRequired: "Business name is required.",
        emailInvalid: "Invalid email format.", // Reusable for other email fields
        businessEmailRequired: "Business email is required.",
        businessUsernameInvalidFormat: "Username can only contain letters, numbers, and underscores.",
        businessUsernameRequired: "Username is required.",
        businessPhoneRequired: "Business phone number is required.",
        businessTagsMin: "Please select at least one business tag.",
        businessWebsiteInvalidUrl: "Please enter a valid URL (e.g., https://example.com).nullable()", // As per original, unusual message

        // Validation Messages - Step 1: Business Location
        locationRequiredOnMap: "Location is required. Please select on map.", // Used for both .required and .typeError
        addressStreetRequired: "Street address is required.",
        addressCityRequired: "City is required.",
        addressPostalCodeRequired: "Postal code is required.",
        addressCountryRequired: "Country is required.",
        addressDetailsRequired: "Address details are required.", // Used for both .required and .typeError

        // Validation Messages - Step 2: Business Logo (Strings for commented-out validations)
        logoFileSizeTooLarge: "Logo file is too large (max 5MB).",
        logoFileTypeUnsupported: "Unsupported logo format (PNG, JPG, GIF, WEBP).",

        // Validation Messages - Step 3: Your Profile
        profileNameRequired: "Your full name is required.",
        // validation.emailInvalid is reused here
        profileEmailRequired: "Your contact email is required.",
        profilePhoneRequired: "Your contact phone number is required.",
        passwordMinLength: "Password must be at least 8 characters.",
        passwordRequiresUppercase: "Password must contain an uppercase letter.",
        passwordRequiresLowercase: "Password must contain a lowercase letter.",
        passwordRequiresNumber: "Password must contain a number.",
        passwordRequiresSpecialChar: "Password must contain a special character.",
        passwordRequired: "Password is required.",
        confirmPasswordMatch: "Passwords must match.",
        confirmPasswordRequired: "Please confirm your password.",

        // Validation Messages - Step 4: Preferences
        timezoneRequired: "Timezone selection is required.",
        currencyRequired: "Currency selection is required.",
        languageRequired: "Language selection is required.",
        acceptTermsRequired: "You must accept the Terms of Service and Privacy Policy.",

        // Validation Messages - Step 5: Profile Image (Strings for commented-out validations)
        profileImageFileSizeTooLarge: "Profile image is too large (max 5MB).",
        profileImageFileTypeUnsupported: "Unsupported image format.",
    },

    // General Error Messages for Steps
    error: {
        form: {
            correctErrorsInStep: "Please correct the errors in step {stepNumber}.", // Placeholder for step number
            correctErrorsInStepTitleCase: "Please correct errors in Step {stepNumber}.", // Placeholder, different casing
        }
    },

    // Password Strength Indicator Values
    // These are values returned by the hook. If displayed, they are now localized.
    // If they are keys for further lookup in a full i18n system, this structure would change.
    passwordStrength: {
        weak: "weak",
        fair: "fair",
        strong: "strong",
    },
};

export const scriptLines_AddressForm = {

    // NEW: AddressForm Component Strings
    addressForm: {
        label: {
            streetAddress: "Street Address",
            city: "City",
            postalCode: "Postal Code",
            country: "Country",
        },
        error: {
            placesImportFailed: "Places import failed", // Console error
            countryAutocompleteError: "Country autocomplete error", // Console error
        },
        // Localized names for the static fallback country list
        staticCountries: {
            US: "United States",
            ES: "Spain",
            FR: "France",
            DE: "Germany",
            IT: "Italy",
            GB: "United Kingdom",
            CA: "Canada",
            PT: "Portugal",
            AU: "Australia",
            BR: "Brazil",
            JP: "Japan",
            IN: "India",
            MX: "Mexico",
            CN: "China",
            RU: "Russia",
            ZA: "South Africa",
        }
    },
};

export const scriptLines_Header = {
    // Console Log Messages (from previous task)
    log: {
        failedToParseSessionStorage: "useFormState: Failed to parse state from session storage:",
        failedToSaveSessionStorage: "useFormState: Failed to save state to session storage:",
    },

    // Validation Messages (from previous task)
    validation: {
        // ... existing validation messages from useFormState ...
        businessNameRequired: "Business name is required.",
        emailInvalid: "Invalid email format.",
        businessEmailRequired: "Business email is required.",
        businessUsernameInvalidFormat: "Username can only contain letters, numbers, and underscores.",
        businessUsernameRequired: "Username is required.",
        businessPhoneRequired: "Business phone number is required.",
        businessTagsMin: "Please select at least one business tag.",
        businessWebsiteInvalidUrl: "Please enter a valid URL (e.g., https://example.com).nullable()",
        locationRequiredOnMap: "Location is required. Please select on map.",
        addressStreetRequired: "Street address is required.",
        addressCityRequired: "City is required.",
        addressPostalCodeRequired: "Postal code is required.",
        addressCountryRequired: "Country is required.",
        addressDetailsRequired: "Address details are required.",
        logoFileSizeTooLarge: "Logo file is too large (max 5MB).",
        logoFileTypeUnsupported: "Unsupported logo format (PNG, JPG, GIF, WEBP).",
        profileNameRequired: "Your full name is required.",
        profileEmailRequired: "Your contact email is required.",
        profilePhoneRequired: "Your contact phone number is required.",
        passwordMinLength: "Password must be at least 8 characters.",
        passwordRequiresUppercase: "Password must contain an uppercase letter.",
        passwordRequiresLowercase: "Password must contain a lowercase letter.",
        passwordRequiresNumber: "Password must contain a number.",
        passwordRequiresSpecialChar: "Password must contain a special character.",
        passwordRequired: "Password is required.",
        confirmPasswordMatch: "Passwords must match.",
        confirmPasswordRequired: "Please confirm your password.",
        timezoneRequired: "Timezone selection is required.",
        currencyRequired: "Currency selection is required.",
        languageRequired: "Language selection is required.",
        acceptTermsRequired: "You must accept the Terms of Service and Privacy Policy.",
        profileImageFileSizeTooLarge: "Profile image is too large (max 5MB).",
        profileImageFileTypeUnsupported: "Unsupported image format.",
    },

    // General Error Messages for Steps (from previous task)
    error: {
        form: {
            correctErrorsInStep: "Please correct the errors in step {stepNumber}.",
            correctErrorsInStepTitleCase: "Please correct errors in Step {stepNumber}.",
        }
    },

    // Password Strength Indicator Values (from previous task)
    passwordStrength: {
        weak: "weak",
        fair: "fair",
        strong: "strong",
    },

    // AddressForm Component Strings (from previous task)
    addressForm: {
        label: {
            streetAddress: "Street Address",
            city: "City",
            postalCode: "Postal Code",
            country: "Country",
        },
        error: {
            placesImportFailed: "Places import failed",
            countryAutocompleteError: "Country autocomplete error",
        },
        staticCountries: {
            US: "United States",
            ES: "Spain",
            FR: "France",
            DE: "Germany",
            IT: "Italy",
            GB: "United Kingdom",
            CA: "Canada",
            PT: "Portugal",
            AU: "Australia",
            BR: "Brazil",
            JP: "Japan",
            IN: "India",
            MX: "Mexico",
            CN: "China",
            RU: "Russia",
            ZA: "South Africa",
        }
    },

    autocompleteInput: {
        label: {
            autoComplete: "Auto Complete", // Label for the input field
        },
        placeholder: {
            quickerSearch: "Here it is quicker...", // Placeholder text for the input
        },
        status: {
            findingLocations: "Finding fresh locations...", // Loading message
            noResults: "No fresh bakes found...",          // Message when no suggestions are found
        },
        error: {
            placesLibraryLoadFailed: "Places library load failed", // Console error
            autocompleteError: "Autocomplete error",                // Console error
            noMatchingAddresses: "Could not find matching addresses", // Error message displayed to user
        }
    },

    // NEW: GeolocationButton Component Strings
    geolocationButton: {
        label: {
            useMyLocation: "Use my location", // Default button label and tooltip text
        },
        aria: {
            locating: "Locating...", // ARIA label when loading
        },
        error: {
            notSupported: "Geolocation is not supported by your browser",
            permissionDenied: "Enable location access in your browser",
            unableToDetermine: "Unable to determine your location",
        }
    },
};

export const scriptLines_Steps = {

    step0BusinessInfo: {
        errors: {
            formDataMissing: "Error: Form data is missing for this step.",
            updateFieldMissing: "Error: Form update mechanism is missing.",
        },
        console: {
            invalidFormDataProp: "Step0BusinessInfo: Invalid `formData` prop. Expected an object.",
            invalidUpdateFieldProp: "Step0BusinessInfo: Invalid `updateField` prop. Expected a function.",
            invalidErrorsProp: "Step0BusinessInfo: Invalid `errors` prop. Expected an object or undefined.",
        },
        label: {
            businessName: "Business Name",
            businessUsername: "Business Username",
            businessEmail: "Business Email",
            businessPhone: "Business Phone",
            businessWebsiteOptional: "Business Website (Optional)",
            businessTags: "Business Tags (Describe your business)",
        },
        placeholder: {
            businessName: "e.g. The Artisan Corner",
            businessUsername: "e.g. @artisancorner",
            businessEmail: "e.g. contact@artisancorner.com",
            businessPhone: "e.g. +1 (555) 123-4567",
            businessWebsite: "e.g. https://artisancorner.com",
            businessTags: "Type and press Enter (e.g., Cafe, Handmade)",
        },
        helptext: {
            businessTags: "Select up to 7 tags that best describe your business.",
        },
        /**
         * @constant {string[]} defaultBusinessTags
         * A predefined list of suggested tags to help users categorize their business.
         * These are provided as an array for direct use. For more granular translation or
         * if tags need to be contextually different, each tag could be its own key.
         */
        defaultBusinessTags: [
            // General Types
            'Restaurant', 'Cafe', 'Retail', 'Service', 'Bakery', 'Bar', 'Grocery', 'Catering',
            // Food Specific
            'Vegan', 'Gluten-Free', 'Organic', 'Local Sourcing', 'Coffee Shop', 'Juice Bar', 'Food Truck', 'Pizzeria',
            // Attributes
            'Family-Owned', 'Online Only', 'Appointment Only', 'Sustainable', 'Luxury', 'Budget-Friendly', 'Pet-Friendly'
        ]
    },

    locationStage: {
        label: {
            mapLocation: "Location", // Label for the map section
        },
        // No other direct text strings were found in LocationStage.jsx.
        // AutocompleteInput, GeolocationButton, and AddressForm have their own localized strings.
    },

    step2BusinessLogo: {
        title: "Upload Your Business Logo",
        description: "Your logo is key to your brand identity. Please upload a clear image. We recommend a square logo or one that crops well into a square.",
        errors: {
            formDataUnavailable: "Error: Form data is unavailable for the business logo step.",
            updateMechanismImproperlyConfigured: "Error: Form update mechanism is improperly configured.",
        },
        console: {
            invalidFormDataProp: "Step2BusinessLogo: Invalid `formData` prop. Expected an object.",
            invalidUpdateFieldProp: "Step2BusinessLogo: Invalid `updateField` prop. Expected a function.",
            invalidErrorsProp: "Step2BusinessLogo: Invalid `errors` prop. Expected an object or undefined. Error display might be affected.",
        },
        themeColorDefault: "rose"
    },

    step3Profile: {
        label: {
            fullName: "Your Full Name",
            lastName: "Your Full Last Name",
            roleAtBusiness: "Your Role/Title at Business",
            contactEmail: "Contact Email",
            contactPhone: "Contact Phone Number",
            createPassword: "Create Password",
            confirmPassword: "Confirm Password",
        },
        placeholder: {
            firstName: "e.g. Alex", // Assuming "Your Full Name" is for first name
            lastName: "e.g. Johnson",
            role: "e.g. Owner, Manager, Chef",
            contactEmail: "e.g. alex.johnson@example.com",
            contactPhone: "(555) 123-4567",
            passwordMinChars: "Minimum 8 characters",
            confirmPassword: "Re-enter your password",
        },
        aria: {
            hidePassword: "Hide password",
            showPassword: "Show password",
        },
        errors: {
            formDataMissing: "Error: Form data is missing for this step.",
            updateMechanismMissing: "Error: Form update mechanism is missing.",
            passwordStrengthMissing: "Error: Password strength information is missing.",
            passwordVisibilityControlMissing: "Error: Password visibility control is missing.",
        },
        console: {
            invalidFormDataProp: "Step3Profile: Invalid `formData` prop. Expected an object.", // Note: Original log used Step2Profile
            invalidUpdateFieldProp: "Step3Profile: Invalid `updateField` prop. Expected a function.",
            invalidPasswordStrengthProp: "Step3Profile: Invalid or missing `passwordStrength` prop. Expected a string.",
            invalidPasswordVisibilityProps: "Step3Profile: Invalid or missing password visibility props (`showPassword`, `setShowPassword`).",
        },
        // Note: The password strength indicator ('weak', 'fair', 'strong') itself
        // is likely localized in the PasswordStrength subcomponent or useFormState.
        // If PasswordStrength subcomponent expects localized strings for these,
        // they would be passed as props.
    },

    step4Preferences: {
        label: {
            timezone: "Timezone",
            preferredNotificationMethod: "Preferred Notification Method",
            primaryCurrency: "Primary Currency",
            preferredDailySummaryTimeOptional: "Preferred Daily Summary Time (Optional)",
            preferredLanguage: "Preferred Language",
            referralSourcesOptional: "How did you hear about us? (Optional)",
            acceptTerms: "I acknowledge and agree to the {termsLink} and the {privacyLink}.", // Placeholders for links
        },
        placeholder: {
            selectTimezone: "Select your timezone",
            selectNotificationChannel: "Select notification channel",
            selectCurrency: "Select your currency",
            referralSources: "e.g., Friend, Social Media, Advertisement",
        },
        helptext: {
            dailySummaryTime: "Set a time to receive daily summaries, if applicable.",
            referralSources: "Let us know how you found us!",
        },
        linkText: {
            termsOfService: "Terms of Service",
            privacyPolicy: "Privacy Policy",
        },
        options: {
            timezones: [ // These labels are user-facing and should be translated.
                { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
                { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
                { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
                { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
                { value: 'America/Sao_Paulo', label: 'America/Sao Paulo (BRT/BRST)' },
                { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
                { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
                { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
                { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK)' },
                { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
                { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
                { value: 'Australia/Perth', label: 'Australia/Perth (AWST)' },
                { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' },
                { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
                { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
            ],
            notificationMethods: [
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS (Text Message)' },
                { value: 'push', label: 'Push Notification' },
                { value: 'none', label: 'None' }
            ],
            currencies: [
                { value: 'USD', label: 'USD - United States Dollar' },
                { value: 'EUR', label: 'EUR - Euro' },
                { value: 'GBP', label: 'GBP - British Pound Sterling' },
                { value: 'JPY', label: 'JPY - Japanese Yen' },
                { value: 'CAD', label: 'CAD - Canadian Dollar' },
                { value: 'AUD', label: 'AUD - Australian Dollar' },
                { value: 'CHF', label: 'CHF - Swiss Franc' },
            ],
            languages: [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español (Spanish)' },
                { value: 'fr', label: 'Français (French)' },
                { value: 'de', label: 'Deutsch (German)' },
                { value: 'it', label: 'Italiano (Italian)' },
                { value: 'pt', label: 'Português (Portuguese)' },
                { value: 'zh-CN', label: '简体中文 (Simplified Chinese)' },
                { value: 'ja', label: '日本語 (Japanese)' },
                { value: 'ko', label: '한국어 (Korean)' },
                { value: 'ru', label: 'Русский (Russian)' },
                { value: 'ar', label: 'العربية (Arabic)' },
                { value: 'hi', label: 'हिन्दी (Hindi)' },
            ],
        },
        errors: {
            formDataMissing: "Error: Form data is missing for preferences.",
            updateMechanismMissing: "Error: Form update mechanism is missing.",
        },
        console: {
            invalidFormDataProp: "Step4Preferences: Invalid `formData` prop. Expected an object.",
            invalidUpdateFieldProp: "Step4Preferences: Invalid `updateField` prop. Expected a function.",
            invalidErrorsProp: "Step4Preferences: Invalid `errors` prop. Expected an object or undefined.",
        }
    },

    step5ProfileImage: {
        title: "Set Your Profile Picture",
        description: "A clear and friendly profile picture helps build trust and recognition. Choose an image that represents your personality and is visually appealing.",
        errors: { // User-facing error messages for prop validation failures
            formDataUnavailable: "Error: Form data is unavailable for the profile image step.",
            updateMechanismImproperlyConfigured: "Error: Form update mechanism is improperly configured.",
        },
        console: { // Internal console messages for developers
            invalidFormDataProp: "Step5ProfileImage: Invalid `formData` prop. Expected an object.",
            invalidUpdateFieldProp: "Step5ProfileImage: Invalid `updateField` prop. Expected a function.",
            invalidErrorsProp: "Step5ProfileImage: Invalid `errors` prop. Expected an object or undefined. Error display might be affected.",
        },
        themeColorDefault: "rose" // Default theme color, can be localized if needed for specific themes per language
    },
};

export const scriptLines_Components = {

    planSelection: {
        title: "Unlock Your Potential",
        subtitle: "You're one step away! Choose the plan that aligns with your ambition and let's start baking success together.",
        footerNote: "All plans are billed monthly or annually. You can upgrade, downgrade, or cancel your plan at any time from your account settings.",
        buttons: {
            chooseThisPlan: "Choose This Plan",
            processing: "Processing...",
            planSelected: "Plan Selected!",
        },
        badges: {
            mostPopular: "Most Popular",
            recommended: "Recommended", // Fallback if plan.badgeText is not set for a highlighted plan
            specialOffer: "SPECIAL OFFER", // Default for discount badge if not specified in plan data
        },
        errors: {
            functionalityUnavailable: "Error: Plan selection functionality is unavailable.",
        },
        console: {
            invalidOnPlanSelectProp: "PlanSelection: Invalid `onPlanSelect` prop. Expected a function.",
        },
        themeColorDefault: "rose", // Default theme color if not provided

        // Plan Data - This is the most complex part for i18n.
        // Each plan's name, description, features, whyThisPlan, etc., needs to be localizable.
        // The structure below mirrors PLANS_DATA from the component.
        plans: [
            {
                id: 'basic', // Keep ID static for logic
                name: 'The First Batch',
                price: '29.99', // Price might be handled differently if currency formatting is complex
                frequency: '/month',
                description: ['Perfect for solo and micro-shops.', 'Get up and running fast with essential order & inventory tools.'],
                features: [
                    { text: 'Unlimited Orders' }, // `check` boolean is logic, not text
                    { text: 'Menu-Style Order Entry' },
                    { text: 'Live Low-Stock Alerts' },
                    { text: 'Basic Consumption Charts' },
                    { text: 'Email Support (48 hr response)' }, // Note: "48 hr" might need specific localization
                    { text: 'Advanced Forecasting' },
                    { text: 'Custom Feature Requests' },
                    { text: 'Dedicated Account Manager' }
                ],
                iconName: 'bolt', // Icon name is usually not localized
                whyThisPlan: 'Lightweight, powerful, and cost-effective—First Batch gives independent bakers core tools to manage orders, track key ingredients, and see basic usage trends. Ideal if you’re just starting or run a very small operation.',
                // Theme related properties are typically not part of i18n text strings.
                // highlight and discount.isActive are also logic.
            },
            {
                id: 'standard',
                name: 'The Artisan Oven',
                price: '49.99',
                frequency: '/month',
                description: ['For growing businesses ready to scale.', 'All-in-one order management + deep insights to optimize and grow.'],
                features: [
                    { text: 'Everything in First Batch' },
                    { text: 'Advanced Cost & Consumption Forecasts' },
                    { text: 'Monthly Performance Reports' },
                    { text: 'Multi-Location Support (2 shops)' }, // "2 shops" might need localization
                    { text: 'Priority Email & Chat Support' },
                    { text: 'Access to Beta Features' },
                    { text: 'Dedicated Account Manager' },
                    { text: 'Custom Integrations' }
                ],
                iconName: 'mode_heat',
                whyThisPlan: 'You’re beyond the basics—now you need real data to plan purchases, optimize recipes, orders, and spot sales trends. Artisan Oven brings forecasting, polished reports, and faster support so you bake bigger profits and expand efficiently.',
                badgeText: "Most Popular", // This specific badge text can be localized here
                discount: {
                    offerTitle: 'First Month FREE!',
                    displayPrice: '0.00', // Could be part of plan data or dynamically generated
                    priceSuffix: '/first month',
                    originalPriceText: '$49.99/month', // Strikethrough text
                    details: 'Then $49.99/month. Renews automatically, cancel anytime.',
                    badgeText: 'SPECIAL OFFER', // Can override the default 'SPECIAL OFFER'
                }
            },
            {
                id: 'premium',
                name: 'Master Baker Suite',
                price: '99.99',
                frequency: '/month',
                description: ['For established bakeries that demand excellence.', 'Full-featured, white-glove service, and limitless scalability.'],
                features: [
                    { text: 'Everything in Artisan Oven, plus:' },
                    { text: 'Unlimited Locations & Team Users' },
                    { text: 'Personalized Onboarding & Training' },
                    { text: 'Custom Feature Roadmap Input' },
                    { text: '24/7 Priority Phone & Emergency Support' }, // "24/7" might need localization
                    { text: 'Bespoke API & System Integrations' },
                    { text: 'SLA-backed Uptime & Performance' }
                ],
                iconName: 'verified',
                whyThisPlan: 'If you’re running multiple sites, handling high order volume, or need bespoke workflows—Master Baker is your all-inclusive suite, complete with real-time SLAs, hands-on training, and a dedicated team that evolves the app around your unique needs.',
            }
        ]
    },

    Dropdown: {
        line1: 'No options available.',
    },

    formStep: {
        progress: {
            step: "Step", // e.g., "Step 1"
            of: "of",     // e.g., "of 6"
        },
        buttons: {
            back: "Back",
            continue: "Continue",
            submitting: "Submitting...",
            completeRegistration: "Complete Registration",
        },
        errors: { // User-facing error messages for prop validation failures
            stepConfigurationInvalid: "Error: Step configuration is invalid.",
            stepContentMissing: "Error: Step content is missing.",
            formContextUnavailable: "Error: Form context is unavailable.",
            navigationHandlersMissing: "Error: Navigation handlers are missing.",
            unexpectedError: "An unexpected error occurred. Please try again.", // Generic fallback error
        },
        console: { // Internal console messages for developers
            invalidStepIndexProp: "FormStep: Invalid `stepIndex` prop. Expected a non-negative number.",
            invalidTitleProp: "FormStep: Invalid or missing `title` prop. Expected a string.",
            missingChildrenProp: "FormStep: Missing `children` prop.",
            invalidFormStateProp: "FormStep: Invalid or missing `formState` prop or `formState.validateStep` function.",
            missingNavigationHandlers: "FormStep: Missing `onProceed` or `onBack` prop. Expected functions.",
            invalidOnSubmitProp: "FormStep: `onSubmit` prop provided for final step but is not a function. `onProceed` will be used.",
            validationOrProceedError: "FormStep: Error during step validation or proceeding:",
        },
        themeColorDefault: "rose",
        // TOTAL_FORM_STEPS might be better configured globally or passed as a prop if it's dynamic,
        // but if it's truly fixed for this form context, it can be a constant.
        // For i18n, if "Step X of Y" needs different phrasing per language, the whole string might need localization.
    },

    imageUploader: {
        dropzone: {
            ctaActive: "Drop image here!",
            ctaDefault: "<span class='font-bold'>{clickToUpload}</span> or drag & drop", // Placeholder for clickable part
            clickToUploadText: "Click to upload", // Text for the clickable part of ctaDefault
            fileTypes: "PNG, JPG, GIF, WEBP up to {maxFileSizeMB}MB", // Placeholder for max size
        },
        cropper: {
            title: "Adjust Your Image",
            buttons: {
                applyCrop: "Apply Crop",
                processing: "Processing...",
                resetCrop: "Reset Crop", // When initialSrc is being re-cropped
                changeImage: "Change Image", // When a new file was uploaded
            },
        },
        preview: {
            title: "Current Profile Image:", // Or "Current Logo:" if context known
            uploadNew: "Upload new image?",
        },
        errors: {
            fileTooLarge: "File is too large. Max size: {maxFileSizeMB}MB.",
            invalidFileType: "Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP).",
            fileNotAccepted: "File could not be accepted. Please try again.",
            errorReadingFile: "Error reading file.",
            cropSaveError: "Could not save crop. Please select a valid area.",
            canvasContextError: "Failed to process image. Canvas context not available.",
            blobCreationError: "Failed to create image blob. Please try again.",
            handlerMissing: "Error: Image upload handler is missing.", // For prop validation
        },
        console: {
            invalidOnImageUploadProp: "ImageUploader: Invalid `onImageUpload` prop. Expected a function.",
            initialSrcWarning: "ImageUploader: initialSrc prop does not appear to be a valid image URL or data URL.",
        },
        themeColorDefault: "rose",
    },

    trustFooter: {
        securityMessage: "Your information is secure. We prioritize your privacy and data protection.",
        links: {
            privacyPolicy: "Privacy Policy",
            termsOfUse: "Terms of Use", // Or "Terms of Service" depending on naming convention
        },
        copyright: "© {year} {companyName}. All rights reserved.", // Placeholders for dynamic values
        // Default values, if needed for props, can also be here.
        // Example: themeColorDefault: "rose"
        // Default URLs are usually app config, not i18n, but could be if regional sites differ.
    },
};

