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
    const { topic, problem, chapter } = JSON.parse(event.body);

    if (!topic || !problem || !chapter) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Data tidak lengkap. Topik, rumusan masalah, dan bab dibutuhkan.' }),
      };
    }

    // PROMPT SUPER LENGKAP UNTUK FLASH
    let prompt = `PERINTAH UNTUK MODEL GEMINI:

Anda adalah asisten akademik profesional di bidang hukum yang bertugas membuat draf skripsi hukum berdasarkan input formulir.

🎯 TUGAS UTAMA:
Tulis satu bab skripsi hukum secara lengkap, panjang, dan formal. Gunakan data dari formulir berikut sebagai acuan utama.

📝 DATA FORMULIR:
- Topik Skripsi: ${topic}
- Rumusan Masalah: ${problem}

📌 PANDUAN PENTING:
- Fokus pada data di atas, tetapi Anda boleh menyusun kerangka lengkap BAB sesuai standar skripsi hukum Indonesia.
- Jangan menyimpang dari topik atau rumusan masalah.
- Hindari generalisasi atau improvisasi yang tidak berdasar.
- Jika suatu subbab membutuhkan informasi tetapi tidak tersedia dari form, beri placeholder seperti “[data belum diisi]”.

🧠 TUJUAN:
Tulis **BAB ${chapter.replace('bab', '')}** secara lengkap sesuai struktur akademik. Panjang minimal 800–1000 kata. Jangan meringkas.

Hanya tampilkan isi bab. Jangan tambahkan apapun di luar itu.`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const apiResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await apiResponse.json();
    console.log('📦 RESPONSE DARI GEMINI:', JSON.stringify(responseData, null, 2));

    if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content?.parts) {
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        body: JSON.stringify({ text: generatedText })
      };
    } else {
      const reason = responseData.promptFeedback?.blockReason || responseData.candidates?.[0]?.finishReason || 'Unknown reason';
      console.error('⚠️ GAGAL GENERATE DARI GEMINI:', reason);
      throw new Error(`Gemini tidak menghasilkan konten. Alasan: ${reason}`);
    }
  } catch (error) {
    console.error('🔥 ERROR UTAMA:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
