// netlify/functions/generate-thesis.js (VERSI FINAL DENGAN PROMPT YANG LEBIH AMAN)

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
    // PROMPT YANG DILUNAKKAN UNTUK MENGHINDARI FILTER KEBIJAKAN
    // =====================================================================
    let prompt = `Sebagai asisten penulisan akademis, tugas Anda adalah membantu menyusun draf untuk sebuah karya tulis ilmiah di bidang hukum.
Hasil tulisan harus objektif, netral, dan fokus pada analisis teoretis. Gunakan bahasa Indonesia yang formal dan terstruktur.
Tujuan utamanya adalah menghasilkan draf yang komprehensif dan mendalam, di mana setiap sub-bab diuraikan dalam beberapa paragraf yang kaya analisis.

Informasi dasar untuk draf ini adalah sebagai berikut:
- Topik Penelitian: "${topic}"
- Rumusan Masalah: "${problem}"

Instruksi Spesifik:
Berdasarkan informasi di atas, tolong buatkan draf untuk BAB ${chapter.replace('bab','')} dengan struktur berikut:\n\n`;

    // Logika SWITCH...CASE yang lebih "aman"
    switch (chapter) {
        case 'bab1':
            prompt += `Struktur BAB I - PENDAHULUAN:
            - Sub-bab Latar Belakang: Uraikan secara komprehensif mengapa topik ini relevan untuk diteliti dari sudut pandang akademis. ${details.latarBelakang ? `Gunakan poin ini sebagai inspirasi: "${details.latarBelakang}"` : ''}
            - Sub-bab Rumusan Masalah: Sajikan kembali rumusan masalah yang diberikan.
            - Sub-bab Tujuan Penelitian: Jabarkan tujuan yang ingin dicapai dari penelitian ini. ${details.tujuanPenelitian ? `Gunakan poin ini sebagai inspirasi: "${details.tujuanPenelitian}"` : ''}
            - Sub-bab Kontribusi Penelitian: Jelaskan potensi kontribusi teoretis dan praktis dari penelitian ini.`;
            break;
        case 'bab2':
            prompt += `Struktur BAB II - TINJAUAN PUSTAKA:
            - Sajikan Tinjauan Umum yang menjelaskan konsep-konsep kunci terkait topik.
            - Uraikan landasan teori, asas-asas hukum, dan peraturan terkait yang relevan. ${details.subtopics ? `Fokuskan pembahasan pada: ${details.subtopics}.` : ''}`;
            break;
        case 'bab3':
            prompt += `Struktur BAB III - METODE PENELITIAN:
            - Jelaskan secara rinci setiap komponen metodologi penelitian yang sesuai.
            - Komponen harus mencakup: Pendekatan Penelitian, Jenis Penelitian, Lokasi/Ruang Lingkup, Teknik Pengumpulan Data, dan Teknik Analisis Data.
            - Berikan justifikasi singkat untuk setiap pilihan metodologi. ${details.pendekatan ? `Gunakan preferensi ini untuk Pendekatan: "${details.pendekatan}"` : ''}`;
            break;
        case 'bab4':
            prompt += `Struktur BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
            - Buat struktur pembahasan yang sistematis untuk menjawab rumusan masalah yang diberikan.
            - Sajikan analisis yang tajam dengan mengaitkan kerangka teori yang ada.`;
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

    let retries = 3;
let responseData;

while (retries > 0) {
  const apiResponse = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  responseData = await apiResponse.json();

  if (!responseData.error || responseData.error.code !== 503) break;

  console.warn('Model overloaded, mencoba ulang...');
  await new Promise(res => setTimeout(res, 2000)); // tunggu 2 detik
  retries--;
}

if (responseData.error) {
  throw new Error(`Gemini gagal: ${responseData.error.message}`);
}
    if ( responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content?.parts ) {
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return { statusCode: 200, body: JSON.stringify({ text: generatedText }) };
    } else {
      console.log('Full Gemini Response:', JSON.stringify(responseData, null, 2));
if (responseData.error) {
  throw new Error(`Gemini gagal: ${responseData.error.message}`);
}
  } catch (error) {
    console.error('Terjadi error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
