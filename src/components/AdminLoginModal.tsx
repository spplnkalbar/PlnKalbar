import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  X, 
  Server, 
  Radio, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Globe
} from 'lucide-react';
import { authService, AuthUser } from '../services/auth';
import { 
  getApiBaseUrl, 
  setApiBaseUrl, 
  checkApiHealth, 
  validateApiUrl, 
  DEFAULT_API_BASE_URL, 
  ApiHealthResponse 
} from '../config/api';
import { SpPlnLogo } from './SpPlnLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  showToast: (message: string) => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onSuccess,
  showToast,
}: AdminLoginModalProps) {
  const [activeView, setActiveView] = useState<'login' | 'server-settings'>('login');
  
  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Server settings states (hanya untuk browser local configuration, tanpa akses private)
  const [serverUrlInput, setServerUrlInput] = useState(getApiBaseUrl());
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [serverHealthResult, setServerHealthResult] = useState<ApiHealthResponse | null>(null);
  const [serverValidationError, setServerValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveView('login');
      setErrorMessage(null);
      setServerValidationError(null);
      const currentUrl = getApiBaseUrl();
      setServerUrlInput(currentUrl);
      setServerHealthResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Harap isi username dan password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(username, password);
      showToast(`Selamat datang kembali, ${result.user.username}!`);
      setUsername('');
      setPassword('');
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestServerConnection = async () => {
    setServerValidationError(null);
    const validated = validateApiUrl(serverUrlInput);
    if (!validated.valid || !validated.formattedUrl) {
      setServerValidationError(validated.error || 'Format URL tidak valid.');
      return;
    }

    setIsTestingServer(true);
    try {
      const res = await checkApiHealth(validated.formattedUrl);
      setServerHealthResult(res);
      if (res.connected) {
        showToast('🟢 Server Terhubung');
      } else {
        showToast('🔴 Server Tidak Terhubung');
      }
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleSaveServerConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerValidationError(null);

    const validated = validateApiUrl(serverUrlInput);
    if (!validated.valid || !validated.formattedUrl) {
      setServerValidationError(validated.error || 'Format URL tidak valid.');
      return;
    }

    const cleanUrl = validated.formattedUrl;
    setIsSavingServer(true);

    try {
      // Test health sebelum menyimpan
      const health = await checkApiHealth(cleanUrl);
      setServerHealthResult(health);

      if (!health.connected) {
        setServerValidationError('Server API tidak dapat dihubungi.');
        showToast('🔴 Server Tidak Terhubung. URL tidak disimpan.');
        setIsSavingServer(false);
        return;
      }

      // Simpan URL API di browser client
      setApiBaseUrl(cleanUrl);
      showToast('URL API Server berhasil disimpan.');
      
      // Kembali ke form login
      setTimeout(() => {
        setActiveView('login');
      }, 500);
    } catch (err: any) {
      setServerValidationError(err?.message || 'Gagal menyimpan URL API.');
    } finally {
      setIsSavingServer(false);
    }
  };

  const handleClose = () => {
    if (isLoading || isSavingServer) return;
    setErrorMessage(null);
    setUsername('');
    setPassword('');
    setActiveView('login');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#860120] via-red-600 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading || isSavingServer}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer"
          title="Tutup Modal"
        >
          <X size={18} />
        </button>

        {activeView === 'login' ? (
          <>
            {/* Header Branding */}
            <div className="text-center mb-6 pt-2">
              <div className="flex justify-center mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('server-settings');
                    setServerUrlInput(getApiBaseUrl());
                  }}
                  className="p-0 bg-transparent border-0 cursor-pointer focus:outline-none transition-transform active:scale-95"
                  title="SP PLN UID Kalbar"
                >
                  <SpPlnLogo 
                    size="custom"
                    className="w-[100px] h-[102px] p-0 object-contain drop-shadow-xs" 
                  />
                </button>
              </div>
              <h2 className="font-serif font-black text-2xl text-stone-900 tracking-tight">
                Login
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Akses khusus pengelola warta{' '}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveView('server-settings');
                    setServerUrlInput(getApiBaseUrl());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveView('server-settings');
                      setServerUrlInput(getApiBaseUrl());
                    }
                  }}
                  className="cursor-pointer font-medium text-stone-600 hover:text-stone-800 transition-colors select-none"
                  title="SP PLN UID Kalbar"
                >
                  Serikat Pekerja PLN UID Kalimantan Barat
                </span>
                .
              </p>
            </div>

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs animate-fade-in">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={isLoading}
                    autoFocus
                    placeholder="Masukkan username admin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120] focus:border-transparent transition-all placeholder:text-stone-400 disabled:bg-stone-50 disabled:text-stone-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={isLoading}
                    placeholder="Masukkan password admin"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#860120] focus:border-transparent transition-all placeholder:text-stone-400 disabled:bg-stone-50 disabled:text-stone-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#860120] hover:bg-red-800 active:bg-red-900 text-white font-bold text-sm tracking-wide shadow-md shadow-red-900/20 hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Memverifikasi Sesi...</span>
                    </>
                  ) : (
                    <span className="w-full text-center">Masuk</span>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* View: Pengaturan Server */
          <div>
            <div className="flex items-center gap-2 mb-4 pt-1">
              <button
                type="button"
                onClick={() => setActiveView('login')}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Kembali ke Login"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* Status Connection Indicator */}
            <div className="mb-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-600">Status Server:</span>
                {serverHealthResult?.connected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>🟢 Server Terhubung</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                    <XCircle size={12} className="text-red-600" />
                    <span>🔴 Server Tidak Terhubung</span>
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveServerConnection} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    URL API Server <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setServerUrlInput(DEFAULT_API_BASE_URL);
                      setServerValidationError(null);
                    }}
                    className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Globe size={15} />
                  </div>
                  <input
                    type="text"
                    value={serverUrlInput}
                    onChange={(e) => {
                      setServerUrlInput(e.target.value);
                      if (serverValidationError) setServerValidationError(null);
                    }}
                    placeholder="https://xxxxx.trycloudflare.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#860120] focus:border-transparent transition-all placeholder:text-stone-400"
                    required
                  />
                </div>

                <p className="text-[11px] text-stone-400 mt-1">
                  Contoh: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-600">https://xxxxx.trycloudflare.com</code>
                </p>

                {serverValidationError && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{serverValidationError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleTestServerConnection}
                  disabled={isTestingServer || isSavingServer || !serverUrlInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTestingServer ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menguji...</span>
                    </>
                  ) : (
                    <>
                      <Radio size={14} />
                      <span>Test Koneksi</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSavingServer || isTestingServer || !serverUrlInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#860120] hover:bg-red-800 active:bg-red-900 text-white font-bold text-xs tracking-wide shadow-md shadow-red-900/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingServer ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <Lock size={12} className="text-emerald-600" />
            <span>Koneksi aman berotentikasi</span>
          </span>
          <span className="font-mono">SP PLN UID Kalbar</span>
        </div>
      </div>
    </div>
  );
}
