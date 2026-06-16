# Berita SP PLN Kalimantan Barat 📰⚡

Aplikasi portal berita premium dan informasi terkini Serikat Pekerja PLN Kalimantan Barat (SP PLN KALBAR) dengan tampilan visual yang elegan, modern, dan interaktif. Dibangun dengan memadukan estetika korporat merah PLN, tipografi kontras tinggi yang nyaman untuk membaca, serta animasi transisi yang mulus.

---

## 🎨 Fitur Utama

- **Estetika Merah PLN Premium & Glassmorphism**: Dilengkapi panel kaca transparan yang melayang anggun di atas logo latar belakang SP PLN Kalimantan Barat, menciptakan kedalaman visual (depth of field) serta sirkulasi *negative space* yang optimal untuk kenyamanan membaca.
- **Transisi Layout Dinamis (Framer Motion)**: Memanfaatkan kekuatan `motion/react` untuk menggerakkan pembukaan kartu artikel utama dan sub-artikel secara mulus ke penayangan layar penuh tanpa penundaan (seamless layout animations).
- **Tipografi Editorial Berkelas**: Menggunakan perpaduan font serif klasik untuk artikel demi kenyamanan mata pelanggan, berdampingan dengan penunjuk waktu dinamis hari ini dalam format lokal Indonesia.
- **Kategori Berita Dinamis**: Memandu navigasi pembaca melalui pengelompokan yang beragam seperti Teknologi, Perjalanan, Gaya Hidup, Otomotif, serta Seni & Budaya.
- **Penanganan Kesalahan Kokoh**: Mengintegrasikan `ErrorBoundary` khusus untuk menjamin keandalan pemuatan aplikasi di browser dengan fungsionalitas pembersihan cache otomatis saat terjadi kendala.

---

## 🚀 Teknologi Utama

- **Vite & React 19**: Landasan kompilasi secepat kilat untuk menyajikan Single Page Application (SPA).
- **Tailwind CSS v4 / PostCSS**: Keleluasaan penuh dalam menyusun visual responsif dan dekorasi gradasi warna yang presisi.
- **Motion/React**: Menghadirkan ketangkasan animasi mikro yang natural di setiap interaksi.
- **Lucide React**: Rangkaian komponen ikon yang minimalis, tajam, dan konsisten di seluruh antarmuka pengguna.

---

## 📂 Struktur Folder Aktual

```text
├── assets/                  # Aset statis aplikasi
├── src/
│   ├── components/
│   │   └── ErrorBoundary.tsx # Pelindung aplikasi dari kegagalan crash di sisi klien
│   ├── data.ts              # Dataset artikel portal berita
│   ├── App.tsx              # Komponen utama visual portal berita dan overlay rincian
│   ├── index.css            # Pengaturan global gaya Tailwind CSS & Google Fonts
│   └── main.tsx             # Titik entri inisiasi React & ErrorBoundary
├── index.html               # Entri berkas dokumen web HTML eksternal
├── package.json             # Pengelolaan dependensi dan definisi skrip npm
├── tsconfig.json            # Konfigurasi pembatasan tipe ketat TypeScript
└── vite.config.ts           # Konfigurasi bundler proyek Vite (HMR disabled di AI Studio)
```

---

## 🛠️ Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
Instal lingkungan run-time [Node.js](https://nodejs.org/) versi v18 atau ke atas pada komputer desktop Anda.

### 1. Instalasi Dependensi
Jalankan perintah berikut pada terminal di folder proyek untuk mengunduh modul-modul yang dibutuhkan:
```bash
npm install
```

### 2. Jalankan Mode Pengembangan (Development)
Aktifkan server uji coba lokal dengan perintah:
```bash
npm run dev
```
Setelah aktif, silakan akses tautan `http://localhost:3000` melalui peramban web pilihan Anda.

### 3. Kompilasi untuk Produksi
Gunakan skrip build untuk menghasilkan berkas statis terkompresi yang siap dideploy ke server publik:
```bash
npm run build
```

---

Didesain secara khusus untuk menyajikan arus informasi Serikat Pekerja PLN Kalimantan Barat secara dinamis, modern, dan berkelas. ⚡🙌
