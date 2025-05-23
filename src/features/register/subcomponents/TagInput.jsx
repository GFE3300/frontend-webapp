import React, { forwardRef, useState, useRef, useMemo, useCallback, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Icon from "../../../components/common/Icon";

/**
 * Accessible tag input component with suggestions, animations, and dark mode support
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.label - Input label text (required)
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.className] - Additional CSS classes
 * @param {string[]} [props.defaultTags] - Predefined tag suggestions
 * @param {number} [props.maxTags=10] - Maximum allowed tags
 * @param {Function} [props.onTagsChange] - Callback when tags change
 * @param {Function} [props.validateTag] - Tag validation function
 * @param {React.Ref} ref - React ref for input element
 */
const TagInput = memo(forwardRef(({
    label,
    error,
    value,
    className,
    defaultTags = [],
    maxTags = 10,
    onTagsChange,
    validateTag,
    ...props
}, ref) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const animationConfig = {
        tagSpring: { type: 'spring', stiffness: 400, damping: 30 },
        dropdown: {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 10 },
            transition: { duration: 0.2 }
        },
        tagItem: {
            initial: { scale: 0.8, opacity: 0, y: 10 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.8, opacity: 0, x: -20 }
        }
    };

    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [tags, setTags] = useState(value || []);
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // ===========================================================================
    // Memoized Values
    // ===========================================================================
    const filteredTags = useMemo(
        () => defaultTags.filter(tag =>
            tag.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.includes(tag)
        ),
        [defaultTags, tags, inputValue]
    );

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const addTag = useCallback((tag) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag || tags.length >= maxTags) return;
        if (validateTag && !validateTag(trimmedTag)) return;

        setTags(prev => [...prev, trimmedTag]);
        setInputValue('');
        inputRef.current?.focus();
    }, [tags, maxTags, validateTag]);

    const removeTag = useCallback((index) => {
        setTags(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (['Enter', ','].includes(e.key) && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue.trim());
        } else if (e.key === 'Backspace' && !inputValue) {
            removeTag(tags.length - 1);
        }
    }, [inputValue, tags, addTag, removeTag]);

    // ===========================================================================
    // Effects
    // ===========================================================================
    useEffect(() => {
        onTagsChange?.(tags);
    }, [tags, onTagsChange]);

    useEffect(() => {
        if (value && JSON.stringify(value) !== JSON.stringify(tags)) {
            setTags(value);
        }
    }, [value]);

    // ===========================================================================
    // Validation
    // ===========================================================================
    if (!label) {
        console.error('TagInput: Missing required "label" prop');
        return null;
    }

    // ===========================================================================
    // Rendering
    // ===========================================================================
    return (
        <LayoutGroup>
            <div
                className={`relative ${className}`}
                ref={containerRef}
                role="group"
                aria-labelledby="tagInputLabel"
            >
                <div className="flex flex-col gap-2">
                    {/* Label */}
                    <label className="absolute -top-7 left-3 origin-bottom-left pointer-events-none">
                        <motion.span
                            id="tagInputLabel"
                            className={`text-sm font-medium font-montserrat transition-colors duration-200 ${isFocused
                                ? 'text-rose-400 dark:text-rose-400'
                                : 'text-neutral-700 dark:text-gray-300'
                                }`}
                            initial={false}
                            transition={{ duration: 0.2 }}
                        >
                            {label}
                        </motion.span>
                    </label>

                    {/* Input & Tags Container */}
                    <div className="relative">
                        <input
                            {...props}
                            id="tagInput"
                            ref={(node) => {
                                if (typeof ref === 'function') ref(node);
                                else if (ref) ref.current = node;
                                inputRef.current = node;
                            }}
                            value={inputValue}
                            aria-describedby={error ? 'tagInputError' : undefined}
                            aria-invalid={!!error}
                            placeholder={tags.length >= maxTags ? 'Maximum tags reached' : 'Add a tag and press Enter...'}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => {
                                setIsFocused(true);
                                props.onFocus?.(e);
                            }}
                            onBlur={(e) => {
                                setTimeout(() => setIsFocused(false), 100);
                                props.onBlur?.(e);
                            }}
                            disabled={tags.length >= maxTags}
                            className={`
                                w-full py-2 px-4 rounded-full font-montserrat font-medium
                                bg-neutral-100 dark:bg-neutral-200
                                focus:outline-none focus:ring-2
                                transition-all duration-200
                                text-gray-900 dark:text-neutral-800 text-sm
                                ${error ? 'ring-2 ring-red-500 dark:ring-red-400' :
                                    'focus:ring-rose-400 dark:focus:ring-rose-400'}
                                ${tags.length >= maxTags ? 'cursor-not-allowed opacity-75' : ''}
                            `}
                        />

                        {/* Tag List */}
                        <motion.div
                            className="flex flex-wrap gap-2 mt-2"
                            layout
                            transition={animationConfig.tagSpring}
                        >
                            <AnimatePresence mode="popLayout">
                                {tags.map((tag, index) => (
                                    <motion.div
                                        key={tag}
                                        layout="position"
                                        {...animationConfig.tagItem}
                                        transition={animationConfig.tagSpring}
                                        className="flex items-center w-max h-max 
                                            bg-rose-100 dark:bg-rose-900 
                                            text-rose-600 dark:text-rose-400 
                                            px-3 py-1 rounded-full text-sm font-montserrat"
                                    >
                                        <span className="max-w-[160px] truncate">{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="ml-2 hover:text-rose-700 dark:hover:text-rose-400 
                        transition-colors w-6 h-6 flex items-center justify-center"
                                            aria-label={`Remove tag ${tag}`}
                                        >
                                            <Icon
                                                name="close"
                                                className="w-6 h-6"
                                                variations={{ fill: 1, weight: 600, grade: 0, opsz: 48 }}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {isFocused && filteredTags.length > 0 && (
                            <motion.ul
                                {...animationConfig.dropdown}
                                className="absolute top-20 left-0 z-20 w-full mt-2 
                                    bg-white dark:bg-neutral-200
                                    border border-neutral-200 dark:border-gray-600 
                                    rounded-2xl shadow-lg max-h-60 overflow-y-auto"
                                role="listbox"
                            >
                                {filteredTags.map((tag) => (
                                    <motion.li
                                        key={tag}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-4 py-2 
                                            hover:bg-rose-50 dark:hover:bg-neutral-300
                                            cursor-pointer transition-colors 
                                            text-sm font-montserrat 
                                            text-gray-900"
                                        role="option"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            addTag(tag);
                                        }}
                                    >
                                        {tag}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-2"
                                id="tagInputError"
                                role="alert"
                            >
                                <Icon
                                    name="error"
                                    className="w-6 h-6 text-red-600 dark:text-red-400"
                                    variations={{ fill: 1, weight: 700, grade: 0, opsz: 48 }}
                                    aria-hidden="true"
                                />
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium font-montserrat">
                                    {error}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </LayoutGroup>
    );
}));

TagInput.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
    className: PropTypes.string,
    defaultTags: PropTypes.arrayOf(PropTypes.string),
    maxTags: PropTypes.number,
    onTagsChange: PropTypes.func,
    validateTag: PropTypes.func
};

TagInput.defaultProps = {
    defaultTags: [],
    maxTags: 10
};

export default TagInput;