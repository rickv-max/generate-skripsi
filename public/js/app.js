// public/js/app.js (VERSI FINAL YANG BENAR-BENAR LENGKAP)

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
    const thesisContentEl = document.getElementById('thesisContent'); // Panel kanan desktop
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Cache elemen DOM untuk menu mobile
    const sidebar = document.getElementById('sidebar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // =================================================
    // BAGIAN 2: Fungsi Helper Inti
    // =================================================

    // Fungsi untuk menu mobile
    const toggleMenu = () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
        sidebarOverlay.classList.toggle('hidden');
        menuOpenIcon.classList.toggle('hidden');
        menuCloseIcon.classList.toggle('hidden');
    };

    // Fungsi untuk berpindah antar form bab (sekarang lebih sederhana)
    const switchView = (targetId) => {
        const formSections = document.querySelectorAll('.form-section');
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

    // Fungsi untuk mengupdate HANYA panel kanan desktop
    const updateDesktopPreview = () => {
        let fullText = '';
        let hasContent = false;
        const renderChapter = (title, content) => `<h2>${title}</h2><pre>${content}</pre>`;
        
        if (appState.generated.bab1) { fullText += renderChapter('BAB I PENDAHULUAN', appState.generated.bab1); hasContent = true; }
        if (appState.generated.bab2) { fullText += renderChapter('BAB II TINJAUAN PUSTAKA', appState.generated.bab2); hasContent = true; }
        if (appState.generated.bab3) { fullText += renderChapter('BAB III METODE PENELITIAN', appState.generated.bab3); hasContent = true; }
        if (appState.generated.bab4) { fullText += renderChapter('BAB IV HASIL DAN PEMBAHASAN', appState.generated.bab4); hasContent = true; }
        
        const placeholder = `<p class="text-gray-500">Draf akan muncul di sini...</p>`;
        thesisContentEl.innerHTML = hasContent ? fullText.replace(/<h2>/g, '<h2 class="chapter-title">') : placeholder;

        if (hasContent) {
            copyAllBtn.style.display = 'flex';
            clearAllBtn.style.display = 'flex';
        } else {
            copyAllBtn.style.display = 'none';
            clearAllBtn.style.display = 'none';
        }
    };

    // Fungsi utama untuk generate
    async function generateChapter(chapter, button) {
        const originalButtonText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<div class="loading-spinner"></div><span>Membuat draf...</span>`;

        appState.topic = document.getElementById('mainThesisTopic').value;
        appState.problem = document.getElementById('mainRumusanMasalah').value;

        if (!appState.topic || !appState.problem) {
            alert('Harap isi Topik Skripsi dan Rumusan Masalah Utama terlebih dahulu.');
            button.disabled = false;
            button.innerHTML = originalButtonText;
            switchView('form-home');
            return;
        }

        const payload = { topic: appState.topic, problem: appState.problem, chapter: chapter, details: {} };
        
        // Mengisi detail dari form spesifik per bab
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
            const response = await fetch('/.netlify/functions/generate-thesis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            if (data.text) {
                appState.generated[chapter] = data.text;
                
                const resultBox = document.getElementById(`result-${chapter}`);
                if (resultBox) {
                    resultBox.innerText = data.text;
                    resultBox.classList.remove('hidden');
                }

                updateDesktopPreview();
                
                document.querySelector(`.nav-link[data-target="form-${chapter}"]`).classList.add('completed');
            } else {
                throw new Error("Respons dari server tidak berisi teks yang diharapkan.");
            }
        } catch (error) {
            alert(`Gagal memproses draf: ${error.message}`);
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }

    // =================================================
    // BAGIAN 3: Event Listeners
    // =================================================

    // Event listener untuk menu mobile
    mobileMenuButton.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);
    
    // Event listener untuk navigasi bab
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.currentTarget.dataset.target);
        });
    });

    // Event listener untuk tombol Salin & Bersihkan
    copyAllBtn.addEventListener('click', () => {
        let fullTextToCopy = '';
        if (appState.generated.bab1) fullTextToCopy += `BAB I PENDAHULUAN\n\n${appState.generated.bab1}\n\n`;
        if (appState.generated.bab2) fullTextToCopy += `BAB II TINJAUAN PUSTAKA\n\n${appState.generated.bab2}\n\n`;
        if (appState.generated.bab3) fullTextToCopy += `BAB III METODE PENELITIAN\n\n${appState.generated.bab3}\n\n`;
        if (appState.generated.bab4) fullTextToCopy += `BAB IV HASIL DAN PEMBAHASAN\n\n${appState.generated.bab4}\n\n`;

        navigator.clipboard.writeText(fullTextToCopy).then(() => {
            alert('Seluruh draf skripsi berhasil disalin ke clipboard!');
        }).catch(err => {
            alert('Gagal menyalin teks.');
        });
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua draf dan hasil yang telah dibuat?')) {
            appState.generated = { bab1: '', bab2: '', bab3: '', bab4: '' };
            navLinks.forEach(link => link.classList.remove('completed'));
            
            // Sembunyikan semua kotak hasil
            const resultBoxes = document.querySelectorAll('.result-box');
            resultBoxes.forEach(box => {
                box.innerText = '';
                box.classList.add('hidden');
            });
            
            updateDesktopPreview();
        }
    });

    // Event listener untuk setiap tombol "Buat Bab"
    document.getElementById('generateBab1Btn').addEventListener('click', (e) => generateChapter('bab1', e.currentTarget));
    document.getElementById('generateBab2Btn').addEventListener('click', (e) => generateChapter('bab2', e.currentTarget));
    document.getElementById('generateBab3Btn').addEventListener('click', (e) => generateChapter('bab3', e.currentTarget));
    document.getElementById('generateBab4Btn').addEventListener('click', (e) => generateChapter('bab4', e.currentTarget));

    // =================================================
    // BAGIAN 4: Inisialisasi Aplikasi
    // =================================================
    switchView('form-home');
});
