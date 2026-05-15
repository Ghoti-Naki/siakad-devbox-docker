// app/src/server.js
require('dotenv').config(); // [cite: 537, 997]
const express = require('express'); // [cite: 538, 998]
const path = require('path'); // [cite: 999]
const morgan = require('morgan'); // 🌟 Peningkatan Profesional: Tambahkan ini

const app = express(); // [cite: 539, 1001]

// Konfigurasi View Engine
app.set('view engine', 'ejs'); // [cite: 540, 1004]
app.set('views', path.join(__dirname, 'views')); // [cite: 541, 1005]

// Middleware Dasar (Bare Minimum)
app.use(express.urlencoded({ extended: true })); // [cite: 542, 1006]
app.use(express.json()); // [cite: 543, 1007]

// 🌟 Peningkatan Profesional (Opsional):
// Gunakan morgan untuk log trafik. Format 'dev' akan memberikan output berwarna di terminal.
app.use(morgan('dev')); 

// Routing
const routes = require('./routes/mahasiswaRoutes'); // [cite: 544, 1000]
app.use('/', routes); // [cite: 545, 1008]

const PORT = process.env.APP_PORT || 3000; // [cite: 546, 1002-1003]
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`); // [cite: 547-550, 1009]
});