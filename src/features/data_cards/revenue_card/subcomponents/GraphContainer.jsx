import React, { forwardRef } from 'react';

const GraphContainer = forwardRef(({ children, size }, ref) => (
    <div
        ref={ref}
        className="
            relative w-full bottom-0 shadow-xl overflow-hidden rounded-b-4xl"
        style={{ height: size.height }}
    >
        <div className="mx-auto" style={{ width: size.width }}>
            {children}
        </div>
    </div>
));

export default GraphContainer;