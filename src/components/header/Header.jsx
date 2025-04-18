import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import IconButton from './IconButton';
import CartPeek from '../store/CartPeek';
import ProfileMenu from './ProfileMenu';
import useCart from '../../hooks/useCart';
import { useFlyingImageContext } from '../animations/flying_image/FlyingImageContext';
import { useAuth } from '../../contexts/AuthContext';


const SCROLL_THRESHOLD = 50;

const Header = ({ navLinks, categories }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openCart, totalItems, wishlist } = useCart();
    const { user, logout } = useAuth()

    const [hideOnScroll, setHideOnScroll] = useState(false);
    const [prevScrollY, setPrevScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const headerRef = useRef(null);
    const { desktopTargetRef, mobileTargetRef } = useFlyingImageContext();


    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (Math.abs(currentY - prevScrollY) > SCROLL_THRESHOLD) {
                        setHideOnScroll(currentY > prevScrollY);
                        setPrevScrollY(currentY);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollY]);

    return (
        <motion.header
            ref={headerRef}
            initial={false}
            animate={{ y: hideOnScroll ? - (headerRef.current?.offsetHeight || 0) : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md"
            role="navigation"
            aria-label="Main Navigation"
        >
            {/* Desktop & Tablet */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:flex items-center justify-between h-16">
                {/* Logo */}
                <Logo className="h-8 cursor-pointer" onClick={() => navigate('/')} />
                {/* Nav Links + MegaMenu under 'Menu' */}
                <NavLinks links={navLinks} activePath={location.pathname} categories={categories} />
                {/* Utilities */}
                <div className="flex items-center space-x-4">
                    <SearchBar placeholder="Search artisan goodies" fetchSuggestions={async (q) => {
                        // TODO: replace with real API call
                        return ['Sourdough', 'Baguette', 'Croissant', 'Muffin'].filter(item =>
                            item.toLowerCase().includes(q.toLowerCase())
                        );
                    }} />
                    <IconButton
                        iconName="favorite_border"
                        ariaLabel="Wishlist"
                        onClick={() => navigate('/wishlist')}
                        isActive={wishlist.length > 0}
                    />
                    <div className="relative" ref={desktopTargetRef}>
                        <IconButton
                            iconName="shopping_cart"
                            ariaLabel="Cart"
                            onClick={openCart}
                            badgeCount={totalItems}
                        />
                    </div>
                    <ProfileMenu
                        user={user}
                        onSignIn={() => navigate('/login')}
                        onSignOut={logout}
                    />
                </div>
            </div>
            {/* Mobile */}
            <div className="md:hidden flex items-center justify-between px-4 py-3">
                <Logo className="h-8 cursor-pointer" onClick={() => navigate('/')} />
                <div className="flex items-center space-x-2">
                    <div className="relative" ref={mobileTargetRef}>
                        <IconButton
                            iconName="shopping_cart"
                            ariaLabel="Cart"
                            onClick={openCart}
                            badgeCount={totalItems}
                        />
                    </div>
                    <IconButton
                        iconName="menu"
                        ariaLabel="Toggle menu"
                        onClick={() => setMobileMenuOpen((o) => !o)}
                    />
                </div>
            </div>
            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-white shadow-lg overflow-hidden"
                        role="menu"
                        aria-label="Mobile Menu"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-3">
                            <NavLinks links={navLinks} activePath={location.pathname} vertical categories={categories} />
                            <SearchBar placeholder="Search artisan goodies" fetchSuggestions={async (q) => {
                                return ['Sourdough', 'Baguette', 'Croissant', 'Muffin'].filter(item =>
                                    item.toLowerCase().includes(q.toLowerCase())
                                );
                            }} />
                            <ProfileMenu user={user} onSignIn={() => navigate('/signin')} onSignOut={() => navigate('/signout')} onNavigate={navigate} vertical />
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

Header.propTypes = {
    navLinks: PropTypes.arrayOf(
        PropTypes.shape({ name: PropTypes.string.isRequired, path: PropTypes.string.isRequired })
    ).isRequired,
    categories: PropTypes.array.isRequired,
    user: PropTypes.shape({ name: PropTypes.string, avatarUrl: PropTypes.string }),
};

export default Header;