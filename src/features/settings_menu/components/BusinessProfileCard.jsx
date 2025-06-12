import React from 'react';

// Internal Hooks
import { useBusinessDetails } from '../hooks/useBusinessDetails';
import { useBusinessProfileForm } from '../hooks/useBusinessProfileForm';

// Reusable Components
import { ImageUploader } from '../../register/subcomponents';
import Step1LocationWrapper from '../../register/stages/Step1Location';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A self-contained "glass card" for managing the active business's profile.
 * It combines business details, logo upload, and location settings into a single,
 * unified interface, powered by a custom form management hook.
 */
const BusinessProfileCard = () => {
    // --- Data Fetching ---
    const { data: businessData, isLoading: isLoadingDetails, isError } = useBusinessDetails();

    // --- Form State & Logic ---
    const {
        formData,
        setFormData,
        updateField,
        setLogoFile,
        isDirty,
        isLoading: isSaving,
        handleSaveChanges,
    } = useBusinessProfileForm(businessData);

    // --- Render Logic ---
    if (isLoadingDetails) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-4xl bg-white/10 p-8 text-center backdrop-blur-xl">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError || !formData) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-4xl bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl">
                <p>{sl.businessProfileCard.toastError || 'Failed to load business profile.'}</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat">
            {/* Header */}
            <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    {sl.businessProfileCard.title || 'Business Profile'}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {sl.businessProfileCard.subtitle || "Manage your business's public information and location settings."}
                </p>
            </header>

            {/* Content Body */}
            <div className="p-6 md:p-8 space-y-12">
                {/* Section: Business Details */}
                <section>
                    <h4 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-6">{sl.businessProfileCard.sectionTitleDetails || 'Business Details'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <InputField id="name" label={sl.businessProfileCard.labelBusinessName || "Business Name"} value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
                        <InputField id="website" label={sl.businessProfileCard.labelWebsite || "Website"} value={formData.website} onChange={(e) => updateField('website', e.target.value)} placeholder={sl.businessProfileCard.placeholderWebsite || "https://yourbusiness.com"} />
                        <InputField id="phone" label={sl.businessProfileCard.labelPhone || "Public Phone Number"} type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                        <div className="md:col-span-2">
                            <InputField id="description" label={sl.businessProfileCard.labelDescription || "Business Description"} type="textarea" value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows={4} />
                        </div>
                    </div>
                </section>

                <hr className="border-white/10 dark:border-neutral-700" />

                {/* Section: Business Logo */}
                <section>
                    <h4 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-6">{sl.businessProfileCard.sectionTitleLogo || 'Business Logo'}</h4>
                    <div className="flex justify-center">
                        <ImageUploader
                            initialSrc={businessData.logo_url}
                            onImageUpload={setLogoFile}
                            circularCrop={false}
                            aspectRatio={16 / 9}
                        />
                    </div>
                </section>

                <hr className="border-white/10 dark:border-neutral-700" />

                {/* Section: Location & Address */}
                <section>
                    <h4 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-6">{sl.businessProfileCard.sectionTitleLocation || 'Location & Address'}</h4>
                    <Step1LocationWrapper
                        formData={formData}
                        updateField={updateField}
                        setFormData={setFormData} // Pass setFormData for complex updates from the map component
                    />
                </section>
            </div>

            {/* Footer */}
            <footer className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-4xl flex justify-end">
                <Button
                    onClick={handleSaveChanges}
                    isLoading={isSaving}
                    disabled={!isDirty || isSaving}
                >
                    {isSaving ? sl.businessProfileCard.savingButton || 'Saving...' : sl.businessProfileCard.saveButton || 'Save Changes'}
                </Button>
            </footer>
        </div>
    );
};

export default BusinessProfileCard;