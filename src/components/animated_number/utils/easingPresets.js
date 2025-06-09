/**
 * Predefined easing curves for consistent animations across the app.
 * Each key maps to a cubic-bezier control points array.
 */
export const easingPresets = {
    /**
     * Starts quickly and decelerates toward the end.
     * Commonly used for natural janky motion when elements settle.
     */
    easeOut: [0, 0, 0.58, 1],

    /**
     * Starts slowly and accelerates toward the end.
     * Useful for emphasizing entrance motion.
     */
    easeIn: [0.42, 0, 1, 1],

    /**
     * Constant speed throughout the animation.
     * Ideal for uniform, mechanical transitions.
     */
    linear: [0, 0, 1, 1],

    /**
     * Fast start, overshoots slightly, then settles back.
     * Great for playful, bouncy interactions.
     */
    easeOutBack: [0.34, 1.56, 0.64, 1],
};
