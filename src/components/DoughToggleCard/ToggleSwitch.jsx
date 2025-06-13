import { motion } from 'framer-motion';
import Icon from '../common/Icon';

export const ToggleSwitch = ({ isLogin, setIsLogin, sl }) => {
    const handleKeyDown = (e, targetState) => {
        if (['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            setIsLogin(targetState);
        }
    };

    return (
        <div className="relative h-12 rounded-full bg-[#EBD8B7] mb-8"
            role="switch"
            aria-checked={isLogin}
            aria-label={sl.switchAriaLabel || 'Switch between login and registration forms'}>
            <motion.div
                className="absolute top-0 w-1/2 h-full rounded-full bg-[#D4A373] shadow-sm"
                animate={{
                    x: isLogin ? 0 : '100%',
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
            />

            <div className="relative flex h-full">
                <button
                    className="flex-1 flex items-center justify-center gap-2 z-10"
                    onClick={() => setIsLogin(true)}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    aria-label={sl.loginFormAria || 'Login form'}
                    aria-pressed={isLogin}>
                    <Icon name="bakery_dining" className="text-[#6F4E37]" />
                    <span className="text-sm font-medium text-[#6F4E37]">{sl.loginButton || 'Login'}</span>
                </button>

                <button
                    className="flex-1 flex items-center justify-center gap-2 z-10"
                    onClick={() => setIsLogin(false)}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    aria-label={sl.registerFormAria || 'Registration form'}
                    aria-pressed={!isLogin}>
                    <Icon name="local_dining" className="text-[#6F4E37]" />
                    <span className="text-sm font-medium text-[#6F4E37]">{sl.registerButton || 'Register'}</span>
                </button>
            </div>
        </div>
    );
};