import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught error:", error?.message || String(error));
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-red-500 selection:text-white">
          <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-red-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Visual Indicator */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold">
              ✕
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-red-400 mb-2">
              Aplikasi Mengalami Kendala
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
              Terjadi kesalahan saat memuat aplikasi di browser Anda. Ini biasanya disebabkan oleh rujukan URL aset yang kurang cocok pada deploy statis atau isu kompatibilitas.
            </p>

            {/* Error Message & Details */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-700/50 mb-6 overflow-x-auto max-h-60">
              <p className="font-mono text-xs text-red-300 font-bold mb-2">
                {this.state.error && this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="font-mono text-[10px] text-slate-400 leading-normal whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-red-900/10"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={() => {
                  // Fallback: Clear local/session storage and reload
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  } catch (e) {}
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl transition-all"
              >
                Hapus Cache & Muat Ulang
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/40 text-center">
              <p className="text-slate-500 text-xs font-mono">
                Berita SP PLN Kalbar • Diagnostic Mode
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
