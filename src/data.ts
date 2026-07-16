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
export const plnArticles: Article[] = [
  {
    id: "pln-1",
    title: "Ruang Dialog Energi Kupas RUPTL 2025–2034 dan Masa Depan Kelistrikan Kalbar",
    excerpt: "Ketua DPD Serikat Pekerja PLN UID Kalbar, Akhmad Junaidi, menyampaikan pemaparan materi dalam kegiatan Ruang Dialog “RUPTL 2025–2034 dan Kemandirian Energi Kalimantan Barat” yang berlangsung di Rumangsa Café Pontianak. Diskusi tersebut membahas arah kebijakan energi nasional, ketahanan energi, serta masa depan sistem kelistrikan di Kalimantan Barat.",
    content: `Pontianak – Ketua DPD Serikat Pekerja PLN UID Kalimantan Barat, Akhmad Junaidi, menjadi salah satu narasumber dalam kegiatan Ruang Dialog bertajuk *"RUPTL 2025–2034 dan Kemandirian Energi Kalimantan Barat"* yang digelar di Rumangsa Café, Pontianak.

Dalam kesempatan tersebut, Akhmad Junaidi memaparkan berbagai aspek terkait Rencana Usaha Penyediaan Tenaga Listrik (RUPTL) 2025–2034 sebagai arah pengembangan sistem ketenagalistrikan nasional, khususnya di Kalimantan Barat. Ia menjelaskan bahwa RUPTL tidak hanya menjadi pedoman pembangunan infrastruktur kelistrikan, tetapi juga berperan penting dalam mendukung ketahanan energi dan mendorong terwujudnya kemandirian energi di daerah.

Diskusi berlangsung interaktif dengan mengangkat sejumlah isu strategis, mulai dari kebijakan energi nasional, tantangan penyediaan pasokan listrik yang andal, pemanfaatan energi baru dan terbarukan (EBT), hingga upaya memperkuat sistem kelistrikan Kalimantan Barat agar mampu memenuhi kebutuhan masyarakat dan mendukung pertumbuhan ekonomi.

Akhmad Junaidi menekankan pentingnya kolaborasi antara pemerintah, PLN, dunia usaha, akademisi, dan masyarakat dalam mewujudkan sistem energi yang berkelanjutan. Menurutnya, keberhasilan implementasi RUPTL 2025–2034 akan menjadi salah satu faktor penting dalam memperkuat ketahanan energi nasional sekaligus meningkatkan keandalan pasokan listrik di Kalimantan Barat.

Melalui forum dialog ini, para peserta juga bertukar pandangan mengenai berbagai peluang dan tantangan sektor ketenagalistrikan di Kalimantan Barat, termasuk strategi percepatan pembangunan infrastruktur energi yang selaras dengan target transisi energi nasional. Kegiatan diharapkan menjadi ruang diskusi yang produktif dalam merumuskan gagasan dan rekomendasi untuk mendukung pembangunan sektor energi yang lebih mandiri, andal, dan berkelanjutan di Kalimantan Barat.`,
    author: "Agustian",
    date: "Kamis, 25 Juni 2026 • 22.13 WIB",
    category: "SP PLN Kalimantan Barat",
    imageUrl: "https://lh3.googleusercontent.com/d/1qjeWGoArNqXQprL67_XVXmbXuFx8mBOa=w1000",
    readTime: "3 Min Read"
  }
];

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
