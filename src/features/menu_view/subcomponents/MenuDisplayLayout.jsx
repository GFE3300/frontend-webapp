import React from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard';
import HorizontalScroll from './HorizontalScroll'; // Assuming this is the corrected path and component
import Icon from '../../../components/common/Icon'; // For category icons

// Helper to chunk array for desktop layout (can be moved to a utils file if used elsewhere)
const chunkArray = (array, chunkSize) => {
	const chunks = [];
	if (!array || !Array.isArray(array)) return chunks;
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
};

const pageVariants = {
	initial: { opacity: 0, y: 20 }, // Adjusted for a subtle upward entry
	in: { opacity: 1, y: 0 },
	out: { opacity: 0, y: -20 }, // Adjusted for a subtle upward exit
};

const pageTransition = {
	type: 'tween', // "spring" can also be nice here, "tween" is smoother for page transitions
	ease: [0.42, 0, 0.58, 1], // A common ease-in-out cubic bezier
	duration: 0.4,
};

const categoryHeaderVariants = {
	initial: { opacity: 0, x: -20 },
	animate: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.4, ease: "easeOut" } },
};

const horizontalScrollVariants = {
	initial: { opacity: 0, y: 15 },
	animate: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4, ease: "easeOut" } },
};

function MenuDisplayLayout({ categorizedProducts, onOpenOptionsPopup, pageTitle = "Menu" }) {
	if (!categorizedProducts || Object.keys(categorizedProducts).length === 0) {
		return (
			<motion.div
				initial="initial"
				animate="in"
				exit="out"
				variants={pageVariants}
				transition={pageTransition}
				className="flex flex-col items-center justify-center h-full p-8 text-center"
			>
				<Icon name="sentiment_dissatisfied" className="w-24 h-24 text-neutral-400 dark:text-neutral-500 mb-6" />
				<h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
					Nothing to see here yet!
				</h2>
				<p className="text-neutral-500 dark:text-neutral-400">
					It seems there are no products available in this menu at the moment.
				</p>
			</motion.div>
		);
	}

	// Assuming categorizedProducts is an object where keys are category IDs/slugs
	// and values are objects like: { name, color_class, icon_name, items: [productObject, ...] }
	// Or, if it's just { categoryName: [productObject, ...], then color_class and icon_name need to be sourced from the product's category_details.
	// For this implementation, I'll assume the parent prepares it as:
	// { categoryId: { name, color_class, icon_name, display_order, items: [product] } }
	// And we sort categories by display_order.

	const sortedCategories = Object.values(categorizedProducts).sort((a, b) => a.display_order - b.display_order);

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
				if (!categoryDetails.items || categoryDetails.items.length === 0) return null;

				const categoryName = categoryDetails.name || "Uncategorized";
				// Default color and icon if not provided
				const colorClass = categoryDetails.color_class || 'bg-neutral-500';
				const iconName = categoryDetails.icon_name || 'restaurant';
				const textColorClass = colorClass.replace('bg-', 'text-').replace('-500', '-700 dark:text-' + colorClass.split('-')[1] + '-300'); // Heuristic for text color

				return (
					<motion.div
						key={categoryDetails.id || categoryName}
						className="mb-10"
						initial="initial" // Stagger children within each category section if desired
						whileInView="animate" // Animate when in view
						viewport={{ once: true, amount: 0.1 }} // Trigger animation once, when 10% is visible
						variants={{ animate: { transition: { staggerChildren: 0.07 } } }} // Stagger children
					>
						<motion.div variants={categoryHeaderVariants} className="px-4 md:px-6 mb-4 flex items-center">
							<span className={`mr-3 p-1.5 rounded-lg ${colorClass}`}>
								<Icon name={iconName} className="w-5 h-5 text-white" />
							</span>
							<h2 className={`text-2xl font-semibold ${textColorClass}`}>
								{categoryName}
							</h2>
						</motion.div>

						{/* Mobile: Simple HorizontalScroll */}
						<motion.div variants={horizontalScrollVariants} className="md:hidden">
							<HorizontalScroll className="pl-4 pr-2"> {/* Adjust padding for edge cards */}
								{categoryDetails.items.map((product) => (
									<MenuItemCard
										key={product.id}
										product={product}
										onOpenOptionsPopup={onOpenOptionsPopup}
									/>
								))}
							</HorizontalScroll>
						</motion.div>

						{/* Desktop: Chunked HorizontalScroll (2 items per "column" in the scroll) */}
						<motion.div variants={horizontalScrollVariants} className="hidden md:block">
							<HorizontalScroll className="pl-6 pr-4"> {/* Adjust padding for edge cards */}
								{chunkArray(categoryDetails.items, 2).map((itemPair, pairIndex) => (
									<div key={`pair-${pairIndex}-${categoryDetails.id || categoryName}`} className="flex flex-col space-y-6"> {/* Increased space-y */}
										{itemPair.map(product => (
											<MenuItemCard
												key={product.id}
												product={product}
												onOpenOptionsPopup={onOpenOptionsPopup}
											/>
										))}
									</div>
								))}
							</HorizontalScroll>
						</motion.div>
					</motion.div>
				);
			})}
		</motion.div>
	);
}

export default MenuDisplayLayout;