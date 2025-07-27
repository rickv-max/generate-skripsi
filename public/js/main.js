// public/js/main.js

const thesisTopicInput = document.getElementById('thesisTopic');
const chapter2SubtopicsInput = document.getElementById('chapter2Subtopics');

// Ambil referensi ke semua textarea input
const inputLatarBelakang = document.getElementById('inputLatarBelakang');
const inputRumusanMasalah = document.getElementById('inputRumusanMasalah');
const inputTujuanPenelitian = document.getElementById('inputTujuanPenelitian');
const inputKontribusiPenelitian = document.getElementById('inputKontribusiPenelitian');
const inputOrisinalitasPenelitian = document.getElementById('inputOrisinalitasPenelitian');
const inputTinjauanUmum = document.getElementById('inputTinjauanUmum');
const inputPendekatanPenelitian = document.getElementById('inputPendekatanPenelitian');
const inputJenisPenelitian = document.getElementById('inputJenisPenelitian');
const inputLokasiPenelitian = document.getElementById('inputLokasiPenelitian');
const inputMetodePengumpulanData = document.getElementById('inputMetodePengumpulanData');
const inputModelAnalisisData = document.getElementById('inputModelAnalisisData');

// Tombol-tombol baru
const generateBab1Btn = document.getElementById('generateBab1Btn');
const generateBab2Btn = document.getElementById('generateBab2Btn');
const generateBab3Btn = document.getElementById('generateBab3Btn');
const generateBab4Btn = document.getElementById('generateBab4Btn');
const copyAllBtn = document.getElementById('copyAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Spinner dan teks tombol
const loadingSpinnerBab1 = document.getElementById('loadingSpinnerBab1');
const buttonTextBab1 = document.getElementById('buttonTextBab1');
const loadingSpinnerBab2 = document.getElementById('loadingSpinnerBab2');
const buttonTextBab2 = document.getElementById('buttonTextBab2');
const loadingSpinnerBab3 = document.getElementById('loadingSpinnerBab3');
const buttonTextBab3 = document.getElementById('buttonTextBab3');
const loadingSpinnerBab4 = document.getElementById('loadingSpinnerBab4');
const buttonTextBab4 = document.getElementById('buttonTextBab4');

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
async function generateContent(prompt, spinner, buttonTextElement) {
    spinner.classList.remove('hidden');
    buttonTextElement.textContent = 'Membuat...';

    try {
        const response = await fetch('/.netlify/functions/generate-skripsi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        const result = await response.json();

        if (response.ok) {
            return result.text;
        } else {
            console.error("Error from Netlify Function:", result.error);
            showMessageBox(`Terjadi kesalahan dari server: ${result.error}`);
            return null;
        }
    } catch (error) {
        console.error("Error calling Netlify Function:", error);
        showMessageBox(`Terjadi kesalahan saat menghubungi server: ${error.message}. Pastikan Netlify Function sudah ter-deploy dan berfungsi.`);
        return null;
    } finally {
        spinner.classList.add('hidden');
    }
}

// Fungsi untuk mengaktifkan/menonaktifkan tombol
function setButtonsDisabled(disabled) {
    generateBab1Btn.disabled = disabled;
    generateBab2Btn.disabled = disabled;
    generateBab3Btn.disabled = disabled;
    generateBab4Btn.disabled = disabled;
    copyAllBtn.disabled = disabled;
    clearAllBtn.disabled = disabled;
}

// Fungsi validasi input dasar
function validateCoreInputs() {
    const thesisTopic = thesisTopicInput.value.trim();
    const rumusanMasalah = inputRumusanMasalah.value.trim();

    if (!thesisTopic) {
        showMessageBox("Mohon masukkan Topik Skripsi.");
        return false;
    }
    if (!rumusanMasalah) {
        showMessageBox("Mohon masukkan Rumusan Masalah (BAB I - 1.2) sebagai dasar pembuatan bab.");
        return false;
    }
    return true;
}

// --- Fungsi Pembuatan BAB I ---
async function generateChapter1() {
    setButtonsDisabled(true);
    buttonTextBab1.textContent = 'Membuat BAB I...';
    outputDiv.classList.remove('hidden'); // Pastikan output terlihat
    thesisContentDiv.innerHTML = ''; // Bersihkan output sebelumnya
    copyAllBtn.style.display = 'none';
    clearAllBtn.style.display = 'none';

    const thesisTopic = thesisTopicInput.value.trim();
    if (!thesisTopic) {
        showMessageBox("Mohon masukkan Topik Skripsi sebelum membuat BAB I.");
        setButtonsDisabled(false);
        buttonTextBab1.textContent = 'Buat BAB I';
        return;
    }

    let chapter1Content = '';
    try {
        chapter1Content += '<div class="chapter-title">BAB I – PENDAHULUAN</div>\n\n';

        // 1.1 Latar Belakang
        chapter1Content += '<div class="sub-chapter-title">1.1 Latar Belakang</div>\n';
        let promptLatarBelakang = inputLatarBelakang.value.trim() ?
            `Kembangkan dan sempurnakan teks latar belakang skripsi berikut ini berdasarkan topik "${thesisTopic}":\n\n${inputLatarBelakang.value.trim()}\n\nPastikan menjelaskan alasan pentingnya topik ini diteliti, hubungkan dengan konteks hukum, isu aktual, dan urgensinya. Tulis dalam bahasa ilmiah formal, minimal 300 kata.` :
            `Buat latar belakang skripsi hukum dengan topik "${thesisTopic}". Jelaskan alasan pentingnya topik ini diteliti, hubungkan dengan konteks hukum, isu aktual, dan urgensinya. Tulis dalam bahasa ilmiah formal, minimal 300 kata.`;
        let latarBelakang = await generateContent(promptLatarBelakang, loadingSpinnerBab1, buttonTextBab1);
        if (!latarBelakang) throw new Error("Gagal membuat Latar Belakang.");
        chapter1Content += latarBelakang + '\n\n';

        // 1.2 Rumusan Masalah
        chapter1Content += '<div class="sub-chapter-title">1.2 Rumusan Masalah</div>\n';
        let promptRumusanMasalah = inputRumusanMasalah.value.trim() ?
            `Sempurnakan dan format ulang rumusan masalah skripsi berikut ini menjadi 2-3 kalimat tanya ilmiah yang menjadi fokus utama penelitian, berdasarkan topik "${thesisTopic}":\n\n${inputRumusanMasalah.value.trim()}` :
            `Buat 2-3 rumusan masalah skripsi hukum dalam bentuk kalimat tanya ilmiah yang menjadi fokus utama penelitian, berdasarkan topik "${thesisTopic}".`;
        let rumusanMasalahResult = await generateContent(promptRumusanMasalah, loadingSpinnerBab1, buttonTextBab1);
        if (!rumusanMasalahResult) throw new Error("Gagal membuat Rumusan Masalah.");
        chapter1Content += rumusanMasalahResult + '\n\n'; // Gunakan hasil dari AI

        // 1.3 Tujuan Penelitian
        chapter1Content += '<div class="sub-chapter-title">1.3 Tujuan Penelitian</div>\n';
        let promptTujuanPenelitian = inputTujuanPenelitian.value.trim() ?
            `Kembangkan tujuan penelitian skripsi berikut ini secara ringkas apa yang ingin dicapai dari penelitian ini, berdasarkan topik "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalahResult}\n\n${inputTujuanPenelitian.value.trim()}` :
            `Buat tujuan penelitian skripsi hukum secara ringkas apa yang ingin dicapai dari penelitian ini, berdasarkan topik "${thesisTopic}" dan rumusan masalah berikut:\n${rumusanMasalahResult}`;
        let tujuanPenelitian = await generateContent(promptTujuanPenelitian, loadingSpinnerBab1, buttonTextBab1);
        if (!tujuanPenelitian) throw new Error("Gagal membuat Tujuan Penelitian.");
        chapter1Content += tujuanPenelitian + '\n\n';

        // 1.4 Kontribusi Penelitian
        chapter1Content += '<div class="sub-chapter-title">1.4 Kontribusi Penelitian</div>\n';
        let promptKontribusiPenelitian = inputKontribusiPenelitian.value.trim() ?
            `Uraikan dan kembangkan kontribusi penelitian berikut ini terhadap pengembangan ilmu hukum, praktik hukum, atau kebijakan publik, berdasarkan topik "${thesisTopic}":\n\n${inputKontribusiPenelitian.value.trim()}` :
            `Uraikan kontribusi penelitian ini terhadap pengembangan ilmu hukum, praktik hukum, atau kebijakan publik, berdasarkan topik "${thesisTopic}".`;
        let kontribusiPenelitian = await generateContent(promptKontribusiPenelitian, loadingSpinnerBab1, buttonTextBab1);
        if (!kontribusiPenelitian) throw new Error("Gagal membuat Kontribusi Penelitian.");
        chapter1Content += kontribusiPenelitian + '\n\n';

        // 1.5 Orisinalitas Penelitian
        chapter1Content += '<div class="sub-chapter-title">1.5 Orisinalitas Penelitian</div>\n';
        let promptOrisinalitas = inputOrisinalitasPenelitian.value.trim() ?
            `Sempurnakan dan format ulang tabel perbandingan penelitian berikut ini, pastikan sesuai dengan topik "${thesisTopic}". Gunakan format tabel Markdown:\n| No | Nama dan bentuk penelitian | judul penelitian | persamaan | Perbedaan |\n|----|-----------------------------|----------------|-------|----------------------------------|\n\n${inputOrisinalitasPenelitian.value.trim()}` :
            `Sajikan contoh tabel perbandingan antara penelitian ini (dengan topik "${thesisTopic}") dengan minimal 3 penelitian sebelumnya. Gunakan format tabel berikut:\n| No | Nama dan bentuk penelitian | judul penelitian | persamaan | Perbedaan |\n|----|-----------------------------|----------------|-------|----------------------------------|\nIsi dengan data placeholder yang relevan dengan topik hukum.`;
        let orisinalitas = await generateContent(promptOrisinalitas, loadingSpinnerBab1, buttonTextBab1);
        if (!orisinalitas) throw new Error("Gagal membuat Orisinalitas Penelitian.");
        chapter1Content += orisinalitas + '\n\n';

        thesisContentDiv.innerHTML += chapter1Content; // Tambahkan ke output
        showMessageBox("BAB I berhasil dibuat!");

    } catch (error) {
        console.error("Terjadi kesalahan saat membuat BAB I:", error);
        showMessageBox(`Gagal membuat BAB I: ${error.message}. Mohon coba lagi.`);
    } finally {
        setButtonsDisabled(false);
        buttonTextBab1.textContent = 'Buat BAB I';
        copyAllBtn.style.display = 'inline-block';
        clearAllBtn.style.display = 'inline-block';
    }
}

// --- Fungsi Pembuatan BAB II ---
async function generateChapter2() {
    setButtonsDisabled(true);
    buttonTextBab2.textContent = 'Membuat BAB II...';
    outputDiv.classList.remove('hidden'); // Pastikan output terlihat

    if (!validateCoreInputs()) {
        setButtonsDisabled(false);
        buttonTextBab2.textContent = 'Buat BAB II';
        return;
    }

    const thesisTopic = thesisTopicInput.value.trim();
    const rumusanMasalah = inputRumusanMasalah.value.trim(); // Ambil dari input

    let chapter2Content = '';
    try {
        chapter2Content += '<div class="chapter-title">BAB II – TINJAUAN PUSTAKA</div>\n\n';

        // 2.1 Tinjauan Umum
        chapter2Content += '<div class="sub-chapter-title">2.1 Tinjauan Umum</div>\n';
        let promptTinjauanUmum = inputTinjauanUmum.value.trim() ?
            `Kembangkan dan sempurnakan teks tinjauan umum berikut ini, jelaskan konsep, teori, dan prinsip dasar yang relevan dengan topik penelitian hukum "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 400 kata.\n\n${inputTinjauanUmum.value.trim()}` :
            `Jelaskan konsep, teori, dan prinsip dasar yang relevan dengan topik penelitian hukum "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 400 kata.`;
        let tinjauanUmum = await generateContent(promptTinjauanUmum, loadingSpinnerBab2, buttonTextBab2);
        if (!tinjauanUmum) throw new Error("Gagal membuat Tinjauan Umum.");
        chapter2Content += tinjauanUmum + '\n\n';

        // User-defined sub-chapters for Chapter II
        const chapter2Subtopics = chapter2SubtopicsInput.value.trim();
        const subtopicArray = chapter2Subtopics.split(',').map(s => s.trim()).filter(s => s !== '');
        for (let i = 0; i < subtopicArray.length; i++) {
            const subtopic = subtopicArray[i];
            chapter2Content += `<div class="sub-chapter-title">2.${2 + i} ${subtopic}</div>\n`;
            let promptSubBab2 = `Bahas teori/konsep "${subtopic}" secara mendalam dan relevan dengan topik skripsi hukum "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 250 kata.`;
            let contentSubBab2 = await generateContent(promptSubBab2, loadingSpinnerBab2, buttonTextBab2);
            if (!contentSubBab2) throw new Error(`Gagal membuat sub-bab 2.${2 + i} ${subtopic}.`);
            chapter2Content += contentSubBab2 + '\n\n';
        }

        thesisContentDiv.innerHTML += chapter2Content; // Tambahkan ke output
        showMessageBox("BAB II berhasil dibuat!");

    } catch (error) {
        console.error("Terjadi kesalahan saat membuat BAB II:", error);
        showMessageBox(`Gagal membuat BAB II: ${error.message}. Mohon coba lagi.`);
    } finally {
        setButtonsDisabled(false);
        buttonTextBab2.textContent = 'Buat BAB II';
        copyAllBtn.style.display = 'inline-block';
        clearAllBtn.style.display = 'inline-block';
    }
}

// --- Fungsi Pembuatan BAB III ---
async function generateChapter3() {
    setButtonsDisabled(true);
    buttonTextBab3.textContent = 'Membuat BAB III...';
    outputDiv.classList.remove('hidden'); // Pastikan output terlihat

    if (!validateCoreInputs()) {
        setButtonsDisabled(false);
        buttonTextBab3.textContent = 'Buat BAB III';
        return;
    }

    const thesisTopic = thesisTopicInput.value.trim();
    const rumusanMasalah = inputRumusanMasalah.value.trim(); // Ambil dari input

    let chapter3Content = '';
    try {
        chapter3Content += '<div class="chapter-title">BAB III – METODE PENELITIAN</div>\n\n';

        // 3.1 Pendekatan Penelitian
        chapter3Content += '<div class="sub-chapter-title">3.1 Pendekatan Penelitian</div>\n';
        let promptPendekatan = inputPendekatanPenelitian.value.trim() ?
            `Kembangkan dan sempurnakan teks pendekatan penelitian berikut ini untuk skripsi hukum dengan topik "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nJelaskan mengapa pendekatan tersebut relevan:\n\n${inputPendekatanPenelitian.value.trim()}` :
            `Jelaskan pendekatan penelitian yang digunakan untuk skripsi hukum dengan topik "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPilih antara yuridis normatif, yuridis empiris, atau socio-legal, dan jelaskan mengapa pendekatan tersebut relevan.`;
        let pendekatanResult = await generateContent(promptPendekatan, loadingSpinnerBab3, buttonTextBab3);
        if (!pendekatanResult) throw new Error("Gagal membuat Pendekatan Penelitian.");
        chapter3Content += pendekatanResult + '\n\n';

        // 3.2 Jenis Penelitian
        chapter3Content += '<div class="sub-chapter-title">3.2 Jenis Penelitian</div>\n';
        let promptJenisPenelitian = inputJenisPenelitian.value.trim() ?
            `Kembangkan dan sempurnakan teks jenis penelitian berikut ini, uraikan apakah penelitian ini deskriptif, eksplanatif, atau preskriptif, relevan dengan topik skripsi hukum "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan pendekatan penelitian yang telah dijelaskan:\n${pendekatanResult}\n\n${inputJenisPenelitian.value.trim()}` :
            `Uraikan apakah penelitian ini deskriptif, eksplanatif, atau preskriptif, relevan dengan topik skripsi hukum "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan pendekatan penelitian yang telah dijelaskan:\n${pendekatanResult}`;
        let jenisPenelitianResult = await generateContent(promptJenisPenelitian, loadingSpinnerBab3, buttonTextBab3);
        if (!jenisPenelitianResult) throw new Error("Gagal membuat Jenis Penelitian.");
        chapter3Content += jenisPenelitianResult + '\n\n';

        // 3.3 Lokasi Penelitian
        chapter3Content += '<div class="sub-chapter-title">3.3 Lokasi Penelitian</div>\n';
        let promptLokasiPenelitian = inputLokasiPenelitian.value.trim() ?
            `Kembangkan dan sempurnakan teks lokasi penelitian berikut ini untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian:\n${jenisPenelitianResult}\n\nJika menggunakan data lapangan, sebutkan lokasinya. Jika normatif, tulis "dilakukan melalui studi pustaka".\n\n${inputLokasiPenelitian.value.trim()}` :
            `Sebutkan tempat/lokasi penelitian untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian:\n${jenisPenelitianResult}\n\nJika menggunakan data lapangan, sebutkan lokasinya. Jika normatif, tulis "dilakukan melalui studi pustaka".`;
        let lokasiPenelitian = await generateContent(promptLokasiPenelitian, loadingSpinnerBab3, buttonTextBab3);
        if (!lokasiPenelitian) throw new Error("Gagal membuat Lokasi Penelitian.");
        chapter3Content += lokasiPenelitian + '\n\n';

        // 3.4 Metode Pengumpulan Data
        chapter3Content += '<div class="sub-chapter-title">3.4 Metode Pengumpulan Data</div>\n';
        let promptMetodePengumpulanData = inputMetodePengumpulanData.value.trim() ?
            `Kembangkan dan sempurnakan teks metode pengumpulan data berikut ini seperti studi dokumen, wawancara, atau observasi, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian:\n${jenisPenelitianResult}\n\n${inputMetodePengumpulanData.value.trim()}` :
            `Jelaskan metode pengumpulan data seperti studi dokumen, wawancara, atau observasi, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian yang telah dijelaskan:\n${jenisPenelitianResult}`;
        let metodePengumpulanDataResult = await generateContent(promptMetodePengumpulanData, loadingSpinnerBab3, buttonTextBab3);
        if (!metodePengumpulanDataResult) throw new Error("Gagal membuat Metode Pengumpulan Data.");
        chapter3Content += metodePengumpulanDataResult + '\n\n';

        // 3.5 Model Analisis Data
        chapter3Content += '<div class="sub-chapter-title">3.5 Model Analisis Data</div>\n';
        let promptModelAnalisisData = inputModelAnalisisData.value.trim() ?
            `Kembangkan dan sempurnakan teks model analisis data berikut ini seperti kualitatif deskriptif, induktif-deduktif, atau metode hermeneutika hukum, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan metode pengumpulan data yang telah dijelaskan:\n${metodePengumpulanDataResult}\n\n${inputModelAnalisisData.value.trim()}` :
            `Jelaskan model analisis data seperti kualitatif deskriptif, induktif-deduktif, atau metode hermeneutika hukum, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan metode pengumpulan data yang telah dijelaskan:\n${metodePengumpulanDataResult}`;
        let modelAnalisisData = await generateContent(promptModelAnalisisData, loadingSpinnerBab3, buttonTextBab3);
        if (!modelAnalisisData) throw new Error("Gagal membuat Model Analisis Data.");
        chapter3Content += modelAnalisisData + '\n\n';

        thesisContentDiv.innerHTML += chapter3Content; // Tambahkan ke output
        showMessageBox("BAB III berhasil dibuat!");

    } catch (error) {
        console.error("Terjadi kesalahan saat membuat BAB III:", error);
        showMessageBox(`Gagal membuat BAB III: ${error.message}. Mohon coba lagi.`);
    } finally {
        setButtonsDisabled(false);
        buttonTextBab3.textContent = 'Buat BAB III';
        copyAllBtn.style.display = 'inline-block';
        clearAllBtn.style.display = 'inline-block';
    }
}

// --- Fungsi Pembuatan BAB IV ---
async function generateChapter4() {
    setButtonsDisabled(true);
    buttonTextBab4.textContent = 'Membuat BAB IV...';
    outputDiv.classList.remove('hidden'); // Pastikan output terlihat

    if (!validateCoreInputs()) {
        setButtonsDisabled(false);
        buttonTextBab4.textContent = 'Buat BAB IV';
        return;
    }

    const thesisTopic = thesisTopicInput.value.trim();
    const rumusanMasalah = inputRumusanMasalah.value.trim(); // Ambil dari input

    let chapter4Content = '';
    try {
        chapter4Content += '<div class="chapter-title">BAB IV – HASIL PENELITIAN DAN PEMBAHASAN</div>\n\n';
        let promptBab4 = `Buat isi Bab IV (Hasil Penelitian dan Pembahasan) skripsi hukum secara menyeluruh berdasarkan topik "${thesisTopic}" dan rumusan masalah berikut:\n${rumusanMasalah}\n\nBagi menjadi beberapa sub-bab yang mengalir logis, setiap sub-bab menjawab satu rumusan masalah dari Bab I. Gunakan bahasa akademik yang objektif dan sistematis. Sertakan teori yang relevan, data (jika ada), serta interpretasi hukum yang mendalam. Jika ada studi kasus, perbandingan, atau putusan pengadilan, silakan dikutip untuk memperkuat argumentasi. Pastikan panjang total Bab IV minimal 1000 kata.`;
        let bab4Content = await generateContent(promptBab4, loadingSpinnerBab4, buttonTextBab4);
        if (!bab4Content) throw new Error("Gagal membuat BAB IV.");
        chapter4Content += bab4Content + '\n\n';

        thesisContentDiv.innerHTML += chapter4Content; // Tambahkan ke output
        showMessageBox("BAB IV berhasil dibuat!");

    } catch (error) {
        console.error("Terjadi kesalahan saat membuat BAB IV:", error);
        showMessageBox(`Gagal membuat BAB IV: ${error.message}. Mohon coba lagi.`);
    } finally {
        setButtonsDisabled(false);
        buttonTextBab4.textContent = 'Buat BAB IV';
        copyAllBtn.style.display = 'inline-block';
        clearAllBtn.style.display = 'inline-block';
    }
}

// --- Event Listeners untuk Tombol ---
generateBab1Btn.addEventListener('click', generateChapter1);
generateBab2Btn.addEventListener('click', generateChapter2);
generateBab3Btn.addEventListener('click', generateChapter3);
generateBab4Btn.addEventListener('click', generateChapter4);

copyAllBtn.addEventListener('click', () => {
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

clearAllBtn.addEventListener('click', () => {
    thesisContentDiv.innerHTML = '';
    outputDiv.classList.add('hidden');
    copyAllBtn.style.display = 'none';
    clearAllBtn.style.display = 'none';
    // Bersihkan semua input textarea juga
    inputLatarBelakang.value = '';
    inputRumusanMasalah.value = '';
    inputTujuanPenelitian.value = '';
    inputKontribusiPenelitian.value = '';
    inputOrisinalitasPenelitian.value = '';
    inputTinjauanUmum.value = '';
    inputPendekatanPenelitian.value = '';
    inputJenisPenelitian.value = '';
    inputLokasiPenelitian.value = '';
    inputMetodePengumpulanData.value = '';
    inputModelAnalisisData.value = '';
    thesisTopicInput.value = '';
    chapter2SubtopicsInput.value = '';

    showMessageBox("Output skripsi dan semua input telah dibersihkan.");
});
