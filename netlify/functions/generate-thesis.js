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
    let prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia dengan standar kualitas tertinggi setara dosen pembimbing.
Tugas Anda adalah membuat draf akademis yang **sangat ekstensif, komprehensif, mendalam, dan panjang**. Setiap sub-bab naratif harus diuraikan setidaknya dalam **lima paragraf yang substantif dan kaya analisis**. Gunakan bahasa Indonesia akademik yang formal, logis, dan sangat sistematis.

Konteks Utama:
- Topik Skripsi: "${topic}"
- Rumusan Masalah Utama: "${problem}"

Tugas Spesifik: Buatkan draf yang sangat lengkap dan mendalam untuk BAB ${chapter.replace('bab','')} dari skripsi hukum, dengan instruksi spesifik berikut:\n\n`;

// Logika SWITCH...CASE untuk membangun prompt yang spesifik
switch (chapter) {
    case 'bab1':
        prompt += `Struktur BAB I - PENDAHULUAN:
        - Buat sub-bab 1.1 Latar Belakang: Uraikan secara sangat mendalam dalam minimal lima paragraf. Mulai dengan gambaran umum, lalu jelaskan kesenjangan antara kondisi ideal (das sollen) dengan kondisi nyata (das sein), berikan data pendukung jika memungkinkan, dan akhiri dengan menyoroti urgensi penelitian ini. ${details.latarBelakang ? `Gunakan draf awal ini sebagai inspirasi utama: "${details.latarBelakang}"` : ''}
        - Buat sub-bab 1.2 Rumusan Masalah: Sajikan kembali rumusan masalah utama dalam format pertanyaan yang jelas.
        - Buat sub-bab 1.3 Tujuan Penelitian: Jabarkan tujuan penelitian (umum dan khusus) yang secara langsung menjawab rumusan masalah.
        - Buat sub-bab 1.4 Kontribusi Penelitian: Jelaskan kontribusi teoretis dan praktis secara terpisah dan detail.`;
        break;
    case 'bab2':
        prompt += `Struktur BAB II - TINJAUAN PUSTAKA:
        - Buat Tinjauan Umum yang komprehensif tentang konsep-konsep dasar terkait "${topic}".
        - Untuk setiap teori, asas, atau konsep kunci, bahas secara mendalam dalam minimal lima paragraf dengan struktur: 1) Definisi dan pengantar. 2) Elaborasi dan konteks historis/filosofis. 3) Analisis mendalam dari berbagai sudut pandang. 4) Contoh penerapan atau relevansi dengan topik. 5) Kesimpulan dan transisi. ${details.subtopics ? `Berikan fokus khusus pada sub-topik berikut: ${details.subtopics}.` : ''}
        - Jelaskan kerangka hukum (peraturan perundang-undangan) yang terkait dengan topik secara hierarkis.`;
        break;
    case 'bab3':
        prompt += `Struktur BAB III - METODE PENELITIAN:
        - Berikan pengantar singkat tentang tujuan dari bab metodologi.
        - Buat sub-bab 3.1 Pendekatan Penelitian: Jelaskan secara komprehensif (minimal lima paragraf) pendekatan yang dipilih. ${details.pendekatan ? `Fokus pada pendekatan: "${details.pendekatan}"` : 'Sarankan pendekatan yang paling cocok (misal: yuridis normatif atau yuridis empiris) dan berikan justifikasi akademis yang kuat mengapa pendekatan itu paling tepat.'}
        - Buat sub-bab lainnya (Jenis, Lokasi, Metode Pengumpulan, Model Analisis) dengan penjelasan yang detail dan jelas di setiap bagiannya, masing-masing minimal empat paragraf.`;
        break;
    case 'bab4':
        prompt += `Struktur BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
        - Buat struktur pembahasan yang sistematis, di mana setiap sub-bab utama menjawab satu aspek dari rumusan masalah: "${problem}".
        - Untuk setiap sub-bab, sajikan analisis yang sangat mendalam dalam minimal lima paragraf. Gunakan kerangka teori dari Bab II untuk membedah data atau peraturan. Jangan hanya mendeskripsikan, tetapi juga menganalisis, menginterpretasikan, dan memberikan argumen kritis.`;
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
