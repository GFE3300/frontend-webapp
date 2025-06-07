import React, { useCallback, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLoginForm } from '../../../../hooks/useLoginForm';
import { useToast } from '../../../../contexts/ToastContext';
import apiService from '../../../../services/api';

import InputField from '../../../../components/common/InputField';
import Button from '../../../../components/common/Button';
import Icon from '../../../../components/common/Icon';

const StaffLoginPage = () => {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    const [showPassword, setShowPassword] = useState(false);

    const {
        email, setEmail,
        password, setPassword,
        errors, setErrors,
        isSubmitting, setIsSubmitting,
        generalError, setGeneralError,
    } = useLoginForm();

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        setGeneralError(null);
        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await apiService.post('auth/login/', { email, password });
            const decodedToken = jwtDecode(response.data.access);

            // Security check: Ensure the user logging in is actually a staff member.
            if (!decodedToken.is_staff) {
                setGeneralError("Access Denied: This portal is for staff members only.");
                addToast("This login is for staff members only.", "error");
                setIsSubmitting(false);
                return;
            }

            // Call the login function from AuthContext to update the global state.
            login(response.data.access, response.data.refresh);
            addToast("Login successful! Welcome.", "success");

        } catch (error) {
            let errorMessage = "An unexpected error occurred. Please try again later.";
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "Invalid credentials. Please check your email and password.";
                } else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
            }
            setGeneralError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [email, password, login, addToast, setGeneralError, setErrors, setIsSubmitting]);

    // This useEffect handles navigation after the user state has been updated.
    useEffect(() => {
        if (isAuthenticated && user?.is_staff) {
            const from = location.state?.from?.pathname || '/staff/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location.state]);

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-4">
                        <Icon name="shield_person" className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                    </Link>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        Staff & Affiliate Portal
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        Please sign in to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {generalError && (
                        <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                            <Icon name="error" className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span>{generalError}</span>
                        </div>
                    )}
                    <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="you@company.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        required
                    />
                    <InputField
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        required
                        adornment={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <Icon name={showPassword ? "visibility_off" : "visibility"} className="w-5 h-5" />
                            </button>
                        }
                    />

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="solid"
                            color="primary"
                            className="w-full"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>

                <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Not a staff member? <Link to="/login/business" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">Login to your business dashboard.</Link>
                </div>
            </div>
        </div>
    );
};

export default StaffLoginPage;