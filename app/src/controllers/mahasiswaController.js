const pool = require('../config/db');
const minioClient = require('../config/minio');
const BUCKET_NAME = process.env.MINIO_BUCKET || 'student-documents';

//part 5
//1. tampilkan mhs
exports.index = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mahasiswa ORDER BY created_at DESC');
    res.render('index', { mahasiswaList: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan pada server');
  }
};

//2. tambah mhs
exports.createForm = (req, res) => {
  res.render('create');
};

//3. save mhs + filter file
exports.store = async (req, res) => {
  const { nim, nama, email, program_studi } = req.body;
  let nama_file = null;
  let file_url = null;

  try {
    if (req.file) {
      nama_file = Date.now() + '-' + req.file.originalname;
      await minioClient.putObject(
        BUCKET_NAME,
        nama_file,
        req.file.buffer,
        req.file.size,
        { 'Content-Type': req.file.mimetype }
      );
      file_url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${nama_file}`;
    }

    await pool.query(
      'INSERT INTO mahasiswa (nim, nama, email, program_studi, nama_file, file_url) VALUES ($1, $2, $3, $4, $5, $6)',
      [nim, nama, email, program_studi, nama_file, file_url]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menyimpan data');
  }
};

//4. edit mhs
exports.editForm = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mahasiswa WHERE id = $1', [req.params.id]);
    res.render('edit', { mahasiswa: result.rows[0] });
  } catch (err) {
    res.status(500).send('Data tidak ditemukan');
  }
};

//5. update mhs
exports.update = async (req, res) => {
  const { nim, nama, email, program_studi } = req.body;
  try {
    await pool.query(
      'UPDATE mahasiswa SET nim = $1, nama = $2, email = $3, program_studi = $4 WHERE id = $5',
      [nim, nama, email, program_studi, req.params.id]
    );
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Gagal update data');
  }
};

//6. delete mhs
exports.destroy = async (req, res) => {
  try {
    await pool.query('DELETE FROM mahasiswa WHERE id = $1', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Gagal menghapus data');
  }
};

exports.destroy = async (req, res) => {
  try {
    const student = await pool.query('SELECT nama_file FROM mahasiswa WHERE id = $1', [req.params.id]);
    const fileName = student.rows[0]?.nama_file;

    await pool.query('DELETE FROM mahasiswa WHERE id = $1', [req.params.id]);

    if (fileName) {
      await minioClient.removeObject(BUCKET_NAME, fileName);
      console.log(`✔ File ${fileName} dihapus dari MinIO`);
    }

    res.redirect('/');
  } catch (err) {
    console.error('X Gagal menghapus:', err.message);
    res.status(500).send('Gagal menghapus data dan file');
  }
};
