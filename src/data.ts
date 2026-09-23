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

// 1. Kategori: Berita SP PLN Kalimantan Barat (Data disinkronkan dari Google Spreadsheet)
// Postingan terbaru berada pada baris bawah spreadsheet, sehingga dimunculkan paling awal sebagai Berita Utama
export const plnArticles: Article[] = [
  {
    id: "pln-sheet-1",
    title: "Ruang Dialog Energi Kupas RUPTL 2025–2034 dan Masa Depan Kelistrikan Kalbar",
    excerpt: "Ketua DPD Serikat Pekerja PLN UID Kalbar, Akhmad Junaidi, menyampaikan pemaparan materi dalam kegiatan Ruang Dialog “RUPTL 2025–2034 dan Kemandirian Energi Kalimantan Barat” yang berlangsung di Rumangsa Café Pontianak. Diskusi tersebut membahas arah kebijakan energi nasional, ketahanan energi, serta masa depan sistem kelistrikan di Kalimantan Barat.",
    content: `Pontianak – Ketua DPD Serikat Pekerja PLN UID Kalimantan Barat, Akhmad Junaidi, menilai Rencana Usaha Penyediaan Tenaga Listrik (RUPTL) 2025–2034 perlu dikaji ulang dan direvisi. Pandangan tersebut disampaikannya dalam kegiatan Ruang Dialog bertajuk "RUPTL 2025–2034 dan Kemandirian Energi Kalimantan Barat" yang berlangsung di Rumangsa Café, Pontianak.

Dalam pemaparannya, Akhmad Junaidi menyampaikan bahwa arah kebijakan dalam RUPTL harus benar-benar berpijak pada kepentingan nasional dengan mengedepankan prinsip kedaulatan energi. Menurutnya, sejumlah strategi yang tertuang dalam dokumen tersebut masih perlu dievaluasi agar tidak menimbulkan ketergantungan yang berlebihan terhadap pihak luar, baik dalam aspek pembiayaan, teknologi, maupun pasokan energi primer.

Ia berpendapat bahwa kedaulatan energi tidak hanya diukur dari kemampuan menyediakan listrik bagi masyarakat, tetapi juga dari kemampuan bangsa mengendalikan sumber daya energi, teknologi pembangkitan, serta rantai pasok strategis secara mandiri. Karena itu, revisi RUPTL dinilai penting agar pembangunan sektor ketenagalistrikan lebih berorientasi pada penguatan kapasitas nasional dan pemanfaatan sumber daya domestik.

Menurut Akhmad Junaidi, Indonesia memiliki potensi energi yang besar, mulai dari batu bara, gas bumi, panas bumi, tenaga air, hingga berbagai sumber energi baru dan terbarukan. Potensi tersebut, katanya, harus menjadi fondasi utama dalam penyusunan kebijakan kelistrikan nasional sehingga tidak bergantung pada kepentingan maupun pasokan dari luar negeri.

Dalam konteks Kalimantan Barat, ia juga menyoroti pentingnya pembangunan infrastruktur kelistrikan yang mampu memperkuat ketahanan energi daerah sekaligus mendukung pertumbuhan ekonomi. Ia menilai RUPTL seharusnya memberikan ruang yang lebih besar bagi optimalisasi potensi energi lokal sehingga manfaat ekonomi dapat dirasakan secara langsung oleh masyarakat.

Melalui forum dialog tersebut, Akhmad Junaidi mengajak seluruh pemangku kepentingan, mulai dari pemerintah, PLN, akademisi, hingga masyarakat sipil, untuk memberikan masukan terhadap implementasi RUPTL 2025–2034. Menurutnya, kebijakan ketenagalistrikan yang berpihak pada kepentingan nasional akan menjadi fondasi penting dalam mewujudkan kemandirian dan kedaulatan energi Indonesia di masa depan.`,
    author: "Agustian",
    date: "Kamis, 25 Juni 2026 • 22.13 WIB",
    category: "SP PLN Kalimantan Barat",
    imageUrl: "https://lh3.googleusercontent.com/d/1qjeWGoArNqXQprL67_XVXmbXuFx8mBOa=w1600",
    readTime: "3 Min Read"
  },
  {
    id: "pln-sheet-0",
    title: "SP PLN UID Kalbar dan Disnakertrans Kalbar Perkuat Sinergi Ketenagakerjaan",
    excerpt: "Audiensi bersama Kepala Dinas Tenaga Kerja dan Transmigrasi Provinsi Kalimantan Barat membahas penguatan hubungan industrial, pengembangan kompetensi pekerja, serta kolaborasi strategis antara pekerja, perusahaan, dan pemerintah.",
    content: `DPD SP PLN UID Kalimantan Barat mengadakan audiensi dengan Kepala Dinas Tenaga Kerja dan Transmigrasi Provinsi Kalimantan Barat untuk memperkuat sinergi di bidang ketenagakerjaan. Pertemuan membahas penguatan hubungan industrial, peningkatan kompetensi pekerja, serta kolaborasi strategis antara pekerja, perusahaan, dan pemerintah. Berdasarkan keterangan foto, Ketua DPD SP PLN UID Kalbar, Akhmad Junaidi (kedua dari kanan), didampingi jajaran pengurus berdiskusi dengan Kepala Disnakertrans Provinsi Kalbar, Drs. Ahmad Priyono, M.M. (kanan).`,
    author: "Agustian",
    date: "Rabu, 3 Juni 2026 • 23.18 WIB",
    category: "SP PLN Kalimantan Barat",
    imageUrl: "https://lh3.googleusercontent.com/d/1D4PKpdaPJ4m_4xHvhXYwkN-5rj7WNO5W=w1600",
    readTime: "2 Min Read"
  }
];

// 2. Kategori: Berita Nasional (Diambil langsung dari tab 'BERITA NASIONAL' di Google Spreadsheet)
// Data otomatis tampil saat baris berita diinput di sheet
export const nasionalArticles: Article[] = [];

export interface ActivityPhoto {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
}

// 3. Kategori: Foto Kegiatan (Diambil langsung dari tab 'FOTO KEGIATAN' di Google Spreadsheet)
// Data otomatis tampil saat baris dokumentasi diinput di sheet
export const activityPhotos: ActivityPhoto[] = [];
