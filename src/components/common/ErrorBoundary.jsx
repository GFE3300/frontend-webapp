import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Button from './Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    resetError = () => {
        if (this.props.onReset) {
            this.props.onReset();
        }
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (this.state.hasError) {
            const { fallback } = this.props;
            if (fallback) {
                // If a specific fallback component is provided, render it.
                // This is useful for rendering skeletons on error.
                return React.cloneElement(fallback, { error: this.state.error, resetError: this.resetError });
            }

            // Generic fallback UI
            return (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 text-center text-red-700 dark:text-red-300 flex flex-col items-center justify-center h-full">
                    <Icon name="error" className="mx-auto h-10 w-10 mb-2" />
                    <h3 className="font-semibold text-lg mb-1">Something went wrong</h3>
                    <p className="text-sm mb-4">
                        We couldn't load this section.
                    </p>
                    <Button onClick={this.resetError} color="red" variant="outline" size="sm">
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.element,
    onReset: PropTypes.func,
};

export default ErrorBoundary;