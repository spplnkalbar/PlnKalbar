# Remix: Berita Elegan 📰✨

Aplikasi pembaca berita premium dan info terkini Serikat Pekerja PLN Kalimantan Barat (SP PLN KALBAR). Dibangun dengan kombinasi teknologi modern untuk menghadirkan pengalaman membaca yang sangat elegan, responsif, dan interaktif dengan animasi sehalus sutra.

---

## 🎨 Fitur Utama

- **Desain Mewah & Estetik (Premium Glassmorphism)**: Antarmuka modern dengan paduan warna merah transparan khas PLN, tipografi Serif yang berkelas untuk kejelasan artikel, serta layout yang memanfaatkan *negative space* secara optimal guna kenyamanan navigasi.
- **Arsip & Kategori Berita Terintegrasi**:
  - **SP PLN KALBAR**: Berita, kegiatan, dan rilis resmi Serikat Pekerja PLN Kalimantan Barat.
  - **Berita Nasional**: Berita terkini skala nasional dalam hitungan menit.
  - **Berita Internasional**: Berita mancanegara agar Anda tetap terhubung dengan isu-isu global.
- **Statistik & Panel Keuangan Real-Time**:
  - **IHSG Chart**: Grafik interaktif Indeks Harga Saham Gabungan yang responsif dan canggih (menggunakan pustaka Recharts/D3).
  - **Kurs Valuta Asing**: Pemantauan nilai tukar Rupiah (IDR) terhadap mata uang global terpopuler secara langsung.
- **Interaksi & Transisi Mikro Tanpa Cela**: Efek animasi transisi kartu, ekspansi detail berita secara instan, serta overlay menu yang mulus diposisikan menggunakan kekuatan `motion/react`.

---

## 🚀 Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur mutakhir:

- **React 18 & Vite**: Membuat proses pengembangan dan rendering aplikasi berjalan ekstra cepat.
- **Tailwind CSS**: Penyuntingan gaya visual langsung dengan utilisasi utilitas responsif.
- **Motion/React (Framer Motion)**: Menggerakkan setiap perpindahan sela halaman dan transisi tata letak agar terasa alami.
- **Lucide React**: Paket ikon minimalis yang tajam dan seragam di semua komponen.
- **Recharts**: Menggambar bagan data pasar uang secara dinamis dan adaptif.

---

## 🛠️ Langkah Menjalankan Aplikasi Secara Lokal

### prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di komputer Anda (versi 18 ke atas sangat disarankan).

### 1. Instalasi Dependensi
Jalankan perintah berikut di terminal Anda untuk mengunduh semua pustaka yang digunakan:
```bash
npm install
```

### 2. Jalankan Mode Pengembangan
Mulai server lokal untuk melihat tampilan aplikasi dengan fitur Live Reload:
```bash
npm run dev
```
Setelah berjalan, buka tautan `http://localhost:3000` di peramban (browser) favorit Anda.

### 3. Kompilasi untuk Produksi
Gunakan perintah ini untuk memaketkan aplikasi Anda dalam versi terkompresi yang siap diluncurkan ke server hosting:
```bash
npm run build
```

---

## 📂 Struktur Folder Proyek

```text
├── assets/                  # Media visual dan aset logo
├── src/
│   ├── components/          # Komponen UI spesifik (ExchangeRates, IHSGChart, dll.)
│   ├── data.ts              # Data simulasi berita SP PLN Kalbar
│   ├── App.tsx              # Halaman beranda utama dan navigasi
│   ├── index.css            # Pengaturan global CSS dan integrasi Google Fonts
│   └── main.tsx             # Titik entri utama React
├── metadata.json            # Berisi konfigurasi dan perizinan sistem AI Studio
├── package.json             # Pustaka proyek dan daftar skrip eksekusi
└── vite.config.ts           # Konfigurasi bundler Vite
```

---

Dibuat dengan penuh dedikasi untuk menyajikan informasi internal dan global secara dinamis kepada seluruh anggota Serikat Pekerja PLN Kalimantan Barat. ⚡🙌
