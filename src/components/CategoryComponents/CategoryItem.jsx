// FILE: C:/Users/maxda/Desktop/dads/data_cards/src/Category editor/CategoryItem.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Assuming TrashIcon & EditIcon are defined in or imported by CategoryList.jsx and thus available.
// For brevity, their SVG definitions are omitted here.
const TrashIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.678-.112 1.017-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const EditIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);


const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const words = name.trim().split(/\s+/).filter(Boolean); // filter(Boolean) removes empty strings
  if (words.length === 0) return '?';
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return (words[0][0] + (words[words.length - 1][0] || '')).toUpperCase();
};


const CategoryItem = ({ category, index, onEditRequest, onDeleteRequest }) => {
  const avatarBgColor = category.color_class || 'bg-slate-500 dark:bg-slate-600';
  const graphFillColor = category.color_class || 'bg-slate-500'; // Use the main category color for the graph fill
  
  let percentageTextColorClasses = `text-xs font-semibold whitespace-nowrap`;

  if (category.color_class) {
    const baseColorName = category.color_class.split('-')[1]; 
    if (baseColorName) {
      // Light Mode: Use a darker shade of the category color for text.
      percentageTextColorClasses += ` text-${baseColorName}-700`;
      // Dark Mode: Use a lighter shade of the category color for text.
      percentageTextColorClasses += ` dark:text-${baseColorName}-400`; // Adjusted for better visibility on dark bg
    } else {
      percentageTextColorClasses += ` text-slate-700 dark:text-slate-300`; // Fallback
    }
  } else { 
    percentageTextColorClasses += ` text-slate-700 dark:text-slate-300`; // Fallback
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, height: 0 }} 
      animate={{ 
        opacity: 1, y: 0, height: 'auto',
        transition: { 
            opacity: { delay: index * 0.07, duration: 0.3 },
            y: { delay: index * 0.07, duration: 0.3 },
            height: { delay: index * 0.07, duration: 0.35, ease: "easeOut" }
        }
      }}
      exit={{ 
        opacity: 0, y: -10, height: 0,
        paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0, 
        transition: { 
            opacity: { duration: 0.15 }, y: { duration: 0.2 }, height: { duration: 0.25, ease: "easeIn" },
            paddingTop: {duration: 0.25}, paddingBottom: {duration: 0.25},
            marginTop: {duration: 0.25}, marginBottom: {duration: 0.25},
        }
      }}
      className="bg-white dark:bg-slate-800/70 p-4 rounded-xl shadow-lg dark:shadow-slate-900/50 flex items-center justify-between hover:shadow-xl dark:hover:shadow-slate-700/60 transition-all duration-200 ease-in-out overflow-hidden group relative"
    >
      {/* Left Section: Avatar and Name */}
      <div className="flex items-center min-w-0 flex-grow mr-3"> {/* Increased mr slightly */}
        <div
          className={`w-10 h-10 rounded-lg ${avatarBgColor} mr-4 flex items-center justify-center text-white shadow-md flex-shrink-0 font-semibold text-lg`}
        >
          {getInitials(category.name)}
        </div>
        <span className="text-slate-700 dark:text-slate-200 font-semibold text-md truncate" title={category.name}>{category.name}</span>
      </div>

      {/* Right Section: Value, Graph, Percentage, and Action Buttons */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
        <span className="text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-md whitespace-nowrap">
          {formatCurrency(category.value || 0)} 
        </span>

        {/* Graph and Percentage Text */}
        <div className="flex items-center space-x-2" aria-label={`Percentage: ${category.percentage || 0}%`}>
          <div className="w-16 sm:w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden" title={`${category.percentage || 0}%`}>
            <motion.div
              className={`h-full ${graphFillColor} rounded-full`} // Fill color from category
              initial={{ width: 0 }}
              animate={{ width: `${category.percentage || 0}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} // Smoother ease
            />
          </div>
          <span className={percentageTextColorClasses}>
            {category.percentage || 0}%
          </span>
        </div>
        
        {/* Action Buttons (Edit/Delete) - Appear on hover */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-1">
            {onEditRequest && (
            <button
                onClick={() => onEditRequest(category)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ring-offset-1 dark:ring-offset-slate-800"
                aria-label={`Edit ${category.name}`}
                title={`Edit ${category.name}`}
            >
                <EditIcon />
            </button>
            )}
            {onDeleteRequest && (
            <button
                onClick={() => onDeleteRequest(category)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ring-offset-1 dark:ring-offset-slate-800"
                aria-label={`Delete ${category.name}`}
                title={`Delete ${category.name}`}
            >
                <TrashIcon />
            </button>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryItem;