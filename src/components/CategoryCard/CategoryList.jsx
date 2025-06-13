import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useCategories } from '../../contexts/ProductDataContext';
import AddCategoryForm from './Subcomponents/AddCategoryForm';
import CategoryItem from './Subcomponents/CategoryItem';
import Icon from '../common/Icon';
import Spinner from '../common/Spinner';

const CategoryList = ({ onSelectCategory, selectedCategoryId }) => {
	const [isAdding, setIsAdding] = useState(false);
	const [editingCategory, setEditingCategory] = useState(null);

	const {
		data: categoriesData,
		isLoading,
		error,
		refetch,
	} = useCategories();

	// Destructure the new data shape with defaults
	const { categories = [], totalProductsCount = 0 } = categoriesData || {};

	const handleEdit = (category) => {
		setEditingCategory(category);
		setIsAdding(false);
	};

	const handleCancel = () => {
		setIsAdding(false);
		setEditingCategory(null);
	};

	const onMutationSuccess = () => {
		refetch();
		handleCancel();
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-40">
				<Spinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-red-500 text-center p-4 border border-red-200 rounded-lg">
				<p className="font-semibold">Error loading categories.</p>
				<p className="text-sm">{error.message}</p>
			</div>
		);
	}

	const isAllSelected = selectedCategoryId === null || selectedCategoryId === undefined;

	return (
		<div className="space-y-3">
			<ul className="space-y-2">
				<li>
					<div
						onClick={() => onSelectCategory(null)}
						className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150
                            ${isAllSelected
								? 'bg-rose-100 dark:bg-rose-500/20 ring-1 ring-rose-500'
								: 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
							}`}
					>
						<span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
							All Products
						</span>
						<span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-600 rounded-full px-2 py-0.5">
							{totalProductsCount}
						</span>
					</div>
				</li>

				{categories.map((category) => (
					<li key={category.id}>
						{editingCategory && editingCategory.id === category.id ? (
							<AddCategoryForm
								onCancel={handleCancel}
								onSuccess={onMutationSuccess}
								existingCategory={editingCategory}
							/>
						) : (
							<CategoryItem
								category={category}
								onEdit={() => handleEdit(category)}
								onSuccess={onMutationSuccess}
								onSelect={() => onSelectCategory(category.id)}
								isSelected={selectedCategoryId === category.id}
							/>
						)}
					</li>
				))}
			</ul>

			{isAdding ? (
				<AddCategoryForm onCancel={handleCancel} onSuccess={onMutationSuccess} />
			) : (
				<button
					onClick={() => { setIsAdding(true); setEditingCategory(null); }}
					className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-rose-300 dark:hover:border-rose-500 transition-all"
				>
					<Icon name="add" className="w-4 h-4" />
					Add Category
				</button>
			)}
		</div>
	);
};

CategoryList.propTypes = {
	onSelectCategory: PropTypes.func.isRequired,
	selectedCategoryId: PropTypes.string,
};

export default CategoryList;