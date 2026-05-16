const pool = require('../config/db');
const minioClient = require('../config/minio');
const BUCKET_NAME = process.env.MINIO_BUCKET || 'student-documents';

//1. tampi mhs
exports.index = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mahasiswa ORDER BY created_at DESC');
    res.render('index', { mahasiswaList: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan pada server');
  }
};

// 2. form add mhs
exports.createForm = (req, res) => {
  res.render('create');
};

// 3. Simpan Mahasiswa Baru + Upload File ke MinIO
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
      file_url = `/mahasiswa/file/${nama_file}`;
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

//4. form edit mhs
exports.editForm = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mahasiswa WHERE id = $1', [req.params.id]);
    res.render('edit', { mahasiswa: result.rows[0] });
  } catch (err) {
    res.status(500).send('Data tidak ditemukan');
  }
};

// 5. Update Data Mahasiswa (Mendukung Pembaruan Teks + Berkas MinIO)
exports.update = async (req, res) => {
  const { nim, nama, email, program_studi } = req.body;
  const { id } = req.params;

  try {
    const currentData = await pool.query('SELECT nama_file, file_url FROM mahasiswa WHERE id = $1', [id]);
    let nama_file = currentData.rows[0]?.nama_file;
    let file_url = currentData.rows[0]?.file_url;

    if (req.file) {
      if (nama_file) {
        try {
          await minioClient.removeObject(BUCKET_NAME, nama_file);
          console.log(`✔ Berkas lama ${nama_file} dibersihkan dari MinIO.`);
        } catch (minioErr) {
          console.error('X Gagal menghapus berkas lama di MinIO:', minioErr.message);
        }
      }

      nama_file = Date.now() + '-' + req.file.originalname;
      await minioClient.putObject(
        BUCKET_NAME,
        nama_file,
        req.file.buffer,
        req.file.size,
        { 'Content-Type': req.file.mimetype }
      );
      
      file_url = `/mahasiswa/file/${nama_file}`;
    }

    await pool.query(
      'UPDATE mahasiswa SET nim = $1, nama = $2, email = $3, program_studi = $4, nama_file = $5, file_url = $6 WHERE id = $7',
      [nim, nama, email, program_studi, nama_file, file_url, id]
    );

    res.redirect('/');
  } catch (err) {
    console.error('X Gagal memperbarui data:', err.message);
    res.status(500).send('Gagal mengupdate data dan berkas mahasiswa');
  }
};

//6. delete data mhs + delete file di minio
exports.destroy = async (req, res) => {
  try {
    const student = await pool.query('SELECT nama_file FROM mahasiswa WHERE id = $1', [req.params.id]);
    const fileName = student.rows[0]?.nama_file;

    await pool.query('DELETE FROM mahasiswa WHERE id = $1', [req.params.id]);

    if (fileName) {
      await minioClient.removeObject(BUCKET_NAME, fileName);
      console.log(`✔ File ${fileName} berhasil dihapus dari MinIO`);
    }

    res.redirect('/');
  } catch (err) {
    console.error('X Gagal menghapus:', err.message);
    res.status(500).send('Gagal menghapus data dan file');
  }
};

//minio ke browser
exports.downloadFile = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const stream = await minioClient.getObject(BUCKET_NAME, fileName);
    
    stream.pipe(res);
  } catch (err) {
    console.error('X Gagal mengambil berkas dari MinIO:', err.message);
    res.status(404).send('Berkas tidak ditemukan');
  }
};