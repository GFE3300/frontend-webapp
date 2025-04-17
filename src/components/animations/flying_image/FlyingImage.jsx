import { color, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Icon from '../../common/Icon';

const FlyingImage = ({ icon, initialPos, targetPos, onComplete }) => {
    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        onComplete?.();
        return null;
    }

    return createPortal(
        <motion.div
            className={`
                flex items-center justify-center
                fixed z-[9999] w-15 h-15
                pointer-events-none 
                max-w-[150px] max-h-[150px] rounded-full shadow-xl
            `}
            style={{
                transform: 'translateZ(0)',
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                background: 'var(--color-cream)',
            }}
            initial={{
                opacity: 1,
                scale: 1,
                left: initialPos.x,
                top: initialPos.y,
                rotate: 0
            }}
            animate={{
                opacity: [1, 0.8, 0], 
                scale: [1, 0.8, 0.4], 
                left: targetPos.x - 40,
                top: targetPos.y-50,
                rotate: 25
            }}
            transition={{
                duration: 1.4, 
                opacity: { duration: 1.2 } 
            }}
            onAnimationComplete={onComplete}
            onError={(e) => {
                console.error('Image load error:', e.target.src);
                e.target.style.display = 'none';
            }}
            aria-hidden="true"
        >
            <Icon
                name={icon}
                className="object-cover rounded-lg"
                style={{
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                    color: 'var(--color-caramel)',
                    fontSize: '2rem',
                }}
                variations={{ fill: 1   , weight: 400, grade: 0, opsz: 24 }}
            />
        </motion.div>
        ,
        document.body
    );
};


FlyingImage.propTypes = {
    src: PropTypes.string.isRequired,
    initialPos: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }).isRequired,
    targetPos: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }).isRequired,
    onComplete: PropTypes.func.isRequired
};

export default FlyingImage;