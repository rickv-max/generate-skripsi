// netlify/functions/generate-thesis.js (VERSI FINAL DENGAN LOGIKA SWITCH...CASE LENGKAP)

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY tidak ditemukan.' }),
    };
  }

  try {
    // Mengambil payload LENGKAP dari frontend, termasuk 'details'
    const { topic, problem, chapter, details } = JSON.parse(event.body);

    if (!topic || !problem || !chapter) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Data tidak lengkap. Topik, rumusan masalah, dan bab dibutuhkan.' }),
      };
    }

    // =====================================================================
    // INI ADALAH "OTAK" YANG HILANG DARI KODE ANDA SEBELUMNYA
    // =====================================================================
    let prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia.
Tugas Anda adalah membuat draf akademis secara **lengkap, utuh, tidak diringkas**, dan sesuai struktur formal skripsi hukum di Indonesia.
Gunakan bahasa akademik yang logis, sistematis, dan formal.

Konteks Utama:
- Topik Skripsi: "${topic}"
- Rumusan Masalah Utama: "${problem}"

Tugas Spesifik: Buatkan **draf lengkap** untuk **BAB ${chapter.replace('bab','')}** dari skripsi hukum, dengan instruksi spesifik berikut:\n\n`;

    // Logika SWITCH...CASE untuk membangun prompt yang spesifik
    switch (chapter) {
        case 'bab1':
            prompt += `Struktur BAB I - PENDAHULUAN:
            - Buat sub-bab 1.1 Latar Belakang yang detail. ${details.latarBelakang ? `Gunakan draf awal ini sebagai inspirasi utama: "${details.latarBelakang}"` : ''}
            - Buat sub-bab 1.2 Rumusan Masalah.
            - Buat sub-bab 1.3 Tujuan Penelitian yang relevan. ${details.tujuanPenelitian ? `Gunakan draf awal ini sebagai inspirasi utama: "${details.tujuanPenelitian}"` : ''}
            - Buat sub-bab 1.4 Kontribusi Penelitian.`;
            break;
        case 'bab2':
            prompt += `Struktur BAB II - TINJAUAN PUSTAKA:
            - Buat Tinjauan Umum yang menjelaskan konsep dasar terkait "${topic}".
            - Bahas secara mendalam teori, asas, dan konsep relevan lainnya. ${details.subtopics ? `Berikan fokus khusus pada sub-topik berikut: ${details.subtopics}.` : ''}`;
            break;
        case 'bab3':
            prompt += `Struktur BAB III - METODE PENELITIAN:
            - Jelaskan metode penelitian hukum yang paling sesuai.
            - Buat sub-bab 3.1 Pendekatan Penelitian. ${details.pendekatan ? `Gunakan preferensi pengguna ini: "${details.pendekatan}"` : 'Sarankan pendekatan yang paling cocok (misal: yuridis normatif).'}
            - Buat sub-bab 3.2 Jenis Penelitian. ${details.jenis ? `Gunakan preferensi pengguna ini: "${details.jenis}"` : 'Sarankan jenis penelitian (misal: deskriptif analitis).'}
            - Buat sub-bab 3.3 Lokasi Penelitian. ${details.lokasi ? `Gunakan preferensi pengguna ini: "${details.lokasi}"` : 'Sebutkan bahwa penelitian ini adalah studi kepustakaan jika tidak ada lokasi spesifik.'}
            - Buat sub-bab 3.4 Metode Pengumpulan Data. ${details.metodePengumpulanData ? `Gunakan preferensi pengguna ini: "${details.metodePengumpulanData}"` : 'Jelaskan metode studi dokumen/kepustakaan.'}
            - Buat sub-bab 3.5 Model Analisis Data. ${details.modelAnalisis ? `Gunakan preferensi pengguna ini: "${details.modelAnalisis}"` : 'Jelaskan metode analisis data kualitatif.'}`;
            break;
        case 'bab4':
            prompt += `Struktur BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
            - Buat struktur pembahasan yang logis untuk menjawab secara tuntas rumusan masalah: "${problem}".
            - Sajikan analisis yang mendalam dan kritis.`;
            break;
        default:
            throw new Error('Chapter tidak valid');
    }

    const requestBody = {
      contents: [ { parts: [{ text: prompt }] } ],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: { "temperature": 0.8, "topP": 0.95, "maxOutputTokens": 8192 }
    };

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const apiResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await apiResponse.json();

    if ( responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content?.parts ) {
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return { statusCode: 200, body: JSON.stringify({ text: generatedText }) };
    } else {
      const reason = responseData.promptFeedback?.blockReason || responseData.candidates?.[0]?.finishReason || 'Unknown reason';
      throw new Error(`Gemini tidak menghasilkan konten. Alasan: ${reason}`);
    }
  } catch (error) {
    console.error('Terjadi error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
