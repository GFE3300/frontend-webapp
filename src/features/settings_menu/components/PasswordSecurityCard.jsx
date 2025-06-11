import React, { useState, useCallback } from 'react';
import { useChangePassword } from '../hooks/useChangePassword';

// UI Component Imports
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import { PasswordStrength } from '../../register/subcomponents/PasswordStrength';

const PasswordSecurityCard = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const clearForm = useCallback(() => {
        setOldPassword('');
        setNewPassword1('');
        setNewPassword2('');
        setPasswordError('');
    }, []);

    const changePasswordMutation = useChangePassword({
        onSuccess: clearForm
    });

    const handleSaveChanges = () => {
        setPasswordError(''); // Clear previous errors

        if (!newPassword1 || !newPassword2 || !oldPassword) {
            setPasswordError("All password fields are required.");
            return;
        }

        if (newPassword1 !== newPassword2) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        if (oldPassword === newPassword1) {
            setPasswordError("The new password cannot be the same as the old password.");
            return;
        }

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

    return (
        <div className="bg-white/10 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-xl">
            <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                        Password & Security
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Manage your password.
                    </p>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                    <InputField
                        id="oldPassword"
                        label="Current Password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    <InputField
                        id="newPassword1"
                        label="New Password"
                        type="password"
                        value={newPassword1}
                        onChange={(e) => setNewPassword1(e.target.value)}
                        autoComplete="new-password"
                    />
                    <PasswordStrength strength={newPassword1 ? (newPassword1.length < 8 ? 'weak' : 'strong') : null} />
                    <InputField
                        id="newPassword2"
                        label="Confirm New Password"
                        type="password"
                        value={newPassword2}
                        onChange={(e) => setNewPassword2(e.target.value)}
                        autoComplete="new-password"
                        error={passwordError || changePasswordMutation.error?.response?.data?.new_password2?.[0]}
                    />
                </div>
                <div className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-xl flex justify-end">
                    <Button
                        type="submit"
                        isLoading={changePasswordMutation.isPending}
                    >
                        Change Password
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PasswordSecurityCard;