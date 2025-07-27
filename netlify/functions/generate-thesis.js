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
    const prompt = `PERHATIAN: Anda adalah asisten profesional penulisan skripsi hukum di Indonesia.

Tugas Anda adalah membuat satu **bab lengkap** dari skripsi hukum secara utuh, panjang, dan sistematis — sesuai kaidah akademik di fakultas hukum Indonesia. TIDAK BOLEH meringkas, menyederhanakan, atau melewatkan bagian penting.

Gunakan gaya bahasa akademik, lugas, netral, dan berdasarkan teori hukum yang berlaku.

JANGAN membuat isi di luar topik yang diberikan. Fokus hanya pada konteks yang sudah ditentukan di bawah ini.

KONTEKS:
- Topik utama skripsi: "${topic}"
- Rumusan masalah: "${problem}"

TUGAS:
Tulis draf lengkap untuk **BAB ${chapter.replace('bab', '')}** dari skripsi hukum tersebut. Struktur dan panjang harus seperti skripsi nyata. Jangan berikan ringkasan, catatan, disclaimer, atau teks tambahan.

Langsung mulai dari isi BAB tersebut seolah-olah ini akan dikumpulkan kepada dosen pembimbing.`;

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
