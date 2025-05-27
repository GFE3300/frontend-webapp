// FILE: C:/Users/maxda/Desktop/dads/data_cards/src/Category editor\EditCategoryForm.jsx
import React, { useState, useEffect } from 'react';
import TailwindColorPicker from './TailwindColorPicker'; 

const EditCategoryForm = ({ categoryToEdit, onUpdateCategory, onCancel }) => {
  const [name, setName] = useState('');
  const [colorClass, setColorClass] = useState('');
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setColorClass(categoryToEdit.color_class || '');
      setValue(categoryToEdit.value !== undefined ? String(categoryToEdit.value) : '');
      setPercentage(categoryToEdit.percentage !== undefined ? String(categoryToEdit.percentage) : '');
      setDisplayOrder(categoryToEdit.display_order !== undefined ? String(categoryToEdit.display_order) : '');
    }
  }, [categoryToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !colorClass.trim()) {
      alert('Name and Color are required.');
      return;
    }
    onUpdateCategory({
      ...categoryToEdit,
      name: name.trim(),
      color_class: colorClass.trim(),
      value: parseFloat(value) || 0,
      percentage: parseFloat(percentage) || 0,
      display_order: displayOrder === '' ? (categoryToEdit.display_order || 0) : parseInt(displayOrder, 10) || 0,
    });
  };

  if (!categoryToEdit) return null;

  const inputBaseClasses = "mt-1 block w-full px-3.5 py-2.5 bg-white dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor={`edit-category-name-${categoryToEdit.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
        <input type="text" id={`edit-category-name-${categoryToEdit.id}`} value={name} onChange={(e) => setName(e.target.value)} className={inputBaseClasses} required autoFocus />
      </div>
      
      <TailwindColorPicker 
        selectedColor={colorClass}
        onColorSelect={setColorClass}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`edit-category-value-${categoryToEdit.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
          <input type="number" id={`edit-category-value-${categoryToEdit.id}`} value={value} onChange={(e) => setValue(e.target.value)} className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor={`edit-category-percentage-${categoryToEdit.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Percentage</label>
          <input type="number" id={`edit-category-percentage-${categoryToEdit.id}`} value={percentage} onChange={(e) => setPercentage(e.target.value)} step="0.1" className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor={`edit-category-display-order-${categoryToEdit.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
          <input type="number" id={`edit-category-display-order-${categoryToEdit.id}`} value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={inputBaseClasses} />
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
          Update Category
        </button>
      </div>
    </form>
  );
};

export default EditCategoryForm;