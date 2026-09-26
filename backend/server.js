const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

// ==========================================
// KONFIGURASI AUTENTIKASI ADMINISTRATOR TUNGGAL
// ==========================================
// Kredensial tersimpan aman di sisi server via variabel lingkungan (ENV), bukan di frontend.
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || 'sp_pln_uid_kalbar_salt_2026';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam

// Fungsi utilitas hash password menggunakan PBKDF2 (SHA-512 dengan 100.000 iterasi)
function hashPassword(plainText, salt) {
  return crypto.pbkdf2Sync(plainText, salt, 100000, 64, 'sha512').toString('hex');
}

// Target hash password admin dari env (atau hash default jika env belum disetel)
let targetPasswordHash = process.env.ADMIN_PASSWORD_HASH;
if (!targetPasswordHash) {
  const initialPassword = process.env.ADMIN_PASSWORD || 'spplnkalbar2026';
  targetPasswordHash = hashPassword(initialPassword, ADMIN_PASSWORD_SALT);
}

// In-memory token storage untuk sesi aktif
const activeSessions = new Map(); // token => { username, expiresAt }

// Simple Rate Limiter untuk mencegah brute-force pada endpoint autentikasi
const rateLimitMap = new Map(); // ip:path => { count, resetTime }
function authRateLimiter(req, res, next) {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const key = `${clientIp}:${req.path}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit
  const maxAttempts = 5; // maksimal 5 percobaan per 15 menit

  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count += 1;
  rateLimitMap.set(key, record);

  if (record.count > maxAttempts) {
    const remainingSec = Math.ceil((record.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${remainingSec} detik.`,
    });
  }

  next();
}

// Middleware untuk memverifikasi autentikasi administrator
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Sesi administrator diperlukan.',
    });
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({
      success: false,
      message: 'Sesi administrator telah kedaluwarsa atau tidak valid.',
    });
  }

  // Perpanjang masa aktif sesi
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  req.adminUser = session;
  next();
}

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Header anti-caching ketat untuk proteksi data admin & pencegahan back-button caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Konfigurasi direktori dan static serving untuk upload gambar
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Konfigurasi Multer dengan Memory Storage untuk validasi magic bytes & MIME type
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimal 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.'), false);
    }
    cb(null, true);
  }
});

// Database initialization
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Gagal membuka database SQLite:', err.message);
  } else {
    console.log('✅ Terhubung ke database SQLite di:', DB_PATH);
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // 1. Table Articles
    db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author TEXT,
        date TEXT,
        category TEXT,
        imageUrl TEXT,
        readTime TEXT,
        type TEXT NOT NULL DEFAULT 'pln'
      )
    `);

    // 2. Table Photos
    db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        imageUrl TEXT,
        location TEXT
      )
    `);

    // 3. Table Settings
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `, () => {
      const defaultSettings = {
        profile_title: "Profil Serikat Pekerja",
        profile_subtitle: "SP PLN Unit Induk Distribusi Kalimantan Barat",
        profile_about: "Serikat Pekerja PT PLN (Persero) Unit Induk Distribusi Kalimantan Barat merupakan wadah kebersamaan dan perjuangan karyawan yang berasaskan Pancasila and UUD 1945. Kami berkomitmen mendukung keandalan listrik bagi seluruh rakyat Kalimantan Barat sekaligus memperjuangkan hak-hak normatif dan kesejahteraan bagi seluruh anggota.",
        profile_visi: "Menjaga kesinambungan PT PLN (Persero) agar tetap tumbuh dan berkembang sebagai Pengemban Amanah Konstitusi dibidang Ketenagalistrikan yang terintegrasi dari Pembangkitan, transmisi, distribusi dan penjualan;\nMeningkatkan Kesejahteraan Insan PLN dan mengawal pembinaan Sistim Karir pegawai yang berkeadilan dan berkesinambungan sesuai dengan kompetensinya agar PLN sebagai pengemban Amanah Konstitusi dibidang ketenagalistrikan dikelola dengan baik dan benar sesuai prinsip Good Coorporate Governance (GCG);",
        profile_misi: "",
        profile_nilai: "Melalui semangat kemitraan yang produktif, kami berkomitmen menjaga dedikasi pelayanan tanpa putus, kesetiaan penuh kawan sekerja, serta kepatuhan penuh akan keselamatan kerja demi keberlangsungan pelayanan kelistrikan bagi masyarakat luas.",
        footer_slogan_1: "SP PLN! Yes! Kuat! Bersatu!",
        footer_slogan_2: "PLN! Jaya! Terbaik!",
        footer_slogan_3: "Unbundling! NO!!!",
        footer_slogan_4: "INDONESIA! Bangkit, Berdaulat, Merdeka, Merdeka, Merdeka!!!",
        footer_address: "Jl. Gusti Sulung Lelanang No.14, Benua Melayu Darat, Kec. Pontianak Sel., Kota Pontianak, Kalimantan Barat 78243",
        footer_email: "dpdspplnkalbar@gmail.com",
        footer_phone: "+62 (561) 732-023"
      };

      db.get('SELECT COUNT(*) as count FROM settings', (err, row) => {
        if (!err && row && row.count === 0) {
          const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
          for (const [k, v] of Object.entries(defaultSettings)) {
            stmt.run(k, v);
          }
          stmt.finalize();
        }
      });
    });

    // 4. Table Admin Users (Satu akun administrator tunggal)
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `, () => {
      db.get('SELECT * FROM admin_users WHERE id = 1 OR username = ?', [ADMIN_USERNAME], (err, row) => {
        if (!err && row) {
          // Sync in-memory hash with SQLite database state
          targetPasswordHash = row.password_hash;
        } else if (!err && !row) {
          // Initialize single admin user in SQLite
          const now = new Date().toISOString();
          db.run(
            'INSERT INTO admin_users (id, username, password_hash, created_at, updated_at) VALUES (1, ?, ?, ?, ?)',
            [ADMIN_USERNAME, targetPasswordHash, now, now]
          );
        }
      });
    });
    db.get('SELECT COUNT(*) as count FROM articles', (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('🌱 Menyiapkan data awal artikel SP PLN Kalbar...');
        const stmt = db.prepare(`
          INSERT INTO articles (title, excerpt, content, author, date, category, imageUrl, readTime, type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          "Ruang Dialog Energi Kupas RUPTL 2025–2034 dan Masa Depan Kelistrikan Kalbar",
          "Ketua DPD Serikat Pekerja PLN UID Kalbar, Akhmad Junaidi, menyampaikan pemaparan materi dalam kegiatan Ruang Dialog RUPTL 2025–2034 dan Kemandirian Energi Kalimantan Barat...",
          "Pontianak – Ketua DPD Serikat Pekerja PLN UID Kalimantan Barat, Akhmad Junaidi, menilai Rencana Usaha Penyediaan Tenaga Listrik (RUPTL) 2025–2034 perlu dikaji ulang dan direvisi...",
          "Agustian",
          "Kamis, 25 Juni 2026 • 22.13 WIB",
          "SP PLN Kalimantan Barat",
          "https://lh3.googleusercontent.com/d/1qjeWGoArNqXQprL67_XVXmbXuFx8mBOa=w1600",
          "3 Min Read",
          "pln"
        );

        stmt.run(
          "SP PLN UID Kalbar dan Disnakertrans Kalbar Perkuat Sinergi Ketenagakerjaan",
          "Audiensi bersama Kepala Dinas Tenaga Kerja dan Transmigrasi Provinsi Kalimantan Barat membahas penguatan hubungan industrial...",
          "DPD SP PLN UID Kalimantan Barat mengadakan audiensi dengan Kepala Dinas Tenaga Kerja dan Transmigrasi Provinsi Kalimantan Barat untuk memperkuat sinergi di bidang ketenagakerjaan...",
          "Agustian",
          "Rabu, 3 Juni 2026 • 23.18 WIB",
          "SP PLN Kalimantan Barat",
          "https://lh3.googleusercontent.com/d/1D4PKpdaPJ4m_4xHvhXYwkN-5rj7WNO5W=w1600",
          "2 Min Read",
          "pln"
        );

        stmt.finalize();
      }
    });
  });
}

// ==========================================
// REST API ENDPOINTS: AUTHENTICATION (ADMINISTRATOR)
// ==========================================

// POST /api/auth/login - Autentikasi administrator tunggal
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username dan password wajib diisi',
    });
  }

  const isUsernameMatch = username.trim() === ADMIN_USERNAME;
  const computedHash = hashPassword(password, ADMIN_PASSWORD_SALT);

  let isPasswordMatch = false;
  try {
    isPasswordMatch = crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(targetPasswordHash, 'hex')
    );
  } catch {
    isPasswordMatch = false;
  }

  if (!isUsernameMatch || !isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Username atau password salah',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    username: ADMIN_USERNAME,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });

  res.json({
    success: true,
    token,
    user: {
      username: ADMIN_USERNAME,
    },
    message: 'Login administrator berhasil',
  });
});

// POST /api/auth/logout - Hapus sesi token administrator
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
  }

  res.json({
    success: true,
    message: 'Berhasil logout',
  });
});

// GET /api/auth/me - Cek status login administrator
app.get('/api/auth/me', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.adminUser.username,
    },
  });
});

// PUT /api/auth/password - Ganti password administrator tunggal
app.put('/api/auth/password', requireAdminAuth, authRateLimiter, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password saat ini dan password baru wajib diisi',
    });
  }

  // 1. Verifikasi Password Saat Ini
  const computedCurrentHash = hashPassword(currentPassword, ADMIN_PASSWORD_SALT);
  let isCurrentMatch = false;
  try {
    isCurrentMatch = crypto.timingSafeEqual(
      Buffer.from(computedCurrentHash, 'hex'),
      Buffer.from(targetPasswordHash, 'hex')
    );
  } catch {
    isCurrentMatch = false;
  }

  if (!isCurrentMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password saat ini salah.',
    });
  }

  // 2. Validasi Kekuatan Password Baru di Backend
  const isMinLength = newPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  if (!isMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return res.status(400).json({
      success: false,
      message: 'Password baru belum memenuhi persyaratan keamanan.',
    });
  }

  // 3. Hash Password Baru menggunakan PBKDF2/SHA-512
  const newPasswordHash = hashPassword(newPassword, ADMIN_PASSWORD_SALT);
  targetPasswordHash = newPasswordHash;

  // 4. Update SQLite database (Tabel admin_users)
  const now = new Date().toISOString();
  db.run(
    'UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = 1 OR username = ?',
    [newPasswordHash, now, ADMIN_USERNAME],
    (err) => {
      if (err) {
        console.error('❌ Gagal memperbarui password_hash di database SQLite:', err.message);
      } else {
        console.log('✅ Password_hash admin berhasil diperbarui di SQLite.');
      }
    }
  );

  // 5. Revoke / Invalidate seluruh sesi aktif (Sesi lama hangus, admin wajib login ulang)
  activeSessions.clear();

  res.json({
    success: true,
    message: 'Password berhasil diubah.',
  });
});

// ==========================================
// REST API ENDPOINTS: ARTICLES
// ==========================================

// GET /api/articles - Ambil seluruh artikel (dengan filter opsional ?type=pln atau ?type=nasional)
app.get('/api/articles', (req, res) => {
  const { type } = req.query;

  let query = 'SELECT * FROM articles';
  const params = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  // Urutkan ID terbesar (terbaru) di posisi paling atas
  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data artikel: ' + err.message
      });
    }

    res.json({
      success: true,
      data: rows || []
    });
  });
});

// GET /api/articles/:id - Ambil satu artikel berdasarkan ID
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan database: ' + err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Artikel dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
});

// POST /api/articles - Tambah artikel baru (Protected Admin)
app.post('/api/articles', requireAdminAuth, (req, res) => {
  const {
    title,
    excerpt,
    content,
    author,
    date,
    category,
    imageUrl,
    readTime,
    type
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Field title dan content wajib diisi'
    });
  }

  const articleType = type === 'nasional' ? 'nasional' : 'pln';
  const finalCategory = category || (articleType === 'nasional' ? 'Berita Nasional' : 'SP PLN Kalimantan Barat');
  const finalAuthor = author || (articleType === 'nasional' ? 'Redaksi Nasional' : 'Humas SP PLN Kalbar');

  const query = `
    INSERT INTO articles (title, excerpt, content, author, date, category, imageUrl, readTime, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    title.trim(),
    excerpt ? excerpt.trim() : '',
    content.trim(),
    finalAuthor.trim(),
    date ? date.trim() : 'Hari ini',
    finalCategory.trim(),
    imageUrl ? imageUrl.trim() : '',
    readTime ? readTime.trim() : '3 Min Read',
    articleType
  ];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan artikel: ' + err.message
      });
    }

    const newId = this.lastID;
    db.get('SELECT * FROM articles WHERE id = ?', [newId], (err, row) => {
      if (err) {
        return res.status(201).json({
          success: true,
          data: { id: newId, ...req.body, type: articleType },
          message: 'Artikel berhasil disimpan'
        });
      }

      res.status(201).json({
        success: true,
        data: row,
        message: 'Artikel berhasil ditambahkan'
      });
    });
  });
});

// PUT /api/articles/:id - Perbarui artikel yang ada (Protected Admin)
app.put('/api/articles/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const {
    title,
    excerpt,
    content,
    author,
    date,
    category,
    imageUrl,
    readTime,
    type
  } = req.body;

  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, existing) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }

    const updated = {
      title: title !== undefined ? title : existing.title,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      content: content !== undefined ? content : existing.content,
      author: author !== undefined ? author : existing.author,
      date: date !== undefined ? date : existing.date,
      category: category !== undefined ? category : existing.category,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      readTime: readTime !== undefined ? readTime : existing.readTime,
      type: type !== undefined ? type : existing.type
    };

    const query = `
      UPDATE articles
      SET title = ?, excerpt = ?, content = ?, author = ?, date = ?, category = ?, imageUrl = ?, readTime = ?, type = ?
      WHERE id = ?
    `;

    const params = [
      updated.title,
      updated.excerpt,
      updated.content,
      updated.author,
      updated.date,
      updated.category,
      updated.imageUrl,
      updated.readTime,
      updated.type,
      id
    ];

    db.run(query, params, function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Gagal memperbarui artikel: ' + err.message });
      }

      db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
        res.json({
          success: true,
          data: row,
          message: 'Artikel berhasil diperbarui'
        });
      });
    });
  });
});

// DELETE /api/articles/:id - Hapus artikel (Protected Admin)
app.delete('/api/articles/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM articles WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus artikel: ' + err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: `Artikel dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      message: 'Artikel berhasil dihapus'
    });
  });
});

// ==========================================
// REST API ENDPOINTS: PHOTOS / GALLERY
// ==========================================

// GET /api/photos - Ambil seluruh foto kegiatan
app.get('/api/photos', (req, res) => {
  db.all('SELECT * FROM photos ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data foto: ' + err.message
      });
    }

    res.json({
      success: true,
      data: rows || []
    });
  });
});

// GET /api/photos/:id - Ambil satu foto berdasarkan ID
app.get('/api/photos/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });
    }

    res.json({
      success: true,
      data: row
    });
  });
});

// POST /api/photos - Tambah foto kegiatan baru (Protected Admin)
app.post('/api/photos', requireAdminAuth, (req, res) => {
  const { title, description, date, imageUrl, location } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'Field title dan imageUrl wajib diisi'
    });
  }

  const query = `
    INSERT INTO photos (title, description, date, imageUrl, location)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    title.trim(),
    description ? description.trim() : '',
    date ? date.trim() : 'Dokumentasi Terkini',
    imageUrl.trim(),
    location ? location.trim() : 'Kalimantan Barat'
  ];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan foto: ' + err.message
      });
    }

    const newId = this.lastID;
    db.get('SELECT * FROM photos WHERE id = ?', [newId], (err, row) => {
      res.status(201).json({
        success: true,
        data: row || { id: newId, ...req.body },
        message: 'Foto kegiatan berhasil ditambahkan'
      });
    });
  });
});

// PUT /api/photos/:id - Perbarui foto (Protected Admin)
app.put('/api/photos/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { title, description, date, imageUrl, location } = req.body;

  db.get('SELECT * FROM photos WHERE id = ?', [id], (err, existing) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!existing) return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });

    const updated = {
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      date: date !== undefined ? date : existing.date,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      location: location !== undefined ? location : existing.location
    };

    const query = `
      UPDATE photos
      SET title = ?, description = ?, date = ?, imageUrl = ?, location = ?
      WHERE id = ?
    `;

    db.run(query, [updated.title, updated.description, updated.date, updated.imageUrl, updated.location, id], function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });

      db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row) => {
        res.json({
          success: true,
          data: row,
          message: 'Foto kegiatan berhasil diperbarui'
        });
      });
    });
  });
});

// DELETE /api/photos/:id - Hapus foto kegiatan (Protected Admin)
app.delete('/api/photos/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM photos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus foto: ' + err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: `Foto dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      message: 'Foto berhasil dihapus'
    });
  });
});

// ==========================================
// REST API ENDPOINTS: SECURE IMAGE UPLOAD
// ==========================================
app.post('/api/upload', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ukuran gambar maksimal 10 MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file gambar yang diunggah.'
      });
    }

    const fileBuffer = req.file.buffer;
    const fileSize = fileBuffer.length;

    // 1. Validasi ukuran maksimal 10 MB
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Ukuran gambar maksimal 10 MB.'
      });
    }

    // 2. Validasi Magic Bytes / Signature file secara ketat
    // - JPEG: FF D8 FF
    // - PNG: 89 50 4E 47 0D 0A 1A 0A
    // - WebP: RIFF (52 49 46 46) di awal dan WEBP (57 45 42 50) di offset 8
    let detectedType = null;
    let fileExt = '';

    if (fileBuffer.length >= 3 && fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF) {
      detectedType = 'image/jpeg';
      fileExt = '.jpg';
    } else if (
      fileBuffer.length >= 8 &&
      fileBuffer[0] === 0x89 &&
      fileBuffer[1] === 0x50 &&
      fileBuffer[2] === 0x4E &&
      fileBuffer[3] === 0x47 &&
      fileBuffer[4] === 0x0D &&
      fileBuffer[5] === 0x0A &&
      fileBuffer[6] === 0x1A &&
      fileBuffer[7] === 0x0A
    ) {
      detectedType = 'image/png';
      fileExt = '.png';
    } else if (
      fileBuffer.length >= 12 &&
      fileBuffer[0] === 0x52 &&
      fileBuffer[1] === 0x49 &&
      fileBuffer[2] === 0x46 &&
      fileBuffer[3] === 0x46 &&
      fileBuffer[8] === 0x57 &&
      fileBuffer[9] === 0x45 &&
      fileBuffer[10] === 0x42 &&
      fileBuffer[11] === 0x50
    ) {
      detectedType = 'image/webp';
      fileExt = '.webp';
    }

    if (!detectedType || !['image/jpeg', 'image/png', 'image/webp'].includes(detectedType)) {
      return res.status(400).json({
        success: false,
        message: 'Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.'
      });
    }

    // 3. Generate nama file aman sendiri oleh server (tidak menggunakan filename asli pengguna)
    const randomName = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${randomName}${fileExt}`;
    const targetPath = path.join(UPLOADS_DIR, safeFilename);

    // 4. Simpan file ke server
    fs.writeFile(targetPath, fileBuffer, (writeErr) => {
      if (writeErr) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menyimpan file gambar ke server.'
        });
      }

      const fileUrl = `/uploads/${safeFilename}`;

      res.json({
        success: true,
        data: {
          url: fileUrl,
          filename: safeFilename,
          mimetype: detectedType,
          size: fileSize
        },
        message: 'Upload gambar berhasil dan lolos validasi.'
      });
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'sqlite',
    time: new Date().toISOString()
  });
});

// Get settings endpoint
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    const settingsObj = {};
    rows.forEach(r => {
      settingsObj[r.key] = r.value;
    });
    res.json({ success: true, data: settingsObj });
  });
});

// Update settings endpoint (Admin only)
app.put('/api/settings', requireAdminAuth, (req, res) => {
  const newSettings = req.body;
  if (!newSettings || typeof newSettings !== 'object') {
    return res.status(400).json({ success: false, message: 'Data pengaturan tidak valid.' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(newSettings)) {
      stmt.run(k, String(v !== undefined && v !== null ? v : ''));
    }
    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: 'Pengaturan berhasil diperbarui.' });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 REST API Backend Berita SP PLN Kalbar berjalan di http://0.0.0.0:${PORT}`);
  console.log(`📡 Endpoint Artikel: http://localhost:${PORT}/api/articles`);
  console.log(`📡 Endpoint Galeri: http://localhost:${PORT}/api/photos`);
  console.log(`🔐 Endpoint Autentikasi: http://localhost:${PORT}/api/auth/login`);
});
