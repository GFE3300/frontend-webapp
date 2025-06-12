import React, { useState, useCallback } from 'react';
import { useChangePassword } from '../hooks/useChangePassword';
import { getErrorMessage } from '../../../utils/getErrorMessage';

// UI Component Imports
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { PasswordStrength } from '../../register/subcomponents';

// i18n
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';

/**
 * A self-contained card for managing user password changes.
 * It handles its own form state, client-side validation, and the
 * API mutation for changing the password, providing clear feedback
 * to the user at every step.
 */
const PasswordSecurityCard = () => {
    // --- State Management ---
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    // Client-side error state for immediate feedback
    const [clientError, setClientError] = useState('');

    // --- Hooks & Mutations ---
    const clearForm = useCallback(() => {
        setOldPassword('');
        setNewPassword1('');
        setNewPassword2('');
        setClientError('');
    }, []);

    const changePasswordMutation = useChangePassword({
        // On successful API call, clear all sensitive data from the form.
        onSuccess: clearForm,
    });

    // --- Handlers ---
    const handleSaveChanges = () => {
        // 1. Clear previous errors before new validation attempt.
        setClientError('');
        if (changePasswordMutation.isError) {
            changePasswordMutation.reset();
        }

        // 2. Perform client-side validation first.
        if (!oldPassword || !newPassword1 || !newPassword2) {
            setClientError(sl.passwordSecurityCard.errorAllFieldsRequired || "All password fields are required.");
            return;
        }
        if (newPassword1.length < 8) {
            setClientError(sl.passwordSecurityCard.errorMinLength || "New password must be at least 8 characters long.");
            return;
        }
        if (newPassword1 !== newPassword2) {
            setClientError(sl.passwordSecurityCard.errorMismatch || "The new passwords do not match.");
            return;
        }
        if (oldPassword === newPassword1) {
            setClientError(sl.passwordSecurityCard.errorSameAsOld || "The new password cannot be the same as the old password.");
            return;
        }

        // 3. If client-side validation passes, trigger the mutation.
        changePasswordMutation.mutate({
            old_password: oldPassword,
            new_password1: newPassword1,
            new_password2: newPassword2
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSaveChanges();
    };

    // --- Derived State ---
    // Combine client-side and server-side errors for the UI.
    const combinedError = clientError || getErrorMessage(changePasswordMutation.error, '');

    // Simple password strength logic for the UI component
    const getPasswordStrength = (password) => {
        if (!password) return null;
        if (password.length < 8) return 'weak';
        if (password.length < 12) return 'fair';
        return 'strong';
    };

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat">
            <form onSubmit={handleSubmit} noValidate>
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                    <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                        {sl.passwordSecurityCard.title || 'Password & Security'}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {sl.passwordSecurityCard.subtitle || 'Update your password for enhanced account security.'}
                    </p>
                </div>
                {/* Content Section */}
                <div className="p-6 md:p-8">
                    <div className='pt-6 space-y-12'>
                        <InputField
                            id="oldPassword"
                            label={sl.passwordSecurityCard.labelCurrentPassword || "Current Password"}
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <InputField
                            id="newPassword1"
                            label={sl.passwordSecurityCard.labelNewPassword || "New Password"}
                            type="password"
                            value={newPassword1}
                            onChange={(e) => setNewPassword1(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                        <PasswordStrength strength={getPasswordStrength(newPassword1)} />
                        <InputField
                            id="newPassword2"
                            label={sl.passwordSecurityCard.labelConfirmNewPassword || "Confirm New Password"}
                            type="password"
                            value={newPassword2}
                            onChange={(e) => setNewPassword2(e.target.value)}
                            autoComplete="new-password"
                            required
                            error={combinedError}
                        />
                    </div>
                </div>
                {/* Footer Section */}
                <div className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-4xl flex justify-end">
                    <Button
                        type="submit"
                        isLoading={changePasswordMutation.isPending}
                        disabled={changePasswordMutation.isPending}
                    >
                        {sl.passwordSecurityCard.changePasswordButton || 'Change Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PasswordSecurityCard;