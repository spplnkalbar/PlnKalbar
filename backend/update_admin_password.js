/**
 * Script Pembaruan Password Administrator SQLite
 * Menggunakan PBKDF2 (SHA-512, 100.000 iterasi, salt unik 16-byte)
 * Sumber kebenaran tunggal: tabel admin_users di berita.db
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashWithPbkdf2(plainText, salt) {
  return crypto.pbkdf2Sync(plainText, salt, 100000, 64, 'sha512').toString('hex');
}

function hashPassword(plainText, salt) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = hashWithPbkdf2(plainText, actualSalt);
  return `${actualSalt}:${derivedKey}`;
}

function verifyPassword(plainText, storedHash) {
  if (!plainText || !storedHash || typeof storedHash !== 'string') return false;
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
  return false;
}

async function run() {
  const candidates = [
    path.join(__dirname, 'berita.db'),
    path.join(process.cwd(), 'berita.db'),
    path.join(process.cwd(), 'backend', 'berita.db')
  ];

  let dbPath = candidates.find(p => fs.existsSync(p));
  if (!dbPath) {
    dbPath = path.join(__dirname, 'berita.db');
  }

  console.log('====================================================');
  console.log('[PEMBARUAN PASSWORD ADMINISTRATOR]');
  console.log(`  Target Database : ${dbPath}`);
  console.log('  Tabel           : admin_users');
  console.log('  Target Username : sppln');
  console.log('  Algoritma Hash  : PBKDF2 (SHA-512, 100.000 iterasi)');

  const newPassword = process.env.NEW_ADMIN_PASSWORD || 'SPPLN2026@';
  const newHash = hashPassword(newPassword);
  const now = new Date().toISOString();

  // Coba gunakan sqlite3 jika tersedia, atau fallback ke sql.js
  let updatedSuccessfully = false;

  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    let db;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    }

    const checkUser = db.exec("SELECT id, username, password_hash FROM admin_users WHERE username = 'sppln'");
    if (checkUser.length > 0 && checkUser[0].values.length > 0) {
      db.run("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = 'sppln'", [newHash, now]);
    } else {
      const anyAdmin = db.exec("SELECT id, username FROM admin_users ORDER BY id ASC LIMIT 1");
      if (anyAdmin.length > 0 && anyAdmin[0].values.length > 0) {
        const adminId = anyAdmin[0].values[0][0];
        db.run("UPDATE admin_users SET username = 'sppln', password_hash = ?, updated_at = ? WHERE id = ?", [newHash, now, adminId]);
      } else {
        db.run("INSERT INTO admin_users (id, username, password_hash, created_at, updated_at) VALUES (1, 'sppln', ?, ?, ?)", [newHash, now, now]);
      }
    }

    // Verifikasi Internal
    const verifyRes = db.exec("SELECT id, username, password_hash FROM admin_users WHERE username = 'sppln'");
    const storedRow = verifyRes[0].values[0];
    const storedUsername = storedRow[1];
    const storedHash = storedRow[2];

    const isMatch = verifyPassword(newPassword, storedHash);
    const isWrongMatch = verifyPassword('WrongPassword123!', storedHash);

    const totalAdminRes = db.exec("SELECT COUNT(*) FROM admin_users");
    const totalAdminCount = totalAdminRes[0].values[0][0];

    const exportData = db.export();
    fs.writeFileSync(dbPath, Buffer.from(exportData));

    console.log('----------------------------------------------------');
    console.log(`  Username Terdeteksi : "${storedUsername}"`);
    console.log(`  Password Hash Status: BERHASIL DISIMPAN`);
    console.log(`  Hasil Verifikasi    : ${isMatch ? 'VERIFIKASI BERHASIL (VALID)' : 'VERIFIKASI GAGAL'}`);
    console.log(`  Uji Password Salah  : ${!isWrongMatch ? 'DITOLAK DENGAN BENAR' : 'GAGAL'}`);
    console.log(`  Jumlah Akun Admin   : ${totalAdminCount} akun`);
    console.log('====================================================');

    updatedSuccessfully = isMatch;
  } catch (err) {
    console.error('❌ Gagal memperbarui password admin:', err.message);
  }

  if (updatedSuccessfully) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run();
