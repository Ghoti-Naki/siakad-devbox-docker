// app/src/config/minio.js
const Minio = require('minio');

// 1. Inisialisasi Client dengan fallback port 9000
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT, // Saat di Docker: 'minio'
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'student-documents';

// 2. Fungsi otomatisasi bucket (Peningkatan Profesional)
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket '${BUCKET_NAME}' berhasil dibuat.`);
    } else {
      console.log(`✅ Bucket '${BUCKET_NAME}' sudah tersedia.`);
    }
  } catch (err) {
    console.error('❌ Gagal setup MinIO bucket:', err.message);
  }
}

// Jalankan fungsi saat aplikasi start
ensureBucket();

// 3. Ekspor client agar bisa dipakai di Controller
module.exports = minioClient;