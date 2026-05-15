import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SYSTEM CRITICAL ERROR:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Use fallback UI logic from App.tsx
      let errorMessage = 'An unexpected error occurred in the system interface.';
      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error) {
            errorMessage = `${parsedError.error} (Operation: ${parsedError.operationType || 'Unknown'})`;
          } else {
            errorMessage = this.state.error.message;
          }
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-terminal">
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
            {/* Caution Stripes */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_10px,#000_10px,#000_20px)] opacity-50" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-rose-500 uppercase tracking-tighter">System Critical Error</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The neural interface encountered an unexpected corruption while rendering the current sector. 
                </p>
              </div>

              {errorMessage && (
                <div className="w-full bg-black/40 border border-rose-500/20 rounded-xl p-4 text-left">
                  <p className="text-[10px] font-mono text-rose-400 break-all mb-1 uppercase opacity-60">Error Log:</p>
                  <p className="text-xs font-mono text-slate-300 break-all">{errorMessage}</p>
                </div>
              )}

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                >
                  <RefreshCw className="w-5 h-5" />
                  INITIATE RELOAD
                </button>
                <button
                  onClick={this.handleReset}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Home className="w-4 h-4" />
                  RETURN TO HOME
                </button>
              </div>

              <p className="text-[9px] text-slate-600 uppercase tracking-widest pt-4">
                Error Code: ERR_UI_CORRUPTION_0xFB
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
