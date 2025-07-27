// netlify/functions/generate-thesis.js

// Menggunakan node-fetch yang sudah ada di package.json Anda
const fetch = require('node-fetch');

exports.handler = async (event) => {
    // 1. Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 2. Ambil API Key dari environment variables di Netlify
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Konfigurasi server error: GEMINI_API_KEY tidak ditemukan.' }),
        };
    }

    try {
        // 3. Ambil data terstruktur yang dikirim dari frontend (app.js)
        const { topic, problem, chapter, details } = JSON.parse(event.body);

        // 4. Bangun prompt (perintah) untuk Gemini berdasarkan bab yang diminta
        let prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia.
        Tugas Anda adalah membuat draf akademis yang sistematis, logis, dan menggunakan bahasa Indonesia yang baik dan benar.

        Konteks Utama:
        - Topik Skripsi: "${topic}"
        - Rumusan Masalah Utama: "${problem}"

        Tugas Spesifik: Buatkan draf untuk ${chapter.toUpperCase()} dengan instruksi berikut:\n\n`;

        // INILAH BAGIAN "OTAK" YANG SEBELUMNYA HILANG
        switch (chapter) {
            case 'bab1':
                prompt += `BAB I - PENDAHULUAN:
                - Buat sub-bab 1.1 Latar Belakang: Jelaskan mengapa topik "${topic}" ini penting untuk diteliti, kaitkan dengan kondisi ideal (das sollen) dan kondisi nyata (das sein). ${details.latarBelakang ? `Gunakan draf awal ini sebagai inspirasi: "${details.latarBelakang}"` : ''}
                - Buat sub-bab 1.2 Rumusan Masalah: Ambil dari rumusan masalah utama yang diberikan.
                - Buat sub-bab 1.3 Tujuan Penelitian: Jabarkan tujuan yang ingin dicapai, harus menjawab rumusan masalah. ${details.tujuanPenelitian ? `Gunakan draf awal ini sebagai inspirasi: "${details.tujuanPenelitian}"` : ''}
                - Buat sub-bab 1.4 Kontribusi Penelitian: Jelaskan kontribusi teoretis dan praktis dari penelitian ini.`;
                break;
            case 'bab2':
                prompt += `BAB II - TINJAUAN PUSTAKA:
                - Buat Tinjauan Umum yang menjelaskan konsep-konsep dasar terkait "${topic}".
                - Buat pembahasan mendalam mengenai teori, asas, dan konsep relevan lainnya. ${details.subtopics ? `Fokus pada sub-topik berikut: ${details.subtopics}.` : ''}`;
                break;
            case 'bab3':
                prompt += `BAB III - METODE PENELITIAN:
                - Jelaskan metode penelitian hukum yang paling sesuai untuk topik "${topic}".
                - Buat sub-bab 3.1 Pendekatan Penelitian (disarankan yuridis normatif jika sesuai, atau jelaskan pilihan lain). ${details.pendekatan ? `Gunakan preferensi ini: "${details.pendekatan}"` : ''}
                - Buat sub-bab 3.2 Jenis Penelitian (misal: deskriptif analitis). ${details.jenis ? `Gunakan preferensi ini: "${details.jenis}"` : ''}
                - Buat sub-bab 3.3 Lokasi Penelitian (jelaskan di mana penelitian dilakukan, bisa berupa studi kepustakaan jika tidak ada lokasi fisik). ${details.lokasi ? `Gunakan preferensi ini: "${details.lokasi}"` : ''}
                - Buat sub-bab 3.4 Metode Pengumpulan Data (studi kepustakaan). ${details.metodePengumpulanData ? `Gunakan preferensi ini: "${details.metodePengumpulanData}"` : ''}
                - Buat sub-bab 3.5 Model Analisis Data (kualitatif). ${details.modelAnalisis ? `Gunakan preferensi ini: "${details.modelAnalisis}"` : ''}`;
                break;
            case 'bab4':
                prompt += `BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
                - Buat struktur pembahasan yang logis untuk menjawab rumusan masalah: "${problem}".
                - Sajikan analisis mendalam yang mengaitkan teori dari Bab II dengan data atau peraturan yang relevan untuk topik "${topic}".
                - Pastikan pembahasan fokus untuk menjawab setiap aspek dari rumusan masalah.`;
                break;
            default:
                throw new Error('Chapter tidak valid');
        }

        // 5. Bungkus prompt ke dalam format JSON yang benar sesuai permintaan Gemini
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        // 6. Kirim request ke Gemini API
        // Menggunakan model gemini-pro yang lebih umum dan stabil
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        const apiResponse = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const responseData = await apiResponse.json();

        // 7. Proses respons dari Gemini
        if (!apiResponse.ok || !responseData.candidates) {
            const errorMessage = responseData.error ? responseData.error.message : 'Gagal berkomunikasi dengan Gemini API.';
            throw new Error(errorMessage);
        }
        
        const generatedText = responseData.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ text: generatedText }),
        };

    } catch (error) {
        console.error('Error di dalam Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};```

Setelah Anda mengganti file `generate-thesis.js` Anda dengan kode di atas, simpan, dan deploy ulang, seluruh aplikasi Anda akan berfungsi. Sekarang "pelayan" (frontend) dan "koki" (backend) sudah berbicara dalam bahasa yang sama.
