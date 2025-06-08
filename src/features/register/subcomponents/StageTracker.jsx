import clsx from "clsx";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Icon from "../../../components/common/Icon";
import { scriptLines_Registration as scriptLines } from '../utils/script_lines';

export const StageTracker = ({
    steps = [],
    currentStep = 0,
    onStepClick = null,
    // Customization props
    animationDelayPerStep = 0.1,
    connectorColor = "bg-rose-500",
    connectorHeight = 20,
    stepSize = "w-10 h-10",
    completedColor = "bg-rose-500",
    currentColor = "bg-rose-500",
    optionalBorderColor = "border-gray-400",
    showDescriptions = true,
    orientation = "responsive",
}) => {
    const previousStepRef = useRef(currentStep);

    useEffect(() => {
        previousStepRef.current = currentStep;
    }, [currentStep]);

    const handleStepClick = (index) => {
        if (index < currentStep && onStepClick) {
            onStepClick(index);
        }
    };

    return (
        <div className={clsx(
            "flex gap-4 w-full pb-4",
            orientation === "vertical" && "flex-col",
            orientation === "responsive" && "flex-col md:flex-row"
        )}>
            {steps.map((step, index) => {
                const stepLabel = typeof step === 'object' ? step.label : step;
                const isOptional = typeof step === 'object' && step.optional;

                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const stepNumber = index + 1;

                return (
                    <div
                        key={'step-' + index}
                        className={clsx(
                            "flex items-center flex-shrink-0",
                            orientation === "vertical" ? "flex-row w-full" : "flex-col"
                        )}
                    >
                        {/* Step Indicator */}
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                whileHover={isCompleted ? { scale: 1.05 } : {}}
                                whileTap={isCompleted ? { scale: 0.95 } : {}}
                                className="relative"
                            >
                                <StepShape
                                    isCompleted={isCompleted}
                                    isCurrent={isCurrent}
                                    isOptional={isOptional}
                                    onClick={() => handleStepClick(index)}
                                    stepSize={stepSize}
                                    completedColor={completedColor}
                                    currentColor={currentColor}
                                    optionalBorderColor={optionalBorderColor}
                                >
                                    {isCompleted ? (
                                        <Icon name="Check" className="w-6 h-6" />
                                    ) : (
                                        <span className="text-base font-medium">{stepNumber}</span>
                                    )}
                                </StepShape>
                            </motion.div>

                            {/* Vertical Connector for desktop */}
                            {orientation !== "horizontal" && index < steps.length - 1 && (
                                <Connector
                                    isCompleted={isCompleted}
                                    orientation="vertical"
                                    index={index}
                                    currentStep={currentStep}
                                    previousStep={previousStepRef.current}
                                    animationDelayPerStep={animationDelayPerStep}
                                    connectorColor={connectorColor}
                                    connectorHeight={connectorHeight}
                                />
                            )}
                        </div>

                        {/* Horizontal Connector for mobile */}
                        {orientation !== "vertical" && index < steps.length - 1 && (
                            <Connector
                                isCompleted={isCompleted}
                                orientation="horizontal"
                                index={index}
                                currentStep={currentStep}
                                previousStep={previousStepRef.current}
                                animationDelayPerStep={animationDelayPerStep}
                                connectorColor={connectorColor}
                                connectorHeight={connectorHeight}
                            />
                        )}

                        {/* Step Information */}
                        <div className={clsx(
                            "flex-1",
                            orientation === "vertical" ? "ml-4" : "text-center mt-2"
                        )}>
                            <h1 className="text-sm font-medium font-montserrat text-neutral-600 dark:text-neutral-50 text-shadow-lg text-shadow-neutral-100 dark:text-shadow-neutral-900">
                                {steps[stepNumber - 1]}
                            </h1>
                            <p className="text-lg font-semibold text-gray-900">
                                {stepLabel}
                                {isOptional && (
                                    <span className="ml-2 text-xs text-rose-500">{scriptLines.stageTracker.optionalLabel}</span>
                                )}
                            </p>
                            {showDescriptions && step.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {step.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const StepShape = ({
    children,
    isCompleted,
    isCurrent,
    isOptional,
    onClick,
    stepSize,
    completedColor,
    currentColor,
    optionalBorderColor,
}) => {
    return (
        <button
            onClick={onClick}
            disabled={!isCompleted}
            className={clsx(
                "flex items-center justify-center transition-all duration-300",
                "rounded-full shadow-sm focus:outline-none",
                stepSize,
                isCompleted && `${completedColor} text-white hover:scale-105`,
                isCurrent && `${currentColor} text-white shadow-lg`,
                !isCompleted && !isCurrent && "bg-gray-200 text-gray-500",
                isOptional && !isCurrent && !isCompleted &&
                `border-2 border-dashed ${optionalBorderColor}`
            )}
            style={{ transitionProperty: "transform, background-color" }}
        >
            {children}
        </button>
    );
};

const Connector = ({
    isCompleted,
    orientation = "vertical",
    index,
    currentStep,
    previousStep,
    animationDelayPerStep,
    connectorColor,
}) => {
    const direction = currentStep > previousStep ? "forward" : "backward";
    let delay = 0;

    if (direction === "forward") {
        if (index >= previousStep && index < currentStep) {
            const positionInRange = index - previousStep;
            delay = positionInRange * animationDelayPerStep;
        }
    } else if (direction === "backward") {
        if (index >= currentStep && index < previousStep) {
            const positionInRange = previousStep - 1 - index;
            delay = positionInRange * animationDelayPerStep;
        }
    }

    return (
        <motion.div
            className={clsx(
                "absolute bg-gray-200 dark:bg-neutral-800",
                orientation === "vertical"
                    ? "w-1 translate-y-[42px]"
                    : "h-1 translate-x-[32px] translate-y-[22px]",
            )}
            initial={false}
            animate={{
                [orientation === "vertical" ? "height" : "width"]: isCompleted
                    ? 12
                    : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay,
            }}
        >
            <div
                className={clsx(
                    "absolute inset-0 rounded-full",
                    connectorColor,
                    orientation === "vertical" ? "h-full" : "w-full"
                )}
            />
        </motion.div>
    );
};