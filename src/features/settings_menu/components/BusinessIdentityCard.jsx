import React from 'react';
import PropTypes from 'prop-types';

// Reusable Components
import ProfileImageUploader from './ProfileImageUploader';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A self-contained "glass card" for managing the business's identity.
 * It handles the business name, contact info, description, and logo.
 * All logic is driven by props from a higher-level form management hook.
 */
const BusinessIdentityCard = ({
    formData,
    updateField,
    setLogoFile,
    isDirty,
    isLoading,
    handleSaveChanges,
    initialLogoUrl,
}) => {
    return (
        <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat">
            {/* Header */}
            <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    {sl.businessProfileCard.title || 'Business Identity'}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {sl.businessProfileCard.subtitle || "Manage your business's public information and location settings."}
                </p>
            </header>

            {/* Content Body */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col items-center pt-6">
                    <ProfileImageUploader
                        initialSrc={initialLogoUrl}
                        onImageUpload={setLogoFile}
                    />
                </div>

                <div className="lg:col-span-2 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-6">
                    <div className="sm:col-span-2">
                        <InputField
                            id="name"
                            label={sl.businessProfileCard.labelBusinessName || 'Business Name'}
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <InputField
                        id="website"
                        label={sl.businessProfileCard.labelWebsite || 'Website'}
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        placeholder={sl.businessProfileCard.placeholderWebsite || "https://yourbusiness.com"}
                        disabled={isLoading}
                    />
                    <InputField
                        id="phone"
                        label={sl.businessProfileCard.labelPhone || 'Public Phone Number'}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="sm:col-span-2">
                        <InputField
                            id="description"
                            label={sl.businessProfileCard.labelDescription || 'Business Description'}
                            type="textarea"
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={4}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-4xl flex justify-end">
                <Button
                    onClick={handleSaveChanges}
                    isLoading={isLoading}
                    disabled={!isDirty || isLoading}
                >
                    {isLoading ? (sl.businessProfileCard.savingButton || 'Saving...') : (sl.businessProfileCard.saveButton || 'Save Changes')}
                </Button>
            </footer>
        </div>
    );
};

BusinessIdentityCard.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    setLogoFile: PropTypes.func.isRequired,
    isDirty: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    handleSaveChanges: PropTypes.func.isRequired,
    initialLogoUrl: PropTypes.string,
};

export default BusinessIdentityCard;