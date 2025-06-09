import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useCategories } from '../../contexts/ProductDataContext'; // Using the context hook
import AddCategoryForm from './Subcomponents/AddCategoryForm';
import CategoryItem from './Subcomponents/CategoryItem';
import Icon from '../common/Icon';
import Spinner from '../common/Spinner';

// Note: The logic for Add/Edit/Delete will be handled internally or via context mutations,
// but the selection logic is now external.

const CategoryList = ({ onSelectCategory, selectedCategoryId }) => {
	const [isAdding, setIsAdding] = useState(false);
	const [editingCategory, setEditingCategory] = useState(null);

	const {
		data: categoriesData,
		isLoading,
		error,
		refetch, // Using refetch from the hook
	} = useCategories();

	const handleEdit = (category) => {
		setEditingCategory(category);
		setIsAdding(false); // Close add form if open
	};

	const handleCancel = () => {
		setIsAdding(false);
		setEditingCategory(null);
	};

	// This function will be called by sub-components after a successful mutation
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

	return (
		<div className="space-y-3">
			<ul className="space-y-2">
				{categoriesData?.map((category) => (
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
								onSelect={() => onSelectCategory(category.id)} // Pass the ID to the handler
								isSelected={selectedCategoryId === category.id} // Control selection state
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