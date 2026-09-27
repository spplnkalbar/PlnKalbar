// Centralized API Configuration
// Titik konfigurasi tunggal komunikasi frontend ke REST API (Node.js/Express di Termux Android via Cloudflare Tunnel)

export const API_URL_STORAGE_KEY = 'sp_pln_custom_api_url';

export const DEFAULT_API_BASE_URL: string =
  ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://127.0.0.1:3000';

export interface ValidationResult {
  valid: boolean;
  formattedUrl?: string;
  error?: string;
}

/**
 * Validasi ketat format URL API:
 * 1. Hanya http:// atau https://
 * 2. URL valid
 * 3. Tidak menerima javascript:, data:, file:, dll.
 * 4. Hapus trailing slash
 * 5. Panjang maksimal 500 karakter
 */
export function validateApiUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL API tidak boleh kosong.' };
  }

  const trimmed = rawUrl.trim();

  if (trimmed.length > 500) {
    return { valid: false, error: 'URL maksimal 500 karakter.' };
  }

  if (/^(javascript|data|file|ftp|vbscript):/i.test(trimmed)) {
    return { valid: false, error: 'Protokol URL tidak diizinkan.' };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return { valid: false, error: 'URL harus dimulai dengan http:// atau https://' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Hanya protokol HTTP dan HTTPS yang diizinkan.' };
    }

    if (parsed.username || parsed.password) {
      return { valid: false, error: 'URL tidak boleh menyertakan kredensial (username/password).' };
    }
    
    // Hapus trailing slashes
    const cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');
    return { valid: true, formattedUrl: cleanUrl };
  } catch {
    return { valid: false, error: 'Format URL API tidak valid.' };
  }
}

/**
 * Mendapatkan URL API awal saat aplikasi dibuka:
 * 1. Baca dari localStorage jika ada
 * 2. Jika tidak ada / tidak valid, gunakan default fallback (http://127.0.0.1:3000 atau VITE_API_BASE_URL)
 */
export function getInitialApiUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(API_URL_STORAGE_KEY);
      if (stored) {
        const validated = validateApiUrl(stored);
        if (validated.valid && validated.formattedUrl) {
          return validated.formattedUrl;
        }
      }
    } catch {
      // Storage access blocked
    }
  }
  return DEFAULT_API_BASE_URL;
}

let activeApiBaseUrl: string = getInitialApiUrl();

/**
 * Mendapatkan URL API aktif saat ini secara dinamis
 */
export function getApiBaseUrl(): string {
  return activeApiBaseUrl;
}

/**
 * Mengubah URL API aktif secara dinamis dan menyimpannya ke localStorage
 */
export function setApiBaseUrl(newUrl: string): string {
  const validated = validateApiUrl(newUrl);
  if (!validated.valid || !validated.formattedUrl) {
    throw new Error(validated.error || 'URL API tidak valid');
  }

  activeApiBaseUrl = validated.formattedUrl;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(API_URL_STORAGE_KEY, validated.formattedUrl);
      window.dispatchEvent(
        new CustomEvent('sp_pln_api_url_changed', {
          detail: { apiUrl: activeApiBaseUrl },
        })
      );
    } catch {
      // Storage error
    }
  }

  return activeApiBaseUrl;
}

/**
 * Reset URL API ke default
 */
export function resetApiBaseUrl(): string {
  activeApiBaseUrl = DEFAULT_API_BASE_URL;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(API_URL_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent('sp_pln_api_url_changed', {
          detail: { apiUrl: activeApiBaseUrl },
        })
      );
    } catch {}
  }
  return activeApiBaseUrl;
}

export interface ApiHealthResponse {
  connected: boolean;
  status?: string;
  database?: string;
  time?: string;
  latencyMs?: number;
  url: string;
  error?: string;
}

/**
 * Memeriksa endpoint GET /health pada target URL secara langsung
 */
export async function checkApiHealth(targetUrl: string = getApiBaseUrl()): Promise<ApiHealthResponse> {
  const validated = validateApiUrl(targetUrl);
  if (!validated.valid || !validated.formattedUrl) {
    return {
      connected: false,
      url: targetUrl,
      error: validated.error || 'Format URL tidak valid',
    };
  }

  const cleanUrl = validated.formattedUrl;
  const startTime = Date.now();

  try {
    const res = await fetch(`${cleanUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store',
      },
      signal: AbortSignal.timeout(6000),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        connected: false,
        url: cleanUrl,
        latencyMs,
        error: 'Server API tidak dapat dihubungi.',
      };
    }

    const data = await res.json().catch(() => null);
    if (!data || data.status !== 'ok') {
      return {
        connected: false,
        url: cleanUrl,
        latencyMs,
        error: 'Server API tidak dapat dihubungi.',
      };
    }

    return {
      connected: true,
      status: 'ok',
      time: new Date().toISOString(),
      latencyMs,
      url: cleanUrl,
    };
  } catch {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      url: cleanUrl,
      latencyMs,
      error: 'Server API tidak dapat dihubungi.',
    };
  }
}

/**
 * Properti API_BASE_URL konstan dinamis untuk backwards-compatibility
 */
export const API_BASE_URL: string = getApiBaseUrl();

/**
 * Endpoints yang selalu merujuk ke getApiBaseUrl() aktif secara dinamis
 */
export const API_ENDPOINTS = {
  get articles() {
    return `${getApiBaseUrl()}/api/articles`;
  },
  get photos() {
    return `${getApiBaseUrl()}/api/photos`;
  },
  get upload() {
    return `${getApiBaseUrl()}/api/upload`;
  },
  get settings() {
    return `${getApiBaseUrl()}/api/settings`;
  },
  get health() {
    return `${getApiBaseUrl()}/health`;
  },
  get apiSettings() {
    return `${getApiBaseUrl()}/api/settings/api`;
  },
  auth: {
    get login() {
      return `${getApiBaseUrl()}/api/auth/login`;
    },
    get logout() {
      return `${getApiBaseUrl()}/api/auth/logout`;
    },
    get me() {
      return `${getApiBaseUrl()}/api/auth/me`;
    },
    get password() {
      return `${getApiBaseUrl()}/api/auth/password`;
    },
  },
};
