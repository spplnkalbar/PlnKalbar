// Centralized API Configuration
// Digunakan sebagai titik konfigurasi tunggal komunikasi frontend ke REST API (Node.js/Express di Termux Android)

export const API_BASE_URL: string =
  ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://127.0.0.1:3000';

export const API_ENDPOINTS = {
  articles: `${API_BASE_URL}/api/articles`,
  photos: `${API_BASE_URL}/api/photos`,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,
    password: `${API_BASE_URL}/api/auth/password`,
  },
} as const;
