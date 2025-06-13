import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ConfirmationModal from '../../common/ConfirmationModal';
import Icon from '../../common/Icon';
import toast from 'react-hot-toast';


const CategoryItem = ({ category, onEdit, onSuccess, onSelect, isSelected }) => {
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	const deleteCategoryMutation = () => { };

	const handleDelete = () => {
		deleteCategoryMutation.mutate(category.id, {
			onSuccess: () => {
				toast.success(`Category "${category.name}" deleted.`);
				setIsConfirmModalOpen(false);
				if (onSuccess) onSuccess();
			},
			onError: (err) => {
				toast.error(`Failed to delete category: ${err.message}`);
				setIsConfirmModalOpen(false);
			},
		});
	};

	const colorIsTailwindClass = category.color_class && category.color_class.startsWith('bg-');

	return (
		<>
			<div
				onClick={onSelect}
				className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150
                    ${isSelected
						? 'bg-rose-100 dark:bg-rose-500/20 ring-1 ring-rose-500'
						: 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
					}`}
			>
				<div className="flex items-center gap-3 flex-grow min-w-0">
					<span
						className={`w-4 h-4 rounded-md flex-shrink-0 ${colorIsTailwindClass ? category.color_class : ''}`}
						style={!colorIsTailwindClass ? { backgroundColor: category.color_class } : {}}
					></span>
					<span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">{category.name}</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm text-neutral-500 dark:text-neutral-400">
						{category.product_count}
					</span>
					<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
						<button
							onClick={(e) => { e.stopPropagation(); onEdit(); }}
							className="p-1 text-neutral-500 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-blue-400 rounded-full"
							aria-label={`Edit ${category.name}`}
						>
							<Icon name="edit" className="w-4 h-4" />
						</button>
						<button
							onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(true); }}
							className="p-1 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 rounded-full"
							aria-label={`Delete ${category.name}`}
						>
							<Icon name="delete" className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={handleDelete}
				title="Confirm Deletion"
				message={`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`}
				isLoading={deleteCategoryMutation.isLoading}
			/>
		</>
	);
};

CategoryItem.propTypes = {
	category: PropTypes.object.isRequired,
	onEdit: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	isSelected: PropTypes.bool.isRequired,
};

export default CategoryItem;