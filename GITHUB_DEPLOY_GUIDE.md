# Panduan Penyebaran (Deployment) ke GitHub Pages 🚀

Panduan ini menjelaskan langkah demi langkah untuk mengunggah dan mempublikasikan aplikasi **Berita SP PLN Kalbar** ke GitHub Pages menggunakan **Vite** dan **GitHub Actions** yang telah dikonfigurasi.

---

## 🛠️ Persiapan dan Konfigurasi yang Telah Diterapkan
1. **Relative Base Path (`./`)**: Berada di file `vite.config.ts`. Ini memastikan semua file aset (JS, CSS, Gambar) dapat dimuat dengan benar dari subdirectory repositori GitHub Pages Anda (`https://nama-user.github.io/nama-repo/`).
2. **GitHub Actions Workflow File**: Berupa file `.github/workflows/deploy.yml` yang akan mengotomatiskan pembangunan aplikasi (*building*) dan mengunggahnya ke branch `gh-pages` secara otomatis ketika Anda melakukan *push* kode ke branch `main` atau `master`.

---

## 🧹 Cara Reset Git & Bersihkan Semua Cache (Mulai Dari Awal)
Jika Anda ingin memulai proses deployment benar-benar dari awal dan memastikan tidak ada cache lama yang bermasalah atau file-file sampah yang ikut terunggah, jalankan langkah-langkah pembersihan ini terlebih dahulu di komputer Anda:

```bash
# 1. Bersihkan build folder dan cache lokal npm/Vite Anda
npm run clean

# 2. Hapus tracking Git lama jika Anda ingin mereset riwayat Git sepenuhnya
# (HATI-HATI: Ini menghapus sejarah commit lokal Anda untuk memulai baru)
rm -rf .git

# 3. Hapus cache Git penjejakan file (file tracking cache)
# Berguna jika ada file .env atau folder rahasia yang sebelumnya terlanjur di-track Git
git rm -r --cached . 2>/dev/null || true
```

Setelah menjalankan pembersihan di atas, Anda siap mengikuti langkah-langkah di bawah untuk mempublikasikan proyek baru Anda secara online!

---

## 📋 Langkah-Langkah Manual Mengunggah ke GitHub

Ada dua metode yang bisa Anda gunakan: **Metode A (Otomatis dengan GitHub Actions - Direkomendasikan)** atau **Metode B (Unggah Folder `dist` secara Manual)**.

### 🌟 Metode A: Otomatis Menggunakan GitHub Actions (Sangat Direkomendasikan)
Gunakan metode ini agar setiap kali Anda melakukan `git push`, situs web Anda diperbarui secara otomatis.

#### Langkah 1: Buat Repositori Baru di GitHub
1. Buka [GitHub](https://github.com) dan masuk ke akun Anda.
2. Klik tombol **New** untuk membuat repositori baru.
3. Beri nama repositori (contoh: `berita-sp-pln-kalbar`).
4. Atur visibilitas menjadi **Public**.
5. Jangan centang "Add a README", "Add .gitignore", atau "Choose a license" karena proyek Anda sudah memiliki file tersebut.
6. Klik **Create repository**.

#### Langkah 2: Hubungkan Kode Anda dan Push ke GitHub
Buka terminal pada direktori proyek Anda, lalu jalankan perintah berikut secara berurutan:

```bash
# Inisialisasi git local (jika belum)
git init

# Tambahkan semua file
git add .

# Buat commit pertama
git commit -m "Inisialisasi aplikasi pembaca berita Berita SP PLN Kalbar"

# Atur branch utama menjadi main
git branch -M main

# Hubungkan repositori lokal ke repositori GitHub baru Anda
# Gantilah USERNAME dan REPO dengan informasi Anda sendiri
git remote add origin https://github.com/USERNAME/REPO.git

# Push kode ke GitHub
git push -u origin main
```

#### Langkah 3: Berikan Hak Akses Tulis (Write) pada GitHub Actions
Secara default, GitHub Actions membutuhkan izin tambahan untuk dapat membuat branch `gh-pages` baru.
1. Di halaman repositori GitHub Anda, klik tab ⚙️ **Settings**.
2. Pada menu bilah samping kiri, pilih **Actions** -> **General**.
3. Gulir ke bawah hingga bagian **Workflow permissions**.
4. Pilih opsi **Read and write permissions**.
5. Klik **Save**.

#### Langkah 4: Proses Pembangunan Otomatis (GitHub Actions)
1. Setelah Anda mengaktifkan perizinan di atas dan melakukan *push* kode, klik tab **Actions** di repositori GitHub Anda.
2. Anda akan melihat workflow bernama **Deploy to GitHub Pages** berjalan otomatis.
3. Tunggu hingga proses selesai dengan ikon centang hijau. Proses ini akan otomatis membuat sebuah cabang/branch baru bernama `gh-pages` yang berisi file aplikasi siap saji (*production build*).

#### Langkah 5: Aktifkan Layanan GitHub Pages
1. Klik tab ⚙️ **Settings** di repositori GitHub Anda.
2. Pada menu bilah samping kiri, klik **Pages**.
3. Di dalam bagian **Build and deployment**:
   - Di kolom **Source**, biarkan tetap terpilih **Deploy from a branch**.
   - Di kolom **Branch**: ubah pilihan dari (`None`) menjadi **`gh-pages`** dan foldernya biarkan tetap **`/ (root)`**.
4. Klik **Save**.

---

### 📦 Metode B: Unggah Folder `dist` secara Manual (Static HTML Build)
Gunakan metode ini jika Anda lebih suka mem-build aplikasi secara lokal di komputer Anda sendiri terlebih dahulu, lalu mengunggahnya secara manual ke Github tanpa GitHub Actions.

#### Langkah 1: Build Aplikasi di Komputer Lokal Anda
1. Jalankan perintah instalasi dependency:
   ```bash
   npm install
   ```
2. Build aplikasi Anda:
   ```bash
   npm run build
   ```
3. Perintah ini akan menghasilkan sebuah folder baru bernama **`dist`** di proyek Anda. Folder `dist` inilah yang berisi file-file statis (HTML, JS, CSS, gambar) yang fungsional dan siap dihosting.

#### Langkah 2: Publikasikan Folder `dist` ke GitHub Pages
Ada beberapa cara mudah untuk mengunggah isi folder `dist` ini:

**Opsi 1: Drag and Drop langsung via web browser**
1. Buat repositori baru di GitHub dengan nama sesuai keinginan Anda.
2. Di halaman repositori baru yang masih kosong, klik tautan **"uploading an existing file"** di bagian bawah.
3. Buka folder **`dist`** di komputer Anda, lalu pilih **semua file dan folder yang ada di dalam `dist`** (bukan folder `dist`-nya sendiri, melainkan file-file di dalamnya seperti `index.html`, folder `assets/`, dll).
4. Tarik (*drag and drop*) file-file tersebut ke halaman upload GitHub.
5. Klik **Commit changes**.
6. Masuk ke **Settings** -> **Pages** di repositori tersebut.
7. Di bagian **Branch**, pilih **`main`** (atau branch utama Anda) dan `/ (root)`, lalu klik **Save**.

**Opsi 2: Menggunakan Branch `gh-pages` dari Terminal Lokal**
Anda dapat menggunakan pintasan bantuan seperti paket `gh-pages` untuk push folder `dist` Anda secara instan:
1. Jalankan perintah deployment manual di terminal lokal Anda:
   ```bash
   npx gh-pages -d dist
   ```
2. Perintah ini akan mem-push isi folder `dist` Anda langsung ke branch `gh-pages` di GitHub secara instan!
3. Masuk ke **Settings** -> **Pages** dan aktifkan layanan dari branch `gh-pages`.

---

## 🎉 Selesai!
Tunggu sekitar 1–2 menit, lalu segarkan (*refresh*) halaman **Pages** tadi. Anda akan mendapatkan tautan URL langsung ke aplikasi online Anda di bagian atas halaman, misalnya:
👉 `https://USERNAME.github.io/REPO/`

---

## 💡 Tips Pemeliharaan Selanjutnya
Setiap kali Anda mengubah kode aplikasi dan ingin memperbarui website yang sudah online, cukup lakukan perintah berikut di terminal lokal Anda:
```bash
git add .
git commit -m "update: fitur atau berita baru"
git push origin main
```
GitHub Actions akan otomatis mendeteksi perubahan Anda, membangun kembali aplikasi, dan memperbarui website Anda dalam hitungan detik!
