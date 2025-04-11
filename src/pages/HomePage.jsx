import Header from "../components/header/Header";
import AboutSection from "../components/layout/AboutSection";

const HomePage = () => {
    return (
        <div className="min-h-screen bg-cream-50">
            {/* --- Header/Hero Section --- */}
            <Header />

            {/* --- Featured Products & Promotions --- */}
            <section className="py-16 px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Seasonal Specialties</h2>
                <div className="container mx-auto">
                    {/* ProductCarousel component will map through featuredProducts here */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-64 bg-gray-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- About/Bakery Story --- */}
            <section className="about-section py-16 bg-white">
                <AboutSection />
            </section>

            {/* --- Categories & Navigation --- */}
            <section className="py-16 container mx-auto">
                <div className="mb-8 flex gap-4 justify-center">
                    {/* CategoryNav component with interactive buttons */}
                    {['Breads', 'Pastries', 'Cakes', 'Special Diets'].map((category) => (
                        <button key={category} className="px-4 py-2 bg-gray-100 rounded">
                            {category}
                        </button>
                    ))}
                </div>
                {/* SearchBar component placeholder */}
                <div className="max-w-md mx-auto bg-gray-100 h-12 rounded"></div>
            </section>

            {/* --- Testimonials & Social Proof --- */}
            <section className="py-16 bg-cream-100">
                <h2 className="text-3xl font-bold text-center mb-12">Customer Stories</h2>
                <div className="container mx-auto grid gap-6 md:grid-cols-2">
                    {/* TestimonialCarousel will map through testimonials here */}
                    {[1, 2].map((testimonial) => (
                        <div key={testimonial} className="p-6 bg-white rounded-lg shadow-sm">
                            <p className="mb-4">"Testimonial text placeholder..."</p>
                            <p className="text-gold-500">- Customer Name</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Conversion & Engagement --- */}
            <section className="py-16 container mx-auto text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                    {/* NewsletterSignup component */}
                    <div className="mb-12 bg-gray-100 h-12 rounded mx-auto max-w-md"></div>
                    {/* LoyaltyPromo component */}
                    <div className="bg-gray-100 h-48 rounded-lg"></div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-espresso-950 text-white py-12">
                <div className="container mx-auto grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">Navigation</h3>
                        {/* FooterNav component links */}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                        {/* SocialIcons component */}
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-cream-100">© 2024 Premium Bakery. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;