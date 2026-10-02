import React, { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './ThemeContext.tsx';
import { I18nProvider } from './i18n.tsx';
import { registerSW } from 'virtual:pwa-register';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends (React.Component as any) {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Something went wrong</h2>
              <p className="text-sm text-slate-400">
                {this.state.error?.message || 'The application encountered an unexpected state.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white transition-all shadow-lg shadow-blue-600/30"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 font-medium text-xs rounded-xl text-slate-300 transition-all"
              >
                Clear Local Data &amp; Reset
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (this.props as any).children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <ThemeProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </ThemeProvider>
      </RootErrorBoundary>
    </StrictMode>,
  );
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // Unregister any stale service workers in dev mode to prevent caching collisions in preview iframe
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  } else {
    registerSW({ immediate: true });
  }
}
