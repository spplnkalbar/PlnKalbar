const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Resolusi path database SQLite existing:
// 1. Jika ada variabel lingkungan DB_PATH, gunakan nilai tersebut.
// 2. Jika ada file berita.db di direktori backend atau direktori kerja, gunakan berita.db.
// 3. Jika ada file database.sqlite di direktori backend atau direktori kerja, gunakan database.sqlite.
// 4. Default utama adalah berita.db (jangan membuat database kedua jika berita.db digunakan).
function resolveDatabasePath() {
  if (process.env.DB_PATH) {
    return path.isAbsolute(process.env.DB_PATH)
      ? process.env.DB_PATH
      : path.resolve(process.cwd(), process.env.DB_PATH);
  }

  const candidates = [
    path.join(__dirname, 'berita.db'),
    path.join(process.cwd(), 'berita.db'),
    path.join(__dirname, 'database.sqlite'),
    path.join(process.cwd(), 'database.sqlite'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(__dirname, 'berita.db');
}

const DB_PATH = resolveDatabasePath();

// Muat konfigurasi dari file .env jika tersedia di folder backend
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (key && process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    });
  }
} catch (e) {
  // Abaikan error pembacaan .env
}

// ==========================================
// 1. AUDIT LOGGING KEAMANAN (SERVER-SIDE ONLY)
// ==========================================
function auditLog(action, details = {}) {
  const timestamp = new Date().toISOString();
  // Sanitasi detail untuk memastikan tidak ada password atau token yang tercatat
  const sanitized = { ...details };
  delete sanitized.password;
  delete sanitized.currentPassword;
  delete sanitized.newPassword;
  delete sanitized.token;
  delete sanitized.passwordHash;
  delete sanitized.password_hash;

  console.log(`[AUDIT-LOG ${timestamp}] Action: ${action} | Details: ${JSON.stringify(sanitized)}`);
}

// ==========================================
// 2. KONFIGURASI AUTENTIKASI ADMINISTRATOR TUNGGAL
// ==========================================
// Catatan: Akun administrator yang tersimpan di tabel admin_users SQLite
// adalah SATU-SATUNYA SUMBER KEBENARAN. Server TIDAK menggunakan hardcoded username/password.
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || 'sp_pln_uid_kalbar_salt_2026';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam

// Deteksi format hash password di SQLite (tanpa membocorkan isi hash)
function detectHashFormat(storedHash) {
  if (!storedHash || typeof storedHash !== 'string') {
    return { type: 'invalid', description: 'Kosong atau bukan string' };
  }
  // Format 1: salt:derivedKey (PBKDF2-SHA512 dengan salt acak unik per password)
  if (storedHash.includes(':')) {
    const parts = storedHash.split(':');
    if (parts.length === 2 && /^[a-f0-9]{128}$/i.test(parts[1])) {
      return { 
        type: 'pbkdf2_salted', 
        description: `PBKDF2-SHA512 (salt unik ${parts[0].length} karakter, 100.000 iterasi, key 128 hex)` 
      };
    }
  }
  // Format 2: raw 128 hex chars (PBKDF2-SHA512 dengan ADMIN_PASSWORD_SALT)
  if (/^[a-f0-9]{128}$/i.test(storedHash)) {
    return { 
      type: 'pbkdf2_raw128', 
      description: 'PBKDF2-SHA512 (raw 128 hex characters, 100.000 iterasi)' 
    };
  }
  // Format 3: scrypt legacy
  if (storedHash.startsWith('$scrypt$')) {
    return { 
      type: 'scrypt', 
      description: 'scrypt format ($scrypt$...)' 
    };
  }
  // Format 4: bcrypt
  if (/^\$2[aby]?\$\d{2}\$/.test(storedHash)) {
    return { 
      type: 'bcrypt', 
      description: 'bcrypt format' 
    };
  }
  // Format 5: SHA-256 raw 64 hex
  if (/^[a-f0-9]{64}$/i.test(storedHash)) {
    return { 
      type: 'sha256', 
      description: 'SHA-256 raw (64 hex characters)' 
    };
  }
  return { 
    type: 'unknown', 
    description: `Format tidak dikenal (${storedHash.length} karakter)` 
  };
}

// Fungsi utilitas hash password menggunakan PBKDF2 (SHA-512 dengan 100.000 iterasi)
function hashWithPbkdf2(plainText, salt) {
  return crypto.pbkdf2Sync(plainText, salt, 100000, 64, 'sha512').toString('hex');
}

function hashPassword(plainText, salt) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = hashWithPbkdf2(plainText, actualSalt);
  return `${actualSalt}:${derivedKey}`;
}

// Verifikasi password murni menggunakan PBKDF2-SHA512 (100.000 iterasi)
function verifyPassword(plainText, storedHash) {
  if (!plainText || !storedHash || typeof storedHash !== 'string') return false;

  // Format 1: salt:derivedKey (PBKDF2 dengan salt acak unik per password)
  if (storedHash.includes(':')) {
    const parts = storedHash.split(':');
    if (parts.length === 2) {
      const [salt, expectedHash] = parts;
      if (!salt || !expectedHash) return false;
      const computedHash = hashWithPbkdf2(plainText, salt);
      try {
        const bufA = Buffer.from(computedHash, 'hex');
        const bufB = Buffer.from(expectedHash, 'hex');
        if (bufA.length !== bufB.length) return false;
        return crypto.timingSafeEqual(bufA, bufB);
      } catch {
        return false;
      }
    }
  }

  // Format 2: raw 128 hex chars (PBKDF2 dengan ADMIN_PASSWORD_SALT)
  if (/^[a-f0-9]{128}$/i.test(storedHash)) {
    const computedHash = hashWithPbkdf2(plainText, ADMIN_PASSWORD_SALT);
    try {
      const bufA = Buffer.from(computedHash, 'hex');
      const bufB = Buffer.from(storedHash, 'hex');
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  // Format lain (misalnya scrypt legacy) tidak valid
  return false;
}

// Validasi kekuatan password (minimal 10 karakter, huruf besar, huruf kecil, angka, karakter khusus)
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') return false;
  const isMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return isMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

// In-memory token storage untuk sesi aktif
const activeSessions = new Map(); // token => { userId, username, expiresAt }

// Rate Limiter khusus untuk mencegah brute-force login
const loginAttemptsMap = new Map(); // ip => { count, resetTime }

function loginRateLimiter(req, res, next) {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit
  const maxAttempts = 5; // maksimal 5 percobaan gagal per 15 menit

  const record = loginAttemptsMap.get(clientIp) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  if (record.count >= maxAttempts) {
    const remainingSec = Math.ceil((record.resetTime - now) / 1000);
    auditLog('LOGIN_RATE_LIMITED', { ip: clientIp, remainingSec });
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${remainingSec} detik.`,
    });
  }

  req.clientIp = clientIp;
  req.loginRecord = record;
  next();
}

function registerFailedLogin(clientIp) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const record = loginAttemptsMap.get(clientIp) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  record.count += 1;
  loginAttemptsMap.set(clientIp, record);
}

function resetFailedLogin(clientIp) {
  loginAttemptsMap.delete(clientIp);
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
  if (!token || token.length < 32) {
    return res.status(401).json({
      success: false,
      message: 'Sesi administrator tidak valid.',
    });
  }

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
  req.adminToken = token;
  next();
}

// ==========================================
// 3. CORS & SECURITY HEADERS MIDDLEWARE
// ==========================================
const allowedOrigins = [
  'https://spplnkalbar.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_ORIGIN) {
  const extraOrigins = process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim().replace(/\/+$/, ''));
  allowedOrigins.push(...extraOrigins);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    
    const isAllowed = allowedOrigins.some(allowed => {
      const cleanAllowed = allowed.trim().replace(/\/+$/, '');
      return cleanAllowed === cleanOrigin || cleanAllowed === '*';
    }) || (process.env.NODE_ENV !== 'production' && /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/.test(cleanOrigin))
       || (process.env.NODE_ENV !== 'production' && /\.googleusercontent\.com$|\.run\.app$/.test(new URL(origin).hostname));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Akses ditolak oleh kebijakan CORS.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Pragma'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
// Batasi ukuran request JSON ke 1MB untuk mencegah payload flooding
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security Headers Lengkap
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob: 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' https: data:;"
  );
  next();
});

// Konfigurasi direktori upload gambar dengan isolasi nama aman
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Melayani file upload statis dengan proteksi path traversal
app.use('/uploads', express.static(UPLOADS_DIR, {
  dotfiles: 'ignore',
  index: false,
  maxAge: '1d'
}));

// Konfigurasi Multer dengan Memory Storage untuk verifikasi magic bytes & MIME type
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

// Helper validasi ID numeric
function isValidId(id) {
  return /^\d+$/.test(String(id).trim());
}

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

    // 4. Tabel Admin Users (Akun administrator tersimpan di SQLite sebagai satu-satunya sumber kebenaran)
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `, () => {
      // Baca akun admin yang SUDAH ADA di SQLite sebagai SATU-SATUNYA SUMBER KEBENARAN
      db.all('SELECT id, username, password_hash, created_at, updated_at FROM admin_users ORDER BY id ASC', (err, rows) => {
        if (err) {
          console.error('❌ [DATABASE] Gagal membaca tabel admin_users di SQLite:', err.message);
          return;
        }

        console.log('====================================================');
        console.log('[STATUS SISTEM AUTENTIKASI ADMIN]');
        console.log(`  Database File : ${DB_PATH}`);
        console.log('  Tabel Admin   : admin_users');

        if (rows && rows.length > 0) {
          const admin = rows[0];
          const hashInfo = detectHashFormat(admin.password_hash);

          console.log(`  Admin User ID : ${admin.id}`);
          console.log(`  Username      : "${admin.username}"`);
          console.log(`  Format Hash   : ${hashInfo.description}`);

          if (hashInfo.type !== 'pbkdf2_salted' && hashInfo.type !== 'pbkdf2_raw128') {
            console.warn(`  ⚠️ PERINGATAN: Format password_hash di SQLite bukan PBKDF2-SHA512 (${hashInfo.description}).`);
            console.warn('     Server TIDAK mereset password secara otomatis demi menjaga keaslian data.');
            console.warn('     Jika verifikasi gagal, pastikan password_hash di SQLite dikonversi ke format PBKDF2-SHA512.');
          } else {
            console.log('  Status        : Akun admin existing siap digunakan sebagai sumber kebenaran tunggal.');
          }

          if (rows.length > 1) {
            console.warn(`  ⚠️ Catatan: Terdapat ${rows.length} akun pada tabel admin_users. Akun pertama ("${admin.username}") digunakan.`);
          }
          // JANGAN lakukan UPDATE, JANGAN timpa password_hash, JANGAN ganti username!
        } else {
          console.warn(`  ⚠️ Tabel admin_users pada ${DB_PATH} belum memiliki akun administrator.`);
        }
        console.log('====================================================');
      });
    });
  });
}

// ==========================================
// REST API ENDPOINTS: HEALTH CHECK (PUBLIC)
// ==========================================
// Endpoint public murni untuk monitoring tanpa membocorkan internal server
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
  });
});

// ==========================================
// REST API ENDPOINTS: AUTHENTICATION
// ==========================================

// POST /api/auth/login - Autentikasi administrator tunggal dengan brute-force protection
app.post('/api/auth/login', loginRateLimiter, (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.clientIp || req.ip || '127.0.0.1';

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Username dan password wajib diisi.',
    });
  }

  const trimmedUsername = username.trim();

  // Query akun admin LANGSUNG dari tabel admin_users di database SQLite (sebagai satu-satunya sumber kebenaran)
  db.get(
    'SELECT id, username, password_hash FROM admin_users WHERE username = ? OR username = ? COLLATE NOCASE ORDER BY id ASC LIMIT 1',
    [trimmedUsername, trimmedUsername],
    (err, adminRow) => {
      if (err) {
        console.error('❌ [AUTH-ERROR] Error query tabel admin_users di SQLite:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan pada database server.',
        });
      }

      // 1. Jika username tidak ditemukan di database SQLite
      if (!adminRow) {
        registerFailedLogin(clientIp);
        auditLog('LOGIN_FAILED', { ip: clientIp, username: trimmedUsername.substring(0, 30), reason: 'Username not found in SQLite' });
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah.',
        });
      }

      const hashInfo = detectHashFormat(adminRow.password_hash);

      // 2. Jika format hash di database SQLite bukan PBKDF2 yang kompatibel (misalnya format scrypt legacy / rusak)
      if (hashInfo.type !== 'pbkdf2_salted' && hashInfo.type !== 'pbkdf2_raw128') {
        registerFailedLogin(clientIp);
        console.error('❌ [AUTH-DIAGNOSIS] Verifikasi login gagal karena format password_hash di SQLite tidak kompatibel:');
        console.error(`   - Database yang digunakan : ${DB_PATH}`);
        console.error('   - Tabel                   : admin_users');
        console.error(`   - Username yang terdeteksi: "${adminRow.username}"`);
        console.error(`   - Format hash terdeteksi  : ${hashInfo.description}`);
        console.error('   - Alasan verifikasi gagal : Format hash tersimpan bukan PBKDF2-SHA512. Server menolak tanpa mereset password secara otomatis.');
        console.error('   - File yang perlu ditinjau: backend/server.js');

        return res.status(401).json({
          success: false,
          message: 'Username atau password salah.',
        });
      }

      // 3. Verifikasi password yang dimasukkan terhadap password_hash di database SQLite menggunakan PBKDF2-SHA512
      const isPasswordMatch = verifyPassword(password, adminRow.password_hash);

      if (!isPasswordMatch) {
        registerFailedLogin(clientIp);
        auditLog('LOGIN_FAILED', { ip: clientIp, username: trimmedUsername.substring(0, 30), reason: 'Password mismatch' });
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah.',
        });
      }

      // Login administrator berhasil
      resetFailedLogin(clientIp);

      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.set(token, {
        userId: adminRow.id,
        username: adminRow.username,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      });

      auditLog('LOGIN_SUCCESS', { ip: clientIp, user: adminRow.username });

      res.json({
        success: true,
        token,
        user: {
          username: adminRow.username,
        },
        message: 'Login administrator berhasil.',
      });
    }
  );
});

// POST /api/auth/logout - Hapus dan cabut sesi token administrator
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = activeSessions.get(token);
    if (session) {
      auditLog('LOGOUT', { user: session.username });
      activeSessions.delete(token);
    }
  }

  res.json({
    success: true,
    message: 'Logout berhasil.',
  });
});

// GET /api/auth/me - Cek status login administrator (Wajib Admin Auth)
app.get('/api/auth/me', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.adminUser.username,
    },
  });
});

// PUT /api/auth/password - Ganti password administrator tunggal (Wajib Admin Auth)
app.put('/api/auth/password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const username = req.adminUser.username;
  const userId = req.adminUser.userId;

  if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password saat ini dan password baru wajib diisi.',
    });
  }

  // 1. Ambil data akun admin langsung dari database SQLite
  db.get(
    'SELECT id, username, password_hash FROM admin_users WHERE id = ? OR username = ? LIMIT 1',
    [userId, username],
    (err, adminRow) => {
      if (err || !adminRow) {
        return res.status(500).json({
          success: false,
          message: 'Gagal memverifikasi akun administrator di SQLite.',
        });
      }

      // Verifikasi password saat ini terhadap hash di SQLite
      const isCurrentMatch = verifyPassword(currentPassword, adminRow.password_hash);

      if (!isCurrentMatch) {
        auditLog('CHANGE_PASSWORD_FAILED', { user: username, reason: 'Wrong current password' });
        return res.status(400).json({
          success: false,
          message: 'Password saat ini salah.',
        });
      }

      // 2. Validasi Kekuatan Password Baru
      if (!validatePasswordStrength(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Password baru belum memenuhi persyaratan keamanan (minimal 10 karakter, harus ada huruf besar, huruf kecil, angka, dan karakter khusus).',
        });
      }

      // 3. Hash Password Baru menggunakan PBKDF2/SHA-512 dengan salt unik acak
      const newPasswordHash = hashPassword(newPassword);

      // 4. Update SQLite database HANYA pada record admin tersebut
      const now = new Date().toISOString();
      db.run(
        'UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?',
        [newPasswordHash, now, adminRow.id],
        (updateErr) => {
          if (updateErr) {
            console.error('❌ Database update error on password:', updateErr.message);
            return res.status(500).json({
              success: false,
              message: 'Gagal menyimpan password baru ke database SQLite.',
            });
          }

          // 5. Invalidate SELURUH sesi aktif lama (keamanan maksimal)
          activeSessions.clear();
          auditLog('PASSWORD_CHANGED', { user: username });

          res.json({
            success: true,
            message: 'Password berhasil diubah. Seluruh sesi lama telah dicabut.',
          });
        }
      );
    }
  );
});

// ==========================================
// REST API ENDPOINTS: ARTICLES
// ==========================================

// GET /api/articles - Ambil artikel (Publik)
app.get('/api/articles', (req, res) => {
  const { type } = req.query;

  let query = 'SELECT * FROM articles';
  const params = [];

  if (type === 'pln' || type === 'nasional') {
    query += ' WHERE type = ?';
    params.push(type);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error on /api/articles:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server.',
      });
    }

    res.json({
      success: true,
      data: rows || []
    });
  });
});

// GET /api/articles/:id - Ambil satu artikel (Publik)
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'ID artikel tidak valid.' });
  }

  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error on /api/articles/:id:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server.',
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
});

// POST /api/articles - Tambah artikel baru (Wajib Admin Auth)
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

  if (!title || typeof title !== 'string' || !title.trim() || !content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Judul dan isi artikel wajib diisi.',
    });
  }

  if (title.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Judul artikel maksimal 500 karakter.',
    });
  }

  const articleType = type === 'nasional' ? 'nasional' : 'pln';
  const finalCategory = (category && typeof category === 'string') 
    ? category.trim().substring(0, 100) 
    : (articleType === 'nasional' ? 'Berita Nasional' : 'SP PLN Kalimantan Barat');
  const finalAuthor = (author && typeof author === 'string') 
    ? author.trim().substring(0, 100) 
    : (articleType === 'nasional' ? 'Redaksi Nasional' : 'Humas SP PLN Kalbar');

  const query = `
    INSERT INTO articles (title, excerpt, content, author, date, category, imageUrl, readTime, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    title.trim(),
    excerpt && typeof excerpt === 'string' ? excerpt.trim().substring(0, 1000) : '',
    content.trim(),
    finalAuthor,
    date && typeof date === 'string' ? date.trim().substring(0, 100) : 'Hari ini',
    finalCategory,
    imageUrl && typeof imageUrl === 'string' ? imageUrl.trim().substring(0, 1000) : '',
    readTime && typeof readTime === 'string' ? readTime.trim().substring(0, 50) : '3 Min Read',
    articleType
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error('Database insert error on /api/articles:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server saat menyimpan artikel.',
      });
    }

    const newId = this.lastID;
    auditLog('ARTICLE_CREATED', { id: newId, title: title.trim().substring(0, 40) });

    db.get('SELECT * FROM articles WHERE id = ?', [newId], (fetchErr, row) => {
      res.status(201).json({
        success: true,
        data: row || { id: newId, title, content, type: articleType },
        message: 'Artikel berhasil ditambahkan.',
      });
    });
  });
});

// PUT /api/articles/:id - Perbarui artikel (Wajib Admin Auth)
app.put('/api/articles/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'ID artikel tidak valid.' });
  }

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
      console.error('Database find error on PUT /api/articles/:id:', err.message);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan.' });
    }

    const updated = {
      title: title !== undefined && typeof title === 'string' ? title.trim().substring(0, 500) : existing.title,
      excerpt: excerpt !== undefined && typeof excerpt === 'string' ? excerpt.trim().substring(0, 1000) : existing.excerpt,
      content: content !== undefined && typeof content === 'string' ? content.trim() : existing.content,
      author: author !== undefined && typeof author === 'string' ? author.trim().substring(0, 100) : existing.author,
      date: date !== undefined && typeof date === 'string' ? date.trim().substring(0, 100) : existing.date,
      category: category !== undefined && typeof category === 'string' ? category.trim().substring(0, 100) : existing.category,
      imageUrl: imageUrl !== undefined && typeof imageUrl === 'string' ? imageUrl.trim().substring(0, 1000) : existing.imageUrl,
      readTime: readTime !== undefined && typeof readTime === 'string' ? readTime.trim().substring(0, 50) : existing.readTime,
      type: type === 'nasional' || type === 'pln' ? type : existing.type
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

    db.run(query, params, function (updateErr) {
      if (updateErr) {
        console.error('Database update error on /api/articles/:id:', updateErr.message);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memperbarui artikel.' });
      }

      auditLog('ARTICLE_UPDATED', { id });

      db.get('SELECT * FROM articles WHERE id = ?', [id], (fetchErr, row) => {
        res.json({
          success: true,
          data: row,
          message: 'Artikel berhasil diperbarui.',
        });
      });
    });
  });
});

// DELETE /api/articles/:id - Hapus artikel (Wajib Admin Auth)
app.delete('/api/articles/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'ID artikel tidak valid.' });
  }

  db.run('DELETE FROM articles WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Database delete error on /api/articles/:id:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server saat menghapus artikel.',
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan.',
      });
    }

    auditLog('ARTICLE_DELETED', { id });

    res.json({
      success: true,
      message: 'Artikel berhasil dihapus.',
    });
  });
});

// ==========================================
// REST API ENDPOINTS: PHOTOS / GALLERY
// ==========================================

// GET /api/photos - Ambil foto kegiatan (Publik)
app.get('/api/photos', (req, res) => {
  db.all('SELECT * FROM photos ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Database error on /api/photos:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server saat mengambil foto.',
      });
    }

    res.json({
      success: true,
      data: rows || []
    });
  });
});

// GET /api/photos/:id - Ambil satu foto (Publik)
app.get('/api/photos/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'ID foto tidak valid.' });
  }

  db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error on /api/photos/:id:', err.message);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Foto tidak ditemukan.' });
    }

    res.json({
      success: true,
      data: row
    });
  });
});

// POST /api/photos - Tambah foto kegiatan (Wajib Admin Auth)
app.post('/api/photos', requireAdminAuth, (req, res) => {
  const { title, description, date, imageUrl, location } = req.body;

  if (!title || typeof title !== 'string' || !title.trim() || !imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Judul dan URL foto wajib diisi.',
    });
  }

  const query = `
    INSERT INTO photos (title, description, date, imageUrl, location)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    title.trim().substring(0, 500),
    description && typeof description === 'string' ? description.trim().substring(0, 1000) : '',
    date && typeof date === 'string' ? date.trim().substring(0, 100) : 'Dokumentasi Terkini',
    imageUrl.trim().substring(0, 1000),
    location && typeof location === 'string' ? location.trim().substring(0, 200) : 'Kalimantan Barat'
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error('Database insert error on /api/photos:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server saat menyimpan foto.',
      });
    }

    const newId = this.lastID;
    auditLog('PHOTO_CREATED', { id: newId, title: title.trim().substring(0, 40) });

    db.get('SELECT * FROM photos WHERE id = ?', [newId], (fetchErr, row) => {
      res.status(201).json({
        success: true,
        data: row || { id: newId, title, imageUrl },
        message: 'Foto kegiatan berhasil ditambahkan.',
      });
    });
  });
});

// PUT /api/photos/:id - Perbarui foto (Wajib Admin Auth)
app.put('/api/photos/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'ID foto tidak valid.' });
  }

  const { title, description, date, imageUrl, location } = req.body;

  db.get('SELECT * FROM photos WHERE id = ?', [id], (err, existing) => {
    if (err) {
      console.error('Database find error on PUT /api/photos/:id:', err.message);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Foto tidak ditemukan.' });
    }

    const updated = {
      title: title !== undefined && typeof title === 'string' ? title.trim().substring(0, 500) : existing.title,
      description: description !== undefined && typeof description === 'string' ? description.trim().substring(0, 1000) : existing.description,
      date: date !== undefined && typeof date === 'string' ? date.trim().substring(0, 100) : existing.date,
      imageUrl: imageUrl !== undefined && typeof imageUrl === 'string' ? imageUrl.trim().substring(0, 1000) : existing.imageUrl,
      location: location !== undefined && typeof location === 'string' ? location.trim().substring(0, 200) : existing.location
    };

    const query = `
      UPDATE photos
      SET title = ?, description = ?, date = ?, imageUrl = ?, location = ?
      WHERE id = ?
    `;

    db.run(query, [updated.title, updated.description, updated.date, updated.imageUrl, updated.location, id], function (updateErr) {
      if (updateErr) {
        console.error('Database update error on /api/photos/:id:', updateErr.message);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memperbarui foto.' });
      }

      auditLog('PHOTO_UPDATED', { id });

      db.get('SELECT * FROM photos WHERE id = ?', [id], (fetchErr, row) => {
        res.json({
          success: true,
          data: row,
          message: 'Foto kegiatan berhasil diperbarui.',
        });
      });
    });
  });
});

// DELETE /api/photos/:id - Hapus foto (Wajib Admin Auth)
app.delete('/api/photos/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'ID foto tidak valid.' });
  }

  db.run('DELETE FROM photos WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Database delete error on /api/photos/:id:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server saat menghapus foto.',
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Foto tidak ditemukan.',
      });
    }

    auditLog('PHOTO_DELETED', { id });

    res.json({
      success: true,
      message: 'Foto berhasil dihapus.',
    });
  });
});

// ==========================================
// REST API ENDPOINTS: UPLOAD (ADMIN ONLY)
// ==========================================
app.post('/api/upload', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ukuran file gambar melebihi batas maksimal 10 MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Gagal memproses file upload.'
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'File gambar wajib disertakan.'
      });
    }

    const fileBuffer = req.file.buffer;
    const fileSize = req.file.size;

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

    const randomName = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${randomName}${fileExt}`;
    const targetPath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFile(targetPath, fileBuffer, (writeErr) => {
      if (writeErr) {
        console.error('File write error on upload:', writeErr.message);
        return res.status(500).json({
          success: false,
          message: 'Gagal menyimpan file gambar ke server.'
        });
      }

      auditLog('IMAGE_UPLOADED', { filename: safeFilename, size: fileSize, mime: detectedType });
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

// ==========================================
// REST API ENDPOINTS: SETTINGS
// ==========================================

// GET /api/settings - Ambil pengaturan publik (Profil & Footer, tanpa membocorkan api_url)
app.get('/api/settings', (req, res) => {
  db.all("SELECT key, value FROM settings WHERE key != 'api_url'", (err, rows) => {
    if (err) {
      console.error('Database error on GET /api/settings:', err.message);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
    const settingsObj = {};
    (rows || []).forEach(r => {
      settingsObj[r.key] = r.value;
    });
    res.json({ success: true, data: settingsObj });
  });
});

// PUT /api/settings - Perbarui pengaturan Profil & Footer (Wajib Admin Auth)
app.put('/api/settings', requireAdminAuth, (req, res) => {
  const newSettings = req.body;
  if (!newSettings || typeof newSettings !== 'object') {
    return res.status(400).json({ success: false, message: 'Data pengaturan tidak valid.' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(newSettings)) {
      if (k !== 'api_url') {
        stmt.run(k, String(v !== undefined && v !== null ? v : ''));
      }
    }
    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Database commit error on /api/settings:', err.message);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memperbarui pengaturan.' });
      }
      auditLog('SETTINGS_UPDATED', { user: req.adminUser?.username || 'admin' });
      res.json({ success: true, message: 'Pengaturan berhasil diperbarui.' });
    });
  });
});

// GET /api/settings/api - Ambil konfigurasi URL API (WAJIB Admin Auth)
app.get('/api/settings/api', requireAdminAuth, (req, res) => {
  db.get("SELECT value FROM settings WHERE key = 'api_url'", (err, row) => {
    if (err) {
      console.error('Database error on GET /api/settings/api:', err.message);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
    res.json({
      success: true,
      data: {
        apiUrl: row ? row.value : null
      }
    });
  });
});

// PUT /api/settings/api - Perbarui konfigurasi URL API (WAJIB Admin Auth)
app.put('/api/settings/api', requireAdminAuth, (req, res) => {
  const { apiUrl } = req.body;
  if (!apiUrl || typeof apiUrl !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'URL API tidak boleh kosong.'
    });
  }

  const trimmed = apiUrl.trim();

  if (trimmed.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'URL maksimal 500 karakter.'
    });
  }

  if (/^(javascript|data|file|ftp|vbscript):/i.test(trimmed)) {
    return res.status(400).json({
      success: false,
      message: 'Protokol URL tidak diizinkan.'
    });
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return res.status(400).json({
      success: false,
      message: 'URL harus dimulai dengan http:// atau https://'
    });
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.status(400).json({
        success: false,
        message: 'Hanya protokol HTTP dan HTTPS yang diizinkan.'
      });
    }

    if (parsed.username || parsed.password) {
      return res.status(400).json({
        success: false,
        message: 'URL tidak boleh menyertakan kredensial (username/password).'
      });
    }

    const cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');

    db.run(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('api_url', ?)",
      [cleanUrl],
      function (err) {
        if (err) {
          console.error('Database error on PUT /api/settings/api:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server saat menyimpan URL API.'
          });
        }
        auditLog('API_URL_UPDATED', { user: req.adminUser?.username || 'admin' });
        res.json({
          success: true,
          data: { apiUrl: cleanUrl },
          message: 'URL API berhasil diperbarui.'
        });
      }
    );
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Format URL API tidak valid.'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 REST API Backend Berita SP PLN Kalbar berjalan di port ${PORT}`);
});
