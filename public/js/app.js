document.addEventListener('DOMContentLoaded', () => {
    // STATE & CACHE
    const appState = { topic: '', problem: '', generated: {}, currentStep: 0 };
    const TOTAL_STEPS = 6;
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextBtn = document.getElementById('next-step-btn');
    const prevBtn = document.getElementById('prev-step-btn');
    const generateButtons = document.querySelectorAll('.generate-button');
    const finalOutput = document.getElementById('final-output');
    const copyAllBtn = document.getElementById('copyAllBtn');

    // FUNGSI INTI
    const navigateToStep = (newStepIndex) => {
        const oldStepIndex = appState.currentStep;
        if (newStepIndex === oldStepIndex) return;

        if (wizardSteps[oldStepIndex]) {
            wizardSteps[oldStepIndex].classList.add('exiting');
            wizardSteps[oldStepIndex].addEventListener('animationend', () => {
                wizardSteps[oldStepIndex].classList.remove('active', 'exiting');
            }, { once: true });
        }

        if (wizardSteps[newStepIndex]) {
            wizardSteps[newStepIndex].classList.add('active');
        }

        appState.currentStep = newStepIndex;
        updateUI();
    };

    const updateUI = () => {
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < appState.currentStep) step.classList.add('completed');
            if (index === appState.currentStep) step.classList.add('active');
        });

        prevBtn.style.visibility = appState.currentStep > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = appState.currentStep < TOTAL_STEPS - 1 ? 'visible' : 'hidden';

        if (appState.currentStep === 0) {
            nextBtn.disabled = !(document.getElementById('mainThesisTopic').value && document.getElementById('mainRumusanMasalah').value);
        } else if (appState.currentStep > 0 && appState.currentStep < TOTAL_STEPS - 1) {
            const chapter = `bab${appState.currentStep}`;
            nextBtn.disabled = !appState.generated[chapter];
        }

        if (appState.currentStep === TOTAL_STEPS - 1) {
            let fullText = '';
            for (let i = 1; i <= 4; i++) {
                const chapterKey = `bab${i}`;
                if (appState.generated[chapterKey]) {
                    fullText += `====================\nBAB ${i}\n====================\n\n${appState.generated[chapterKey]}\n\n\n`;
                }
            }
            finalOutput.value = fullText.trim();
        }
    };

    async function generateChapter(chapter, button) {
        const originalButtonText = button.textContent;
        button.disabled = true;
        button.innerHTML = `<span class="loading-spinner"></span><span>Membangun...</span>`;
        appState.topic = document.getElementById('mainThesisTopic').value;
        appState.problem = document.getElementById('mainRumusanMasalah').value;
        const payload = { topic: appState.topic, problem: appState.problem, chapter: chapter, details: {} };
        
        try {
            const response = await fetch('/.netlify/functions/generate-thesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Request gagal');
            
            appState.generated[chapter] = data.text;
            const resultBox = document.getElementById(`result-${chapter}`);
            resultBox.innerText = data.text;
            resultBox.classList.remove('hidden');
            updateUI();
        } catch (error) {
            alert('Gagal: ' + error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }

    // EVENT LISTENERS
    progressSteps.forEach(step => {
        step.addEventListener('click', () => {
            const targetStep = parseInt(step.dataset.step);
            if (targetStep < appState.currentStep) {
                navigateToStep(targetStep);
            }
        });
    });

    nextBtn.addEventListener('click', () => {
        if (appState.currentStep < TOTAL_STEPS - 1) navigateToStep(appState.currentStep + 1);
    });
    prevBtn.addEventListener('click', () => {
        if (appState.currentStep > 0) navigateToStep(appState.currentStep - 1);
    });
    
    generateButtons.forEach(button => {
        button.addEventListener('click', () => generateChapter(button.dataset.chapter, button));
    });

    copyAllBtn.addEventListener('click', () => {
        finalOutput.select();
        document.execCommand('copy');
        alert('Draf skripsi lengkap berhasil disalin!');
    });
    
    document.getElementById('mainThesisTopic').addEventListener('input', updateUI);
    document.getElementById('mainRumusanMasalah').addEventListener('input', updateUI);

    // INISIALISASI
    updateUI();
});
