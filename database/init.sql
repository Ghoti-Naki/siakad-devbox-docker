-- database/init.sql

CREATE TABLE IF NOT EXISTS mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(30) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    program_studi VARCHAR(100),
    nama_file VARCHAR(255),
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
