const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect((err) => {
  if (err) {
    console.error('X Gagal koneksi ke PostgreSQL:', err.message);
  } else {
    console.log('✔ Berhasil terhubung ke PostgreSQL');
  }
});

module.exports = pool;


//add on
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});