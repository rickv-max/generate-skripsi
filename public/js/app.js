// public/js/app.js (VERSI FINAL DENGAN PENGAMBILAN DATA FORMULIR LENGKAP)

document.addEventListener('DOMContentLoaded', () => {
    // STATE & CACHE
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 3400); // 100 milidetik sudah cukup
    }
    const appState = { topic: '', problem: '', generated: {}, currentView: 'form-home' };
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const generateButtons = document.querySelectorAll('.generate-button');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // FUNGSI INTI
    const toggleMenu = () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
        sidebarOverlay.classList.toggle('hidden');
        menuOpenIcon.classList.toggle('hidden');
        menuCloseIcon.classList.toggle('hidden');
    };

    const switchView = (targetId) => {
        document.querySelectorAll('.form-section').forEach(section => section.classList.add('hidden'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) link.classList.add('active');
        });

        appState.currentView = targetId;
        if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
            toggleMenu();
        }
        // Sembunyikan hasil jika di halaman form-home
        const resultContainer = document.getElementById('result-container');
        if (targetId === 'form-home' && resultContainer) {
            resultContainer.classList.add('hidden');
        } else if (resultContainer && Object.values(appState.generated).length > 0) {
            resultContainer.classList.remove('hidden');
        }
    };

    const updateUI = () => {
        const desktopPreview = document.getElementById('thesisContent');
        const resultContainer = document.getElementById('result-container');
        const placeholder = document.getElementById('draft-placeholder');
        if (!desktopPreview || !resultContainer || !placeholder) return;

        let fullText = '';
        let hasContent = false;
        resultContainer.innerHTML = '';

        ['bab1', 'bab2', 'bab3', 'bab4'].forEach(bab => {
            if (appState.generated[bab]) {
                const titleMap = { bab1: "BAB I: PENDAHULUAN", bab2: "BAB II: TINJAUAN PUSTAKA", bab3: "BAB III: METODE PENELITIAN", bab4: "BAB IV: PEMBAHASAN" };
                fullText += `<h2>${titleMap[bab]}</h2><pre>${appState.generated[bab]}</pre>`;
                
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                resultCard.innerHTML = `<h3>${titleMap[bab]}</h3><pre>${appState.generated[bab]}</pre>`;
                resultContainer.appendChild(resultCard);

                hasContent = true;
            }
        });

        if (!hasContent && appState.currentView !== 'form-home') {
            resultContainer.appendChild(placeholder);
            placeholder.style.display = 'block';
        } else {
            placeholder.style.display = 'none';
        }

        desktopPreview.innerHTML = hasContent ? fullText : `<p class="text-muted">Pratinjau keseluruhan akan muncul di sini.</p>`;
        copyAllBtn.classList.toggle('hidden', !hasContent);
        clearAllBtn.classList.toggle('hidden', !hasContent);
    };

    async function generateChapter(chapter, button) {
        const originalButtonText = button.textContent;
        button.disabled = true;
        button.innerHTML = `<span class="loading-spinner"></span><span>Membangun...</span>`;
        
        appState.topic = document.getElementById('mainThesisTopic').value;
        appState.problem = document.getElementById('mainRumusanMasalah').value;
        if (!appState.topic || !appState.problem) {
            alert('Harap isi Topik dan Rumusan Masalah utama terlebih dahulu.');
            button.disabled = false; button.innerHTML = originalButtonText; switchView('form-home'); return;
        }
        
        // =====================================================================
        // INI ADALAH BAGIAN "INGATAN PELAYAN" YANG TELAH DIKEMBALIKAN
        // =====================================================================
        const payload = { topic: appState.topic, problem: appState.problem, chapter: chapter, details: {} };
        
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
        // =====================================================================

        try {
            const response = await fetch('/.netlify/functions/generate-thesis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Request gagal');
            
            if (data.text) {
                appState.generated[chapter] = data.text;
                updateUI();
                document.querySelector(`.nav-link[data-target="form-${chapter}"]`).classList.add('completed');
            } else { 
                throw new Error("Respons dari server tidak berisi teks."); 
            }
        } catch (error) {
            alert('Gagal: ' + error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }

    // EVENT LISTENERS
    mobileMenuButton.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);
    
    navLinks.forEach(link => { 
        link.addEventListener('click', (e) => { 
            e.preventDefault(); 
            switchView(e.currentTarget.dataset.target); 
        }); 
    });

    generateButtons.forEach(button => {
        button.addEventListener('click', () => generateChapter(button.dataset.chapter, button));
    });
    
    copyAllBtn.addEventListener('click', () => {
        const textToCopy = document.getElementById('thesisContent').innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Seluruh draf berhasil disalin!');
        }).catch(err => {
            alert('Gagal menyalin.');
        });
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua hasil?')) {
            appState.generated = {};
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('completed'));
            updateUI();
        }
        window.addEventListener('load', () => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    });
    });

    // INISIALISASI
    switchView('form-home');
    updateUI();
});
