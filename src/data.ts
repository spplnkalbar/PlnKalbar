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

export const featuredArticle: Article = {
  id: "featured-1",
  title: "Masa Depan Kecerdasan Buatan dalam Kehidupan Sehari-hari",
  excerpt: "Bagaimana teknologi AI mulai berintegrasi secara mulus ke dalam rutinitas kita, mengubah cara kita bekerja, berinteraksi, dan memandang dunia. Sebuah eksplorasi tentang harmoni antara mesin dan manusia.",
  content: "Kecerdasan Buatan (AI) tidak lagi hanya menjadi fiksi ilmiah. Saat ini, AI telah menjadi bagian tak terpisahkan dari kehidupan sehari-hari kita. Dari asisten virtual di smartphone yang membantu mengatur jadwal, hingga algoritma rekomendasi di platform streaming yang menyuguhkan hiburan sesuai selera, AI bekerja di latar belakang untuk membuat hidup lebih efisien.\n\nNamun, perkembangan AI juga membawa tantangan baru. Isu tentang privasi data, bias algoritma, dan masa depan lapangan pekerjaan menjadi topik yang hangat diperdebatkan. Bagaimana kita menyeimbangkan kemudahan yang ditawarkan oleh AI dengan risiko yang mungkin ditimbulkannya?\n\nPara ahli berpendapat bahwa kunci keberhasilan integrasi AI terletak pada regulasi yang bijak dan pemahaman yang mendalam tentang teknologi ini. Kita perlu memastikan bahwa AI dikembangkan dan digunakan secara etis, dengan tetap mempertahankan nilai-nilai kemanusiaan.",
  author: "Budi Santoso",
  date: "14 Juni 2026",
  category: "Teknologi",
  imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000",
  readTime: "5 menit"
};

export const additionalArticles: Article[] = [
  {
    id: "article-1",
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
    id: "article-2",
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
    id: "article-3",
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
    id: "article-4",
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
