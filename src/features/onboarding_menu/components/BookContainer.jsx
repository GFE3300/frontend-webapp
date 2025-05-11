// BookContainer.jsx
import { useEffect, useState } from 'react';
import MenuCover from './MenuCover';
import AnimatedPage from './AnimatedPage';

export default function BookContainer({ pages, currentPage, setCurrentPage, size }) {
    const totalPages = pages.length + 1;

    const handleContainerClick = () => {
        if (currentPage < totalPages * 2) {
            setCurrentPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        console.log('Current Page:', currentPage);
    }, [currentPage]);

    return (
        <div
            className={`
            flex items-center justify-center
            h-screen w-full`}
            style={{ 
                perspective: '1200px',
                width: size.width,
                height: size.height
            }}
        >
            <div
                className={`
                relative flex items-center justify-center`}
                style={{
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Book Cover */}
                <div
                    className={`menu-cover-container relative`}
                    style={{
                        width: size.width,
                        height: size.height 
                    }}
                >
                    <MenuCover
                        isActive={currentPage >= 0}
                        zIndex={(totalPages + 1 - currentPage) * 10}
                    />
                </div>

                {/* Page Stack */}
                {pages.map((page, index) => (
                    <AnimatedPage
                        key={index}
                        frontContent={page.front}
                        backContent={page.back}
                        activePage={currentPage}
                        isActive={currentPage >= index * 2 + 1}
                        zIndex={(totalPages - index - 1) * 10}
                        index={index + 1}
                    />
                ))}

                {/* Book Cover */}
                <div
                    className={`menu-cover-container absolute h-full w-full`}
                >
                    <div
                        className={`absolute h-full w-full p-4 shadow-2xl`}
                        style={{
                            background: `linear-gradient(342deg,var(--color-chocolate) 0%, rgba(115, 87, 77, 1) 90%)`,
                            borderRadius: currentPage >= 0 ? '0 1rem 1rem 0' : '1rem ',
                        }}
                    >
                        <div
                            className="border-2 border-[var(--color-gold)] h-full rounded-md"
                        >
                            <div className='h-[calc(100%-32px)] w-2 bg-[var(--color-gold)] rounded-md rounded-l-none absolute left-0 top-4' />
                        </div>
                    </div>
                </div>

            </div>
            <button
                onClick={handleContainerClick}
                className='
                absolute top-170 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                flex items-center justify-center
                w-12 h-12 rounded-full
                bg-[var(--color-chocolate)] text-white
                hover:bg-[var(--color-caramel)] hover:text-black
                transition-colors duration-300'
            />
        </div>
    );
}