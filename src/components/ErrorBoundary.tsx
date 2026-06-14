import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

// Simple error fallback (used outside BrowserRouter)
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { t } = useTranslation('common');

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="max-w-md w-full shadow-xl border-2 border-red-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            {t('errorOccurred', { defaultValue: 'Oops! Something went wrong' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {t('errorMessage', { 
              defaultValue: 'We encountered an unexpected error. Please try again or return to the home page.' 
            })}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs font-mono text-red-600 break-all">
                {error.toString()}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={onReset}
              variant="default"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('tryAgain', { defaultValue: 'Try Again' })}
            </Button>
            <Button
              variant="outline"
              className="w-full flex-1"
              onClick={handleGoHome}
            >
              <Home className="h-4 w-4 mr-2" />
              {t('goHome', { defaultValue: 'Go Home' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;

