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
    const prompt = `
⚠️ Penting:
Tugas ini adalah pembuatan **draf skripsi hukum yang lengkap, utuh, dan sesuai kaidah akademik** di Indonesia.
Hasil harus netral, objektif, dan fokus pada analisis hukum secara yuridis dan teoritis.
Gunakan bahasa ilmiah yang logis, sistematis, dan mendalam seperti skripsi S1 Fakultas Hukum.

JANGAN meringkas, menyingkat, atau membuat daftar poin saja. Buat narasi utuh seperti skripsi cetak.
Tulis seolah-olah akan diserahkan kepada dosen pembimbing.

📘 Informasi Utama:
- Topik Skripsi: ${topic}
- Rumusan Masalah: ${problem}
- Bab yang diminta: BAB ${chapter.replace('bab', '')}

📌 Struktur:
Buatlah isi dari BAB ${chapter.replace('bab', '')} yang lengkap, sesuai struktur resmi penulisan skripsi hukum. Gunakan subjudul, paragraf utuh, dan format yang umum dipakai di fakultas hukum.

Output hanya boleh berupa isi bab — tidak ada disclaimer, penjelasan tambahan, atau catatan sistem.

⛔ Jangan beri tanggapan meta seperti “Berikut ini adalah...”, cukup langsung isi skripsinya.

Mulailah sekarang.
`;

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
