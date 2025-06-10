import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import Icon from '../components/common/Icon';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

const AcceptInvitePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addToast } = useToast();

    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const acceptMutation = useMutation({
        mutationFn: (payload) => apiService.acceptInvitation(payload),
        onSuccess: (data) => {
            const { access, refresh, message, user } = data.data;
            addToast(message || 'Invitation accepted successfully!', 'success');

            if (access && refresh) {
                // New user was created, log them in
                login(access, refresh);
            }
            // For both new and existing users, redirect to the dashboard
            navigate('/dashboard/business/overview', { replace: true });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || error.response?.data?.token?.[0] || 'Failed to accept invitation. It may be invalid or expired.';
            addToast(errorMessage, 'error');
            // If the error indicates an invalid token, we might want to stay on the page with the error.
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('Passwords do not match.', 'warning');
            return;
        }
        acceptMutation.mutate({ token, password });
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center p-8 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
                    <Icon name="error" className="text-red-500 h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Invalid Invitation Link</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">Please check the URL or contact the sender.</p>
                </div>
            </div>
        );
    }

    // Based on the simplified backend, we present one form.
    // The backend's `get_or_create` handles both new and existing users.
    // A password is required only if the user is new. We'll show the password fields
    // and let the backend return an error if it's required but not provided.
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
                <div className="text-center">
                    <Icon name="group_add" className="text-primary-500 h-12 w-12 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Join the Team</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                        Complete your registration to accept the invitation. If you already have an account, just set a password to confirm.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                        required
                        helpText="Required for new users. If you have an account, enter your password to confirm."
                    />
                    <InputField
                        label="Confirm Password"
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                    />
                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="solid"
                            color="primary"
                            className="w-full"
                            isLoading={acceptMutation.isLoading}
                        >
                            Accept Invitation & Join
                        </Button>
                    </div>
                </form>
                <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                    Already have an account? <Link to="/login/business" className="font-medium text-primary-600 hover:underline">Log in here</Link>.
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitePage;