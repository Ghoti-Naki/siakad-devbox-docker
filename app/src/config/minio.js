const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'student-documents';

//mastiin bucket
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✔ Bucket '${BUCKET_NAME}' berhasil dibuat.`);
    } else {
      console.log(`✔ Bucket '${BUCKET_NAME}' sudah tersedia.`);
    }
  } catch (err) {
    console.error('X Gagal setup MinIO bucket:', err.message);
  }
}

ensureBucket();

module.exports = minioClient;