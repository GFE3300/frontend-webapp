import { useState, useCallback } from 'react';
import * as yup from 'yup';

/**
 * A custom hook to manage the state and validation for a login form.
 *
 * @param {string} [initialEmail=''] - The initial value for the email field.
 * @param {string} [initialPassword=''] - The initial value for the password field.
 * @returns {{
 *  email: string,
 *  setEmail: React.Dispatch<React.SetStateAction<string>>,
 *  password: {string},
 *  setPassword: {function},
 *  errors: {object},
 *  setErrors: {function},
 *  isSubmitting: {boolean},
 *  setIsSubmitting: {function},
 *  generalError: {string|null},
 *  setGeneralError: {function},
 *  validate: {function(): Promise<boolean>},
 *  resetForm: {function}
 * }} An object containing form state and handlers.
 */
export const useLoginForm = (initialEmail = '', initialPassword = '') => {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState(initialPassword);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState(null);

    // Define validation schema (can be localized)
    const loginSchema = yup.object().shape({
        email: yup.string().email("Invalid email format.").required("Email is required."),
        password: yup.string().required("Password is required."),
    });

    /**
     * Validates the current email and password against the login schema.
     * Sets specific field errors or a general error message if validation fails.
     * @returns {Promise<boolean>} A promise that resolves to true if validation is successful, false otherwise.
     */
    const validate = useCallback(async () => {
        try {
            await loginSchema.validate({ email, password }, { abortEarly: false });
            setErrors({});
            setGeneralError(null);
            return true;
        } catch (err) {
            if (err.inner) {
                // This is a Yup validation error with specific fields.
                const fieldErrors = err.inner.reduce((acc, currentError) => {
                    // Avoid overwriting if a field has multiple errors.
                    if (!acc[currentError.path]) {
                        acc[currentError.path] = currentError.message;
                    }
                    return acc;
                }, {});
                setErrors(fieldErrors);
                // Set a generic message to guide the user to the field-specific errors.
                setGeneralError("Please correct the errors below.");
            } else {
                // This is likely a non-Yup error or a general one.
                setGeneralError(err.message || "An unknown validation error occurred.");
                setErrors({}); // Clear any previous specific field errors.
            }
            return false; // Indicate that validation failed.
        }
    }, [email, password, loginSchema]);

    /**
     * Resets all form fields and state to their initial values.
     */
    const resetForm = useCallback(() => {
        setEmail('');
        setPassword('');
        setErrors({});
        setIsSubmitting(false);
        setGeneralError(null);
    }, []);

    return {
        email,
        setEmail,
        password,
        setPassword,
        errors,
        setErrors,
        isSubmitting,
        setIsSubmitting,
        generalError,
        setGeneralError,
        validate,
        resetForm,
    };
};