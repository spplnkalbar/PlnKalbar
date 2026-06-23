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
    id: "pln-featured",
    title: "Musyawarah Daerah VII SP PLN Kalbar: Teguhkan Komitmen Menjaga Kedaulatan Ketenagalistrikan",
    excerpt: "Musda VII merumuskan langkah strategis perjuangan hak pekerja, peningkatan kompetensi, serta penolakan tegas terhadap unbundling demi menjaga kestabilan energi di Kalimantan Barat.",
    content: "Serikat Pekerja (SP) PT PLN (Persero) Unit Induk Distribusi Kalimantan Barat sukses menyelenggarakan Musyawarah Daerah (Musda) VII bertempat di Kota Pontianak. Kegiatan konsolidasi organisasi yang berlangsung selama dua hari ini mengusung tekad luhur untuk menegakkan kedaulatan ketenagalistrikan nasional, sekaligus memastikan pelayanan prima tanpa jeda bagi seluruh lapisan masyarakat di Kalimantan Barat.\n\nDalam jalannya musyawarah, disepakati berbagai program kerja jangka pendek dan menengah, di antaranya penajaman kompetensi teknik personel serta program kesejahteraan kolaboratif. Ketua SP PLN Kalbar menegaskan pentingnya solidaritas seluruh anggota dalam mempertahankan kesatuan PLN dari ancaman skema pemecahan (unbundling) yang berisiko mengganggu kestabilan harga energi nasional di masa mendatang.\n\nMusda VII ini juga menjadi momentum emas untuk merekatkan tali silaturahmi antar-unit, memberikan ruang apresiasi bagi ide-ide cemerlang dari pekerja muda, serta menyelaraskan visi perjuangan organisasi dengan dinamika pembangunan daerah Kalimantan Barat yang berdaya saing tinggi.",
    author: "Humas SP PLN Kalbar",
    date: "16 Juni 2026",
    category: "Organisasi",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
    readTime: "5 menit"
  },
  {
    id: "pln-art-1",
    title: "Sinergi Kemanusiaan: SP PLN Kalbar Salurkan Bantuan Darurat untuk Korban Banjir Sintang",
    excerpt: "Sebagai wujud nyata kepedulian sosial, SP PLN Kalbar bergerak cepat menyalurkan paket sembako dan obat-obatan langsung ke lokasi terdampak banjir.",
    content: "Bencana banjir yang melanda beberapa wilayah di hulu Kalimantan Barat, khususnya kawasan Sintang, memanggil kepedulian jajaran pengurus dan anggota Serikat Pekerja PLN UID Kalbar. Melalui aksi terpadu 'SP PLN Peduli', tim relawan lapangan dikirim langsung untuk mendistribusikan ratusan paket sembako, selimut, susu anak, dan kebutuhan medis darurat ke posko penyintas.\n\nBantuan dikawal langsung oleh perwakilan SP PLN Kalbar untuk memastikan penyaluran tepat sasaran kepada warga yang paling membutuhkan. Kehadiran tim ini tidak hanya meringankan beban fisik, tetapi juga membawa dukungan moral bagi saudara-saudara kita di tengah musibah.",
    author: "Relawan SP PLN",
    date: "14 Juni 2026",
    category: "Sosial",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
    readTime: "4 menit"
  },
  {
    id: "pln-art-2",
    title: "Sosialisasi Penerapan K3: SP PLN Kalbar Prioritaskan Keselamatan Petugas Lapangan",
    excerpt: "Melahirkan budaya nihil kecelakaan kerja (zero accident) melalui pemahaman hak keselamatan normatif dan pelatihan intensif standar operasional.",
    content: "Keselamatan dan Kesehatan Kerja (K3) bukan sekadar aturan, melainkan harga mati bagi seluruh insan kelistrikan. SP PLN UID Kalbar kembali menggelar sosialisasi intensif untuk memperkuat implementasi budaya keselamatan bermutu tinggi pada setiap unit kerja layanan transmisi dan distribusi.\n\nEdukasi ini mengupas tuntas hak normatif pekerja dalam mendapatkan alat pelindung diri (APD) berstandar internasional, serta cara merespons kondisi darurat di lapangan secara taktis. Penurunan angka risiko kerja diharapkan terwujud melalui kesadaran kolektif dari barisan depan ketenagalistrikan.",
    author: "K3 Lestari",
    date: "12 Juni 2026",
    category: "K3 & Keselamatan",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1200",
    readTime: "3 menit"
  },
  {
    id: "pln-art-3",
    title: "Mempererat Kebersamaan: Perayaan HUT SP PLN di Pontianak Berlangsung Hangat",
    excerpt: "Rangkaian Family Gathering dan pemberian santunan bagi anak yatim piatu mewarnai peringatan HUT tahun ini dengan penuh rasa kekeluargaan.",
    content: "Suasana kehangatan menyelimuti perayaan Hari Ulang Tahun Serikat Pekerja PLN yang menggelora di kota Pontianak. Mengusung konsep kebersamaan keluarga, acara dipadati keluarga pegawai yang antusias berpartisipasi dalam aneka lomba ketangkasan, gelar seni budaya lokal, hingga malam keakraban.\n\nPuncak peringatan dihiasi dengan pembagian santunan sosial kepada panti asuhan setempat, menegaskan jati diri SP PLN sebagai elemen bangsa yang senantiasa menebarkan manfaat bagi kemaslahatan masyarakat sekitar.",
    author: "Panitia HUT",
    date: "10 Juni 2026",
    category: "Kegiatan",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200",
    readTime: "4 menit"
  },
  {
    id: "pln-art-4",
    title: "Aksi Nyata Hijaukan Pantai: SP PLN Kalbar Tanam Mangrove di Pesisir Mempawah",
    excerpt: "Menjaga keseimbangan ekosistem pantai dan mencegah abrasi hebat dengan menanam bibit mangrove berkualitas bersama komunitas lingkungan.",
    content: "Merespons ancaman abrasi pantai yang kian memprihatinkan di wilayah pesisir Kalimantan Barat, SP PLN UID Kalbar meluncurkan inisiatif peduli bumi dengan melakukan penanaman bibit pohon mangrove di pesisir kabupaten Mempawah.\n\nKegiatan ini melibatkan partisipasi aktif ratusan pengurus, kader muda pekerja, serta dinas kelautan setempat. Sinergi ini merupakan wujud dedikasi Serikat Pekerja yang tidak hanya peduli pada ketenagalistrikan, tetapi juga berkomitmen merawat kelestarian lingkungan hidup demi generasi masa kini dan masa depan.",
    author: "Humas SP PLN",
    date: "08 Juni 2026",
    category: "Lingkungan",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    readTime: "4 menit"
  }
];

// 2. Kategori: Berita Nasional
export const nasionalArticles: Article[] = [
  {
    id: "nasional-featured",
    title: "Optimisme Transisi Energi Nasional: Indonesia Genjot Pemanfaatan Energi Terbarukan",
    excerpt: "Pemerintah bersama berbagai pihak terus mendorong percepatan transisi energi hijau guna mencapai target Net Zero Emission pada tahun 2060.",
    content: "Indonesia terus berkomitmen dalam menekan emisi karbon dengan memperbanyak kontribusi pembangkit listrik ramah lingkungan. Transformasi sektor energi menuju energi baru terbarukan (EBT) kini menjadi prioritas nasional.\n\nBeberapa proyek strategis seperti pembangkit listrik tenaga surya terapung, pemanfaatan panas bumi, serta turbin angin mulai dikembangkan secara masif di berbagai wilayah Indonesia. Pemerintah juga terus merumuskan kebijakan tarif yang menarik bagi investor guna mendukung ekosistem investasi hijau.\n\nDengan potensi sumber daya alam yang melimpah, Indonesia berpeluang besar menjadi salah satu pelopor transisi energi di Asia Tenggara, sekaligus menciptakan lapangan kerja baru di sektor teknologi ramah lingkungan.",
    author: "Zainal Abidin",
    date: "16 Juni 2026",
    category: "Energi",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2000",
    readTime: "5 menit"
  },
  {
    id: "nasional-art-1",
    title: "Pembangunan IKN Nusantara Ditargetkan Menggunakan 100% Energi Ramah Lingkungan",
    excerpt: "Konsep Forest City yang diusung oleh Ibu Kota Nusantara akan ditopang sepenuhnya oleh pasokan listrik hijau dari PLTA dan PLTS.",
    content: "Pemerintah menegaskan bahwa Ibu Kota Nusantara (IKN) akan menjadi role model kota ramah lingkungan di tingkat global. Sistem tata kota didesain sedemikian rupa agar meminimalkan emisi gas buang dan polusi udara.\n\nSalah satu pilar utamanya adalah penggunaan 100% energi bersih. Pembangkit Listrik Tenaga Surya (PLTS) berkapasitas besar kini tengah dibangun di kawasan IKN, didukung oleh rencana pasokan dari Pembangkit Listrik Tenaga Air (PLTA) di wilayah sekitar Kalimantan.\n\nSelain itu, moda transportasi di dalam kawasan inti pemerintahan hanya diperuntukkan bagi kendaraan listrik dan transportasi umum bebas emisi.",
    author: "Dian Sastro",
    date: "15 Juni 2026",
    category: "Infrastruktur",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    readTime: "4 menit"
  },
  {
    id: "nasional-art-2",
    title: "Ekonomi Digital Indonesia Diperkirakan Tumbuh Pesat Hingga Akhir Dekade",
    excerpt: "Laporan riset terbaru memproyeksikan nilai ekonomi digital tanah air dapat menembus angka fantastis berkat penetrasi internet yang merata.",
    content: "Sektor ekonomi digital terus menjadi salah satu penopang utama pertumbuhan ekonomi nasional. Kontribusi dari e-commerce, fintech, serta layanan on-demand terus menunjukkan tren positif dari tahun ke tahun.\n\nPengembangan infrastruktur digital seperti jaringan fiber optik dan penyediaan akses internet di daerah 3T (Tertinggal, Terdepan, dan Terluar) menjadi kunci utama pemerataan peluang ekonomi ini.\n\nPara pelaku UMKM juga semakin go-digital, memanfaatkan platform online untuk memasarkan produk mereka hingga ke kancah nasional maupun mancanegara.",
    author: "Eko Pratama",
    date: "14 Juni 2026",
    category: "Ekonomi",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    readTime: "3 menit"
  },
  {
    id: "nasional-art-3",
    title: "Revolusi Pertanian Modern: Petani Muda Mengadopsi Teknologi IoT dan Hidroponik",
    excerpt: "Guna menjaga ketahanan pangan nasional, para petani milenial mulai menerapkan digitalisasi pertanian untuk meningkatkan hasil panen.",
    content: "Wajah pertanian Indonesia sedang mengalami transformasi besar. Di tangan generasi muda, pertanian tidak lagi dianggap sebagai pekerjaan kotor dan kuno, melainkan sektor industri modern yang berteknologi tinggi.\n\nDengan sistem Internet of Things (IoT), petani kini dapat memantau kelembapan tanah, suhu udara, serta kebutuhan nutrisi tanaman hanya melalui aplikasi di smartphone mereka. Hal ini terbukti mampu menghemat air dan pupuk hingga 40% sekaligus melipatgandakan produktivitas.\n\nInovasi semacam ini diharapkan dapat menarik minat lebih banyak anak muda untuk berkiprah di sektor pertanian guna memperkuat ketahanan pangan tanah air.",
    author: "Agus Harimurti",
    date: "13 Juni 2026",
    category: "Agrikultur",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=800",
    readTime: "4 menit"
  },
  {
    id: "nasional-art-4",
    title: "Seni Batik Nusantara Kembali Mendunia Melalui Pameran Internasional",
    excerpt: "Pameran busana eksklusif di Milan berhasil mencuri perhatian pengamat mode dunia dengan keindahan motif batik tulis tradisional Indonesia.",
    content: "Warisan budaya takbenda Indonesia, Batik, kembali menorehkan prestasi di panggung internasional. Dalam ajang Milan Fashion Week, karya para perancang busana tanah air yang memadukan siluet modern dengan motif batik nusantara mendapat apresiasi luar biasa.\n\nPenggunaan pewarna alami ramah lingkungan pada kain batik menjadi daya tarik tersendiri di tengah tren global 'sustainable fashion' yang mengutamakan kelestarian alam.\n\nUpaya promosi ini diharapkan dapat terus dilakukan untuk menjaga kelestarian batik sekaligus meningkatkan taraf hidup perajin batik lokal di berbagai pelosok nusantara.",
    author: "Amia Lestari",
    date: "12 Juni 2026",
    category: "Budaya",
    imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800",
    readTime: "5 menit"
  }
];

// 3. Kategori: Berita Internasional
export const internasionalArticles: Article[] = [
  {
    id: "internasional-featured",
    title: "Konferensi Iklim Global COP31: Hubungan Bersejarah Antarnegara Kurangi Emisi Global",
    excerpt: "Para pemimpin dunia menyetujui pakta baru yang mempercepat penghentian penggunaan batu bara dan meningkatkan pendanaan hijau global.",
    content: "Konferensi Perubahan Iklim PBB (COP31) resmi ditutup dengan kesepakatan bersejarah antara negara maju dan berkembang. Kesepakatan ini menekankan aksi nyata untuk membatasi kenaikan suhu global di bawah 1,5 derajat Celsius.\n\nDalam traktat baru ini, negara-negara berkomitmen untuk secara bertahap mengurangi subsidi energi fosil dan menggandakan kapasitas energi terbarukan global pada tahun 2030. Komitmen pendanaan iklim dari negara-negara kaya juga terus ditingkatkan untuk membantu negara-negara berkembang beradaptasi terhadap perubahan sosiomedis.\n\nSekretaris Jenderal PBB menyatakan ini adalah langkah maju yang esensial, meskipun implementasi nyata di lapangan akan menjadi ujian sesungguhnya bagi kepatuhan komitmen masing-masing negara.",
    author: "Helena Carter",
    date: "15 Juni 2026",
    category: "Internasional",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000",
    readTime: "6 menit"
  },
  {
    id: "internasional-art-1",
    title: "Tantangan Baru Pasokan Chip dan Rantai Logistik Semikonduktor Global",
    excerpt: "Ketegangan geopolitik dan perlambatan produksi memicu restrukturisasi rute logistik semikonduktor dunia demi kestabilan suplai.",
    content: "Industri teknologi global kembali dihadapkan pada ketidakpastian rantai pasok komponen vital semikonduktor. Menanggapi situasi ini, beberapa raksasa teknologi mulai melakukan diversifikasi lokasi pabrik perakitan guna meminimalkan risiko operasional.\n\nNegara-negara di kawasan Asia Tenggara dan Eropa Timur kini menjadi target utama relokasi investasi pabrik microchip baru. Langkah strategis ini diharapkan dapat memperkuat kemandirian industri lokal serta memastikan pasokan yang stabil untuk kebutuhan otomotif dan elektronik pintar dunia.",
    author: "Marcus Aurelius",
    date: "14 Juni 2026",
    category: "Bisnis & Teknologi",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    readTime: "5 menit"
  },
  {
    id: "internasional-art-2",
    title: "Misi Eksplorasi Luar Angkasa Terbaru Sukses Mendarat di Kawah Mars",
    excerpt: "Wahana antariksa nirawak berhasil mendarat dengan selamat di Mars guna meneliti potensi sumber air purba di planet merah tersebut.",
    content: "Badan antariksa gabungan internasional mengumumkan keberhasilan pendaratan wahana eksplorasi tercanggih mereka di permukaan Mars. Misi utama dari eksplorasi ini adalah mengumpulkan sampel batuan dari dasar kawah kuno yang diduga kuat pernah dialiri air miliaran tahun lalu.\n\nData-data ilmiah yang dikirimkan kembali ke bumi diharapkan dapat memberikan petunjuk berharga mengenai sejarah evolusi tata surya serta jawaban atas pertanyaan besar tentang kemungkinan adanya kehidupan di luar bumi.",
    author: "Neil Stephenson",
    date: "13 Juni 2026",
    category: "Sains",
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
    readTime: "4 menit"
  },
  {
    id: "internasional-art-3",
    title: "Evolusi Pasar Kendaraan Listrik Global Mengalami Lonjakan Permintaan di Eropa",
    excerpt: "Kebijakan insentif pajak yang progresif di Uni Eropa berhasil melipatgandakan populasi mobil ramah lingkungan dalam setahun terakhir.",
    content: "Adopsi kendaraan listrik di benua Eropa mencatat rekor tertinggi sepanjang sejarah industri otomotif setempat. Kesadaran konsumen yang tinggi dipadukan dengan ketersediaan infrastruktur pengisian daya cepat berperan vital dalam kesuksesan transisi ini.\n\nSejumlah produsen otomotif legacy juga terpantau mempercepat transformasi portfolio produk mereka untuk beralih sepenuhnya ke tenaga listrik penuh, meninggalkan varian mesin pembakaran konvensional.",
    author: "Oliver Bennett",
    date: "12 Juni 2026",
    category: "Otomotif",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
    readTime: "5 menit"
  },
  {
    id: "internasional-art-4",
    title: "Arsitektur Hijau: Kota-Kota Besar Dunia Mulai Beralih ke Konsep Urban Farming",
    excerpt: "Guna menekan jejak karbon perkotaan, integrasi kebun vertikal pada gedung pencakar langit terus digencarkan secara global.",
    content: "Konsep tata kota masa depan kini bergeser ke arah keberlanjutan ekologis yang aktif. Berbagai megacity di dunia mulai mewajibkan penerapan konsep gedung berkelanjutan dengan atap hijau dan kebun hidroponik vertikal.\n\nLangkah ini terbukti efektif dalam meringankan efek 'urban heat island' serta menyediakan bahan pangan segar lokal bagi para penghuni perkotaan yang berpenduduk padat.",
    author: "Sophia Laurent",
    date: "11 Juni 2026",
    category: "Arsitektur",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    readTime: "4 menit"
  }
];

export interface ActivityPhoto {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
}

export const activityPhotos: ActivityPhoto[] = [
  {
    id: "act-1",
    title: "Musyawarah Daerah VII SP PLN Kalbar",
    description: "Kegiatan konsolidasi organisasi SP PLN Kalimantan Barat untuk merumuskan aspirasi pegawai serta mendorong sinergi yang harmonis demi kemajuan ketenagalistrikan daerah.",
    date: "10 April 2026",
    location: "Pontianak, Kalimantan Barat",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "act-2",
    title: "Aksi Sosial Peduli Korban Banjir",
    description: "Serikat Pekerja PLN Kalbar menyalurkan paket bantuan sembako dan kebutuhan darurat langsung kepada warga terdampak banjir di wilayah hulu Kalimantan Barat.",
    date: "25 Mei 2026",
    location: "Sintang, Kalimantan Barat",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "act-3",
    title: "Edukasi Keselamatan Kerja & K3",
    description: "Sesi sosialisasi dan edukasi mengenai pentingnya penerapan prinsip keselamatan dan kesehatan kerja (K3) serta pemenuhan hak-hak normatif para petugas lapangan.",
    date: "12 Maret 2026",
    location: "Singkawang, Kalimantan Barat",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "act-4",
    title: "Family Gathering & Pembagian Santunan",
    description: "Meningkatkan jalinan silaturahmi, solidaritas, dan hubungan kekeluargaan di antara keluarga pegawai PLN Kalbar dalam merayakan HUT Serikat Pekerja.",
    date: "05 Januari 2026",
    location: "Pontianak, Kalimantan Barat",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "act-5",
    title: "Rapat Kerja Wilayah (Rakerwil) I",
    description: "Diskusi mendalam bersama jajaran manajemen untuk membahas peningkatan keselamatan kerja, struktur kesejahteraan pegawai, dan efisiensi operasional ke depan.",
    date: "18 Februari 2026",
    location: "Pontianak, Kalimantan Barat",
    imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "act-6",
    title: "Penghijauan & Penanaman 1000 Pohon",
    description: "Wujud nyata kepedulian lingkungan dari SP PLN Kalimantan Barat melalui program penanaman bibit pohon mangrove untuk mencegah abrasi pantai.",
    date: "04 April 2026",
    location: "Mempawah, Kalimantan Barat",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
  }
];
