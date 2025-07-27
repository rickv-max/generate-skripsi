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

    const prompt = `
PENTING: Permintaan ini adalah untuk tujuan akademik dan penelitian hukum murni. Hasilnya harus netral, objektif, dan fokus pada analisis teoretis dan yuridis. Hindari konten yang dapat ditafsirkan sebagai nasihat hukum atau mempromosikan tindakan berbahaya.

Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia.
Tugas Anda adalah membuat draf akademis secara lengkap, utuh, tidak diringkas, dan sesuai struktur formal skripsi hukum di Indonesia.
Gunakan bahasa akademik yang logis, sistematis, dan formal. Panjang isi tidak dibatasi. Tidak boleh menyingkat, meringkas, atau melewatkan bagian penting.

Berikan hasil seolah-olah ini akan dikumpulkan ke dosen pembimbing skripsi fakultas hukum. Jangan sertakan catatan, disclaimer, atau penjelasan tambahan di luar isi skripsi.

Topik Skripsi: ${topic}
Rumusan Masalah: ${problem}

Tugas Anda: Buatkan draf lengkap untuk BAB ${chapter.replace('bab', '').toUpperCase()} dari skripsi hukum.
Pastikan sesuai struktur formal akademik di Indonesia.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
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
        maxOutputTokens: 8192,
        stopSequences: []
      }
    };

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

    const apiResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await apiResponse.json();

    // ✅ DEBUG LOG: TAMPILKAN SEMUA HASIL RAW
    console.log('🔍 RESPONSE DATA:', JSON.stringify(responseData, null, 2));

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
      const reason = responseData.promptFeedback?.blockReason ||
                     responseData.candidates?.[0]?.finishReason ||
                     'Unknown reason';

      console.error('⚠️ GAGAL GENERATE DARI GEMINI:', reason);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Gemini tidak menghasilkan konten. Alasan: ${reason}`,
          rawResponse: responseData
        })
      };
    }
  } catch (error) {
    console.error('💥 ERROR SERVER:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
