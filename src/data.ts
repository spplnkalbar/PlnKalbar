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
}

// 1. Kategori: Berita SP PLN Kalimantan Barat (berisi berita bawaan saat ini)
export const plnArticles: Article[] = [];

// 2. Kategori: Berita Nasional
export const nasionalArticles: Article[] = [];

// 3. Kategori: Berita Internasional
export const internasionalArticles: Article[] = [];

export interface ActivityPhoto {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
}

export const activityPhotos: ActivityPhoto[] = [];
