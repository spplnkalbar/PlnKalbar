import type { Article, ActivityPhoto } from '../data';
import { 
  getApiBaseUrl, 
  setApiBaseUrl, 
  API_BASE_URL, 
  API_ENDPOINTS, 
  checkApiHealth, 
  validateApiUrl,
  ApiHealthResponse 
} from '../config/api';
import { authService } from './auth';

export { getApiBaseUrl, setApiBaseUrl, API_BASE_URL, API_ENDPOINTS, checkApiHealth, validateApiUrl };
export type { ApiHealthResponse };

function getAuthHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleAuthError(status: number) {
  if (status === 401) {
    authService.clearSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sp_pln_auth_expired'));
    }
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CreateArticlePayload {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  readTime: string;
  type?: 'pln' | 'nasional';
}

export interface CreatePhotoPayload {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
}

export function resolveImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads/')) {
    return `${getApiBaseUrl()}${trimmed}`;
  }
  return trimmed;
}

// Convert SQLite numeric/string ID into standard string format for UI compatibility
function normalizeArticle(item: any): Article {
  return {
    id: String(item.id),
    title: item.title || '',
    excerpt: item.excerpt || '',
    content: item.content || '',
    author: item.author || 'Humas SP PLN Kalbar',
    date: item.date || '',
    category: item.category || (item.type === 'nasional' ? 'Berita Nasional' : 'SP PLN Kalimantan Barat'),
    imageUrl: resolveImageUrl(item.imageUrl),
    readTime: item.readTime || '3 Min Read',
    type: item.type === 'nasional' ? 'nasional' : 'pln',
  };
}

function normalizePhoto(item: any): ActivityPhoto {
  return {
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    date: item.date || '',
    imageUrl: resolveImageUrl(item.imageUrl),
    location: item.location || 'Kalimantan Barat',
  };
}

// REST API Service communicating with Node.js/Express + SQLite backend (Termux / Cloudflare Tunnel)
export const apiService = {
  // Check backend health/connectivity via active API_BASE_URL
  async checkHealth(targetUrl?: string): Promise<boolean> {
    const result = await checkApiHealth(targetUrl || getApiBaseUrl());
    return result.connected;
  },

  // Detailed health check test
  async testHealth(targetUrl?: string): Promise<ApiHealthResponse> {
    return checkApiHealth(targetUrl || getApiBaseUrl());
  },

  // 1. ARTICLES ENDPOINTS
  async getArticles(type?: 'pln' | 'nasional'): Promise<Article[]> {
    const baseUrl = getApiBaseUrl();
    const url = type 
      ? `${baseUrl}/api/articles?type=${encodeURIComponent(type)}` 
      : `${baseUrl}/api/articles`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil artikel: HTTP ${res.status}`);
    }

    const json: ApiResponse<any[]> = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Format data API artikel tidak valid');
    }

    return json.data.map(normalizeArticle);
  },

  async getArticleById(id: string | number): Promise<Article> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/articles/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil detail artikel ID ${id}`);
    }

    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Artikel tidak ditemukan');
    }

    return normalizeArticle(json.data);
  },

  async createArticle(payload: CreateArticlePayload): Promise<Article> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...payload,
        type: payload.type || (payload.category === 'Berita Nasional' ? 'nasional' : 'pln')
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal menambah artikel: HTTP ${res.status}`);
    }

    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Respon penambahan artikel tidak valid');
    }

    return normalizeArticle(json.data);
  },

  async updateArticle(id: string | number, payload: Partial<CreateArticlePayload>): Promise<Article> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal memperbarui artikel ID ${id}`);
    }

    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Respon pembaruan artikel tidak valid');
    }

    return normalizeArticle(json.data);
  },

  async deleteArticle(id: string | number): Promise<boolean> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal menghapus artikel ID ${id}`);
    }

    const json: ApiResponse<null> = await res.json();
    return Boolean(json.success);
  },

  // 2. PHOTOS / GALLERY ENDPOINTS
  async getPhotos(): Promise<ActivityPhoto[]> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/photos`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil galeri foto: HTTP ${res.status}`);
    }

    const json: ApiResponse<any[]> = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Format data API foto tidak valid');
    }

    return json.data.map(normalizePhoto);
  },

  async getPhotoById(id: string | number): Promise<ActivityPhoto> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/photos/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil detail foto ID ${id}`);
    }

    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Foto tidak ditemukan');
    }

    return normalizePhoto(json.data);
  },

  async createPhoto(payload: CreatePhotoPayload): Promise<ActivityPhoto> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal menambah foto kegiatan: HTTP ${res.status}`);
    }

    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Respon penambahan foto tidak valid');
    }

    return normalizePhoto(json.data);
  },

  async updatePhoto(id: string | number, payload: Partial<CreatePhotoPayload>): Promise<ActivityPhoto> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/photos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal memperbarui foto ID ${id}`);
    }

    const json: ApiResponse<any> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Respon pembaruan foto tidak valid');
    }

    return normalizePhoto(json.data);
  },

  async deletePhoto(id: string | number): Promise<boolean> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/photos/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal menghapus foto ID ${id}`);
    }

    const json: ApiResponse<null> = await res.json();
    return Boolean(json.success);
  },

  async uploadImage(file: File): Promise<string> {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal mengunggah gambar: HTTP ${res.status}`);
    }

    const json: ApiResponse<{ url: string }> = await res.json();
    if (!json.success || !json.data?.url) {
      throw new Error(json.message || 'Respon upload gambar tidak valid');
    }

    return json.data.url;
  },

  // 3. SETTINGS ENDPOINTS
  async getSettings(): Promise<Record<string, string>> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/settings`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const json: ApiResponse<Record<string, string>> = await res.json();
    return json.data || {};
  },

  async updateSettings(settings: Record<string, string>): Promise<boolean> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(settings),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      handleAuthError(res.status);
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Gagal memperbarui pengaturan');
    }
    const json: ApiResponse<null> = await res.json();
    return Boolean(json.success);
  },

  // 4. API SERVER URL SETTINGS ENDPOINTS (GET /api/settings/api & PUT /api/settings/api)
  async getApiUrlSetting(): Promise<string | null> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/settings/api`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const json: ApiResponse<{ apiUrl?: string }> = await res.json();
      return json.data?.apiUrl || null;
    } catch {
      return null;
    }
  },

  async updateApiUrlSetting(newApiUrl: string): Promise<boolean> {
    try {
      const validated = validateApiUrl(newApiUrl);
      if (!validated.valid || !validated.formattedUrl) {
        throw new Error(validated.error || 'Format URL tidak valid');
      }

      // 1. Simpan ke backend baru jika sudah bisa dijangkau
      const res = await fetch(`${validated.formattedUrl}/api/settings/api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ apiUrl: validated.formattedUrl }),
        signal: AbortSignal.timeout(6000),
      }).catch(() => null);

      // Note: Even if backend PUT fails (e.g. not authenticated yet), the frontend URL will be saved locally
      return res ? res.ok : false;
    } catch {
      return false;
    }
  },
};
