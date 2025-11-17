// netlify/functions/generate-thesis.js
// VERSI GEMINI - PROMPT TIDAK DIUBAH

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // ▼ Pakai ENV dulu, kalau tidak ada baru fallback ke string manual
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY tidak ditemukan.' }),
    };
  }

  try {
    // Kasih default {} supaya tidak error kalau details tidak dikirim
    const { topic, problem, chapter, details = {} } = JSON.parse(event.body);

    if (!topic || !problem || !chapter) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Data tidak lengkap. Topik, rumusan masalah, dan bab dibutuhkan.',
        }),
      };
    }

    // === PROMPT TIDAK DIUBAH (isi teks sama persis, cuma dipakai ke Gemini) ===
    let prompt = `Sebagai asisten penulisan akademis, tugas Anda adalah membantu menyusun draf untuk sebuah karya tulis ilmiah di bidang hukum.
Hasil tulisan harus objektif, netral, dan fokus pada analisis teoretis. Gunakan bahasa Indonesia yang formal dan terstruktur.
Tujuan utamanya adalah menghasilkan draf yang komprehensif dan mendalam, di mana setiap sub-bab diuraikan dalam beberapa paragraf yang kaya analisis.

Informasi dasar untuk draf ini adalah sebagai berikut:
- Topik Penelitian: "${topic}"
- Rumusan Masalah: "${problem}"\n\n`;

    switch (chapter) {
      case 'bab1':
        prompt += `Struktur BAB I - PENDAHULUAN:
1.1 Latar belakang
1.2 Rumusan masalah
1.3 Tujuan penelitian
1.4 Kontribusi penelitian
1.5 Orisinalitas (buat dalam bentuk tabel)`;
        break;

      case 'bab2':
        prompt += `Struktur BAB II - TINJAUAN PUSTAKA:
2.1 Tinjauan Umum terkait topik
2.2 Tinjauan Teori relevan
2.3 Tinjauan Penelitian Terdahulu (3 sumber berbeda dan relevan)`;
        break;

      case 'bab3':
        prompt += `Struktur BAB III - METODE PENELITIAN:
- Berikan pengantar singkat yang menjelaskan pentingnya bab metodologi ini.
- Uraikan secara sangat mendalam setiap sub-bab berikut, di mana masing-masing sub-bab harus terdiri dari minimal empat paragraf yang terstruktur dengan baik:

3.1. Sub-bab Pendekatan Penelitian:
  - Paragraf 1: Jelaskan definisi dan tujuan umum dari pendekatan penelitian dalam sebuah karya tulis ilmiah hukum.
  - Paragraf 2: Uraikan beberapa jenis pendekatan yang umum digunakan (contohnya yuridis normatif, yuridis empiris, socio-legal) beserta perbedaannya.
  - Paragraf 3: Berikan justifikasi akademis yang kuat mengapa pendekatan tertentu adalah yang paling tepat untuk menganalisis topik "${topic}" dan menjawab rumusan masalah "${problem}". ${details.pendekatan ? `Prioritaskan dan jelaskan secara detail pendekatan yang disarankan pengguna: "${details.pendekatan}".` : 'Sarankan pendekatan yang paling logis jika pengguna tidak memberikan masukan.'}
  - Paragraf 4: Detailkan bagaimana pendekatan yang dipilih tersebut akan diimplementasikan secara praktis dalam analisis di bab-bab selanjutnya.

3.2. Sub-bab Jenis Penelitian:
  - Uraikan dalam minimal empat paragraf. Jelaskan apa itu jenis penelitian, sebutkan beberapa contoh (deskriptif, eksplanatif, preskriptif), dan berikan justifikasi kuat mengapa jenis tertentu (misalnya deskriptif analitis) dipilih. ${details.jenis ? `Gunakan preferensi pengguna ini: "${details.jenis}".` : ''}

3.3. Sub-bab Lokasi atau Ruang Lingkup Penelitian:
  - Uraikan dalam minimal empat paragraf. Jelaskan secara detail lokasi fisik penelitian atau, jika merupakan studi kepustakaan, jelaskan secara rinci batasan dan ruang lingkup bahan hukum yang akan diteliti. ${details.lokasi ? `Gunakan preferensi pengguna ini: "${details.lokasi}".` : ''}

3.4. Sub-bab Teknik Pengumpulan Data:
  - Uraikan dalam minimal empat paragraf. Jelaskan secara mendalam teknik yang digunakan (misalnya studi dokumen/kepustakaan atau wawancara), bagaimana teknik itu akan dijalankan, dan mengapa teknik itu paling relevan. ${details.metodePengumpulanData ? `Gunakan preferensi pengguna ini: "${details.metodePengumpulanData}".` : ''}

3.5. Sub-bab Teknik Analisis Data:
  - Uraikan dalam minimal empat paragraf. Jelaskan secara komprehensif bagaimana data yang terkumpul akan dianalisis (misalnya analisis kualitatif). Detailkan langkah-langkah analisisnya (reduksi data, penyajian data, penarikan kesimpulan) dan bagaimana analisis itu akan digunakan untuk menjawab rumusan masalah. ${details.modelAnalisis ? `Gunakan preferensi pengguna ini: "${details.modelAnalisis}".` : ''}`;
        break;

      case 'bab4':
        prompt += `Struktur BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
- Buat struktur pembahasan yang sistematis untuk menjawab rumusan masalah yang diberikan.
- Sajikan analisis yang tajam dengan mengaitkan kerangka teori yang ada.`;
        break;

      default:
        throw new Error('Chapter tidak valid');
    }

    // ====== PANGGIL GEMINI API ======
    const apiURL =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
      encodeURIComponent(GEMINI_API_KEY);

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      // mirip dengan temperature & max_tokens di Cohere
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      },
    };

    // === RETRY LOGIC (untuk 429 / 503) ===
    let retries = 3;
    let responseData;
    let status;

    while (retries > 0) {
      const apiResponse = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      status = apiResponse.status;
      responseData = await apiResponse.json();

      if (status !== 503 && status !== 429) break;

      console.warn('Gemini overload / rate limit, retrying...');
      await new Promise((res) => setTimeout(res, 2000));
      retries--;
    }

    // Ambil teks dari struktur respons Gemini
    let generatedText = '';

    if (
      responseData &&
      Array.isArray(responseData.candidates) &&
      responseData.candidates.length > 0
    ) {
      const parts = responseData.candidates[0].content?.parts || [];
      generatedText = parts
        .map((p) => (typeof p.text === 'string' ? p.text : ''))
        .join('')
        .trim();
    }

    if (generatedText) {
      return {
        statusCode: 200,
        body: JSON.stringify({ text: generatedText }),
      };
    } else {
      throw new Error(
        `Gemini gagal: ${
          responseData.error?.message ||
          responseData.message ||
          'Tidak ada teks dihasilkan.'
        }`
      );
    }
  } catch (error) {
    console.error('Terjadi error:', error.message, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
