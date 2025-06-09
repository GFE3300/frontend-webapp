// eslint-disable-next-line
import { motion, AnimatePresence, transform } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import AnimatedNumber from '../../../../components/animated_number/number_components/AnimatedNumber';
import { format } from 'date-fns';
import useThrottledValue from '../../../../hooks/useThrottledValue';

const ClientTooltip = ({
    tooltip = {},
    maxValue = 0,
    timeRange = { startHour: 8, endHour: 16 },
}) => {
    const value = useThrottledValue(Math.round(tooltip.value * (maxValue / 100)), 100);

    return (
        <motion.div
            className="fixed top-0 left-0 z-50 pointer-events-none"
            style={{ 
                left: tooltip.x, top: tooltip.y,
                width: tooltip.size?.width || 0,
                height: tooltip.size?.height || 0,
                transform: tooltip.style?.transform || ''
             }}
            initial={{ opacity: 0}}
            animate={{ opacity: 1, transform: tooltip.style?.transform || '' }}
            exit={{ opacity: 0}}
            transition={{ duration: 0.2 }}
        >
            <div className="tooltip-content py-3 px-4 bg-neutral-200/70 dark:bg-neutral-800/70 backdrop-blur-lg shadow-xl rounded-xl">
                {/* Upper Section */}
                <div className="flex flex-col justify-between items-start">
                    <div className="flex flex-col">
                        <span className="font-montserrat text-sm font-semibold text-gray-900 dark:text-white">
                            {tooltip.date && format(tooltip.date, 'EEEE')}
                        </span>
                        <div className="flex items-end justify-start space-x-2 mt-1">
                            <AnimatedNumber
                                value={value}
                                className="text-3xl font-bold"
                                decimals={0}
                                duration={0.3}
                                easing="easeOut"
                            />
                            <div className='h-full flex flex-col justify-end items-end'>
                                <span className="text-xs font-montserrat font-semibold text-gray-500 dark:text-gray-400">clients</span>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="w-full h-[0.5px] bg-neutral-500/50 my-3" />

                    {/* Metrics Section */}
                    <div className="flex space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-rose-400 rounded-lg">
                            <Icon name="event" className="text-white" style={{ fontSize: '18px' }} />
                        </div>
                        <div className="flex-1">
                            <div className="space-y-0 font-montserrat">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {tooltip.date && format(tooltip.date, 'MMM d, yyyy')}
                                </div>
                                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                    {`${timeRange && format(new Date(0, 0, 0, timeRange.startHour), 'HH:mm')} - ${timeRange && format(new Date(0, 0, 0, timeRange.endHour), 'HH:mm')}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ClientTooltip;