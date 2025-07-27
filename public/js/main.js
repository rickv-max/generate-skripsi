// public/js/main.js

const thesisTopicInput = document.getElementById('thesisTopic');
const chapter2SubtopicsInput = document.getElementById('chapter2Subtopics');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const buttonText = document.getElementById('buttonText');
const outputDiv = document.getElementById('output');
const thesisContentDiv = document.getElementById('thesisContent');

// Function to display a custom message box
function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerHTML = `
        <p>${message}</p>
        <button onclick="this.parentNode.remove()">OK</button>
    `;
    document.body.appendChild(messageBox);
}

// Function to call the Netlify Function for content generation
async function generateContent(prompt) {
    try {
        // Perubahan di sini: Memanggil endpoint yang baru
        const response = await fetch('/.netlify/functions/generate-skripsi', { // Endpoint Netlify Function yang diperbarui
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        const result = await response.json();

        if (response.ok) {
            return result.text; // Netlify Function is expected to return { text: "..." }
        } else {
            console.error("Error from Netlify Function:", result.error);
            showMessageBox(`Terjadi kesalahan dari server: ${result.error}`);
            return null;
        }
    } catch (error) {
        console.error("Error calling Netlify Function:", error);
        showMessageBox(`Terjadi kesalahan saat menghubungi server: ${error.message}. Pastikan Netlify Function sudah ter-deploy dan berfungsi.`);
        return null;
    }
}

generateBtn.addEventListener('click', async () => {
    const thesisTopic = thesisTopicInput.value.trim();
    const chapter2Subtopics = chapter2SubtopicsInput.value.trim();

    if (!thesisTopic) {
        showMessageBox("Mohon masukkan Topik Skripsi.");
        return;
    }

    generateBtn.disabled = true;
    loadingSpinner.classList.remove('hidden');
    buttonText.textContent = 'Membuat Draf...';
    outputDiv.classList.add('hidden');
    thesisContentDiv.innerHTML = ''; // Clear previous content
    copyBtn.style.display = 'none';

    let fullThesis = '';

    try {
        // BAB I – PENDAHULUAN
        fullThesis += '<div class="chapter-title">BAB I – PENDAHULUAN</div>\n\n';

        // 1.1 Latar Belakang
        fullThesis += '<div class="sub-chapter-title">1.1 Latar Belakang</div>\n';
        let promptLatarBelakang = `Buat latar belakang skripsi hukum dengan topik "${thesisTopic}". Jelaskan alasan pentingnya topik ini diteliti, hubungkan dengan konteks hukum, isu aktual, dan urgensinya. Tulis dalam bahasa ilmiah formal, minimal 300 kata.`;
        let latarBelakang = await generateContent(promptLatarBelakang);
        if (!latarBelakang) throw new Error("Gagal membuat Latar Belakang.");
        fullThesis += latarBelakang + '\n\n';

        // 1.2 Rumusan Masalah
        fullThesis += '<div class="sub-chapter-title">1.2 Rumusan Masalah</div>\n';
        let promptRumusanMasalah = `Buat 2-3 rumusan masalah skripsi hukum dalam bentuk kalimat tanya ilmiah yang menjadi fokus utama penelitian, berdasarkan topik "${thesisTopic}".`;
        let rumusanMasalah = await generateContent(promptRumusanMasalah);
        if (!rumusanMasalah) throw new Error("Gagal membuat Rumusan Masalah.");
        fullThesis += rumusanMasalah + '\n\n';

        // 1.3 Tujuan Penelitian
        fullThesis += '<div class="sub-chapter-title">1.3 Tujuan Penelitian</div>\n';
        let promptTujuanPenelitian = `Buat tujuan penelitian skripsi hukum secara ringkas apa yang ingin dicapai dari penelitian ini, berdasarkan topik "${thesisTopic}" dan rumusan masalah berikut:\n${rumusanMasalah}`;
        let tujuanPenelitian = await generateContent(promptTujuanPenelitian);
        if (!tujuanPenelitian) throw new Error("Gagal membuat Tujuan Penelitian.");
        fullThesis += tujuanPenelitian + '\n\n';

        // 1.4 Kontribusi Penelitian
        fullThesis += '<div class="sub-chapter-title">1.4 Kontribusi Penelitian</div>\n';
        let promptKontribusiPenelitian = `Uraikan kontribusi penelitian ini terhadap pengembangan ilmu hukum, praktik hukum, atau kebijakan publik, berdasarkan topik "${thesisTopic}".`;
        let kontribusiPenelitian = await generateContent(promptKontribusiPenelitian);
        if (!kontribusiPenelitian) throw new Error("Gagal membuat Kontribusi Penelitian.");
        fullThesis += kontribusiPenelitian + '\n\n';

        // 1.5 Orisinalitas Penelitian
        fullThesis += '<div class="sub-chapter-title">1.5 Orisinalitas Penelitian</div>\n';
        let promptOrisinalitas = `Sajikan contoh tabel perbandingan antara penelitian ini (dengan topik "${thesisTopic}") dengan minimal 3 penelitian sebelumnya. Gunakan format tabel berikut:\n| No | Nama dan bentuk penelitian | judul penelitian | persamaan | Perbedaan |\n|----|-----------------------------|----------------|-------|----------------------------------|\nIsi dengan data placeholder yang relevan dengan topik hukum.`;
        let orisinalitas = await generateContent(promptOrisinalitas);
        if (!orisinalitas) throw new Error("Gagal membuat Orisinalitas Penelitian.");
        fullThesis += orisinalitas + '\n\n';

        // BAB II – TINJAUAN PUSTAKA
        fullThesis += '<div class="chapter-title">BAB II – TINJAUAN PUSTAKA</div>\n\n';

        // 2.1 Tinjauan Umum
        fullThesis += '<div class="sub-chapter-title">2.1 Tinjauan Umum</div>\n';
        let promptTinjauanUmum = `Jelaskan konsep, teori, dan prinsip dasar yang relevan dengan topik penelitian hukum "${thesisTopic}". Pastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 400 kata.`;
        let tinjauanUmum = await generateContent(promptTinjauanUmum);
        if (!tinjauanUmum) throw new Error("Gagal membuat Tinjauan Umum.");
        fullThesis += tinjauanUmum + '\n\n';

        // User-defined sub-chapters for Chapter II
        const subtopicArray = chapter2Subtopics.split(',').map(s => s.trim()).filter(s => s !== '');
        for (let i = 0; i < subtopicArray.length; i++) {
            const subtopic = subtopicArray[i];
            fullThesis += `<div class="sub-chapter-title">2.${2 + i} ${subtopic}</div>\n`;
            let promptSubBab2 = `Bahas teori/konsep "${subtopic}" secara mendalam dan relevan dengan topik skripsi hukum "${thesisTopic}". Pastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 250 kata.`;
            let contentSubBab2 = await generateContent(promptSubBab2);
            if (!contentSubBab2) throw new Error(`Gagal membuat sub-bab 2.${2 + i} ${subtopic}.`);
            fullThesis += contentSubBab2 + '\n\n';
        }

        // BAB III – METODE PENELITIAN
        fullThesis += '<div class="chapter-title">BAB III – METODE PENELITIAN</div>\n\n';

        // 3.1 Pendekatan Penelitian
        fullThesis += '<div class="sub-chapter-title">3.1 Pendekatan Penelitian</div>\n';
        let promptPendekatan = `Jelaskan pendekatan penelitian yang digunakan untuk skripsi hukum dengan topik "${thesisTopic}". Pilih antara yuridis normatif, yuridis empiris, atau socio-legal, dan jelaskan mengapa pendekatan tersebut relevan.`;
        let pendekatan = await generateContent(promptPendekatan);
        if (!pendekatan) throw new Error("Gagal membuat Pendekatan Penelitian.");
        fullThesis += pendekatan + '\n\n';

        // 3.2 Jenis Penelitian
        fullThesis += '<div class="sub-chapter-title">3.2 Jenis Penelitian</div>\n';
        let promptJenisPenelitian = `Uraikan apakah penelitian ini deskriptif, eksplanatif, atau preskriptif, relevan dengan topik skripsi hukum "${thesisTopic}" dan pendekatan penelitian yang telah dijelaskan:\n${pendekatan}`;
        let jenisPenelitian = await generateContent(promptJenisPenelitian);
        if (!jenisPenelitian) throw new Error("Gagal membuat Jenis Penelitian.");
        fullThesis += jenisPenelitian + '\n\n';

        // 3.3 Lokasi Penelitian
        fullThesis += '<div class="sub-chapter-title">3.3 Lokasi Penelitian</div>\n';
        let promptLokasiPenelitian = `Sebutkan tempat/lokasi penelitian untuk skripsi hukum dengan topik "${thesisTopic}". Jika menggunakan data lapangan, sebutkan lokasinya. Jika normatif, tulis "dilakukan melalui studi pustaka".`;
        let lokasiPenelitian = await generateContent(promptLokasiPenelitian);
        if (!lokasiPenelitian) throw new Error("Gagal membuat Lokasi Penelitian.");
        fullThesis += lokasiPenelitian + '\n\n';

        // 3.4 Metode Pengumpulan Data
        fullThesis += '<div class="sub-chapter-title">3.4 Metode Pengumpulan Data</div>\n';
        let promptMetodePengumpulanData = `Jelaskan metode pengumpulan data seperti studi dokumen, wawancara, atau observasi, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}" dan jenis penelitian yang telah dijelaskan:\n${jenisPenelitian}`;
        let metodePengumpulanData = await generateContent(promptMetodePengumpulanData);
        if (!metodePengumpulanData) throw new Error("Gagal membuat Metode Pengumpulan Data.");
        fullThesis += metodePengumpulanData + '\n\n';

        // 3.5 Model Analisis Data
        fullThesis += '<div class="sub-chapter-title">3.5 Model Analisis Data</div>\n';
        let promptModelAnalisisData = `Jelaskan model analisis data seperti kualitatif deskriptif, induktif-deduktif, atau metode hermeneutika hukum, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}" dan metode pengumpulan data yang telah dijelaskan:\n${metodePengumpulanData}`;
        let modelAnalisisData = await generateContent(promptModelAnalisisData);
        if (!modelAnalisisData) throw new Error("Gagal membuat Model Analisis Data.");
        fullThesis += modelAnalisisData + '\n\n';

        // BAB IV – HASIL PENELITIAN DAN PEMBAHASAN
        fullThesis += '<div class="chapter-title">BAB IV – HASIL PENELITIAN DAN PEMBAHASAN</div>\n\n';
        let promptBab4 = `Buat isi Bab IV (Hasil Penelitian dan Pembahasan) skripsi hukum secara menyeluruh berdasarkan topik "${thesisTopic}" dan rumusan masalah berikut:\n${rumusanMasalah}\n\nBagi menjadi beberapa sub-bab yang mengalir logis, setiap sub-bab menjawab satu rumusan masalah dari Bab I. Gunakan bahasa akademik yang objektif dan sistematis. Sertakan teori yang relevan, data (jika ada), serta interpretasi hukum yang mendalam. Jika ada studi kasus, perbandingan, atau putusan pengadilan, silakan dikutip untuk memperkuat argumentasi. Pastikan panjang total Bab IV minimal 1000 kata.`;
        let bab4Content = await generateContent(promptBab4);
        if (!bab4Content) throw new Error("Gagal membuat BAB IV.");
        fullThesis += bab4Content + '\n\n';

        thesisContentDiv.innerHTML = fullThesis;
        outputDiv.classList.remove('hidden');
        copyBtn.style.display = 'inline-block'; // Show copy button
        showMessageBox("Draf skripsi berhasil dibuat!");

    } catch (error) {
        console.error("Terjadi kesalahan saat membuat skripsi:", error);
        showMessageBox(`Gagal membuat skripsi: ${error.message}. Mohon coba lagi.`);
    } finally {
        generateBtn.disabled = false;
        loadingSpinner.classList.add('hidden');
        buttonText.textContent = 'Buat Draf Skripsi';
    }
});

copyBtn.addEventListener('click', () => {
    const range = document.createRange();
    range.selectNode(thesisContentDiv);
    window.getSelection().removeAllRanges(); // Clear current selection
    window.getSelection().addRange(range); // Select the text
    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Berhasil disalin!' : 'Gagal menyalin!';
        showMessageBox(msg);
    } catch (err) {
        console.error('Gagal menyalin:', err);
        showMessageBox('Gagal menyalin teks ke clipboard.');
    }
    window.getSelection().removeAllRanges(); // Deselect after copying
});
