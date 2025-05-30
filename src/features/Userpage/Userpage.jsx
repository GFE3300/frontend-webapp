// C:/Users/maxda/Desktop/dads/data_cards/src/Userpage/Userpage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuPage from './SubComponents/MenuPage';
import OrderPage from './SubComponents/OrderPage';
import BottomNav from './SubComponents/BottomNav';
import { initialMenuData } from './SubComponents/DummyData';
import FlyingItemAnimator from './SubComponents/FlyingItemAnimator';
import Modal from '../../components/animated_alerts/Modal';
import ProductOptionsPopup from './SubComponents/ProductOptionsPopup';
import Icon from '../../components/common/Icon';
import SetupStage from './SubComponents/SetupStage';
// --- Logo Imports ---
import LogoLight from '../components/assets/Logo.png'; // Assuming this is the light mode logo
import LogoDark from '../components/assets/LogoDark.png'; // Import your dark mode logo
import SnakesGameComponent from './SnakesGame';

import { useTheme, ThemeProvider } from '../components/common/ThemeProvider';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';


const TABLE_NUMBER = "6";
// No need for LOGO_URL constant here anymore, it will be dynamic

function AppContent() {
    const { theme } = useTheme();

    // --- Dynamically select logo based on theme ---
    const currentLogo = theme === 'dark' ? LogoDark : LogoLight;

    const [appStage, setAppStage] = useState('setup');
    const [userDetails, setUserDetails] = useState({
        name: '',
        numberOfPeople: 1,
        tableNumber: TABLE_NUMBER,
    });
    const [currentPage, setCurrentPage] = useState('menu');
    const [activeSidebarTab, setActiveSidebarTab] = useState('deals');
    const [orderItems, setOrderItems] = useState([]);
    const [flyingItem, setFlyingItem] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalProps, setUserModalProps] = useState({ title: '', message: '', type: 'info' });
    const [isOptionsPopupOpen, setIsOptionsPopupOpen] = useState(false);
    const [currentItemForOptions, setCurrentItemForOptions] = useState(null);
    const orderNavTabRefMobile = useRef(null);
    const orderPanelRefDesktop = useRef(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showSnakeGame, setShowSnakeGame] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSetupComplete = (details) => {
        setUserDetails(prev => ({
            ...prev,
            name: details.userName,
            numberOfPeople: details.numberOfPeople,
        }));
        setAppStage('main');
    };

    const handleLogoClick = () => {
        const newClickCount = logoClickCount + 1;
        if (newClickCount >= 7) {
            setShowSnakeGame(true);
            setLogoClickCount(0);
        } else {
            setLogoClickCount(newClickCount);
        }
    };

    const handleOpenOptionsPopup = (item, imageRect) => {
        if (item.availableSizes || item.availableExtras) {
            setCurrentItemForOptions({ ...item, imageRect });
            setIsOptionsPopupOpen(true);
        } else {
            const itemToAdd = {
                id: item.id.toString(),
                originalId: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                price: item.price,
                quantity: 1,
            };
            addToOrder(itemToAdd, imageRect);
        }
    };

    const handleConfirmWithOptions = (originalItemDetails, selectedOptions) => {
        const itemToAdd = {
            id: `${originalItemDetails.id}-${selectedOptions.selectedSize?.name || 'defaultsize'}-${(selectedOptions.selectedExtras?.map(e => e.id).join('_') || 'noextras')}`,
            originalId: originalItemDetails.id,
            name: originalItemDetails.name,
            imageUrl: originalItemDetails.imageUrl,
            price: selectedOptions.finalPricePerItem,
            quantity: selectedOptions.quantity,
            selectedSizeName: selectedOptions.selectedSize?.name,
            selectedExtrasNames: selectedOptions.selectedExtras?.map(e => e.name),
        };
        addToOrder(itemToAdd, originalItemDetails.imageRect);
        setIsOptionsPopupOpen(false);
        setCurrentItemForOptions(null);
    };

    const addToOrder = (itemToAdd, itemImageRect) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === itemToAdd.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === itemToAdd.id
                        ? { ...item, quantity: item.quantity + itemToAdd.quantity }
                        : item
                );
            }
            return [...prevItems, itemToAdd];
        });

        let targetRect = null;
        if (isDesktop && orderPanelRefDesktop.current) {
            targetRect = orderPanelRefDesktop.current.getBoundingClientRect();
        } else if (!isDesktop && orderNavTabRefMobile.current) {
            targetRect = orderNavTabRefMobile.current.getBoundingClientRect();
        }

        if (itemImageRect && targetRect) {
            setFlyingItem({
                id: Date.now(),
                imageUrl: itemToAdd.imageUrl,
                startRect: itemImageRect,
                endRect: targetRect,
            });
        } else {
            if (flyingItem) setFlyingItem(null);
        }
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } else {
            setOrderItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const handleConfirmOrder = (orderSpecifics) => {
        if (orderItems.length === 0) {
            setUserModalProps({
                title: "Empty Order",
                message: "Your order is empty. Please add some items from the menu before confirming.",
                type: "warning"
            });
            setIsUserModalOpen(true);
            return;
        }

        setUserModalProps({
            title: "Order Confirmed!",
            message: `Thank you, ${userDetails.name}! Your order for table ${userDetails.tableNumber} (${userDetails.numberOfPeople} guest${userDetails.numberOfPeople > 1 ? 's' : ''}) has been placed. Notes: ${orderSpecifics.notes || 'None'}. Promo: ${orderSpecifics.promo || 'None'}`,
            type: "success"
        });
        setIsUserModalOpen(true);
    };

    const handleUserModalClose = () => {
        setIsUserModalOpen(false);
        if (userModalProps.type === "success") {
            setOrderItems([]);
            if (!isDesktop) {
                setCurrentPage('menu');
            }
        }
        setUserModalProps({ title: '', message: '', type: 'info' });
    };

    const SidebarNavItem = ({ label, iconName, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                        ${isActive
                            ? 'bg-red-500 text-white shadow-md'
                            : 'text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700'}`}
        >
            <Icon name={iconName} className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </button>
    );

    if (appStage === 'setup') {
        return (
            <SetupStage
                tableNumber={userDetails.tableNumber}
                onSetupComplete={handleSetupComplete}
                theme={theme}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-900 font-sans flex flex-col lg:flex-row">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-neutral-800 p-4 border-r border-neutral-200 dark:border-neutral-700 shadow-lg">
                <div className="mb-6 flex items-center">
                    {/* MODIFIED: Use currentLogo */}
                    <img src={currentLogo} alt="MyBrand Logo" className="h-15 mr-3 cursor-pointer" onClick={handleLogoClick} />
                </div>
                {userDetails.name && (
                    <div className="mb-4 text-xs text-neutral-600 dark:text-neutral-400">
                        <p>Table: <span className="font-semibold">{userDetails.tableNumber}</span></p>
                        <p>Guest: <span className="font-semibold">{userDetails.name}</span></p>
                        <p>Party: <span className="font-semibold">{userDetails.numberOfPeople}</span></p>
                    </div>
                )}
                <nav className="space-y-2">
                    <SidebarNavItem
                        label="Deals"
                        iconName="loyalty"
                        isActive={activeSidebarTab === 'deals'}
                        onClick={() => setActiveSidebarTab('deals')}
                    />
                    <SidebarNavItem
                        label="Discounts"
                        iconName="flare"
                        isActive={activeSidebarTab === 'discounts'}
                        onClick={() => setActiveSidebarTab('discounts')}
                    />
                </nav>
                <div className="mt-auto text-xs text-center text-neutral-400 dark:text-neutral-500">
                    <p>© {new Date().getFullYear()} MyBrand Inc.</p>
                    <p>All rights reserved.</p>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                {/* MOBILE TOP HEADER */}
                <div className="md:hidden h-14 bg-white dark:bg-neutral-800 shadow-md flex items-center px-4 shrink-0">
                    {/* MODIFIED: Use currentLogo */}
                    <img src={currentLogo} alt="MyBrand Logo" className="h-13 cursor-pointer" onClick={handleLogoClick} />
                </div>

                {/* Content columns for desktop */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Desktop "Deals/Discounts" panel */}
                    <div className="hidden lg:flex lg:flex-col lg:flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {activeSidebarTab === 'deals' && (
                                <motion.div
                                    key="dealsContent"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-6 bg-slate-50 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 h-full"
                                >
                                    <h2 className="text-3xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100">Today's Deals</h2>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="p-4 bg-white dark:bg-neutral-700 rounded-lg shadow">
                                                <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Amazing Deal #{i}</h3>
                                                <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-300">Description of this fantastic deal. Don't miss out!</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {activeSidebarTab === 'discounts' && (
                                <motion.div
                                    key="discountsContent"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-6 bg-slate-50 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 h-full"
                                >
                                    <h2 className="text-3xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100">Exclusive Discounts</h2>
                                    <div className="space-y-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="p-4 bg-white dark:bg-neutral-700 rounded-lg shadow">
                                                <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">Special Discount Offer #{i}</h3>
                                                <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-300">Details about this exclusive discount just for you.</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Central Menu Area / Mobile Page Content */}
                    <div className="w-full md:flex-1 lg:flex-1 lg:max-w-2xl xl:max-w-3xl bg-white dark:bg-neutral-900 md:border-l md:border-r border-neutral-200 dark:border-neutral-700 md:shadow-xl md:overflow-y-auto">
                        {/* MOBILE CONTENT AREA */}
                        <div className="md:hidden pb-16">
                            <AnimatePresence mode="wait">
                                {currentPage === 'menu' && <MenuPage key="menuPageMobile" menuData={initialMenuData} onAddToOrder={handleOpenOptionsPopup} />}
                                {currentPage === 'order' && <OrderPage key="orderPageMobile" orderItems={orderItems} onUpdateQuantity={updateQuantity} onConfirmOrder={handleConfirmOrder} isSidebarVersion={false} navigateToMenu={() => setCurrentPage('menu')} tableNumber={userDetails.tableNumber}/>}
                                {currentPage === 'deals' && (
                                    <motion.div key="dealsPageMobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 pt-8 text-neutral-700 dark:text-neutral-300">
                                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Deals Page</h1>
                                        <div className="space-y-4 mt-4">
                                            {[1,2,3].map(i => ( <div key={i} className="p-4 bg-white dark:bg-neutral-700 rounded-lg shadow"> <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Amazing Deal #{i}</h3> <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-300">Description of this fantastic deal. Don't miss out!</p> </div> ))}
                                        </div>
                                    </motion.div>
                                )}
                                {currentPage === 'discounts' && (
                                     <motion.div key="discountsPageMobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 pt-8 text-neutral-700 dark:text-neutral-300">
                                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Discounts Page</h1>
                                        <div className="space-y-4 mt-4">
                                            {[1,2].map(i => ( <div key={i} className="p-4 bg-white dark:bg-neutral-700 rounded-lg shadow"> <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">Special Discount Offer #{i}</h3> <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-300">Details about this exclusive discount just for you.</p> </div> ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* DESKTOP MENU AREA */}
                        <div className="hidden md:block h-full">
                            <MenuPage menuData={initialMenuData} onAddToOrder={handleOpenOptionsPopup} />
                        </div>
                    </div>

                    {/* Desktop Order Panel */}
                    <div ref={orderPanelRefDesktop} className="hidden md:flex md:flex-col md:w-[22rem] lg:w-[24rem] xl:w-[28rem] bg-neutral-50 dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-lg">
                        <OrderPage orderItems={orderItems} onUpdateQuantity={updateQuantity} onConfirmOrder={handleConfirmOrder} isSidebarVersion={true} tableNumber={userDetails.tableNumber}/>
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <div className="md:hidden">
                <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} orderItemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)} orderTabRefProp={orderNavTabRefMobile} />
            </div>

            {/* Modals and Animators */}
            <Modal isOpen={isUserModalOpen} onClose={handleUserModalClose} title={userModalProps.title} type={userModalProps.type}>
                <p>{userModalProps.message}</p>
            </Modal>
            {currentItemForOptions && <ProductOptionsPopup isOpen={isOptionsPopupOpen} onClose={() => { setIsOptionsPopupOpen(false); setCurrentItemForOptions(null); }} item={currentItemForOptions} onConfirmWithOptions={handleConfirmWithOptions} />}
            <AnimatePresence>
                {flyingItem && <FlyingItemAnimator key={flyingItem.id} imageUrl={flyingItem.imageUrl} startRect={flyingItem.startRect} endRect={flyingItem.endRect} onAnimationComplete={() => setFlyingItem(null)} />}
            </AnimatePresence>

            {/* Snake Game Modal */}
            {showSnakeGame && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', }}>
                    <div style={{ position: 'relative', borderRadius: '8px', width: '100%', height: `calc(100% - 70px)`, overflow: 'auto', boxSizing: 'border-box', display: 'flex', }}>
                        <SnakesGameComponent />
                    </div>
                    <button onClick={() => setShowSnakeGame(false)} style={{ marginTop: '20px', padding: '12px 25px', fontSize: '1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                        Close Game
                    </button>
                </div>
            )}
        </div>
    );
}

function UserpageWrapper() {
    return (
        <ThemeProvider>
            <ThemeToggleButton />
            <AppContent />
        </ThemeProvider>
    );
}

export default UserpageWrapper;