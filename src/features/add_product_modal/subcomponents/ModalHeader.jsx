import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import ProductTitleInput from '../stage_1/ProductTitleInput';

const ModalHeader = memo(({
    onClose,
    productName,
    onProductNameSave,
    productNameError = null,
    titlePlaceholder = "Product Name",
    closeButtonAriaLabel = "Close modal",
    isEditMode, // New prop
}) => {
    return (
        <header className="px-4 py-6 sm:px-6 sm:py-8 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10">
            <div className="flex justify-between items-center gap-x-2 sm:gap-x-4">
                <div className="flex-grow min-w-0">
                    <ProductTitleInput
                        initialValue={productName}
                        onSave={onProductNameSave}
                        placeholder={isEditMode ? "Edit Product Name..." : titlePlaceholder} // Dynamic placeholder
                        maxLength={100}
                        error={productNameError}
                        label={isEditMode ? `Editing: ${productName || 'Product'}` : "Product Name"} // Dynamic label
                    />
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-shrink-0 w-10 h-10 p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-800 focus-visible:ring-rose-500 transition-all duration-150 ease-in-out"
                    aria-label={closeButtonAriaLabel}
                >
                    <Icon name="close" className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
});

ModalHeader.displayName = 'ModalHeader';

ModalHeader.propTypes = {
    onClose: PropTypes.func.isRequired,
    productName: PropTypes.string.isRequired,
    onProductNameSave: PropTypes.func.isRequired,
    productNameError: PropTypes.string,
    titlePlaceholder: PropTypes.string,
    closeButtonAriaLabel: PropTypes.string,
};

ModalHeader.defaultProps = {
    productNameError: null,
    titlePlaceholder: 'Product Name',
    closeButtonAriaLabel: 'Close modal',
    isEditMode: false,
};

export default ModalHeader;