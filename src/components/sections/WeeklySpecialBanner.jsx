import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchWeeklySpecial } from "../../services/api";
import WeeklySpecialLoader from "../loaders/WeeklySpecialLoader";

const WeeklySpecialBanner = () => {
    const [weeklySpecial, setWeeklySpecial] = useState(null);
    const [daysLeft, setDaysLeft] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const special = await fetchWeeklySpecial();

            // Preload the image
            const img = new Image();
            img.src = special.image;
            img.onload = () => setImageLoaded(true);
            img.onerror = () => setImageLoaded(true); // Handle error gracefully

            // Set data after starting image load
            setWeeklySpecial(special);

            const now = dayjs();
            const end = dayjs(special.expiresAt);
            const diff = end.diff(now, "day");
            setDaysLeft(diff >= 0 ? diff : 0);
        };

        loadData();
    }, []);

    // Show loader until both data and image are ready
    if (!weeklySpecial || !imageLoaded) {
        return <WeeklySpecialLoader />;
    }

    return (
        <section className="relative h-120 isolate overflow-hidden shadow-lg bg-black text-white">
            {/* Background image with fade-in */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                style={{
                    backgroundImage: `url(${weeklySpecial.image})`,
                    opacity: imageLoaded ? 1 : 0
                }}
                aria-hidden="true"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Content with fade-up animation */}
            <div className="relative z-10 px-6 py-16 pt-32 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl">
                    <p className="text-sm uppercase tracking-wider text-[var(--color-caramel)] mb-2">
                        Weekly Special
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-playfair font-semibold mb-3">
                        {weeklySpecial.name}
                    </h2>
                    <p className="text-sm opacity-90 leading-relaxed mb-4">
                        {weeklySpecial.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs mb-6">
                        <span className="bg-white/10 px-3 py-1 rounded-full">
                            🔥 Limited Edition
                        </span>
                        {daysLeft !== null && (
                            <span className="bg-white/10 px-3 py-1 rounded-full">
                                ⏳ {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button className="bg-[var(--color-caramel)] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#b08b6f] transition">
                            View Details
                        </button>
                        <button className="bg-white text-[var(--color-caramel)] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#f8f1ed] transition">
                            Add to Cart - ${weeklySpecial.price.toFixed(2)}
                        </button>
                    </div>
                </div>

                {/* Optional: product image standalone for desktop */}
                <div className="hidden md:block md:max-w-sm rounded-2xl overflow-hidden shadow-xl">
                    <img
                        src={weeklySpecial.image}
                        alt={weeklySpecial.name}
                        className="w-full h-72 object-cover"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
};

export default WeeklySpecialBanner;