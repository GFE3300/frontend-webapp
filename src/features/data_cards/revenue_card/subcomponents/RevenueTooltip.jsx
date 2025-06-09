//eslint-disable-next-line
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import AnimatedNumber from '../../../../components/animated_number/number_components/AnimatedNumber';
import useThrottledValue from '../../../../hooks/useThrottledValue';

const RevenueTooltip = ({
    title = 'Test title',
    data = '65.36',
    percentChange = -0.5,
    time = {
        period: '--',  // Main period identifier 
        range: '--'    // Full date range
    },
    comparisons = [
        { label: 'Peak', value: '$0.00' },
        { label: 'Average', value: '$0.00' },
        { label: 'Baseline', value: '$0.00' }
    ]
}) => {
    const rawRevenue = data;
    const displayRevenue = useThrottledValue(rawRevenue, 750);

    const numericValue = parseFloat(displayRevenue.replace(/[^0-9.]/g, ''));

    return (
        <div
            className={`
            tooltip-content py-2 px-4
            bg-neutral-200/70 backdrop-blur-lg dark:bg-neutral-800/70
            shadow-xl rounded-xl`}
        >
            <div
                className='
                upper-section
                flex flex-row justify-between items-start
                '
            >
                <div className='flex flex-col'>
                    <span className="font-montserrat text-sm font-semibold">
                        {title}
                    </span>
                    <span className="font-montserrat text-xl font-semibold flex flex-row">
                        $ <AnimatedNumber
                            value={numericValue}
                            // ─── Formatting ───────────────────────────────
                            decimals={2}         // default is 2
                            locale="en-US"            // add commas: "1,234.56"
                            formatOptions={{ useGrouping: true }}
                            // ─── Animation controls ──────────────────────
                            duration={0.25}    // seconds per digit-step
                            easing="easeOut"          // or custom cubic Bezier / function
                            cascade                   // stagger each digit in turn
                            cascadeDelay={0.03}       // seconds between each digit start
                        />
                    </span>
                </div>
                <div className='flex flex-col'>
                    <AnimatePresence mode="wait">
                        {percentChange < 0 ? (
                            <motion.div
                                key="decrease" // Unique key for this condition
                                initial={{ opacity: 0, top: 0 }}
                                animate={{ opacity: 1, top: 8 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                exit={{ opacity: 0, top: 16 }}
                                className='
                                    absolute top-2 right-2
                                    flex items-center p-1 px-2 space-x-2
                                    bg-rose-400 rounded-lg'
                            >
                                <Icon
                                    name='trending_down'
                                    className='text-white w-4 h-4'
                                    style={{ fontSize: '1rem' }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="increase" // Unique key for this condition
                                initial={{ opacity: 0, top: 0 }}
                                animate={{ opacity: 1, top: 8 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                exit={{ opacity: 0, top: 16 }}
                                className='
                                    absolute top-2 right-2
                                    flex items-center p-1 px-2 space-x-2
                                    bg-green-400 rounded-lg'
                            >
                                <Icon
                                    name='trending_up'
                                    className='text-white w-4 h-4'
                                    style={{ fontSize: '1rem' }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div
                className='
                lower-section mt-2 w-full
                flex flex-row justify-start items-start
                '
            >
                <div className='w-2 h-18 bg-purple-600 rounded-full mr-2' />
                <div className='flex flex-col justify-start space-y-1 w-full'>
                    <span className="font-montserrat text-sm font-medium">
                        {time.period}
                    </span>
                    <div className='w-full h-[0.5px] bg-neutral-500 rounded-full mb-1' />
                    <div className='flex flex-col space-y-1'>
                        <div className="flex flex-row items-center justify-between w-full font-montserrat text-sm font-medium">
                            <span className='text-xs'>
                                {comparisons[0].label}
                            </span>
                            <span className='text-xs'>
                                {comparisons[0].value}
                            </span>
                        </div>
                    </div>
                    <div className='flex flex-col space-y-1'>
                        <div className="flex flex-row items-center justify-between w-full font-montserrat text-sm font-medium">
                            <span className='text-xs'>
                                {comparisons[1].label}
                            </span>
                            <span className='text-xs'>
                                {comparisons[1].value}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default RevenueTooltip;