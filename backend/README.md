# Backend REST API + SQLite (Termux Android)
### Aplikasi Berita SP PLN UID Kalimantan Barat

Backend ini dirancang khusus untuk berjalan di lingkungan **Termux (Android)** menggunakan Node.js, Express, dan basis data SQLite relasional, dilengkapi dengan **sistem autentikasi administrator tunggal berbasis token sesi aman**.

---

## 🔒 Sistem Keamanan & Autentikasi Admin

1. **Satu Akun Administrator**: Tidak ada fitur registrasi publik atau akun tambahan.
2. **Kredensial Server-Side**: Username dan password hash dikelola melalui file `.env` di Termux, bukan di kode frontend.
3. **Password Hashing Kuat**: Menggunakan algoritma **PBKDF2-SHA512** dengan salt dan 100.000 iterasi.
4. **Token-Based Session**: Sesi admin menggunakan token acak 256-bit berdurasi 24 jam.
5. **Proteksi Mutasi**: Seluruh operasi penambahan, perubahan, dan penghapusan data (`POST`, `PUT`, `DELETE`) mewajibkan header HTTP:
   `Authorization: Bearer <token>`
6. **Akses Publik**: Seluruh pengunjung publik tetap dapat membaca seluruh berita dan foto kegiatan tanpa perlu login (`GET /api/articles`, `GET /api/photos`).

---

## 📋 Konfigurasi Lingkungan (`.env`)

Salin file `.env.example` menjadi `.env` di direktori `backend/`:
```bash
cp .env.example .env
```

Contoh konfigurasi:
```env
PORT=3000
DB_PATH=./database.sqlite

# Kredensial Administrator Tunggal
ADMIN_USERNAME=admin
ADMIN_PASSWORD=spplnkalbar2026
ADMIN_PASSWORD_SALT=sp_pln_uid_kalbar_salt_2026
SESSION_SECRET=sp_pln_uid_kalbar_session_secret_key_2026
```

---

## 📡 Daftar REST API Endpoints

### 1. Autentikasi Administrator
| Method | Endpoint | Keterangan | Header Wajib |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login admin (mengirim `{ username, password }`) | `-` |
| `POST` | `/api/auth/logout` | Logout dan membatalkan token sesi | `Authorization: Bearer <token>` |
| `GET` | `/api/auth/me` | Memeriksa validitas sesi aktif | `Authorization: Bearer <token>` |

#### Contoh Respon Login Berhasil:
```json
{
  "success": true,
  "token": "4f8a9b2c...",
  "user": {
    "username": "admin"
  },
  "message": "Login administrator berhasil"
}
```

#### Contoh Respon Login Gagal:
```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

---

### 2. Artikel Berita
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/articles` | **Publik** | Seluruh artikel berita terbaru |
| `GET` | `/api/articles?type=pln` | **Publik** | Khusus Berita SP PLN Kalbar |
| `GET` | `/api/articles?type=nasional` | **Publik** | Khusus Berita Nasional |
| `GET` | `/api/articles/:id` | **Publik** | Detail satu artikel |
| `POST` | `/api/articles` | **Admin Only** | Menambah artikel baru |
| `PUT` | `/api/articles/:id` | **Admin Only** | Memperbarui artikel |
| `DELETE` | `/api/articles/:id` | **Admin Only** | Menghapus artikel |

---

### 3. Galeri Foto Kegiatan
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/photos` | **Publik** | Seluruh galeri foto kegiatan |
| `GET` | `/api/photos/:id` | **Publik** | Detail satu foto kegiatan |
| `POST` | `/api/photos` | **Admin Only** | Menambah foto kegiatan baru |
| `PUT` | `/api/photos/:id` | **Admin Only** | Memperbarui foto kegiatan |
| `DELETE` | `/api/photos/:id` | **Admin Only** | Menghapus foto kegiatan |

---

## 📋 Struktur Tabel SQLite

### 1. Tabel `articles`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | ID unik artikel |
| `title` | TEXT NOT NULL | Judul berita |
| `excerpt` | TEXT | Ringkasan / Lead berita |
| `content` | TEXT NOT NULL | Isi berita lengkap |
| `author` | TEXT | Penulis / Redaksi |
| `date` | TEXT | Tanggal terbit format Indonesia |
| `category` | TEXT | Kategori (SP PLN / Nasional) |
| `imageUrl` | TEXT | Link gambar (JPG/PNG/Drive) |
| `readTime` | TEXT | Estimasi waktu baca |
| `type` | TEXT NOT NULL DEFAULT 'pln' | `pln` atau `nasional` |

### 2. Tabel `photos`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | ID unik foto kegiatan |
| `title` | TEXT NOT NULL | Judul kegiatan |
| `description` | TEXT | Keterangan dokumentasi |
| `date` | TEXT | Tanggal pelaksanaan kegiatan |
| `imageUrl` | TEXT | Link foto resolusi tinggi |
| `location` | TEXT | Lokasi kegiatan (default: Kalbar) |

---

## 🚀 Panduan Menjalankan di Termux Android

### Langkah 1: Persiapan Lingkungan Termux
Buka aplikasi **Termux** di ponsel Android Anda, lalu jalankan:
```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
```

### Langkah 2: Masuk ke Direktori Backend & Pasang Dependensi
```bash
cd backend
npm install
```

### Langkah 3: Menjalankan Server
```bash
node server.js
```
Server akan aktif di port `3000` (atau port yang disetel melalui variabel lingkungan `PORT`).
