const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/mahasiswaController');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya diperbolehkan mengunggah PDF atau Gambar!'), false);
  }
};

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 🌟 
  fileFilter: fileFilter
});

router.get('/', controller.index);
router.get('/mahasiswa/create', controller.createForm);
router.post('/mahasiswa', upload.single('dokumen'), controller.store);
router.get('/mahasiswa/:id/edit', controller.editForm);
router.post('/mahasiswa/:id/update', controller.update);
router.post('/mahasiswa/:id/delete', controller.destroy);

module.exports = router;