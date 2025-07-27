// public/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // State aplikasi untuk menyimpan semua data
    const appState = {
        topic: '',
        problem: '',
        generated: {
            bab1: '',
            bab2: '',
            bab3: '',
            bab4: '',
        },
        currentView: 'form-home'
    };

    // Cache elemen DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const formSections = document.querySelectorAll('.form-section');
    const thesisContentEl = document.getElementById('thesisContent');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    // Fungsi untuk mengubah tampilan form
    const switchView = (targetId) => {
        formSections.forEach(section => section.classList.add('hidden'));
        
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            }
        });

        appState.currentView = targetId;
    };
    
    // Event listener untuk link navigasi
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.dataset.target;
            switchView(targetId);
        });
    });

    // Fungsi untuk memperbarui pratinjau dan tombol
    const updatePreview = () => {
        let fullText = '';
        let hasContent = false;
        const chapters = ['bab1', 'bab2', 'bab3', 'bab4'];

        // Menggunakan preformatted text untuk menjaga format dari AI
        const renderChapter = (title, content) => `<h2>${title}</h2><pre>${content}</pre>`;

        if(appState.generated.bab1) {
            fullText += renderChapter('BAB I PENDAHULUAN', appState.generated.bab1);
            hasContent = true;
        }
        if(appState.generated.bab2) {
            fullText += renderChapter('BAB II TINJAUAN PUSTAKA', appState.generated.bab2);
            hasContent = true;
        }
        if(appState.generated.bab3) {
            fullText += renderChapter('BAB III METODE PENELITIAN', appState.generated.bab3);
            hasContent = true;
        }
        if(appState.generated.bab4) {
            fullText += renderChapter('BAB IV HASIL DAN PEMBAHASAN', appState.generated.bab4);
            hasContent = true;
        }

        if(hasContent) {
            thesisContentEl.innerHTML = fullText.replace(/<h2>/g, '<h2 class="chapter-title">'); // Menambahkan style pada judul bab
            copyAllBtn.style.display = 'block';
            clearAllBtn.style.display = 'block';
        } else {
            thesisContentEl.innerHTML = `<p class="text-gray-500">Draf yang Anda buat akan muncul di sini...</p>`;
            copyAllBtn.style.display = 'none';
            clearAllBtn.style.display = 'none';
        }
    };
    
    // Fungsi utama untuk memanggil API
    async function generateChapter(chapter, button) {
        const originalButtonText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<div class="loading-spinner"></div><span>Membuat draf...</span>`;

        appState.topic = document.getElementById('mainThesisTopic').value;
        appState.problem = document.getElementById('mainRumusanMasalah').value;
        
        if (!appState.topic || !appState.problem) {
            alert('Harap isi Topik Skripsi dan Rumusan Masalah Utama pada halaman "Informasi Utama" terlebih dahulu.');
            button.disabled = false;
            button.innerHTML = originalButtonText;
            switchView('form-home'); // Arahkan pengguna ke form utama
            return;
        }

        const payload = {
            topic: appState.topic,
            problem: appState.problem,
            chapter: chapter,
            // Mengumpulkan data opsional dari setiap form
            details: {}
        };
        
        if (chapter === 'bab1') {
            payload.details.latarBelakang = document.getElementById('formLatarBelakang').value;
            payload.details.tujuanPenelitian = document.getElementById('formTujuanPenelitian').value;
        } else if (chapter === 'bab2') {
            payload.details.subtopics = document.getElementById('mainChapter2Subtopics').value;
        } else if (chapter === 'bab3') {
            payload.details.pendekatan = document.getElementById('formPendekatanPenelitian').value;
            payload.details.jenis = document.getElementById('formJenisPenelitian').value;
            payload.details.metodePengumpulanData = document.getElementById('formMetodePengumpulanData').value;
        }

        try {
            const response = await fetch('/.netlify/functions/generate-thesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            appState.generated[chapter] = data.text;
            updatePreview();
            
            // Tandai navigasi sebagai selesai
            document.querySelector(`.nav-link[data-target="form-${chapter}"]`).classList.add('completed');

        } catch (error) {
            console.error('Error generating chapter:', error);
            alert(`Gagal membuat draf: ${error.message}`);
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }
    
    // Event listener untuk tombol "Salin" dan "Bersihkan"
    copyAllBtn.addEventListener('click', () => {
        const fullText = thesisContentEl.innerText;
        navigator.clipboard.writeText(fullText).then(() => {
            alert('Seluruh draf skripsi berhasil disalin ke clipboard!');
        }).catch(err => {
            alert('Gagal menyalin teks.');
        });
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua draf yang telah dibuat?')) {
            appState.generated = { bab1: '', bab2: '', bab3: '', bab4: '' };
            navLinks.forEach(link => link.classList.remove('completed'));
            updatePreview();
        }
    });

    // Menghubungkan semua tombol "Buat Draf"
    document.getElementById('generateBab1Btn').addEventListener('click', (e) => generateChapter('bab1', e.currentTarget));
    document.getElementById('generateBab2Btn').addEventListener('click', (e) => generateChapter('bab2', e.currentTarget));
    document.getElementById('generateBab3Btn').addEventListener('click', (e) => generateChapter('bab3', e.currentTarget));
    document.getElementById('generateBab4Btn').addEventListener('click', (e) => generateChapter('bab4', e.currentTarget));
    
    // Inisialisasi
    switchView('form-home');
});
