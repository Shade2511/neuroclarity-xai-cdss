import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Brain, RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NeuroClarity Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mx-auto text-[#DC2626]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Clinical View Recovery</h2>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                An unexpected interface state occurred. The clinical engine preserved your patient data and session state.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-left max-h-40 overflow-y-auto">
                <p className="text-[11px] font-mono text-[#DC2626] whitespace-pre-wrap break-words">
                  {this.state.error.stack || this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#334155] flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-3 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
