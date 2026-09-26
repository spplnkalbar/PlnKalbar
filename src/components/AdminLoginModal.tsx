import { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Loader2, X } from 'lucide-react';
import { authService, AuthUser } from '../services/auth';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMessage(err?.message || 'Username atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setErrorMessage(null);
    setUsername('');
    setPassword('');
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
        {/* Subtle top brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#860120] via-red-600 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer"
          title="Tutup Modal"
        >
          <X size={18} />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6 pt-2">
          <div className="flex justify-center mb-3">
            <img 
              src="https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000" 
              alt="Logo SP PLN" 
              className="w-[100px] h-[102px] p-0 object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="font-serif font-black text-2xl text-stone-900 tracking-tight">
            Login
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Akses khusus pengelola warta Serikat Pekerja PLN UID Kalimantan Barat.
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
