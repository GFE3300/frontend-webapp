import { createContext, useContext, useRef } from 'react';
import PropTypes from 'prop-types';

const FlyingImageContext = createContext();

export const FlyingImageProvider = ({ children }) => {
    const desktopTargetRef = useRef(null);
    const mobileTargetRef = useRef(null);

  return (
    <FlyingImageContext.Provider value={{ desktopTargetRef, mobileTargetRef }}>
      {children}
    </FlyingImageContext.Provider>
  );
};

FlyingImageProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useFlyingImageContext = () => {
  const context = useContext(FlyingImageContext);
  if (!context) {
    throw new Error('useFlyingImageContext must be used within a FlyingImageProvider');
  }
  return context;
};