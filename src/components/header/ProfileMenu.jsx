import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../common/Icon';

const ProfileMenu = ({ onSignIn, onSignOut, onNavigate, vertical = false }) => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (open && menuRef.current && !menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
    };

    const handleSignOut = async () => {
        try {
          await logout();
          onSignOut?.();
        } catch (e) {
          console.error('Failed to log out. Please try again.');
        }
      };

    return (
        <div className={`${vertical ? 'w-full' : 'relative'}`} onKeyDown={handleKeyDown}>
            <button
                ref={btnRef}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={user ? 'User menu' : 'Sign in'}
                className={`flex items-center space-x-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${open ? 'bg-[var(--color-caramel)/10]' : ''
                    }`}
            >
                {user && user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    : <Icon name="account_circle" className="w-8 h-8 text-gray-600" style={{ fontSize: '2rem' }} variations={{ fill: 0 }}/>}
                {!vertical && user && <span className="text-sm font-medium text-[var(--color-chocolate)]">{user.name}</span>}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className={`${vertical ? 'mt-2' : 'absolute right-0 mt-4'
                            } w-48 rounded-2xl shadow-lg overflow-hidden z-50
                             bg-white/70 backdrop-blur-md
                            `}
                            
                        role="menu"
                        aria-label="Profile options"
                    >
                        <ul className="flex flex-col">
                            {user ? (
                                <>
                                    <li>
                                        <button
                                            onClick={() => { onNavigate('/orders'); setOpen(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Orders
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => { onNavigate('/account'); setOpen(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Account Settings
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Sign Out
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <button
                                        onClick={() => { onSignIn(); setOpen(false); }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                        role="menuitem"
                                    >
                                        Sign In
                                    </button>
                                </li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ProfileMenu.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        avatarUrl: PropTypes.string,
    }),
    onSignIn: PropTypes.func.isRequired,
    onSignOut: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    vertical: PropTypes.bool,
};

export default ProfileMenu;
