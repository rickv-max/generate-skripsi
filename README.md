Aplikasi Pembuat Draf Skripsi Hukum Otomatis
Aplikasi web sederhana ini membantu mahasiswa hukum membuat draf skripsi secara otomatis berdasarkan struktur yang telah ditentukan, menggunakan kekuatan Gemini API. Ini dirancang untuk mempercepat tahap awal penulisan skripsi dengan menghasilkan konten yang sistematis, logis, dan akademis.
Fitur
 * Generasi Bab Otomatis: Menghasilkan draf untuk BAB I (Pendahuluan), BAB II (Tinjauan Pustaka), BAB III (Metode Penelitian), dan BAB IV (Hasil Penelitian dan Pembahasan).
 * Input Kustom: Pengguna dapat memasukkan topik skripsi dan sub-bab tambahan untuk Bab II.
 * Struktur Akademis: Mengikuti format skripsi hukum Indonesia yang umum, termasuk sub-bab seperti Latar Belakang, Rumusan Masalah, Tujuan, Kontribusi, Orisinalitas, Tinjauan Umum, Pendekatan Penelitian, dll.
 * Integrasi Gemini API: Memanfaatkan model bahasa Gemini untuk menghasilkan teks yang relevan dan koheren.
 * Keamanan API Key: Menggunakan Netlify Functions untuk menjaga kunci API Gemini tetap aman di sisi server, tidak terekspos ke sisi klien.
Struktur Proyek
thesis-generator-app/
├── public/                 # File-file yang akan di-serve ke browser (frontend)
│   ├── index.html          # Halaman utama aplikasi
│   ├── css/
│   │   └── style.css       # Styling CSS kustom dan integrasi Tailwind CSS
│   └── js/
│       └── main.js         # Logika JavaScript untuk interaksi UI dan panggilan API
├── netlify/                # Direktori untuk Netlify Functions
│   └── functions/
│       └── generate-thesis.js # Fungsi serverless untuk memanggil Gemini API
├── .env.example            # Contoh file untuk variabel lingkungan
├── netlify.toml            # Konfigurasi deployment Netlify
└── README.md               # Dokumentasi proyek ini

Persyaratan
 * Node.js (untuk menjalankan Netlify Functions secara lokal dan menginstal dependensi)
 * Akun Google Cloud dan akses ke Gemini API (untuk mendapatkan API Key)
 * Akun Netlify (untuk deployment)
Setup Lokal
 * Clone repositori ini:
   git clone https://github.com/your-username/thesis-generator-app.git
cd thesis-generator-app

 * Buat file .env:
   Buat file bernama .env di direktori root proyek Anda (thesis-generator-app/). Isi file ini dengan kunci API Gemini Anda:
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   (Ganti AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX dengan kunci API Gemini Anda yang sebenarnya.)
 * Instal Netlify CLI dan dependensi:
   npm install -g netlify-cli
cd netlify/functions
npm install node-fetch # Diperlukan oleh fungsi generate-thesis.js
cd ../.. # Kembali ke root proyek

 * Jalankan server pengembangan Netlify:
   netlify dev

   Aplikasi akan tersedia di http://localhost:8888 (atau port lain yang ditunjukkan oleh Netlify CLI).
Deployment ke Netlify
 * Pastikan repositori Anda di GitHub/GitLab/Bitbucket:
   Push kode ini ke repositori Git Anda.
 * Buat Situs Baru di Netlify:
   * Masuk ke dasbor Netlify Anda.
   * Klik "Add new site" -> "Import an existing project".
   * Pilih penyedia Git Anda (GitHub, dll.) dan repositori proyek ini.
 * Konfigurasi Build Settings:
   * Base directory: Biarkan kosong (atau / jika Anda menempatkan semua file langsung di root).
   * Build command: echo "No build command needed for static site + functions" (atau npm install jika Anda memiliki dependensi frontend)
   * Publish directory: public
   * Functions directory: netlify/functions
 * Tambahkan Environment Variable:
   * Setelah situs Anda dibuat, pergi ke Site settings -> Build & deploy -> Environment variables.
   * Klik "Add a variable".
   * Key: GEMINI_API_KEY
   * Value: Kunci API Gemini Anda yang sebenarnya.
   * Pastikan ini adalah kunci API yang sama dengan yang Anda gunakan di .env lokal.
 * Deploy Situs:
   Netlify akan secara otomatis mendeploy situs Anda setiap kali Anda melakukan push ke branch yang terhubung.
Penggunaan
 * Buka aplikasi di browser Anda.
 * Masukkan "Topik Skripsi Hukum" yang ingin Anda buat drafnya.
 * (Opsional) Masukkan sub-bab tambahan untuk Bab II, dipisahkan dengan koma.
 * Klik tombol "Buat Draf Skripsi".
 * Tunggu beberapa saat hingga Gemini API menghasilkan konten.
 * Draf skripsi akan muncul di area output. Anda dapat menyalinnya untuk diedit lebih lanjut.
Penting!
 * Draf Awal: Konten yang dihasilkan oleh AI adalah draf awal. Sangat penting untuk melakukan verifikasi, penyuntingan, dan penambahan secara manual dengan referensi hukum yang valid dan analisis Anda sendiri. AI tidak menggantikan penelitian mendalam dan pemahaman hukum.
 * Orisinalitas Penelitian: Bagian ini akan berisi placeholder. Anda harus menggantinya dengan penelitian terdahulu yang relevan dan analisis perbandingan yang akurat.
 * Batasan Kata: Meskipun ada instruksi panjang kata dalam prompt, AI mungkin tidak selalu mencapai target persis. Lakukan penambahan manual jika diperlukan.
# Tambahkan baris ini di akhir file README.md
Pembaruan terakhir untuk memaksa pembersihan cache.
