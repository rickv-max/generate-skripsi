// netlify/functions/generate-draft.js

// Membutuhkan "mesin" node-fetch agar bisa berfungsi
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
      body: JSON.stringify({ error: 'GEMINI_API_KEY tidak ditemukan.' }),
    };
  }

  try {
    // Ambil data dari frontend (app.js)
    const { topic, problem, chapter } = JSON.parse(event.body);

    // Validasi data
    if (!topic || !problem || !chapter) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Data tidak lengkap. Topik, rumusan masalah, dan bab dibutuhkan.' }),
      };
    }

    // Bangun prompt sesuai format yang Anda berikan
    const prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia.
Tugas Anda adalah membuat draf akademis secara **lengkap, utuh, tidak diringkas**, dan sesuai struktur formal skripsi hukum di Indonesia.
Gunakan bahasa akademik yang logis, sistematis, dan formal. Panjang isi tidak dibatasi. Tidak boleh menyingkat, meringkas, atau melewatkan bagian penting.

Berikan hasil seolah-olah ini akan dikumpulkan ke dosen pembimbing skripsi fakultas hukum. Jangan sertakan catatan, disclaimer, atau penjelasan tambahan di luar isi skripsi.

Konteks Utama:
- Topik Skripsi: "${topic}"
- Rumusan Masalah Utama: "${problem}"

Tugas Spesifik: Buatkan **draf lengkap** untuk **BAB ${chapter.toUpperCase()}** dari skripsi hukum, sesuai struktur standar akademik di Indonesia.\n\n`;

    // Siapkan body permintaan untuk Gemini API
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ], // <-- Koma ini penting
      
      // Konfigurasi tambahan yang dibutuhkan oleh model 1.5 Pro
      generationConfig: {
        "temperature": 1,
        "topK": 0,
        "topP": 0.95,
        "maxOutputTokens": 8192,
        "stopSequences": [],
      }
    };

    // Panggil model Gemini 1.5 Pro
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

    const apiResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await apiResponse.json();

    // Periksa apakah respons dari Gemini valid
    if (
      responseData.candidates &&
      responseData.candidates.length > 0 &&
      responseData.candidates[0].content?.parts
    ) {
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        body: JSON.stringify({ text: generatedText })
      };
    } else {
      // Jika respons tidak valid, catat alasannya
      const reason =
        responseData.promptFeedback?.blockReason ||
        responseData.candidates?.[0]?.finishReason ||
        'Unknown reason';
      console.error('Gemini gagal memberikan respons:', reason);
      throw new Error(`Gemini tidak menghasilkan konten. Alasan: ${reason}`);
    }
  } catch (error) {
    // Tangani semua error lain yang mungkin terjadi
    console.error('Terjadi error fatal di dalam fungsi:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
