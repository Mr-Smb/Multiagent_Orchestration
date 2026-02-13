import React, { Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fix: Error in file index.tsx on line 48: Property 'props' does not exist on type 'ErrorBoundary'.
// Ensured ErrorBoundary correctly extends React.Component with generics and used a constructor.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-red-50 dark:bg-red-900/10 h-screen flex flex-col items-center justify-center font-sans">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-300">The application failed to load. This may be due to a network issue or a missing dependency.</p>
          <pre className="bg-white dark:bg-black p-4 rounded border border-red-200 text-xs overflow-auto max-w-2xl w-full mb-6 text-left">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reload Application
          </button>
        </div>
      );
    }

    // Fix: Access props correctly from React.Component instance
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);