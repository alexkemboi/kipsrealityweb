"use client";

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

/**
 * Error Boundary for Listing Management Components
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
export class ListingErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error('ListingErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, send error to monitoring service
        if (process.env.NODE_ENV === 'production') {
            this.reportErrorToService(error, errorInfo);
        }
    }

    private reportErrorToService(error: Error, errorInfo: ErrorInfo) {
        // This would integrate with error monitoring services like Sentry, LogRocket, etc.
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errorId: this.state.errorId
        };

        // Example: Send to error monitoring service
        // errorMonitoringService.captureException(errorReport);
        console.log('Error report:', errorReport);
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/property-manager';
    };

    private copyErrorDetails = () => {
        const errorDetails = {
            errorId: this.state.errorId,
            message: this.state.error?.message,
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
            timestamp: new Date().toISOString()
        };

        navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
            .then(() => {
                alert('Error details copied to clipboard');
            })
            .catch(() => {
                console.log('Failed to copy error details');
            });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <Card className="max-w-2xl w-full p-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <AlertTriangle className="h-16 w-16 text-red-500" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Something went wrong
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                We encountered an unexpected error in the listing management system. 
                                Our team has been notified and is working to fix this issue.
                            </p>

                            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                                <div className="flex items-center mb-2">
                                    <Bug className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Error ID: {this.state.errorId}
                                    </span>
                                </div>
                                
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-4">
                                        <details className="text-sm">
                                            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                                                Technical Details (Development Mode)
                                            </summary>
                                            <div className="bg-white rounded border p-3 font-mono text-xs overflow-auto max-h-40">
                                                <div className="mb-2">
                                                    <strong>Error:</strong> {this.state.error?.message}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Stack:</strong>
                                                    <pre className="whitespace-pre-wrap mt-1">
                                                        {this.state.error?.stack}
                                                    </pre>
                                                </div>
                                                {this.state.errorInfo?.componentStack && (
                                                    <div>
                                                        <strong>Component Stack:</strong>
                                                        <pre className="whitespace-pre-wrap mt-1">
                                                            {this.state.errorInfo.componentStack}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={this.handleRetry}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    onClick={this.handleReload}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reload Page
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-gray-500 mb-3">
                                    If this problem persists, please contact support with the error ID above.
                                </p>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={this.copyErrorDetails}
                                    className="text-xs"
                                >
                                    Copy Error Details
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ListingErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ListingErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
}

/**
 * Lightweight error boundary for smaller components
 */
export function ListingErrorFallback({ 
    error, 
    resetError 
}: { 
    error: Error; 
    resetError: () => void; 
}) {
    return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                    Component Error
                </h3>
            </div>
            
            <p className="text-sm text-red-700 mb-3">
                {error.message || 'An unexpected error occurred in this component.'}
            </p>
            
            <Button
                size="sm"
                variant="outline"
                onClick={resetError}
                className="text-red-700 border-red-300 hover:bg-red-100"
            >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
            </Button>
        </div>
    );
}
