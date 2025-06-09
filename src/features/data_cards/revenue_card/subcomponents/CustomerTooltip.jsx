import React from 'react';
import useThrottledValue from '../../../../hooks/useThrottledValue';
import Icon from '../../../../components/common/Icon';

const CustomerTooltip = ({ customers }) => {
    const rawCustomers = customers;
    const displayCustomers = useThrottledValue(rawCustomers, 250);

    return (
        <div
            className={`
            tooltip-content p-2 h-10 w-24
            bg-neutral-200/70 backdrop-blur-lg dark:bg-neutral-800/70
            flex flex-row items-center justify-left
            shadow-xl rounded-xl`}
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-6 rounded-lg bg-rose-400 flex items-center justify-center">
                    <Icon
                        name="group"
                        className="text-white"
                        variations={{
                            fill: 0,
                            weight: 400,
                            grade: 0,
                            opsz: 48,
                        }}
                        style={{ fontSize: '18px' }}
                    />
                </div>
                <div className="flex flex-col">
                    <div
                        className="
                        flex items-baseline gap-1
                        font-montserrat text-sm font-semibold"
                    >
                        {displayCustomers}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CustomerTooltip;