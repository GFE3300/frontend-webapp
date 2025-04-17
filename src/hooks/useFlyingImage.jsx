// src/hooks/useFlyingImage.js
import { useState } from 'react';
import FlyingImage from '../components/animations/flying_image/FlyingImage';
import { useFlyingImageContext } from '../components/animations/flying_image/FlyingImageContext';

/**
 * Hook to trigger flying image animation to cart
 * @returns {Function} triggerFlyingImage - Function to start the animation
 */

const useFlyingImage = () => {
	const [activeAnimation, setActiveAnimation] = useState(null);
	const { desktopTargetRef, mobileTargetRef } = useFlyingImageContext();

	const triggerFlyingImage = (sourceRef, icon) => {
		const isDesktop = window.matchMedia('(min-width: 768px)').matches;
		const targetRef = isDesktop ? desktopTargetRef : mobileTargetRef;

		if (activeAnimation || !sourceRef.current || !targetRef.current) return;

		const sourceRect = sourceRef.current.getBoundingClientRect();
		const targetRect = targetRef.current.getBoundingClientRect();

		const initialPos = {
			x: sourceRect.left + sourceRect.width / 2,
			y: sourceRect.top + sourceRect.height / 2
		};

		const targetPos = {
			x: targetRect.left + targetRect.width / 2,
			y: targetRect.top + targetRect.height / 2
		};

		const handleComplete = () => {
			setActiveAnimation(null);
		};

		if (!Number.isFinite(targetPos.x) || !Number.isFinite(targetPos.y)) {
			console.error('Invalid target position:', targetPos);
			return;
		}

		console.log('Initial Position:', initialPos);
		console.log('Target Position:', targetPos);

		setActiveAnimation(
			<FlyingImage
				src={sourceRef.current}
				icon={icon}
				initialPos={initialPos}
				targetPos={targetPos}
				onComplete={handleComplete}
			/>
		);
	};

	return { triggerFlyingImage, activeAnimation };
};

export default useFlyingImage;