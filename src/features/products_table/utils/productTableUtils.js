// Example mock data structure (you'll fetch this from your backend later)
export const mockProductsData = [
    {
        id: 'prod_1',
        name: 'Artisan Sourdough Loaf - Classic White',
        thumbnailUrl: 'https://via.placeholder.com/32/FFC107/000000?Text=SL', // Placeholder image
        description: 'A classic sourdough loaf with a crispy crust and soft, chewy interior. Made with organic flour and a long fermentation process for maximum flavor.',
        category: 'Breads',
        tags: ['Sourdough', 'Organic', 'Vegan', 'Best Seller', 'High Fiber'],
        price: 8.50,
        cost: 3.20,
        stockLevel: 78, // Percentage
        stockQuantity: 12, // Actual units
        lowStockThreshold: 10,
        salesLast7Days: [5, 7, 6, 9, 12, 8, 10], // Orders per day for last 7 days
        status: 'active', // 'active' or 'inactive'
        order: 1, // For drag-and-drop reordering
    },
    {
        id: 'prod_2',
        name: 'Chocolate Croissant - Extra Flaky',
        thumbnailUrl: 'https://via.placeholder.com/32/8BC34A/FFFFFF?Text=CC',
        description: 'Buttery, flaky croissant filled with rich dark chocolate batons. A morning favorite.',
        category: 'Pastries',
        tags: ['Chocolate', 'Morning Treat'],
        price: 4.25,
        cost: 1.50,
        stockLevel: 45,
        stockQuantity: 23,
        lowStockThreshold: 5,
        salesLast7Days: [10, 15, 12, 18, 20, 22, 17],
        status: 'active',
        order: 2,
    },
    {
        id: 'prod_3',
        name: 'Blueberry Muffin (Gluten-Free)',
        thumbnailUrl: 'https://via.placeholder.com/32/03A9F4/FFFFFF?Text=BM',
        description: 'A moist and delicious gluten-free blueberry muffin, packed with fresh blueberries.',
        category: 'Muffins',
        tags: ['Gluten-Free', 'Berry'],
        price: 3.75,
        cost: 1.20,
        stockLevel: 15,
        stockQuantity: 7,
        lowStockThreshold: 8,
        salesLast7Days: [3, 2, 5, 4, 6, 3, 5],
        status: 'inactive',
        order: 3,
    },
    // ... more products
];