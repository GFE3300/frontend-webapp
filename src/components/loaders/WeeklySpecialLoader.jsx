const WeeklySpecialLoader = () => {
    return (
        <section className="relative h-120 isolate overflow-hidden shadow-lg bg-black text-white">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black animate-pulse" />

            {/* Soft blur overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Glowing bubbles */}
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                <div className="glowing-bubbles">
                    <span className="bubble bubble-1" />
                    <span className="bubble bubble-2" />
                    <span className="bubble bubble-3" />
                </div>
            </div>

            {/* Structured skeleton layout */}
            <div className="relative z-10 px-6 py-16 pt-32 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-10">
                {/* Text Content Skeleton */}
                <div className="max-w-xl w-full space-y-4">
                    <div className="h-4 w-1/3 bg-gray-500/50 rounded animate-pulse" />
                    <div className="h-8 w-2/3 bg-gray-400/60 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-400/40 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-400/40 rounded animate-pulse" />

                    <div className="flex items-center gap-3 text-xs mb-2 pt-2">
                        <div className="h-6 w-24 bg-gray-600/30 rounded-full animate-pulse" />
                        <div className="h-6 w-28 bg-gray-600/30 rounded-full animate-pulse" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="h-10 w-32 bg-[var(--color-caramel)]/30 rounded-full animate-pulse" />
                        <div className="h-10 w-40 bg-white/20 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Image Placeholder */}
                <div className="hidden md:block md:max-w-sm w-full h-72 aspect-square bg-gray-600/40 rounded-2xl animate-pulse shadow-xl" />
            </div>
        </section>
    );
};

export default WeeklySpecialLoader;
