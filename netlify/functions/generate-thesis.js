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

    const prompt = `Anda adalah seorang asisten ahli penulisan skripsi hukum di Indonesia.
Tugas Anda adalah membuat draf akademis secara **lengkap, utuh, tidak diringkas**, dan sesuai struktur formal skripsi hukum di Indonesia.
Gunakan bahasa akademik yang logis, sistematis, dan formal. Panjang isi tidak dibatasi. Tidak boleh menyingkat, meringkas, atau melewatkan bagian penting.

Berikan hasil seolah-olah ini akan dikumpulkan ke dosen pembimbing skripsi fakultas hukum. Jangan sertakan catatan, disclaimer, atau penjelasan tambahan di luar isi skripsi.

Konteks Utama:
- Topik Skripsi: "${topic}"
- Rumusan Masalah Utama: "${problem}"

Tugas Spesifik: Buatkan draf untuk ${chapter.toUpperCase()} dengan instruksi berikut:\n\n`;

    let instruksiBab = '';

    switch (chapter) {
      case 'bab1':
        instruksiBab = `BAB I - PENDAHULUAN:
1.1 Latar Belakang: Jelaskan secara utuh pentingnya penelitian dengan topik "${topic}". ${details.latarBelakang ? `Gunakan draf awal ini: "${details.latarBelakang}"` : ''}
1.2 Rumusan Masalah: Rumuskan masalah yang diteliti dengan jelas dan terstruktur.
1.3 Tujuan Penelitian: Jabarkan secara eksplisit tujuan dari penelitian ini. ${details.tujuanPenelitian ? `Gunakan draf awal ini: "${details.tujuanPenelitian}"` : ''}
1.4 Kontribusi Penelitian: Jelaskan kontribusi teoretis dan praktis dari penelitian ini.
1.5 Orisinalitas Penelitian: Berikan analisis orisinalitas dengan format tabel atau narasi.`;
        break;

      case 'bab2':
        instruksiBab = `BAB II - TINJAUAN PUSTAKA:
2.1 Tinjauan Umum terkait topik "${topic}".
2.2 Bahas teori, asas, konsep, dan doktrin yang relevan.
2.3 Bahas penelitian terdahulu dan posisikan penelitian ini secara ilmiah.
${details.subtopics ? `Fokuskan bahasan pada subtopik: ${details.subtopics}.` : ''}`;
        break;

      case 'bab3':
        instruksiBab = `BAB III - METODE PENELITIAN:
3.1 Pendekatan Penelitian: ${details.pendekatan || 'Jelaskan pendekatan yang digunakan (misalnya normatif, empiris, atau campuran).'}
3.2 Jenis Penelitian: ${details.jenis || 'Jelaskan jenis penelitian dan alasan pemilihannya.'}
3.3 Lokasi Penelitian: ${details.lokasi || 'Sebutkan lokasi penelitian jika relevan.'}
3.4 Metode Pengumpulan Data: ${details.metodePengumpulanData || 'Jelaskan teknik pengumpulan data yang digunakan.'}
3.5 Teknik Analisis Data: ${details.modelAnalisis || 'Jelaskan metode analisis yang digunakan untuk mengolah data.'}`;
        break;

      case 'bab4':
        instruksiBab = `BAB IV - HASIL PENELITIAN DAN PEMBAHASAN:
4.1 Paparkan hasil temuan atau uraian analisis terhadap "${problem}".
4.2 Kaji dan hubungkan dengan teori-teori dalam Bab II.
4.3 Sajikan contoh kasus, regulasi, atau putusan pengadilan jika relevan.
4.4 Jelaskan secara logis bagaimana jawaban terhadap rumusan masalah dibangun.`;
        break;

      default:
        throw new Error('Chapter tidak valid');
    }

    const requestBody = {
      contents: [{
        parts: [{ text: prompt + instruksiBab }]
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    };

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const apiResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseData = await apiResponse.json();

    if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content?.parts) {
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        body: JSON.stringify({ text: generatedText }),
      };
    } else {
      const reason = responseData.promptFeedback?.blockReason || responseData.candidates?.[0]?.finishReason || 'Unknown reason';
      console.error('Gemini gagal memberikan respons:', reason);
      throw new Error(`Gemini tidak menghasilkan konten. Alasan: ${reason}`);
    }

  } catch (error) {
    console.error('Terjadi error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
