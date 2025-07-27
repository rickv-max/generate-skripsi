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
    const prompt = `PERINTAH KHUSUS UNTUK MODEL GEMINI:

Anda adalah asisten akademik yang profesional dan ahli dalam penulisan skripsi hukum di Indonesia.

❗TUGAS UTAMA ANDA:
Buat satu bab skripsi **secara lengkap dan panjang** berdasarkan isi formulir yang telah diisi oleh pengguna. **JANGAN mengubah, menyederhanakan, menyimpulkan, menambah, atau mengembangkan isi formulir.** Anda hanya boleh menggunakan data dari formulir sebagai satu-satunya sumber informasi.

🧾 KONTEKS YANG HARUS DIGUNAKAN (WAJIB):
- Topik Skripsi: ${topic}
- Rumusan Masalah: ${problem}

🧠 BATASAN:
- Jangan berimprovisasi. Tugas Anda bukan untuk berkreasi, tetapi untuk menulis berdasarkan formulir.
- Jika informasi tidak tersedia dalam formulir, cukup lewati bagian tersebut atau buat bagian dengan placeholder seperti "[data belum tersedia]".
- Gunakan gaya penulisan akademik formal, sesuai standar skripsi hukum Indonesia.
- Panjang minimal sekitar 800–1000 kata per bab (jangan dipersingkat).
- Mulai langsung dari isi bab — **tanpa** pembuka, penjelasan, atau catatan tambahan.

🎯 TUGAS SPESIFIK:
Tulis draf lengkap **BAB ${chapter.replace('bab', '')}** dari skripsi tersebut berdasarkan konteks yang diberikan.

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
