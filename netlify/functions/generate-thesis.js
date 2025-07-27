// netlify/functions/generate-thesis.js

const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Ambil API Key dari environment variables di Netlify
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Konfigurasi server error: GEMINI_API_KEY tidak ditemukan.' }),
        };
    }

    try {
        // Ambil data terstruktur dari frontend
        const { topic, problem, chapter, details } = JSON.parse(event.body);

        // Pastikan data yang dibutuhkan ada
        if (!topic || !problem || !chapter) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Data tidak lengkap. Topik, rumusan masalah, dan bab dibutuhkan.' }),
            };
        }

        // Bangun prompt (perintah) untuk Gemini berdasarkan bab yang diminta
        let prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia.
Tugas Anda adalah membuat draf akademis secara lengkap, utuh, tidak diringkas, dan sesuai struktur formal skripsi hukum di Indonesia.
Gunakan bahasa akademik yang logis, sistematis, dan formal. Panjang isi tidak dibatasi. Tidak boleh menyingkat, meringkas, atau melewatkan bagian penting.

Berikan hasil seolah-olah ini akan dikumpulkan ke dosen pembimbing skripsi fakultas hukum. Jangan sertakan catatan, disclaimer, atau penjelasan tambahan di luar isi skripsi.

Konteks Utama:
- Topik Skripsi: "${topic}"
- Rumusan Masalah Utama: "${problem}"

Tugas Spesifik: Buatkan draf untuk ${chapter.toUpperCase()} dengan instruksi berikut:\n\n`;

        // Bagian "otak" untuk meracik prompt per bab
        switch (chapter) {
            case 'bab1':
                prompt += `BAB I - PENDAHULUAN:
                - Buat sub-bab 1.1 Latar Belakang: Jelaskan mengapa topik "${topic}" ini penting untuk diteliti. ${details.latarBelakang ? `Gunakan draf awal ini: "${details.latarBelakang}"` : ''}
                - Buat sub-bab 1.2 Rumusan Masalah.
                - Buat sub-bab 1.3 Tujuan Penelitian. ${details.tujuanPenelitian ? `Gunakan draf awal ini: "${details.tujuanPenelitian}"` : ''}
                - Buat sub-bab 1.4 Kontribusi Penelitian.`;
                break;
            case 'bab2':
                prompt += `BAB II - TINJAUAN PUSTAKA:
                - Buat Tinjauan Umum terkait "${topic}".
                - Bahas teori, asas, dan konsep relevan. ${details.subtopics ? `Fokus pada: ${details.subtopics}.` : ''}`;
                break;
            case 'bab3':
                prompt += `BAB III - METODE PENELITIAN:
                - Buat sub-bab 3.1 Pendekatan Penelitian. ${details.pendekatan ? `Gunakan preferensi ini: "${details.pendekatan}"` : ''}
                - Buat sub-bab 3.2 Jenis Penelitian. ${details.jenis ? `Gunakan preferensi ini: "${details.jenis}"` : ''}
                - Buat sub-bab 3.3 Lokasi Penelitian. ${details.lokasi ? `Gunakan preferensi ini: "${details.lokasi}"` : ''}
                - Buat sub-bab 3.4 Metode Pengumpulan Data. ${details.metodePengumpulanData ? `Gunakan preferensi ini: "${details.metodePengumpulanData}"` : ''}
                - Buat sub-bab 3.5 Model Analisis Data. ${details.modelAnalisis ? `Gunakan preferensi ini: "${details.modelAnalisis}"` : ''}`;
                break;
            case 'bab4':
                prompt += `BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
                - Buat struktur pembahasan logis untuk menjawab rumusan masalah: "${problem}".
                - Sajikan analisis mendalam yang mengaitkan teori dari Bab II dengan data/peraturan untuk topik "${topic}".`;
                break;
            default:
                throw new Error('Chapter tidak valid');
        }

        // Bungkus prompt ke dalam format JSON yang benar, termasuk safety settings
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ]
        };

        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const apiResponse = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const responseData = await apiResponse.json();
        
        // Ini akan mencetak seluruh respons dari Gemini ke log Netlify Anda
        console.log('Respons Mentah dari Gemini:', JSON.stringify(responseData, null, 2));

        // Cek jika respons dari Gemini valid
        if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content?.parts) {
            const generatedText = responseData.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                body: JSON.stringify({ text: generatedText }),
            };
        } else {
            // Jika Gemini tidak mengembalikan konten
            const reason = responseData.promptFeedback?.blockReason || responseData.candidates?.[0]?.finishReason || 'Unknown reason';
            console.error(`Gemini tidak menghasilkan konten. Alasan: ${reason}. Respons penuh:`, JSON.stringify(responseData));
            throw new Error(`Gemini tidak menghasilkan konten. Kemungkinan karena filter keamanan. Alasan: ${reason}`);
        }

    } catch (error) {
        console.error('Error fatal di dalam Netlify function:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
