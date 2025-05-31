import React from 'react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard'; // Assuming this is in the same directory
import HorizontalScroll from './HorizontalScroll'; // Assuming this is in the same directory
import Icon from '../../../components/common/Icon'; // Adjusted path

const CARD_CONTENT_WIDTH = 240; // Referenced for placeholder in chunking logic

// Helper to chunk array for desktop layout
const chunkArray = (array, chunkSize) => {
	const chunks = [];
	if (!array || !Array.isArray(array) || chunkSize <= 0) return chunks;
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
};

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
	if (!categorizedProducts || Object.keys(categorizedProducts).length === 0) {
		return (
			<motion.div
				initial="initial"
				animate="in"
				exit="out"
				variants={pageVariants}
				transition={pageTransition}
				className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[calc(100vh-200px)]"
				aria-live="polite"
			>
				<Icon name="sentiment_very_dissatisfied" className="w-20 h-20 text-neutral-400 dark:text-neutral-500 mb-5" />
				<h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
					Menu Not Available
				</h2>
				<p className="text-neutral-500 dark:text-neutral-400 max-w-md">
					It seems there are no items on the menu at this moment. Please check back later or ask our staff for assistance.
				</p>
			</motion.div>
		);
	}

	const sortedCategories = Object.values(categorizedProducts)
		.map(cat => ({ ...DEFAULT_CATEGORY_DETAILS, ...cat })) // Apply defaults
		.sort((a, b) => a.display_order - b.display_order);

	return (
		<motion.div
			initial="initial"
			animate="in"
			exit="out"
			variants={pageVariants}
			transition={pageTransition}
			className="pt-6 pb-20 md:pb-6" // Padding bottom for mobile nav, less for desktop
		>
			<h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8 text-center px-4 font-montserrat">
				{pageTitle}
			</h1>

			{sortedCategories.map((categoryDetails) => {
				if (!categoryDetails.items || categoryDetails.items.length === 0) {
					return null; // Skip rendering if category has no items
				}

				const sortedItems = [...categoryDetails.items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

				// Determine icon text color based on background lightness
				let iconTextColorClass = "text-white"; // Default for dark backgrounds
				const color = categoryDetails.color_class || "";
				if (color.includes("-50") || color.includes("-100") || color.includes("-200") ||
					color.includes("yellow") || color.includes("lime") || color.includes("amber") ||
					color.includes("white") || color.includes("slate-50") || color.includes("gray-50")) {
					iconTextColorClass = "text-neutral-700 dark:text-neutral-800"; // For light backgrounds
				} else if (color.includes("-300") || color.includes("-400")) {
					iconTextColorClass = "text-neutral-800 dark:text-neutral-100"; // For mid-range light colors
				}


				return (
					<motion.section
						key={categoryDetails.id}
						className="mb-10"
						variants={categorySectionVariants} // Use variants for the section itself
						initial="initial" // These apply to the section's animation
						whileInView="animate"
						viewport={{ once: true, amount: 0.1 }}
						aria-labelledby={`category-title-${categoryDetails.id}`}
					>
						<motion.div variants={categoryHeaderVariants} className="px-4 md:px-6 mb-4 flex items-center">
							<span className={`mr-3 p-2 rounded-xl shadow-sm ${categoryDetails.color_class || 'bg-gray-400'} flex items-center justify-center`}>
								<Icon name={categoryDetails.icon_name || 'label'} className={`w-5 h-5 ${iconTextColorClass}`} aria-hidden="true" />
							</span>
							<h2
								id={`category-title-${categoryDetails.id}`}
								className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100"
							>
								{categoryDetails.name}
							</h2>
						</motion.div>

						{/* Mobile: Simple HorizontalScroll */}
						<motion.div variants={horizontalScrollVariants} className="md:hidden">
							<HorizontalScroll className="pl-4 pr-2">
								{sortedItems.map((product) => (
									<MenuItemCard
										key={product.id}
										product={product} // Pass the full product object
										onOpenOptionsPopup={onOpenOptionsPopup}
									/>
								))}
							</HorizontalScroll>
						</motion.div>

						{/* Desktop: Chunked HorizontalScroll (2 items per "column" in the scroll) */}
						<motion.div variants={horizontalScrollVariants} className="hidden md:block">
							<HorizontalScroll className="pl-6 pr-4">
								{chunkArray(sortedItems, 2).map((itemPair, pairIndex) => (
									<div key={`pair-${pairIndex}-${categoryDetails.id}`} className="flex flex-col space-y-6">
										{itemPair.map(product => (
											<MenuItemCard
												key={product.id}
												product={product} // Pass the full product object
												onOpenOptionsPopup={onOpenOptionsPopup}
											/>
										))}
										{/* If a pair has only one item, render an invisible placeholder to maintain structure.
                                            This ensures consistent spacing if the last "column" in the scroll has one item. */}
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