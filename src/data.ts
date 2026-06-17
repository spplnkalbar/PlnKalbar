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
    title: "Masa Depan Kecerdasan Buatan dalam Kehidupan Sehari-hari",
    excerpt: "Bagaimana teknologi AI mulai berintegrasi secara mulus ke dalam rutinitas kita, mengubah cara kita bekerja, berinteraksi, dan memandang dunia. Sebuah eksplorasi tentang harmoni antara mesin dan manusia.",
    content: "Kecerdasan Buatan (AI) tidak lagi hanya menjadi fiksi ilmiah. Saat ini, AI telah menjadi bagian tak terpisahkan dari kehidupan sehari-hari kita. Dari asisten virtual di smartphone yang membantu mengatur jadwal, hingga algoritma rekomendasi di platform streaming yang menyuguhkan hiburan sesuai selera, AI bekerja di latar belakang untuk membuat hidup lebih efisien.\n\nNamun, perkembangan AI juga membawa tantangan baru. Isu tentang privasi data, bias algoritma, dan masa depan lapangan pekerjaan menjadi topik yang hangat diperdebatkan. Bagaimana kita menyeimbangkan kemudahan yang ditawarkan oleh AI dengan risiko yang mungkin ditimbulkannya?\n\nPara ahli berpendapat bahwa kunci keberhasilan integrasi AI terletak pada regulasi yang bijak dan pemahaman yang mendalam tentang teknologi ini. Kita perlu memastikan bahwa AI dikembangkan dan digunakan secara etis, dengan tetap mempertahankan nilai-nilai kemanusiaan.",
    author: "Budi Santoso",
    date: "14 Juni 2026",
    category: "Teknologi",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000",
    readTime: "5 menit"
  },
  {
    id: "pln-art-1",
    title: "Menjelajahi Keindahan Alam Tersembunyi di Timur Indonesia",
    excerpt: "Sebuah perjalanan menakjubkan ke destinasi wisata yang belum banyak terjamah oleh wisatawan mainstream, menyimpan pesona yang luar biasa.",
    content: "Timur Indonesia selalu menyimpan misteri dan keindahan yang tak ada habisnya. Jauh dari hingar-bingar kota besar, terdapat pulau-pulau kecil dengan pantai berpasir putih, air laut yang sebening kristal, dan kekayaan bawah laut yang memanjakan mata.\n\nPerjalanan ke wilayah ini mungkin tidak selalu mudah. Tantangan transportasi dan infrastruktur seringkali menjadi kendala. Namun, semua itu akan terbayar lunas saat Anda menginjakkan kaki di tanah surga ini.\n\nMasyarakat lokal yang ramah dan budaya yang masih terjaga keasliannya menambah nilai lebih dari sekadar wisata alam. Ini adalah perjalanan jiwa untuk mensyukuri mahakarya Sang Pencipta.",
    author: "Siti Rahma",
    date: "13 Juni 2026",
    category: "Perjalanan",
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800",
    readTime: "4 menit"
  },
  {
    id: "pln-art-2",
    title: "Tren Kuliner Sehat yang Akan Mendominasi Tahun Ini",
    excerpt: "Dari plant-based diet hingga superfood lokal, ini dia deretan makanan sehat yang sedang naik daun dan digemari kaum urban.",
    content: "Kesadaran akan gaya hidup sehat semakin meningkat di kalangan masyarakat urban. Hal ini tercermin dari perubahan tren kuliner yang kini lebih berfokus pada nutrisi dan bahan-bahan alami.\n\nDiet berbasis tumbuhan (plant-based diet) menjadi salah satu tren yang paling populer. Banyak restoran mulai menawarkan menu vegan yang tidak hanya sehat, tetapi juga lezat.\n\nSelain itu, bahan-bahan lokal yang kaya nutrisi (superfood) seperti kelor, tempe, dan rempah-rempah tradisional kembali digemari. Ini membuktikan bahwa makanan sehat tidak selalu harus mahal dan diimpor dari luar negeri.",
    author: "Chef Juna",
    date: "12 Juni 2026",
    category: "Gaya Hidup",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    readTime: "3 menit"
  },
  {
    id: "pln-art-3",
    title: "Perkembangan Kendaraan Listrik dan Infrastrukturnya",
    excerpt: "Sejauh mana kesiapan infrastruktur dunia untuk mendukung transisi besar-besaran menuju era kendaraan ramah lingkungan?",
    content: "Transisi menuju kendaraan bermotor listrik berbasis baterai (KBLBB) tengah menjadi fokus global. Beberapa negara telah menetapkan target ambisius untuk menghentikan penjualan kendaraan berbahan bakar fosil dalam beberapa dekade mendatang.\n\nNamun, tantangan terbesar terletak pada kesiapan infrastruktur. Ketersediaan stasiun pengisian kendaraan listrik (SPKLU) yang memadai sangat krusial untuk mengatasi 'range anxiety' atau kekhawatiran kehabisan baterai di tengah jalan.\n\nSelain itu, pasokan bahan baku baterai dan pengelolaan limbah baterai juga menjadi isu lingkungan yang perlu segera dicarikan solusinya.",
    author: "Andi Wijaya",
    date: "11 Juni 2026",
    category: "Otomotif",
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
    readTime: "6 menit"
  },
  {
    id: "pln-art-4",
    title: "Seni Minimalisme: Mengurangi Barang untuk Menambah Makna",
    excerpt: "Mengapa semakin banyak orang yang mulai menerapkan gaya hidup minimalis di tengah gempuran tren konsumerisme modern.",
    content: "Di tengah gempuran iklan dan tuntutan untuk terus mengonsumsi, gaya hidup minimalis hadir sebagai oase. Minimalisme bukan hanya tentang membuang barang, tetapi tentang memilih dengan bijak apa yang benar-benar memberikan nilai dalam hidup kita.\n\nDengan mengurangi barang-barang yang tidak perlu, kita dapat menghemat ruang, waktu, dan uang. Lebih dari itu, minimalisme membebaskan kita dari beban psikologis yang seringkali melekat pada kepemilikan materi.\n\nKonsep ini mengajarkan kita untuk lebih bersyukur dan menghargai pengalaman daripada sekadar memiliki barang.",
    author: "Rina Melati",
    date: "10 Juni 2026",
    category: "Seni & Budaya",
    imageUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800",
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
