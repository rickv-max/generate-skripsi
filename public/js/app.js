// public/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // BAGIAN 1: State Aplikasi & Cache Elemen DOM
    // =================================================
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

    // Cache elemen DOM utama
    const navLinks = document.querySelectorAll('.nav-link');
    const formSections = document.querySelectorAll('.form-section');
    const thesisContentEl = document.getElementById('thesisContent');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Cache elemen DOM untuk menu mobile
    const sidebar = document.getElementById('sidebar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // =================================================
    // BAGIAN 2: Logika untuk Menu Mobile Responsif
    // =================================================
    const toggleMenu = () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
        sidebarOverlay.classList.toggle('hidden');
        menuOpenIcon.classList.toggle('hidden');
        menuCloseIcon.classList.toggle('hidden');
    };

    mobileMenuButton.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);

    // =================================================
    // BAGIAN 3: Fungsi Inti Aplikasi
    // =================================================

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

        if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
            toggleMenu();
        }
    };

    const updatePreview = () => {
        let fullText = '';
        let hasContent = false;
        
        const renderChapter = (title, content) => `<h2>${title}</h2><pre class="whitespace-pre-wrap break-words">${content}</pre>`;

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
            thesisContentEl.innerHTML = fullText.replace(/<h2>/g, '<h2 class="chapter-title">');
            copyAllBtn.style.display = 'block';
            clearAllBtn.style.display = 'block';
        } else {
            thesisContentEl.innerHTML = `<p class="text-gray-500">Draf yang Anda buat akan muncul di sini...</p>`;
            copyAllBtn.style.display = 'none';
            clearAllBtn.style.display = 'none';
        }
    };

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
            switchView('form-home');
            return;
        }

        const payload = {
            topic: appState.topic,
            problem: appState.problem,
            chapter: chapter,
            details: {}
        };
        
        // Mengisi detail untuk setiap bab
        if (chapter === 'bab1') {
            payload.details.latarBelakang = document.getElementById('formLatarBelakang').value;
            payload.details.tujuanPenelitian = document.getElementById('formTujuanPenelitian').value;
        } else if (chapter === 'bab2') {
            payload.details.subtopics = document.getElementById('mainChapter2Subtopics').value;
        } else if (chapter === 'bab3') {
            payload.details.pendekatan = document.getElementById('formPendekatanPenelitian').value;
            payload.details.jenis = document.getElementById('formJenisPenelitian').value;
            payload.details.lokasi = document.getElementById('formLokasiPenelitian').value; 
            payload.details.metodePengumpulanData = document.getElementById('formMetodePengumpulanData').value;
            payload.details.modelAnalisis = document.getElementById('formModelAnalisisData').value;
        }

        try {
            const response = await fetch('/.netlify/functions/generate-thesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            // Ini adalah baris penting untuk debugging di browser
            console.log("Data berhasil diterima dari backend:", data);

            if (!response.ok) {
                // Jika server mengembalikan error, tampilkan pesan error dari server
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            // Pastikan data yang diterima memiliki properti 'text'
            if (data.text) {
                appState.generated[chapter] = data.text;
                updatePreview();
                document.querySelector(`.nav-link[data-target="form-${chapter}"]`).classList.add('completed');
            } else {
                // Jika tidak ada 'text', berarti ada masalah meskipun status OK
                throw new Error("Respons dari server tidak berisi teks yang diharapkan.");
            }

        } catch (error) {
            console.error('Error di dalam fungsi generateChapter (frontend):', error);
            alert(`Gagal memproses draf: ${error.message}`);
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }

    // =================================================
    // BAGIAN 4: Event Listeners
    // =================================================

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.currentTarget.dataset.target);
        });
    });

    copyAllBtn.addEventListener('click', () => {
        const fullText = thesisContentEl.innerText;
        navigator.clipboard.writeText(fullText).then(() => {
            alert('Seluruh draf skripsi berhasil disalin ke clipboard!');
        }).catch(err => {
            alert('Gagal menyalin teks.');
            console.error('Clipboard copy failed: ', err);
        });
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua draf yang telah dibuat?')) {
            appState.generated = { bab1: '', bab2: '', bab3: '', bab4: '' };
            navLinks.forEach(link => link.classList.remove('completed'));
            updatePreview();
        }
    });

    document.getElementById('generateBab1Btn').addEventListener('click', (e) => generateChapter('bab1', e.currentTarget));
    document.getElementById('generateBab2Btn').addEventListener('click', (e) => generateChapter('bab2', e.currentTarget));
    document.getElementById('generateBab3Btn').addEventListener('click', (e) => generateChapter('bab3', e.currentTarget));
    document.getElementById('generateBab4Btn').addEventListener('click', (e) => generateChapter('bab4', e.currentTarget));
    
    // =================================================
    // BAGIAN 5: Inisialisasi Aplikasi
    // =================================================
    switchView('form-home');
});
