import React from 'react';
import MainContentArea from './MainContentArea';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar'; // Import the new mobile navbar
import { useDeviceDetection } from '../../hooks/useDeviceDetection'; // Import the device detection hook

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import * as reactSpring from '@react-spring/three'
import { useTheme } from '../../utils/ThemeProvider';

const HeaderHeight = '5rem';

const DashboardLayout = () => {
    const { theme } = useTheme();
    const { isMobile } = useDeviceDetection();

    return (
        <div className="flex h-screen bg-transparent overflow-hidden">
            {/* Background Shader (no changes needed here) */}
            <ShaderGradientCanvas
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -1,
                }}
                camera={{ position: [0, 0, 5] }}
            >
                <ShaderGradient
                    control='query'
                    urlString={theme === 'light' ?
                        'https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.4&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23f43f5e&color2=%23e9d5ff&color3=%23e9d5ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1&uFrequency=5.5&uSpeed=0.3&uStrength=3&uTime=0.2&wireframe=false'
                        :
                        'https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.6&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%234a044e&color2=%234a044e&color3=%23242424&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1&uFrequency=5.5&uSpeed=0.3&uStrength=4&uTime=0.2&wireframe=false'
                    }
                    {...reactSpring}
                />
            </ShaderGradientCanvas>

            {isMobile ? <MobileNavbar /> : (
                <div className='fixed left-0 bottom-0 z-10' style={{ height: `calc(100% - ${HeaderHeight})` }}>
                    <Sidebar />
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden z-0">
                <DashboardHeader />

                <div
                    className="flex-1 overflow-y-auto pb-20 md:pb-0 md:pl-24"
                    style={{ paddingTop: HeaderHeight }}
                >
                    <MainContentArea />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;