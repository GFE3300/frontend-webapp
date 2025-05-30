import React from 'react';
import { motion } from 'framer-motion';

function FlyingItemAnimator({ imageUrl, startRect, endRect, onAnimationComplete }) {
  if (!startRect || !endRect ||
      typeof startRect.left !== 'number' || typeof startRect.top !== 'number' ||
      typeof startRect.width !== 'number' || typeof startRect.height !== 'number' ||
      typeof endRect.left !== 'number' || typeof endRect.top !== 'number' ||
      typeof endRect.width !== 'number' || typeof endRect.height !== 'number') {
    return null;
  }

  const initialBubbleSize = 60;
  const finalScale = 0;
  const arcHeight = 75;

  const initialCenterX = startRect.left + startRect.width / 2;
  const initialCenterY = startRect.top + startRect.height / 2;

  const iconActualHeightPx = 24;
  const navItemPaddingTopPx = 8;
  const targetCenterX = endRect.left + endRect.width / 2;
  const targetCenterY = endRect.top + navItemPaddingTopPx + (iconActualHeightPx / 2);

  const controlPointX = (initialCenterX + targetCenterX) / 2;
  const controlPointY = (initialCenterY + targetCenterY) / 2 - arcHeight;

  return (
    <motion.img
      src={imageUrl}
      alt="Flying item"
      className="fixed rounded-full object-cover z-[9999] shadow-lg"
      style={{
        transform: 'translate(-50%, -50%)',
      }}
      initial={{
        left: initialCenterX,
        top: initialCenterY,
        width: initialBubbleSize,
        height: initialBubbleSize,
        opacity: 0,
        scale: 0.5,
        rotate: -45,
      }}
      animate={{
        left: [initialCenterX, controlPointX, targetCenterX],
        top: [initialCenterY, controlPointY, targetCenterY],
        opacity: [0, 0.9, 0.9, 0],
        scale:   [0.5, 1.2, 0.8, finalScale],
        rotate:  [-45, 0, 270, 360],
      }}
      transition={{
        left:    { duration: 1.3, ease: "easeOut", times: [0, 0.5, 1] },
        top:     { duration: 1.3, ease: "easeOut", times: [0, 0.5, 1] },
        opacity: { duration: 1.3, ease: "easeInOut", times: [0, 0.2, 0.8, 1] },
        scale:   { duration: 1.3, ease: "backInOut", times: [0, 0.25, 0.5, 1] },
        rotate:  { duration: 1.3, ease: "easeInOut", times: [0, 0.15, 0.7, 1] }
      }}
      onAnimationComplete={() => {
        if (onAnimationComplete) {
            onAnimationComplete();
        }
      }}
    />
  );
}
export default FlyingItemAnimator;