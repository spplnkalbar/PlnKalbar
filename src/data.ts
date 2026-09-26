export interface Article {
  id: string;
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

// 1. Kategori: Berita SP PLN Kalimantan Barat (Disimpan di database SQLite server)
export const plnArticles: Article[] = [];

// 2. Kategori: Berita Nasional (Diambil dari REST API / SQLite)
export const nasionalArticles: Article[] = [];

export interface ActivityPhoto {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
}

// 3. Kategori: Foto Kegiatan (Diambil dari REST API / SQLite)
export const activityPhotos: ActivityPhoto[] = [];
