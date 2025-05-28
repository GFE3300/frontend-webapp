// FILE: C:/Users/maxda/Desktop/dads/data_cards/src/Category editor/TailwindColorPicker.jsx
import React from 'react';
import { availableColorClasses } from './Subcomponents/colorConstants'; // MODIFIED IMPORT

// REMOVED: export const availableColorClasses = [ ... ];

const TailwindColorPicker = ({ selectedColor, onColorSelect, label = "Category Color" }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="grid grid-cols-7 sm:grid-cols-11 gap-2.5">
        {availableColorClasses.map((colorClass) => (
          <button
            type="button"
            key={colorClass}
            className={`w-9 h-9 rounded-full cursor-pointer focus:outline-none transition-all duration-150 ease-in-out border-2 shadow-sm hover:shadow-md
                        ${colorClass} 
                        ${selectedColor === colorClass 
                            ? 'ring-3 ring-offset-2 dark:ring-offset-slate-800 ring-indigo-500 dark:ring-indigo-400 border-white dark:border-slate-300 scale-110 transform' 
                            : 'border-transparent hover:scale-110 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
            onClick={() => onColorSelect(colorClass)}
            title={colorClass.replace('bg-', '').replace(/-\d+/, '')}
            aria-label={`Select color ${colorClass.replace('bg-', '').replace(/-\d+/, '')}`}
            aria-pressed={selectedColor === colorClass}
          />
        ))}
      </div>
    </div>
  );
};

export default TailwindColorPicker;