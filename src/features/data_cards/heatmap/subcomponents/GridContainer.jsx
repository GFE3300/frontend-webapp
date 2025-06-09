import React, { forwardRef } from 'react';

const GridContainer = forwardRef(({ children, size }, ref) => (
    <div
        ref={ref}
        className="w-full"
        style={{ height: size.height + 32 }}
    >
        {children}
    </div>
));

export default GridContainer; 