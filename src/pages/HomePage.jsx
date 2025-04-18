import React, { useEffect, useState } from "react";
import Header from "../components/header/Header";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import AboutSection from "../components/layout/AboutSection";
import WeeklySpecialBanner from "../components/sections/WeeklySpecialBanner";
import { fetchCategories } from "../services/api";


const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

const categories = [
    {
        id: 'bread',
        title: 'Artisan Breads',
        image: 'https://source.unsplash.com/collection/bread/100x100',
        items: [
            { id: 'sourdough', price: 5.5 },
            { id: 'rye', price: 6.0 },
        ],
    },
    {
        id: 'pastries',
        title: 'Pastries',
        image: 'https://source.unsplash.com/collection/pastries/100x100',
        items: [
            { id: 'croissant', price: 3.0 },
            { id: 'danish', price: 3.5 },
        ],
    },
    {
        id: 'cakes',
        title: 'Cakes',
        image: 'https://source.unsplash.com/collection/cakes/100x100',
        items: [
            { id: 'cheesecake', price: 20.0 },
            { id: 'chocolate', price: 22.0 },
        ],
    },
];

const user = {
    name: 'Jane Doe',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
};

const HomePage = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchCategories();
            setCategories(data);
        };
        loadCategories();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-cream)]">
            {/* --- Header/Hero Section --- */}
            <Header
                navLinks={navLinks}
                categories={categories}
                user={user}
            />

            {/* --- Weekly Special Banner --- */}
            <WeeklySpecialBanner />

            {/* --- Featured Products & Promotions --- */}
            <FeaturedProducts />

            {/* --- About/Bakery Story --- */}
            <AboutSection />

            {/* --- Categories & Navigation --- */}
            <section className="section-padding bg-[var(--color-white)]">
                <div className="container">
                    <div className="flex flex-wrap gap-4 justify-center mb-8">
                        {['Breads', 'Pastries', 'Cakes', 'Special Diets'].map((category) => (
                            <button
                                key={category}
                                className="btn btn-outline"
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="max-w-md mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search our creations..."
                            className="w-full px-6 py-3 rounded-full border border-[var(--color-caramel)] focus:ring-2 focus:ring-[var(--color-caramel)]"
                        />
                    </div>
                </div>
            </section>

            {/* --- Testimonials & Social Proof --- */}
            <section className="section-padding bg-[var(--color-rose)]">
                <div className="container">
                    <h2 className="section-title text-[var(--color-chocolate)]">
                        Sweet Words From Our Clients
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        {[1, 2].map((testimonial) => (
                            <div key={testimonial} className="card group">
                                <p className="text-body italic mb-4">
                                    "The most exquisite croissants I've tasted outside Paris. Every
                                    bite tells a story of craftsmanship and passion."
                                </p>
                                <p className="text-subheading">- Marie Leclerc</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Conversion & Engagement --- */}
            <section className="section-padding">
                <div className="container max-w-3xl text-center">
                    <h2 className="section-title text-[var(--color-chocolate)]">
                        Join Our Artisan Circle
                    </h2>
                    <div className="space-y-12">
                        <div className="card p-8 space-y-4">
                            <h3 className="text-subheading">
                                Get Fresh Updates
                            </h3>
                            <div className="flex gap-4 justify-center">
                                <input
                                    type="email"
                                    placeholder="Your best email..."
                                    className="flex-1 px-6 py-3 rounded-full border border-[var(--color-caramel)]"
                                />
                                <button className="btn btn-primary">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        <div className="card p-8 bg-[var(--color-blush)]">
                            <h3 className="text-subheading mb-4">
                                Earn Golden Crust Rewards
                            </h3>
                            <p className="text-body mb-6">
                                Join our loyalty program and turn every purchase into
                                delicious rewards.
                            </p>
                            <button className="btn btn-secondary">
                                Discover Benefits
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-[var(--color-chocolate)] text-[var(--color-cream)] py-12">
                <div className="container grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-heading mb-4">Navigation</h3>
                        <nav className="space-y-2">
                            {['Home', 'Menu', 'About', 'Contact'].map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="block hover:text-[var(--color-caramel)] transition-colors"
                                >
                                    {link}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div>
                        <h3 className="text-lg font-heading mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            {['Instagram', 'Facebook', 'Pinterest'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="hover:text-[var(--color-caramel)] transition-colors"
                                >
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="max-w-sm">
                            <p className="text-body">
                                © 2024 Artisan Bakehouse. Crafted with patience and
                                natural leavening. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;