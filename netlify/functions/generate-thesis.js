// netlify/functions/generate-thesis.js (VERSI FINAL DENGAN PROMPT YANG DISEMPURNAKAN)

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
    const { topic, problem, chapter, details } = JSON.parse(event.body);

    if (!topic || !problem || !chapter) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Data tidak lengkap. Topik, rumusan masalah, dan bab dibutuhkan.' }),
      };
    }

    // =====================================================================
    // INI ADALAH BAGIAN YANG KITA SEMPURNAKAN
    // =====================================================================
    let prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia dengan standar kualitas tertinggi.
Tugas Anda adalah membuat draf akademis yang **sangat detail, komprehensif, mendalam, dan panjang**. Setiap sub-bab harus diuraikan setidaknya dalam **tiga paragraf yang kaya isi**, dengan analisis dan elaborasi yang jelas. Gunakan bahasa Indonesia akademik yang formal, logis, dan sistematis.

Konteks Utama:
- Topik Skripsi: "${topic}"
- Rumusan Masalah Utama: "${problem}"

Tugas Spesifik: Buatkan **draf yang sangat lengkap dan mendalam** untuk **BAB ${chapter.replace('bab','')}** dari skripsi hukum, dengan instruksi spesifik berikut:\n\n`;

    switch (chapter) {
        case 'bab1':
            prompt += `Struktur BAB I - PENDAHULUAN:
            - Buat sub-bab 1.1 Latar Belakang: Uraikan secara mendalam dalam minimal tiga paragraf. Mulai dengan gambaran umum, kemudian jelaskan kesenjangan antara kondisi ideal (das sollen) berdasarkan peraturan perundang-undangan dengan kondisi nyata (das sein) di masyarakat. Akhiri dengan menyoroti urgensi penelitian ini. ${details.latarBelakang ? `Gunakan draf awal ini sebagai inspirasi utama: "${details.latarBelakang}"` : ''}
            - Buat sub-bab 1.2 Rumusan Masalah: Sajikan kembali rumusan masalah utama dalam format yang jelas, biasanya dalam bentuk pertanyaan.
            - Buat sub-bab 1.3 Tujuan Penelitian: Jabarkan tujuan penelitian secara spesifik (tujuan umum dan tujuan khusus) yang secara langsung menjawab setiap pertanyaan dalam rumusan masalah. Uraikan dalam beberapa poin. ${details.tujuanPenelitian ? `Gunakan draf awal ini sebagai inspirasi utama: "${details.tujuanPenelitian}"` : ''}
            - Buat sub-bab 1.4 Kontribusi Penelitian: Jelaskan kontribusi teoretis (untuk pengembangan ilmu hukum) dan kontribusi praktis (untuk praktisi hukum, pemerintah, atau masyarakat) secara terpisah dan detail.`;
            break;
        case 'bab2':
            prompt += `Struktur BAB II - TINJAUAN PUSTAKA:
            - Buat Tinjauan Umum yang komprehensif tentang konsep-konsep dasar yang melandasi topik "${topic}". Jelaskan setiap konsep kunci dalam paragraf-paragraf yang mendalam.
            - Bahas secara mendalam (minimal tiga paragraf per teori) mengenai landasan teori, asas-asas hukum, dan doktrin-doktrin yang relevan. ${details.subtopics ? `Berikan fokus analisis khusus pada sub-topik berikut: ${details.subtopics}.` : ''}
            - Jelaskan kerangka hukum (peraturan perundang-undangan) yang terkait dengan topik, dari level tertinggi (UUD) hingga peraturan teknis jika ada.`;
            break;
        case 'bab3':
            prompt += `Struktur BAB III - METODE PENELITIAN:
            - Berikan pengantar singkat tentang tujuan dari bab metodologi penelitian.
            - Buat sub-bab 3.1 Pendekatan Penelitian: Jelaskan secara mendalam (minimal tiga paragraf) pendekatan penelitian yang dipilih. ${details.pendekatan ? `Fokus pada pendekatan: "${details.pendekatan}"` : 'Sarankan pendekatan yang paling cocok (misal: yuridis normatif atau yuridis empiris) dan jelaskan mengapa pendekatan tersebut adalah yang paling tepat.'}
            - Buat sub-bab 3.2 Jenis Penelitian: Uraikan jenis penelitian yang digunakan (misal: deskriptif analitis) dan jelaskan relevansinya dengan tujuan penelitian.
            - Buat sub-bab 3.3 Lokasi Penelitian: Jelaskan secara detail lokasi penelitian. ${details.lokasi ? `Gunakan preferensi pengguna ini: "${details.lokasi}"` : 'Jika tidak ada lokasi fisik, jelaskan secara detail bahwa penelitian ini adalah studi kepustakaan dan jelaskan ruang lingkupnya.'}
            - Buat sub-bab 3.4 Metode Pengumpulan Data: Uraikan teknik pengumpulan data yang digunakan (misal: studi dokumen, wawancara). Jelaskan secara rinci bagaimana setiap teknik akan dilaksanakan.
            - Buat sub-bab 3.5 Model Analisis Data: Jelaskan secara komprehensif (minimal tiga paragraf) bagaimana data yang terkumpul akan dianalisis. ${details.modelAnalisis ? `Gunakan preferensi pengguna ini: "${details.modelAnalisis}"` : 'Jelaskan metode analisis data kualitatif secara detail, termasuk langkah-langkah seperti reduksi data, penyajian data, dan penarikan kesimpulan.'}`;
            break;
        case 'bab4':
            prompt += `Struktur BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
            - Buat struktur pembahasan yang sistematis dan logis, di mana setiap sub-bab secara langsung menjawab satu aspek dari rumusan masalah: "${problem}".
            - Untuk setiap sub-bab, sajikan analisis yang **sangat mendalam, kritis, dan komprehensif**. Jangan hanya mendeskripsikan, tetapi juga menganalisis, membandingkan, dan menginterpretasikan data dengan menggunakan kerangka teori dan hukum dari Bab II.
            - Pastikan setiap sub-bab diuraikan dalam **minimal tiga paragraf yang kaya dan substantif**.`;
            break;
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

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
