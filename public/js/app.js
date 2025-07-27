document.addEventListener('DOMContentLoaded', () => {
    // STATE
    const appState = { topic: '', problem: '', generated: {}, currentStep: 0 };
    const TOTAL_STEPS = 6;

    // CACHE ELEMENTS
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextBtn = document.getElementById('next-step-btn');
    const prevBtn = document.getElementById('prev-step-btn');
    const generateButtons = document.querySelectorAll('.generate-button');
    const finalOutput = document.getElementById('final-output');
    const copyAllBtn = document.getElementById('copyAllBtn');

    // FUNCTIONS
    const navigateToStep = (stepIndex) => {
        const currentActiveStep = document.querySelector('.wizard-step.active');
        if(currentActiveStep) {
            currentActiveStep.classList.add('exiting');
            currentActiveStep.addEventListener('animationend', () => {
                currentActiveStep.classList.remove('active', 'exiting');
            }, { once: true });
        }
        
        wizardSteps[stepIndex].classList.add('active');
        appState.currentStep = stepIndex;
        updateUI();
    };

    const updateUI = () => {
        // Progress Bar
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if(index < appState.currentStep) step.classList.add('completed');
            if(index === appState.currentStep) step.classList.add('active');
        });

        // Buttons
        prevBtn.style.visibility = appState.currentStep > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = appState.currentStep < TOTAL_STEPS - 1 ? 'visible' : 'hidden';

        if(appState.currentStep === 0){
             nextBtn.disabled = !(document.getElementById('mainThesisTopic').value && document.getElementById('mainRumusanMasalah').value);
        } else if(appState.currentStep > 0 && appState.currentStep < TOTAL_STEPS - 1) {
             const chapter = `bab${appState.currentStep}`;
             nextBtn.disabled = !appState.generated[chapter];
        }

        if(appState.currentStep === TOTAL_STEPS - 1) {
            let fullText = '';
            for(let i = 1; i <= 4; i++) {
                const chapterKey = `bab${i}`;
                if(appState.generated[chapterKey]) {
                    fullText += `BAB ${i}\n\n${appState.generated[chapterKey]}\n\n---\n\n`;
                }
            }
            finalOutput.value = fullText;
        }
    };

    async function generateChapter(chapter, button) {
        // ... (fungsi generateChapter sama seperti sebelumnya, tapi dengan beberapa penyesuaian)
        button.disabled = true; // ... loading state
        
        appState.topic = document.getElementById('mainThesisTopic').value;
        appState.problem = document.getElementById('mainRumusanMasalah').value;

        const payload = { topic: appState.topic, problem: appState.problem, chapter: chapter, details: {} };
        // ... (mengisi payload.details)

        try {
            const response = await fetch('/.netlify/functions/generate-thesis', { method: 'POST', body: JSON.stringify(payload) });
            const data = await response.json();
            if(!response.ok) throw new Error(data.error || 'Request failed');
            
            appState.generated[chapter] = data.text;
            document.getElementById(`result-${chapter}`).innerText = data.text;
            document.getElementById(`result-${chapter}`).classList.remove('hidden');
            updateUI(); // Enable next button
        } catch (error) {
            alert('Gagal: ' + error.message);
        } finally {
            button.disabled = false; // ... reset state
        }
    }

    // EVENT LISTENERS
    nextBtn.addEventListener('click', () => {
        if(appState.currentStep < TOTAL_STEPS - 1) navigateToStep(appState.currentStep + 1);
    });
    prevBtn.addEventListener('click', () => {
        if(appState.currentStep > 0) navigateToStep(appState.currentStep - 1);
    });
    
    generateButtons.forEach(button => {
        button.addEventListener('click', () => generateChapter(button.dataset.chapter, button));
    });

    copyAllBtn.addEventListener('click', () => {
        finalOutput.select();
        document.execCommand('copy');
        alert('Draf skripsi disalin!');
    });
    
    // Validasi untuk step pertama
    document.getElementById('mainThesisTopic').addEventListener('input', updateUI);
    document.getElementById('mainRumusanMasalah').addEventListener('input', updateUI);

    // INITIALIZATION
    navigateToStep(0);
});
