import { useState } from 'react';
import { motion } from 'framer-motion';
import { ToggleSwitch } from './ToggleSwitch';
import { AuthForm } from './AuthForm';
import { RollingPin } from './RollingPin';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import { scriptLines_doughToggleCard as sl } from './script_lines.js';

const AuthCard = () => {
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = sl.authCard.emailRequired || 'Email is required';
        if (!formData.password) newErrors.password = sl.authCard.passwordRequired || 'Password is required';
        if (!isLogin && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = sl.authCard.passwordsMustMatch || 'Passwords must match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password);
            }
            setFormData({ email: '', password: '', confirmPassword: '' });
        } catch (error) {
            setApiError(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (apiError) setApiError('');
    };

    const handleToggle = (newState) => {
        if (isLogin === newState) return;
        setIsAnimating(true);
        setIsLogin(newState);
        setTimeout(() => setIsAnimating(false), 600);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F5F0]">
            <motion.div
                layout
                className="relative w-full max-w-[90%] md:w-[400px] bg-[#F5EFE6] rounded-xl shadow-md p-8"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{
                    height: isLogin ? 500 : 600
                }}
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#6F4E37] mb-2">
                        S'more
                    </h1>
                    <p className="text-[#6F4E37]/80">{sl.authCard.tagline || 'Bake your next order'}</p>
                </div>

                <ToggleSwitch isLogin={isLogin} setIsLogin={handleToggle} sl={sl.toggleSwitch} />

                <RollingPin isAnimating={isAnimating} />

                <form onSubmit={handleSubmit}>
                    <AuthForm
                        isLogin={isLogin}
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        isLoading={isLoading}
                        handleSubmit={handleSubmit}
                        apiError={apiError}
                        sl={sl.authForm}
                    />
                </form>

                <div aria-live="polite" className="sr-only">
                    {isLogin ? (sl.authCard.loginFormAria || 'Login form') : (sl.authCard.registerFormAria || 'Registration form')}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthCard;