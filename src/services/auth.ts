import { API_ENDPOINTS } from '../config/api';

export interface AuthUser {
  username: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

const TOKEN_STORAGE_KEY = 'sp_pln_admin_session_token';

// In-memory token cache untuk keamanan tinggi selama sesi berjalan
let memoryToken: string | null = null;

export const authService = {
  // Hanya membaca token dari memory atau sessionStorage (ephemeral, hilang saat browser/tab ditutup)
  getToken(): string | null {
    if (memoryToken) return memoryToken;
    try {
      const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        memoryToken = stored;
        return stored;
      }
    } catch {
      // Access error or restricted environment
    }
    return null;
  },

  // Menyimpan token sesi sementara di sessionStorage & memory. TIDAK PERNAH disimpan di localStorage.
  setToken(token: string): void {
    memoryToken = token;
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      // Pastikan hapus bekas token lama di localStorage jika pernah ada
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('sp_pln_is_admin');
    } catch {
      // Storage access error
    }
  },

  // Membersihkan seluruh memori dan storage dari token/sesi admin
  clearSession(): void {
    memoryToken = null;
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('sp_pln_is_admin');
      // Bersihkan seluruh item localStorage yang terkait dengan kredensial
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Storage access error
    }
  },

  // Memeriksa apakah klien saat ini memegang token sesi aktif
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  // Login admin - Mengirim kredensial aman ke backend REST API
  async login(username: string, password: string): Promise<{ user: AuthUser; token: string }> {
    if (!username.trim() || !password) {
      throw new Error('Username dan password wajib diisi');
    }

    try {
      const res = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data: AuthResponse = await res.json().catch(() => ({
        success: false,
        message: 'Respon server tidak valid',
      }));

      if (!res.ok || !data.success || !data.token) {
        throw new Error(data.message || 'Username atau password salah');
      }

      const user: AuthUser = data.user || { username: username.trim() };
      // Simpan token hanya di sessionStorage (hilang saat browser ditutup)
      this.setToken(data.token);

      return {
        user,
        token: data.token,
      };
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.message?.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server backend Termux. Pastikan server aktif.');
      }
      throw err;
    }
  },

  // Logout admin & Revoke token di server backend secara permanen
  async logout(): Promise<void> {
    const token = this.getToken();

    // 1. Bersihkan lokal memori & storage lebih dulu
    this.clearSession();

    // 2. Kirim sinyal pencabutan token ke backend
    if (token) {
      try {
        await fetch(API_ENDPOINTS.auth.logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
          signal: AbortSignal.timeout(4000),
        });
      } catch {
        // Kesalahan jaringan diabaikan karena sesi lokal sudah dibersihkan
      }
    }

    // 3. Pancarkan event logout ke seluruh komponen UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sp_pln_logged_out'));
    }
  },

  // Verifikasi keabsahan sesi token aktif ke backend (GET /api/auth/me)
  async getMe(): Promise<AuthUser> {
    const token = this.getToken();
    if (!token) {
      this.clearSession();
      throw new Error('Tidak ada sesi aktif');
    }

    try {
      const res = await fetch(API_ENDPOINTS.auth.me, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.status === 401 || !res.ok) {
        this.clearSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sp_pln_auth_expired'));
        }
        throw new Error('Sesi administrator telah berakhir');
      }

      const data: AuthResponse = await res.json();
      if (!data.success || !data.user) {
        this.clearSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sp_pln_auth_expired'));
        }
        throw new Error(data.message || 'Data sesi tidak valid');
      }

      return data.user;
    } catch (err: any) {
      this.clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sp_pln_auth_expired'));
      }
      throw err;
    }
  },

  // Change admin password via PUT /api/auth/password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Sesi administrator tidak valid. Silakan login kembali.');
    }

    try {
      const res = await fetch(API_ENDPOINTS.auth.password, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data: AuthResponse = await res.json().catch(() => ({
        success: false,
        message: 'Respon server tidak valid',
      }));

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengubah password');
      }

      // Automatically revoke local session since server invalidated active tokens
      this.clearSession();
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.message?.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server backend Termux. Pastikan server aktif.');
      }
      throw err;
    }
  },
};
