// frontend/src/features/menu_view/subcomponents/MenuDisplayLayout.jsx
// (Path from your frontend.txt)

import React from 'react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard'; // REVIEW: Ensure this path is correct.
import HorizontalScroll from './HorizontalScroll'; // REVIEW: Ensure this path is correct.
import Icon from '../../../components/common/Icon'; // REVIEW: Ensure this path is correct.

// Referenced for placeholder in chunking logic for desktop.
// REVIEW: Ensure this matches the actual CARD_CONTENT_WIDTH in MenuItemCard.jsx for consistent layout.
const CARD_CONTENT_WIDTH = 240;

// Helper to chunk array for desktop layout
const chunkArray = (array, chunkSize) => {
	const chunks = [];
	if (!array || !Array.isArray(array) || chunkSize <= 0) return chunks;
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
};

// REVIEW: Page transition variants. Ensure they provide the desired entry/exit feel.
const pageVariants = {
	initial: { opacity: 0, y: 20 },
	in: { opacity: 1, y: 0 },
	out: { opacity: 0, y: -20 },
};

const pageTransition = {
	type: 'tween',
	ease: [0.42, 0, 0.58, 1], // Smooth easing
	duration: 0.4,
};

// REVIEW: Animation variants for category sections and headers.
const categorySectionVariants = {
	initial: { opacity: 0, y: 30 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const categoryHeaderVariants = {
	initial: { opacity: 0, x: -20 },
	animate: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.4, ease: "easeOut" } },
};

const horizontalScrollVariants = {
	initial: { opacity: 0, y: 15 },
	animate: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4, ease: "easeOut" } },
};

// REVIEW: Default category details if backend data is missing parts.
const DEFAULT_CATEGORY_DETAILS = {
	name: "Uncategorized",
	color_class: "bg-neutral-500 dark:bg-neutral-600", // A neutral default
	icon_name: "label", // A generic icon
	display_order: 999,
};

/**
 * Displays a list of products, categorized and sorted, with appropriate layouts for mobile and desktop.
 */
function MenuDisplayLayout({ categorizedProducts, onOpenOptionsPopup, pageTitle = "Menu" }) {
	// CRITICAL: Empty/Error State. Test this by providing null/empty `categorizedProducts`.
	if (!categorizedProducts || Object.keys(categorizedProducts).length === 0) {
		return (
			<motion.div
				initial="initial"
				animate="in"
				exit="out"
				variants={pageVariants}
				transition={pageTransition}
				className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[calc(100vh-200px)]" // REVIEW: Height and padding for empty state.
				aria-live="polite"
			>
				<Icon name="sentiment_very_dissatisfied" className="w-20 h-20 text-neutral-400 dark:text-neutral-500 mb-5" /> {/* REVIEW: Icon and styling. */}
				<h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
					Menu Not Available
				</h2>
				<p className="text-neutral-500 dark:text-neutral-400 max-w-md">
					It seems there are no items on the menu at this moment. Please check back later or ask our staff for assistance.
				</p>
			</motion.div>
		);
	}

	// CRITICAL: Data processing. Relies on `categorizedProducts` from `Userpage.jsx`.
	const sortedCategories = Object.values(categorizedProducts)
		.map(cat => ({ ...DEFAULT_CATEGORY_DETAILS, ...cat })) // Apply defaults
		.sort((a, b) => a.display_order - b.display_order); // Sort categories by `display_order`.

	return (
		<motion.div
			initial="initial"
			animate="in"
			exit="out"
			variants={pageVariants}
			transition={pageTransition}
			className="pt-6 pb-20 md:pb-6" // REVIEW: Padding for mobile (pb-20 for BottomNav) and desktop (pb-6).
		>
			{/* REVIEW: Page title styling (font, size, color, margin). */}
			<h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 text-center px-4 font-montserrat">
				{pageTitle}
			</h1>

			{sortedCategories.map((categoryDetails) => {
				// Skip rendering category if it has no items.
				if (!categoryDetails.items || categoryDetails.items.length === 0) {
					return null;
				}

				// CRITICAL: Sort items within the category by `display_order`.
				const sortedItems = [...categoryDetails.items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

				// Logic to determine icon text color based on category background lightness.
				// REVIEW: This logic for `iconTextColorClass`. Test with various `color_class` values from backend.
				let iconTextColorClass = "text-white";
				const color = categoryDetails.color_class || "";
				if (color.includes("-50") || color.includes("-100") || color.includes("-200") ||
					color.includes("yellow") || color.includes("lime") || color.includes("amber") ||
					color.includes("white") || color.includes("slate-50") || color.includes("gray-50")) {
					iconTextColorClass = "text-neutral-700 dark:text-neutral-800";
				} else if (color.includes("-300") || color.includes("-400")) {
					iconTextColorClass = "text-neutral-800 dark:text-neutral-100";
				}


				return (
					<motion.section
						key={categoryDetails.id}
						className="mb-10" // REVIEW: Margin between category sections.
						variants={categorySectionVariants}
						initial="initial"
						whileInView="animate" // Animates when section scrolls into view.
						viewport={{ once: true, amount: 0.1 }} // REVIEW: `amount: 0.1` means 10% of section visible to trigger.
						aria-labelledby={`category-title-${categoryDetails.id}`}
					>
						{/* Category Header */}
						<motion.div variants={categoryHeaderVariants} className="px-4 md:px-6 mb-4 flex items-center"> {/* REVIEW: Padding and margin for header. */}
							{/* REVIEW: Category icon container styling (margin, padding, shadow, background from `color_class`). */}
							<span className={`mr-3 p-2 rounded-xl shadow-sm ${categoryDetails.color_class || 'bg-gray-400'} flex items-center justify-center`}>
								{/* REVIEW: Category icon styling (size, color from `iconTextColorClass`). `icon_name` comes from backend. */}
								<Icon name={categoryDetails.icon_name || 'label'} className={`w-5 h-5 ${iconTextColorClass}`} aria-hidden="true" />
							</span>
							<h2
								id={`category-title-${categoryDetails.id}`}
								className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100" // REVIEW: Category title styling.
							>
								{categoryDetails.name} {/* Category name from backend. */}
							</h2>
						</motion.div>

						{/* Mobile: Simple HorizontalScroll for items */}
						<motion.div variants={horizontalScrollVariants} className="md:hidden">
							{/* REVIEW: `HorizontalScroll` padding (pl-4 pr-2). */}
							<HorizontalScroll className="pl-4 pr-2">
								{sortedItems.map((product) => (
									<MenuItemCard
										key={product.id}
										product={product} // Pass the full product object
										onOpenOptionsPopup={onOpenOptionsPopup} // Callback from Userpage.jsx
									/>
								))}
							</HorizontalScroll>
						</motion.div>

						{/* Desktop: Chunked HorizontalScroll (2 items per "column") */}
						<motion.div variants={horizontalScrollVariants} className="hidden md:block">
							{/* REVIEW: `HorizontalScroll` padding (pl-6 pr-4). */}
							<HorizontalScroll className="pl-6 pr-4">
								{chunkArray(sortedItems, 2).map((itemPair, pairIndex) => (
									// REVIEW: Spacing between items in a pair (`space-y-6`).
									<div key={`pair-${pairIndex}-${categoryDetails.id}`} className="flex flex-col space-y-6">
										{itemPair.map(product => (
											<MenuItemCard
												key={product.id}
												product={product}
												onOpenOptionsPopup={onOpenOptionsPopup}
											/>
										))}
										{/* Placeholder for consistent spacing if last pair has only one item. */}
										{itemPair.length === 1 && <div style={{ width: CARD_CONTENT_WIDTH, height: 1 }} aria-hidden="true" className="opacity-0 pointer-events-none"></div>}
									</div>
								))}
							</HorizontalScroll>
						</motion.div>
					</motion.section>
				);
			})}
		</motion.div>
	);
}

export default MenuDisplayLayout;