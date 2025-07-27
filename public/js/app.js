// public/js/app.js

// --- Fungsi Umum ---
function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerHTML = `
        <p>${message}</p>
        <button onclick="this.parentNode.remove()">OK</button>
    `;
    document.body.appendChild(messageBox);
}

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

// --- Logika untuk index.html ---
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const mainThesisTopicInput = document.getElementById('mainThesisTopic');
    const mainRumusanMasalahInput = document.getElementById('mainRumusanMasalah');
    const mainChapter2SubtopicsInput = document.getElementById('mainChapter2Subtopics');

    const openBab1FormBtn = document.getElementById('openBab1FormBtn');
    const openBab2FormBtn = document.getElementById('openBab2FormBtn');
    const openBab3FormBtn = document.getElementById('openBab3FormBtn');
    const openBab4FormBtn = document.getElementById('openBab4FormBtn');

    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const outputDiv = document.getElementById('output');
    const thesisContentDiv = document.getElementById('thesisContent');

    // Load saved data from localStorage on page load
    const savedThesisTopic = localStorage.getItem('thesisTopic');
    const savedRumusanMasalah = localStorage.getItem('rumusanMasalah');
    const savedChapter2Subtopics = localStorage.getItem('chapter2Subtopics');

    if (savedThesisTopic) mainThesisTopicInput.value = savedThesisTopic;
    if (savedRumusanMasalah) mainRumusanMasalahInput.value = savedRumusanMasalah;
    if (savedChapter2Subtopics) mainChapter2SubtopicsInput.value = savedChapter2Subtopics;

    // Display generated chapters
    const displayGeneratedContent = () => {
        let fullContent = '';
        const chapter1 = localStorage.getItem('chapter1Content');
        const chapter2 = localStorage.getItem('chapter2Content');
        const chapter3 = localStorage.getItem('chapter3Content');
        const chapter4 = localStorage.getItem('chapter4Content');

        if (chapter1) fullContent += chapter1;
        if (chapter2) fullContent += chapter2;
        if (chapter3) fullContent += chapter3;
        if (chapter4) fullContent += chapter4;

        if (fullContent) {
            thesisContentDiv.innerHTML = fullContent;
            outputDiv.classList.remove('hidden');
            copyAllBtn.style.display = 'inline-block';
            clearAllBtn.style.display = 'inline-block';
        } else {
            outputDiv.classList.add('hidden');
            copyAllBtn.style.display = 'none';
            clearAllBtn.style.display = 'none';
        }
    };

    displayGeneratedContent();

    // Save main inputs to localStorage when they change
    mainThesisTopicInput.addEventListener('input', () => {
        localStorage.setItem('thesisTopic', mainThesisTopicInput.value.trim());
    });
    mainRumusanMasalahInput.addEventListener('input', () => {
        localStorage.setItem('rumusanMasalah', mainRumusanMasalahInput.value.trim());
    });
    mainChapter2SubtopicsInput.addEventListener('input', () => {
        localStorage.setItem('chapter2Subtopics', mainChapter2SubtopicsInput.value.trim());
    });


    // Event Listeners for opening chapter forms
    openBab1FormBtn.addEventListener('click', () => {
        const thesisTopic = mainThesisTopicInput.value.trim();
        const rumusanMasalah = mainRumusanMasalahInput.value.trim();
        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon isi Topik Skripsi dan Rumusan Masalah Utama terlebih dahulu.");
            return;
        }
        localStorage.setItem('thesisTopic', thesisTopic);
        localStorage.setItem('rumusanMasalah', rumusanMasalah);
        window.location.href = 'forms/bab1.html';
    });

    openBab2FormBtn.addEventListener('click', () => {
        const thesisTopic = mainThesisTopicInput.value.trim();
        const rumusanMasalah = mainRumusanMasalahInput.value.trim();
        const chapter2Subtopics = mainChapter2SubtopicsInput.value.trim();
        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon isi Topik Skripsi dan Rumusan Masalah Utama terlebih dahulu.");
            return;
        }
        localStorage.setItem('thesisTopic', thesisTopic);
        localStorage.setItem('rumusanMasalah', rumusanMasalah);
        localStorage.setItem('chapter2Subtopics', chapter2Subtopics); // Simpan juga sub-bab tambahan
        window.location.href = 'forms/bab2.html';
    });

    openBab3FormBtn.addEventListener('click', () => {
        const thesisTopic = mainThesisTopicInput.value.trim();
        const rumusanMasalah = mainRumusanMasalahInput.value.trim();
        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon isi Topik Skripsi dan Rumusan Masalah Utama terlebih dahulu.");
            return;
        }
        localStorage.setItem('thesisTopic', thesisTopic);
        localStorage.setItem('rumusanMasalah', rumusanMasalah);
        window.location.href = 'forms/bab3.html';
    });

    openBab4FormBtn.addEventListener('click', () => {
        const thesisTopic = mainThesisTopicInput.value.trim();
        const rumusanMasalah = mainRumusanMasalahInput.value.trim();
        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon isi Topik Skripsi dan Rumusan Masalah Utama terlebih dahulu.");
            return;
        }
        localStorage.setItem('thesisTopic', thesisTopic);
        localStorage.setItem('rumusanMasalah', rumusanMasalah);
        window.location.href = 'forms/bab4.html';
    });

    copyAllBtn.addEventListener('click', () => {
        const range = document.createRange();
        range.selectNode(thesisContentDiv);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'Berhasil disalin!' : 'Gagal menyalin!';
            showMessageBox(msg);
        } catch (err) {
            console.error('Gagal menyalin:', err);
            showMessageBox('Gagal menyalin teks ke clipboard.');
        }
        window.getSelection().removeAllRanges();
    });

    clearAllBtn.addEventListener('click', () => {
        localStorage.removeItem('thesisTopic');
        localStorage.removeItem('rumusanMasalah');
        localStorage.removeItem('chapter2Subtopics');
        localStorage.removeItem('chapter1Content');
        localStorage.removeItem('chapter2Content');
        localStorage.removeItem('chapter3Content');
        localStorage.removeItem('chapter4Content');
        displayGeneratedContent(); // Update UI
        mainThesisTopicInput.value = '';
        mainRumusanMasalahInput.value = '';
        mainChapter2SubtopicsInput.value = '';
        showMessageBox("Output skripsi dan semua input telah dibersihkan.");
    });

}
// --- Logika untuk forms/bab1.html ---
else if (window.location.pathname.includes('/forms/bab1.html')) {
    const formThesisTopic = document.getElementById('formThesisTopic');
    const formRumusanMasalah = document.getElementById('formRumusanMasalah');
    const formLatarBelakang = document.getElementById('formLatarBelakang');
    const formTujuanPenelitian = document.getElementById('formTujuanPenelitian');
    const formKontribusiPenelitian = document.getElementById('formKontribusiPenelitian');
    const formOrisinalitasPenelitian = document.getElementById('formOrisinalitasPenelitian');
    const generateBabBtn = document.getElementById('generateBabBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const buttonText = document.getElementById('buttonText');
    const backToHomeBtn = document.getElementById('backToHomeBtn');

    // Prefill from localStorage
    formThesisTopic.value = localStorage.getItem('thesisTopic') || '';
    formRumusanMasalah.value = localStorage.getItem('rumusanMasalah') || '';

    generateBabBtn.addEventListener('click', async () => {
        const thesisTopic = formThesisTopic.value.trim();
        const rumusanMasalah = formRumusanMasalah.value.trim();

        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon masukkan Topik Skripsi dan Rumusan Masalah.");
            return;
        }

        generateBabBtn.disabled = true;
        buttonText.textContent = 'Membuat BAB I...';

        let chapter1Content = '';
        try {
            chapter1Content += '<div class="chapter-title">BAB I – PENDAHULUAN</div>\n\n';

            // 1.1 Latar Belakang
            chapter1Content += '<div class="sub-chapter-title">1.1 Latar Belakang</div>\n';
            let promptLatarBelakang = formLatarBelakang.value.trim() ?
                `Kembangkan dan sempurnakan teks latar belakang skripsi berikut ini berdasarkan topik "${thesisTopic}":\n\n${formLatarBelakang.value.trim()}\n\nPastikan menjelaskan alasan pentingnya topik ini diteliti, hubungkan dengan konteks hukum, isu aktual, dan urgensinya. Tulis dalam bahasa ilmiah formal, minimal 300 kata.` :
                `Buat latar belakang skripsi hukum dengan topik "${thesisTopic}". Jelaskan alasan pentingnya topik ini diteliti, hubungkan dengan konteks hukum, isu aktual, dan urgensinya. Tulis dalam bahasa ilmiah formal, minimal 300 kata.`;
            let latarBelakang = await generateContent(promptLatarBelakang, loadingSpinner, buttonText);
            if (!latarBelakang) throw new Error("Gagal membuat Latar Belakang.");
            chapter1Content += latarBelakang + '\n\n';

            // 1.2 Rumusan Masalah
            chapter1Content += '<div class="sub-chapter-title">1.2 Rumusan Masalah</div>\n';
            chapter1Content += rumusanMasalah + '\n\n'; // Gunakan rumusan masalah dari form

            // 1.3 Tujuan Penelitian
            chapter1Content += '<div class="sub-chapter-title">1.3 Tujuan Penelitian</div>\n';
            let promptTujuanPenelitian = formTujuanPenelitian.value.trim() ?
                `Kembangkan tujuan penelitian skripsi berikut ini secara ringkas apa yang ingin dicapai dari penelitian ini, berdasarkan topik "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\n${formTujuanPenelitian.value.trim()}` :
                `Buat tujuan penelitian skripsi hukum secara ringkas apa yang ingin dicapai dari penelitian ini, berdasarkan topik "${thesisTopic}" dan rumusan masalah berikut:\n${rumusanMasalah}`;
            let tujuanPenelitian = await generateContent(promptTujuanPenelitian, loadingSpinner, buttonText);
            if (!tujuanPenelitian) throw new Error("Gagal membuat Tujuan Penelitian.");
            chapter1Content += tujuanPenelitian + '\n\n';

            // 1.4 Kontribusi Penelitian
            chapter1Content += '<div class="sub-chapter-title">1.4 Kontribusi Penelitian</div>\n';
            let promptKontribusiPenelitian = formKontribusiPenelitian.value.trim() ?
                `Uraikan dan kembangkan kontribusi penelitian berikut ini terhadap pengembangan ilmu hukum, praktik hukum, atau kebijakan publik, berdasarkan topik "${thesisTopic}":\n\n${formKontribusiPenelitian.value.trim()}` :
                `Uraikan kontribusi penelitian ini terhadap pengembangan ilmu hukum, praktik hukum, atau kebijakan publik, berdasarkan topik "${thesisTopic}".`;
            let kontribusiPenelitian = await generateContent(promptKontribusiPenelitian, loadingSpinner, buttonText);
            if (!kontribusiPenelitian) throw new Error("Gagal membuat Kontribusi Penelitian.");
            chapter1Content += kontribusiPenelitian + '\n\n';

            // 1.5 Orisinalitas Penelitian
            chapter1Content += '<div class="sub-chapter-title">1.5 Orisinalitas Penelitian</div>\n';
            let promptOrisinalitas = formOrisinalitasPenelitian.value.trim() ?
                `Sempurnakan dan format ulang tabel perbandingan penelitian berikut ini, pastikan sesuai dengan topik "${thesisTopic}". Gunakan format tabel Markdown:\n| No | Nama dan bentuk penelitian | judul penelitian | persamaan | Perbedaan |\n|----|-----------------------------|----------------|-------|----------------------------------|\n\n${formOrisinalitasPenelitian.value.trim()}` :
                `Sajikan contoh tabel perbandingan antara penelitian ini (dengan topik "${thesisTopic}") dengan minimal 3 penelitian sebelumnya. Gunakan format tabel berikut:\n| No | Nama dan bentuk penelitian | judul penelitian | persamaan | Perbedaan |\n|----|-----------------------------|----------------|-------|----------------------------------|\nIsi dengan data placeholder yang relevan dengan topik hukum.`;
            let orisinalitas = await generateContent(promptOrisinalitas, loadingSpinner, buttonText);
            if (!orisinalitas) throw new Error("Gagal membuat Orisinalitas Penelitian.");
            chapter1Content += orisinalitas + '\n\n';

            localStorage.setItem('chapter1Content', chapter1Content); // Save to localStorage
            showMessageBox("BAB I berhasil dibuat!");
            window.location.href = '../index.html'; // Redirect back to home
        } catch (error) {
            console.error("Terjadi kesalahan saat membuat BAB I:", error);
            showMessageBox(`Gagal membuat BAB I: ${error.message}. Mohon coba lagi.`);
        } finally {
            generateBabBtn.disabled = false;
            buttonText.textContent = 'Buat BAB I';
        }
    });

    backToHomeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}
// --- Logika untuk forms/bab2.html ---
else if (window.location.pathname.includes('/forms/bab2.html')) {
    const formThesisTopic = document.getElementById('formThesisTopic');
    const formRumusanMasalah = document.getElementById('formRumusanMasalah');
    const formTinjauanUmum = document.getElementById('formTinjauanUmum');
    const formSubBab2_2 = document.getElementById('formSubBab2_2');
    const formSubBab2_3 = document.getElementById('formSubBab2_3');
    const formSubBab2_4 = document.getElementById('formSubBab2_4');
    const formSubBab2_5 = document.getElementById('formSubBab2_5');
    const generateBabBtn = document.getElementById('generateBabBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const buttonText = document.getElementById('buttonText');
    const backToHomeBtn = document.getElementById('backToHomeBtn');

    // Prefill from localStorage
    formThesisTopic.value = localStorage.getItem('thesisTopic') || '';
    formRumusanMasalah.value = localStorage.getItem('rumusanMasalah') || '';
    // Prefill sub-bab tambahan dari main page
    const mainChapter2Subtopics = localStorage.getItem('chapter2Subtopics') || '';
    const subtopicArrayFromMain = mainChapter2Subtopics.split(',').map(s => s.trim()).filter(s => s !== '');
    if (subtopicArrayFromMain[0]) formSubBab2_2.value = subtopicArrayFromMain[0];
    if (subtopicArrayFromMain[1]) formSubBab2_3.value = subtopicArrayFromMain[1];
    if (subtopicArrayFromMain[2]) formSubBab2_4.value = subtopicArrayFromMain[2];
    if (subtopicArrayFromMain[3]) formSubBab2_5.value = subtopicArrayFromMain[3];


    generateBabBtn.addEventListener('click', async () => {
        const thesisTopic = formThesisTopic.value.trim();
        const rumusanMasalah = formRumusanMasalah.value.trim();

        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon masukkan Topik Skripsi dan Rumusan Masalah.");
            return;
        }

        generateBabBtn.disabled = true;
        buttonText.textContent = 'Membuat BAB II...';

        let chapter2Content = '';
        try {
            chapter2Content += '<div class="chapter-title">BAB II – TINJAUAN PUSTAKA</div>\n\n';

            // 2.1 Tinjauan Umum
            chapter2Content += '<div class="sub-chapter-title">2.1 Tinjauan Umum</div>\n';
            let promptTinjauanUmum = formTinjauanUmum.value.trim() ?
                `Kembangkan dan sempurnakan teks tinjauan umum berikut ini, jelaskan konsep, teori, dan prinsip dasar yang relevan dengan topik penelitian hukum "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 400 kata.\n\n${formTinjauanUmum.value.trim()}` :
                `Jelaskan konsep, teori, dan prinsip dasar yang relevan dengan topik penelitian hukum "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 400 kata.`;
            let tinjauanUmum = await generateContent(promptTinjauanUmum, loadingSpinner, buttonText);
            if (!tinjauanUmum) throw new Error("Gagal membuat Tinjauan Umum.");
            chapter2Content += tinjauanUmum + '\n\n';

            // Sub-bab 2.2, 2.3, 2.4, 2.5
            const subBabInputs = [
                { id: formSubBab2_2, title: "2.2" },
                { id: formSubBab2_3, title: "2.3" },
                { id: formSubBab2_4, title: "2.4" },
                { id: formSubBab2_5, title: "2.5" }
            ];

            for (let i = 0; i < subBabInputs.length; i++) {
                const inputElement = subBabInputs[i].id;
                const subBabNumber = subBabInputs[i].title; // e.g., "2.2"
                const subBabContent = inputElement.value.trim();

                if (subBabContent) {
                    chapter2Content += `<div class="sub-chapter-title">${subBabNumber} ${subBabContent.split('\n')[0]}</div>\n`; // Ambil baris pertama sebagai judul
                    let promptSubBab = `Bahas teori/konsep "${subBabContent}" secara mendalam dan relevan dengan topik skripsi hukum "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPastikan semua pustaka berasal dari sumber ilmiah hukum seperti jurnal, buku, peraturan, dan putusan. Tulis minimal 250 kata.`;
                    let generatedSubBab = await generateContent(promptSubBab, loadingSpinner, buttonText);
                    if (!generatedSubBab) throw new Error(`Gagal membuat sub-bab ${subBabNumber}.`);
                    chapter2Content += generatedSubBab + '\n\n';
                }
            }

            localStorage.setItem('chapter2Content', chapter2Content);
            showMessageBox("BAB II berhasil dibuat!");
            window.location.href = '../index.html';
        } catch (error) {
            console.error("Terjadi kesalahan saat membuat BAB II:", error);
            showMessageBox(`Gagal membuat BAB II: ${error.message}. Mohon coba lagi.`);
        } finally {
            generateBabBtn.disabled = false;
            buttonText.textContent = 'Buat BAB II';
        }
    });

    backToHomeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}
// --- Logika untuk forms/bab3.html ---
else if (window.location.pathname.includes('/forms/bab3.html')) {
    const formThesisTopic = document.getElementById('formThesisTopic');
    const formRumusanMasalah = document.getElementById('formRumusanMasalah');
    const formPendekatanPenelitian = document.getElementById('formPendekatanPenelitian');
    const formJenisPenelitian = document.getElementById('formJenisPenelitian');
    const formLokasiPenelitian = document.getElementById('formLokasiPenelitian');
    const formMetodePengumpulanData = document.getElementById('formMetodePengumpulanData');
    const formModelAnalisisData = document.getElementById('formModelAnalisisData');
    const generateBabBtn = document.getElementById('generateBabBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const buttonText = document.getElementById('buttonText');
    const backToHomeBtn = document.getElementById('backToHomeBtn');

    // Prefill from localStorage
    formThesisTopic.value = localStorage.getItem('thesisTopic') || '';
    formRumusanMasalah.value = localStorage.getItem('rumusanMasalah') || '';

    generateBabBtn.addEventListener('click', async () => {
        const thesisTopic = formThesisTopic.value.trim();
        const rumusanMasalah = formRumusanMasalah.value.trim();

        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon masukkan Topik Skripsi dan Rumusan Masalah.");
            return;
        }

        generateBabBtn.disabled = true;
        buttonText.textContent = 'Membuat BAB III...';

        let chapter3Content = '';
        try {
            chapter3Content += '<div class="chapter-title">BAB III – METODE PENELITIAN</div>\n\n';

            // 3.1 Pendekatan Penelitian
            chapter3Content += '<div class="sub-chapter-title">3.1 Pendekatan Penelitian</div>\n';
            let promptPendekatan = formPendekatanPenelitian.value.trim() ?
                `Kembangkan dan sempurnakan teks pendekatan penelitian berikut ini untuk skripsi hukum dengan topik "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nJelaskan mengapa pendekatan tersebut relevan:\n\n${formPendekatanPenelitian.value.trim()}` :
                `Jelaskan pendekatan penelitian yang digunakan untuk skripsi hukum dengan topik "${thesisTopic}" dan rumusan masalah:\n${rumusanMasalah}\n\nPilih antara yuridis normatif, yuridis empiris, atau socio-legal, dan jelaskan mengapa pendekatan tersebut relevan.`;
            let pendekatanResult = await generateContent(promptPendekatan, loadingSpinner, buttonText);
            if (!pendekatanResult) throw new Error("Gagal membuat Pendekatan Penelitian.");
            chapter3Content += pendekatanResult + '\n\n';

            // 3.2 Jenis Penelitian
            chapter3Content += '<div class="sub-chapter-title">3.2 Jenis Penelitian</div>\n';
            let promptJenisPenelitian = formJenisPenelitian.value.trim() ?
                `Kembangkan dan sempurnakan teks jenis penelitian berikut ini, uraikan apakah penelitian ini deskriptif, eksplanatif, atau preskriptif, relevan dengan topik skripsi hukum "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan pendekatan penelitian yang telah dijelaskan:\n${pendekatanResult}\n\n${formJenisPenelitian.value.trim()}` :
                `Uraikan apakah penelitian ini deskriptif, eksplanatif, atau preskriptif, relevan dengan topik skripsi hukum "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan pendekatan penelitian yang telah dijelaskan:\n${pendekatanResult}`;
            let jenisPenelitianResult = await generateContent(promptJenisPenelitian, loadingSpinner, buttonText);
            if (!jenisPenelitianResult) throw new Error("Gagal membuat Jenis Penelitian.");
            chapter3Content += jenisPenelitianResult + '\n\n';

            // 3.3 Lokasi Penelitian
            chapter3Content += '<div class="sub-chapter-title">3.3 Lokasi Penelitian</div>\n';
            let promptLokasiPenelitian = formLokasiPenelitian.value.trim() ?
                `Kembangkan dan sempurnakan teks lokasi penelitian berikut ini untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian:\n${jenisPenelitianResult}\n\nJika menggunakan data lapangan, sebutkan lokasinya. Jika normatif, tulis "dilakukan melalui studi pustaka".\n\n${formLokasiPenelitian.value.trim()}` :
                `Sebutkan tempat/lokasi penelitian untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian:\n${jenisPenelitianResult}\n\nJika menggunakan data lapangan, sebutkan lokasinya. Jika normatif, tulis "dilakukan melalui studi pustaka".`;
            let lokasiPenelitian = await generateContent(promptLokasiPenelitian, loadingSpinner, buttonText);
            if (!lokasiPenelitian) throw new Error("Gagal membuat Lokasi Penelitian.");
            chapter3Content += lokasiPenelitian + '\n\n';

            // 3.4 Metode Pengumpulan Data
            chapter3Content += '<div class="sub-chapter-title">3.4 Metode Pengumpulan Data</div>\n';
            let promptMetodePengumpulanData = formMetodePengumpulanData.value.trim() ?
                `Kembangkan dan sempurnakan teks metode pengumpulan data berikut ini seperti studi dokumen, wawancara, atau observasi, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian:\n${jenisPenelitianResult}\n\n${formMetodePengumpulanData.value.trim()}` :
                `Jelaskan metode pengumpulan data seperti studi dokumen, wawancara, atau observasi, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan jenis penelitian yang telah dijelaskan:\n${jenisPenelitianResult}`;
            let metodePengumpulanDataResult = await generateContent(promptMetodePengumpulanData, loadingSpinner, buttonText);
            if (!metodePengumpulanDataResult) throw new Error("Gagal membuat Metode Pengumpulan Data.");
            chapter3Content += metodePengumpulanDataResult + '\n\n';

            // 3.5 Model Analisis Data
            chapter3Content += '<div class="sub-chapter-title">3.5 Model Analisis Data</div>\n';
            let promptModelAnalisisData = formModelAnalisisData.value.trim() ?
                `Kembangkan dan sempurnakan teks model analisis data berikut ini seperti kualitatif deskriptif, induktif-deduktif, atau metode hermeneutika hukum, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan metode pengumpulan data yang telah dijelaskan:\n${metodePengumpulanDataResult}\n\n${formModelAnalisisData.value.trim()}` :
                `Jelaskan model analisis data seperti kualitatif deskriptif, induktif-deduktif, atau metode hermeneutika hukum, yang relevan untuk skripsi hukum dengan topik "${thesisTopic}", rumusan masalah:\n${rumusanMasalah}\n dan metode pengumpulan data yang telah dijelaskan:\n${metodePengumpulanDataResult}`;
            let modelAnalisisData = await generateContent(promptModelAnalisisData, loadingSpinner, buttonText);
            if (!modelAnalisisData) throw new Error("Gagal membuat Model Analisis Data.");
            chapter3Content += modelAnalisisData + '\n\n';

            localStorage.setItem('chapter3Content', chapter3Content);
            showMessageBox("BAB III berhasil dibuat!");
            window.location.href = '../index.html';
        } catch (error) {
            console.error("Terjadi kesalahan saat membuat BAB III:", error);
            showMessageBox(`Gagal membuat BAB III: ${error.message}. Mohon coba lagi.`);
        } finally {
            generateBabBtn.disabled = false;
            buttonText.textContent = 'Buat BAB III';
        }
    });

    backToHomeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}
// --- Logika untuk forms/bab4.html ---
else if (window.location.pathname.includes('/forms/bab4.html')) {
    const formThesisTopic = document.getElementById('formThesisTopic');
    const formRumusanMasalah = document.getElementById('formRumusanMasalah');
    const generateBabBtn = document.getElementById('generateBabBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const buttonText = document.getElementById('buttonText');
    const backToHomeBtn = document.getElementById('backToHomeBtn');

    // Prefill from localStorage
    formThesisTopic.value = localStorage.getItem('thesisTopic') || '';
    formRumusanMasalah.value = localStorage.getItem('rumusanMasalah') || '';

    generateBabBtn.addEventListener('click', async () => {
        const thesisTopic = formThesisTopic.value.trim();
        const rumusanMasalah = formRumusanMasalah.value.trim();

        if (!thesisTopic || !rumusanMasalah) {
            showMessageBox("Mohon masukkan Topik Skripsi dan Rumusan Masalah.");
            return;
        }

        generateBabBtn.disabled = true;
        buttonText.textContent = 'Membuat BAB IV...';

        let chapter4Content = '';
        try {
            chapter4Content += '<div class="chapter-title">BAB IV – HASIL PENELITIAN DAN PEMBAHASAN</div>\n\n';
            let promptBab4 = `Buat isi Bab IV (Hasil Penelitian dan Pembahasan) skripsi hukum secara menyeluruh berdasarkan topik "${thesisTopic}" dan rumusan masalah berikut:\n${rumusanMasalah}\n\nBagi menjadi beberapa sub-bab yang mengalir logis, setiap sub-bab menjawab satu rumusan masalah dari Bab I. Gunakan bahasa akademik yang objektif dan sistematis. Sertakan teori yang relevan, data (jika ada), serta interpretasi hukum yang mendalam. Jika ada studi kasus, perbandingan, atau putusan pengadilan, silakan dikutip untuk memperkuat argumentasi. Pastikan panjang total Bab IV minimal 1000 kata.`;
            let bab4Content = await generateContent(promptBab4, loadingSpinner, buttonText);
            if (!bab4Content) throw new Error("Gagal membuat BAB IV.");
            chapter4Content += bab4Content + '\n\n';

            localStorage.setItem('chapter4Content', chapter4Content);
            showMessageBox("BAB IV berhasil dibuat!");
            window.location.href = '../index.html';
        } catch (error) {
            console.error("Terjadi kesalahan saat membuat BAB IV:", error);
            showMessageBox(`Gagal membuat BAB IV: ${error.message}. Mohon coba lagi.`);
        } finally {
            generateBabBtn.disabled = false;
            buttonText.textContent = 'Buat BAB IV';
        }
    });

    backToHomeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}
