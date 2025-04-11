const AboutSection = () => {
    return (
        <section
            className="relative py-24 px-4 bg-cream-50 overflow-hidden"
            aria-labelledby="about-heading"
        >
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
                {/* Image Section */}
                <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                        src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80"
                        alt="Artisan bakers preparing bread in a traditional stone oven"
                        className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Text Content */}
                <div className="space-y-6 md:space-y-8">
                    <h2
                        id="about-heading"
                        className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight"
                    >
                        Crafted with Passion Since 1985
                    </h2>

                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Born from a family tradition of French patisserie, our bakery blends centuries-old
                        techniques with modern artistry. Each morning, our master bakers knead, proof, and
                        bake using locally-sourced heirloom grains and the purest Normandy butter. From our
                        signature sourdough starter - lovingly maintained for three generations - to the
                        hand-folded layers in our viennoiserie, we honor the craft in every detail.
                    </p>

                    <div className="mt-8">
                        <button
                            className="inline-flex items-center px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white rounded-lg 
                transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500 
                focus:ring-offset-2 text-lg font-medium"
                            aria-label="Learn more about our bakery story"
                        >
                            Discover Our Legacy
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-3 h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gold-100/30 rounded-full blur-3xl -translate-x-20 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gold-100/20 rounded-full blur-3xl translate-x-20 translate-y-12" />
        </section>
    );
};

export default AboutSection;