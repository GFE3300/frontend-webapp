// FILE: C:/Users/maxda/Desktop/dads/data_cards/src/Category editor\AddCategoryForm.jsx
import React, { useState } from 'react';
import TailwindColorPicker from '../TailwindColorPicker';
import { availableColorClasses } from './colorConstants'; // MODIFIED IMPORT

const AddCategoryForm = ({ onAddCategory, onCancel }) => {
  const [name, setName] = useState('');
  const [colorClass, setColorClass] = useState(availableColorClasses[0] || ''); // Uses imported constant
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !colorClass.trim()) {
      alert('Name and Color are required.');
      return;
    }
    onAddCategory({
      name: name.trim(),
      color_class: colorClass.trim(),
      value: parseFloat(value) || 0,
      percentage: parseFloat(percentage) || 0,
      display_order: displayOrder === '' ? undefined : parseInt(displayOrder, 10),
    });
  };
  
  const inputBaseClasses = "mt-1 block w-full px-3.5 py-2.5 bg-white dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5"> 
      <div>
        <label htmlFor="add-category-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
        <input
          type="text"
          id="add-category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputBaseClasses}
          placeholder="e.g., Marketing Expenses"
          required
          autoFocus
        />
      </div>
      
      <TailwindColorPicker 
        selectedColor={colorClass}
        onColorSelect={setColorClass}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="add-category-value" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
          <input type="number" id="add-category-value" value={value} onChange={(e) => setValue(e.target.value)} className={inputBaseClasses} placeholder="e.g., 15000" />
        </div>
        <div>
          <label htmlFor="add-category-percentage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Percentage</label>
          <input type="number" id="add-category-percentage" value={percentage} onChange={(e) => setPercentage(e.target.value)} step="0.1" className={inputBaseClasses} placeholder="e.g., 15.5" />
        </div>
        <div>
          <label htmlFor="add-category-display-order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
          <input type="number" id="add-category-display-order" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={inputBaseClasses} placeholder="e.g., 1 (optional)" />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-5 border-t border-slate-200 dark:border-slate-700 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
        >
          Add Category
        </button>
      </div>
    </form>
  );
};

export default AddCategoryForm;