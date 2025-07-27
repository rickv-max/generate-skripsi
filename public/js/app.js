// public/js/app.js (VERSI FINAL STABIL)

document.addEventListener('DOMContentLoaded', () => {
    const appState = {
        topic: '',
        problem: '',
        generated: {}
    };

    const navLinks = document.querySelectorAll('.nav-link');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // === FUNGSI MENU MOBILE ===
    const toggleMenu = () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
        sidebarOverlay.classList.toggle('hidden');
        menuOpenIcon.classList.toggle('hidden');
        menuCloseIcon.classList.toggle('hidden');
    };

    // === GANTI VIEW SESUAI NAVIGASI ===
    const switchView = (targetId) => {
        document.querySelectorAll('.form-section').forEach(section => section.classList.add('hidden'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove('hidden');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) link.classList.add('active');
        });
        if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) toggleMenu();
    };

    // === UPDATE PREVIEW LENGKAP DI LAYAR DESKTOP ===
    const updateDesktopPreview = () => {
        const desktopPreview = document.getElementById('thesisContent');
        let fullText = '';
        let hasContent = false;
        ['bab1', 'bab2', 'bab3', 'bab4'].forEach(bab => {
            if (appState.generated[bab]) {
                const titleMap = {
                    bab1: "BAB I PENDAHULUAN",
                    bab2: "BAB II TINJAUAN PUSTAKA",
                    bab3: "BAB III METODE PENELITIAN",
                    bab4: "BAB IV PEMBAHASAN"
                };
                fullText += `<h2 class="text-xl font-bold my-4">${titleMap[bab]}</h2><pre class="whitespace-pre-wrap">${appState.generated[bab]}</pre>`;
                hasContent = true;
            }
        });
        desktopPreview.innerHTML = hasContent ? fullText : `<p class="text-gray-500">Pratinjau keseluruhan akan muncul di sini.</p>`;
        document.getElementById('copyAllBtn').classList.toggle('hidden', !hasContent);
        document.getElementById('clearAllBtn').classList.toggle('hidden', !hasContent);
    };

    // === GENERATE TIAP BAB ===
    async function generateChapter(chapter, button) {
        const originalButtonText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<div class="loading-spinner"></div><span>Membuat...</span>`;

        appState.topic = document.getElementById('mainThesisTopic').value.trim();
        appState.problem = document.getElementById('mainRumusanMasalah').value.trim();

        if (!appState.topic || !appState.problem) {
            alert('Harap isi Topik dan Rumusan Masalah terlebih dahulu.');
            button.disabled = false;
            button.innerHTML = originalButtonText;
            switchView('form-home');
            return;
        }

        const payload = {
            topic: appState.topic,
            problem: appState.problem,
            chapter: chapter.replace('bab', '')
        };

        try {
            const response = await fetch('/.netlify/functions/generate-thesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
            if (!data.text) throw new Error("Server tidak memberikan teks hasil.");

            appState.generated[chapter] = data.text;
            const resultBox = document.getElementById(`result-${chapter}`);
            resultBox.innerText = data.text;
            resultBox.classList.remove('hidden');
            document.querySelector(`.nav-link[data-target="form-${chapter}"]`).classList.add('completed');
            updateDesktopPreview();

        } catch (err) {
            alert(`Gagal memproses draf: ${err.message}`);
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }

    // === EVENT LISTENER ===
    mobileMenuButton.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.dataset.target;
            switchView(targetId);
        });
    });

    document.getElementById('generateBab1Btn').addEventListener('click', (e) => generateChapter('bab1', e.currentTarget));
    document.getElementById('generateBab2Btn').addEventListener('click', (e) => generateChapter('bab2', e.currentTarget));
    document.getElementById('generateBab3Btn').addEventListener('click', (e) => generateChapter('bab3', e.currentTarget));
    document.getElementById('generateBab4Btn').addEventListener('click', (e) => generateChapter('bab4', e.currentTarget));

    // === FUNGSI CLEAR & COPY SEMUA ===
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (confirm('Yakin ingin menghapus semua hasil?')) {
            appState.generated = {};
            document.querySelectorAll('.result-box').forEach(box => {
                box.innerText = '';
                box.classList.add('hidden');
            });
            navLinks.forEach(link => link.classList.remove('completed'));
            updateDesktopPreview();
        }
    });

    document.getElementById('copyAllBtn').addEventListener('click', () => {
        const allText = document.getElementById('thesisContent').innerText;
        navigator.clipboard.writeText(allText)
            .then(() => alert('Seluruh teks berhasil disalin!'))
            .catch(() => alert('Gagal menyalin ke clipboard.'));
    });

    // === INISIALISASI ===
    switchView('form-home');
    updateDesktopPreview();
});
