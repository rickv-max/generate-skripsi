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

    if (!subbab) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Subbab tidak ditentukan. Kirim subbab seperti "1.1" atau "3.4"' }),
  };
}

let instruksiBab = '';

switch (subbab) {
  case '1.1':
    instruksiBab = `1.1 Latar Belakang: Jelaskan secara utuh pentingnya penelitian dengan topik "${topic}". ${details.latarBelakang ? `Gunakan draf awal ini: "${details.latarBelakang}"` : ''}`;
    break;
  case '1.2':
    instruksiBab = `1.2 Rumusan Masalah: Rumuskan masalah yang diteliti secara eksplisit dan sistematis dari topik "${topic}".`;
    break;
  case '1.3':
    instruksiBab = `1.3 Tujuan Penelitian: Jelaskan tujuan penelitian dari rumusan masalah "${problem}". ${details.tujuanPenelitian ? `Gunakan draf awal ini: "${details.tujuanPenelitian}"` : ''}`;
    break;
  case '1.4':
    instruksiBab = `1.4 Kontribusi Penelitian: Jelaskan kontribusi ilmiah dan praktis dari penelitian ini terhadap bidang hukum.`;
    break;
  case '1.5':
    instruksiBab = `1.5 Orisinalitas Penelitian: Berikan analisis orisinalitas topik "${topic}", baik dalam bentuk narasi atau tabel, dibandingkan dengan penelitian terdahulu.`;
    break;
  
  case '2.1':
    instruksiBab = `2.1 Tinjauan Umum tentang "${topic}" dari perspektif hukum.`;
    break;
  case '2.2':
    instruksiBab = `2.2 Bahas teori, asas, dan doktrin hukum yang relevan dengan topik "${topic}".`;
    break;
  case '2.3':
    instruksiBab = `2.3 Tinjau penelitian terdahulu, dan posisikan penelitian ini secara akademik.`;
    break;

  case '3.1':
    instruksiBab = `3.1 Pendekatan Penelitian: ${details.pendekatan || 'Jelaskan pendekatan normatif, empiris, atau campuran yang digunakan.'}`;
    break;
  case '3.2':
    instruksiBab = `3.2 Jenis Penelitian: ${details.jenis || 'Uraikan jenis penelitian hukum yang digunakan dan alasan pemilihannya.'}`;
    break;
  case '3.3':
    instruksiBab = `3.3 Lokasi Penelitian: ${details.lokasi || 'Sebutkan lokasi penelitian, jika relevan (terutama untuk metode empiris).'}`;
    break;
  case '3.4':
    instruksiBab = `3.4 Metode Pengumpulan Data: ${details.metodePengumpulanData || 'Jelaskan teknik wawancara, studi dokumen, observasi, atau lainnya yang digunakan.'}`;
    break;
  case '3.5':
    instruksiBab = `3.5 Teknik Analisis Data: ${details.modelAnalisis || 'Jelaskan metode analisis data hukum, baik normatif atau empiris.'}`;
    break;

  case '4.1':
    instruksiBab = `4.1 Paparkan hasil analisis atau temuan penelitian terkait rumusan masalah "${problem}".`;
    break;
  case '4.2':
    instruksiBab = `4.2 Bahas hubungan antara temuan dan teori-teori hukum yang sudah dijelaskan sebelumnya.`;
    break;
  case '4.3':
    instruksiBab = `4.3 Sajikan contoh kasus, putusan pengadilan, atau regulasi yang relevan dengan topik "${topic}".`;
    break;
  case '4.4':
    instruksiBab = `4.4 Berikan pembahasan sistematis bagaimana temuan menjawab rumusan masalah.`;
    break;

  default:
    throw new Error('Subbab tidak valid');
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
