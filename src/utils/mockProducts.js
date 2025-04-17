import dayjs from 'dayjs';

export const featuredProducts = [
	{
		id: 1,
		name: 'Sourdough Boule',
		price: 8.99,
		description: 'Traditional 24-hour fermented sourdough with wild yeast starter',
		category: 'breads',
		image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
		weight: '800g',
		ingredients: ['organic flour', 'water', 'sea salt', 'sourdough starter'],
		rating: 4.8,
		stock: 15,
		icon: 'bakery_dining',
		badges: [
		{
			type: 'freeShipping',
			label: 'Free Shipping',
		},
		{
			type: 'bestseller',
			label: 'Bestseller',
		},
		{
			type: 'newArrival',
			label: 'New Arrival',
		},
		],
	},
	{
		id: 2,
		name: 'Pain au Chocolat',
		price: 4.99,
		description: 'French-style laminated pastry with premium dark chocolate',
		category: 'pastries',
		image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df',
		weight: '120g',
		ingredients: ['French butter', 'dark chocolate', 'organic flour', 'milk'],
		rating: 4.9,
		stock: 22,
		icon: 'croissant',
	},
	{
		id: 3,
		name: 'Almond Croissant',
		price: 5.50,
		description: 'Twice-baked croissant filled with almond cream and sliced almonds',
		category: 'pastries',
		image: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8',
		weight: '150g',
		ingredients: ['almond flour', 'butter', 'organic flour', 'vanilla'],
		rating: 4.7,
		stock: 18,
		icon: 'croissant',
	},
	{
		id: 4,
		name: 'Brioche Loaf',
		price: 12.99,
		description: 'Rich French brioche with golden crust and tender crumb',
		category: 'breads',
		image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
		weight: '600g',
		ingredients: ['organic flour', 'free-range eggs', 'butter', 'milk'],
		rating: 4.6,
		stock: 8,
		icon: 'bakery_dining',
	},
	{
		id: 5,
		name: 'Red Velvet Cake',
		price: 45.00,
		description: 'Three-layer signature cake with cream cheese frosting',
		category: 'cakes',
		image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
		weight: '1.8kg',
		ingredients: ['organic cocoa', 'beetroot', 'cream cheese', 'vanilla'],
		rating: 4.9,
		stock: 5,
		icon: 'cake',
	},
	{
		id: 6,
		name: 'Gluten-Free Seeded',
		price: 9.99,
		description: 'Nutrient-packed gluten-free loaf with sunflower and pumpkin seeds',
		category: 'special-diets',
		image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec',
		weight: '700g',
		ingredients: ['buckwheat flour', 'seeds', 'psyllium husk', 'olive oil'],
		rating: 4.5,
		stock: 12,
		icon: 'nutrition',
	},
	// Add 6 more products
	{
		id: 7,
		name: 'Danish Kringle',
		price: 28.00,
		description: 'Traditional Scandinavian pastry with almond filling',
		category: 'pastries',
		image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df',
		weight: '500g',
		ingredients: ['almond paste', 'cardamom', 'organic flour', 'butter'],
		rating: 4.8,
		stock: 7,
		icon: 'kebab_dining',
	},
	{
		id: 8,
		name: 'Ciabatta Rustica',
		price: 7.50,
		description: 'Italian-style ciabatta with crisp crust and open crumb',
		category: 'breads',
		image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
		weight: '450g',
		ingredients: ['type 00 flour', 'olive oil', 'yeast', 'water'],
		rating: 4.7,
		stock: 14,
		icon: 'flatbread',
	},
	{
		id: 9,
		name: 'Vegan Brownies',
		price: 3.99,
		description: 'Decadent vegan brownies with walnut pieces',
		category: 'special-diets',
		image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec',
		weight: '100g',
		ingredients: ['coconut oil', 'cacao', 'flax egg', 'walnuts'],
		rating: 4.6,
		stock: 25,
		icon: 'eco',
	},
	{
		id: 10,
		name: 'Croissant Bundle',
		price: 18.00,
		description: 'Assortment of 4 classic, almond, and chocolate croissants',
		category: 'pastries',
		image: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8',
		weight: '600g',
		ingredients: ['French butter', 'organic flour', 'dark chocolate', 'almonds'],
		rating: 4.9,
		stock: 9,
		icon: 'breakfast_dining',
	},
	{
		id: 11,
		name: 'Multigrain Batard',
		price: 8.25,
		description: 'Whole grain loaf with oats, flax, and sunflower seeds',
		category: 'breads',
		image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
		weight: '750g',
		ingredients: ['whole wheat', 'rye', 'oats', 'seeds'],
		rating: 4.7,
		stock: 11,
		icon: 'grain',
	},
	{
		id: 12,
		name: 'Opera Cake',
		price: 52.00,
		description: 'French coffee cake with layers of almond joconde and ganache',
		category: 'cakes',
		image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
		weight: '2kg',
		ingredients: ['almond flour', 'espresso', 'chocolate', 'butter'],
		rating: 5.0,
		stock: 3,
		icon: 'cake',
	}
];

// Simulated API calls
export const getFeaturedProducts = async () => {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 1000));
	return featuredProducts;
};

export const getProductById = async (id) => {
	const product = featuredProducts.find(p => p.id === Number(id));
	await new Promise(resolve => setTimeout(resolve, 500));
	return product || null;
};

// Helper function for related products
export const getRelatedProducts = (currentProductId) => {
	const currentProduct = featuredProducts.find(p => p.id === currentProductId);
	if (!currentProduct) return [];

	return featuredProducts.filter(p =>
		p.category === currentProduct.category &&
		p.id !== currentProductId
	).slice(0, 3);
};

// Add these to your existing mockProducts.js

// Weekly Special
export const getWeeklySpecial = async () => {
	await new Promise(resolve => setTimeout(resolve, 800));
	return {
		name: "Raspberry Pistachio Tart",
		description: "A flaky pistachio crust filled with fresh raspberries and cream.",
		image: "https://www.charlottepuckette.com/wp-content/uploads/2020/04/Wz6q3KRQjrOo0U6N531g_thumb_3060.jpg",
		price: 6.99,
		expiresAt: dayjs().endOf("week").toISOString()
	};
};

// Product Categories
export const getCategories = async () => {
	await new Promise(resolve => setTimeout(resolve, 500));
	return ['Breads', 'Pastries', 'Cakes', 'Special Diets'];
};

// Testimonials
export const getTestimonials = async () => {
	await new Promise(resolve => setTimeout(resolve, 700));
	return [/*...testimonial data...*/];
};