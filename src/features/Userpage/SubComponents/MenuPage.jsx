import React from 'react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard';

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  if (!array) return chunks;
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

function MenuPage({ menuData, onAddToOrder }) {
  const categorizedItems = menuData.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 100 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="pt-4"
    >
      <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 mb-6 text-center px-4">Menu</h1>

      {Object.entries(categorizedItems).map(([category, items]) => {
        if (items.length === 0) return null;

        return (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500 mb-4 px-4 md:px-4">{category}</h2>
            <div className="
              flex overflow-x-auto space-x-4 pb-4 pl-4 pr-4
              scrollbar-thin scrollbar-thumb-red-300 dark:scrollbar-thumb-red-500 scrollbar-track-red-100 dark:scrollbar-track-neutral-700
            ">
              {items.map((item) => (
                <div key={`${item.id}-mobile`} className="flex-shrink-0 md:hidden">
                  <MenuItemCard
                    item={item}
                    onOpenOptionsPopup={onAddToOrder}
                  />
                </div>
              ))}

              {chunkArray(items, 2).map((itemPair, pairIndex) => (
                <div key={`pair-${pairIndex}-${category}`} className="hidden md:flex flex-col space-y-4 flex-shrink-0">
                  {itemPair.map(item => (
                    <div key={`${item.id}-md-lg`} className="flex-shrink-0">
                      <MenuItemCard
                        item={item}
                        onOpenOptionsPopup={onAddToOrder}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

export default MenuPage;