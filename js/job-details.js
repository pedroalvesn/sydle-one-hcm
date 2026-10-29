(function () {
    const jobId = '1';
    const jobTitleInput = document.getElementById('jobTitle');
    const jobPageTitle = document.getElementById('jobPageTitle');
    const jobLocationSelect = document.getElementById('jobLocation');
    const contractTypeSelect = document.getElementById('contractType');
    const workScheduleSelect = document.getElementById('workSchedule');
    const annualSalarySelect = document.getElementById('annualSalary');
    const saveJobButton = document.getElementById('saveJobButton');
    const saveToast = document.getElementById('saveToast');
    const saveToastMessage = document.getElementById('saveToastMessage');
    const detailsStepButton = document.getElementById('detailsStepButton');
    const candidatesStepButton = document.getElementById('candidatesStepButton');
    const detailsPanel = document.getElementById('detailsPanel');
    const candidatesPanel = document.getElementById('candidatesPanel');
    const jobDetailsView = document.getElementById('jobDetailsView');
    const activeCandidatesTab = document.getElementById('activeCandidatesTab');
    const disqualifiedCandidatesTab = document.getElementById('disqualifiedCandidatesTab');
    const candidateSearch = document.getElementById('candidateSearch');
    const candidateList = document.getElementById('candidateList');
    const candidateItem = document.getElementById('pedroCandidate');
    const candidateListEmpty = document.getElementById('candidateListEmpty');
    const candidateCount = document.getElementById('candidateCount');
    const candidateWelcome = document.getElementById('candidateWelcome');
    const candidateDetails = document.getElementById('candidateDetails');
    const candidateNextPage = document.getElementById('candidateNextPage');
    const candidateContinueButton = document.getElementById('candidateContinueButton');
    const candidateNextPageBackButton = document.getElementById('candidateNextPageBackButton');
    const candidateNextPageContent = candidateNextPage.querySelector('.candidate-next-page-content');
    const proposalView = document.getElementById('proposalView');
    const proposalYesButton = document.getElementById('proposalYesButton');
    const proposalNoButton = document.getElementById('proposalNoButton');
    const proposalNoToast = document.getElementById('proposalNoToast');
    const proposalSuccess = document.getElementById('proposalSuccess');
    const proposalSuccessHeading = document.getElementById('proposalSuccessHeading');
    const proposalConfetti = document.getElementById('proposalConfetti');
    const candidateAvatarElements = document.querySelectorAll('[data-candidate-avatar]');
    let toastTimeout;
    let proposalNoToastTimeout;
    let activeCandidateFilter = 'active';

    function setCandidateAvatarColors() {
        const colors = ['#5a009f', '#490082', '#7b2cbf', '#7c3aed', '#6d28d9', '#8b5cf6'];
        const colorIndex = Math.floor(Math.random() * colors.length);
        candidateAvatarElements.forEach(avatar => {
            avatar.style.backgroundColor = colors[colorIndex];
        });
    }

    function filterCandidates() {
        const isActiveTab = activeCandidateFilter === 'active';
        const matchesSearch = candidateItem.textContent.toLocaleLowerCase('pt-BR')
            .includes(candidateSearch.value.trim().toLocaleLowerCase('pt-BR'));
        const candidateIsVisible = isActiveTab && matchesSearch;

        candidateItem.hidden = !candidateIsVisible;
        candidateListEmpty.hidden = candidateIsVisible;
        candidateListEmpty.textContent = isActiveTab
            ? 'Nenhum candidato encontrado.'
            : 'Não há candidatos desqualificados.';
        candidateCount.textContent = candidateIsVisible ? '1' : '0';
        candidateList.setAttribute('aria-labelledby', isActiveTab ? 'activeCandidatesTab' : 'disqualifiedCandidatesTab');

        if (!candidateIsVisible) {
            candidateItem.setAttribute('aria-pressed', 'false');
            candidateWelcome.hidden = false;
            candidateDetails.hidden = true;
            candidateNextPage.hidden = true;
        }
    }

    function selectCandidateFilter(filter) {
        activeCandidateFilter = filter;
        const showActive = filter === 'active';
        activeCandidatesTab.classList.toggle('candidate-tab-active', showActive);
        disqualifiedCandidatesTab.classList.toggle('candidate-tab-active', !showActive);
        activeCandidatesTab.setAttribute('aria-selected', String(showActive));
        disqualifiedCandidatesTab.setAttribute('aria-selected', String(!showActive));
        filterCandidates();
    }

    function resetCandidates() {
        candidateSearch.value = '';
        candidateItem.setAttribute('aria-pressed', 'false');
        candidateWelcome.hidden = false;
        candidateDetails.hidden = true;
        candidateNextPage.hidden = true;
        selectCandidateFilter('active');
    }

    function currentUserEmail() {
        return window.sydleAuth.getUserEmail();
    }

    function showToast(message, isError = false) {
        window.clearTimeout(toastTimeout);
        saveToastMessage.textContent = message;
        saveToast.classList.toggle('save-toast-error', isError);
        saveToast.hidden = false;
        toastTimeout = window.setTimeout(() => {
            saveToast.hidden = true;
        }, 3500);
    }

    function updateCurrentJob(showConfirmation) {
        const title = jobTitleInput.value.trim();
        if (!title) {
            if (showConfirmation) {
                showToast('Informe o título da oferta antes de salvar.', true);
            }
            return false;
        }

        const jobs = window.sydleJobs.getJobs();
        const job = jobs.find(item => item.id === jobId);
        if (!job) {
            if (showConfirmation) {
                showToast('Não foi possível encontrar esta oferta para salvar.', true);
            }
            return false;
        }

        job.title = title;
        job.location = jobLocationSelect.value;
        job.contractType = contractTypeSelect.value;
        job.workSchedule = workScheduleSelect.value;
        job.annualSalary = annualSalarySelect.value;
        try {
            localStorage.setItem('sydle_jobs', JSON.stringify(jobs));
        } catch (error) {
            console.error('Não foi possível salvar os detalhes da oferta.', error);
            if (showConfirmation) {
                showToast('Não foi possível salvar as alterações neste navegador.', true);
            }
            return false;
        }
        jobPageTitle.textContent = title;

        if (showConfirmation) {
            showToast('Alterações salvas corretamente.');
        }
        return true;
    }

    function load() {
        if (currentUserEmail() !== 'carla@gmail.com') {
            window.sydleApp.navigate('jobs', {}, true);
            return;
        }

        const currentJob = window.sydleJobs.getJobs().find(job => job.id === jobId);
        if (!currentJob || currentJob.restrictedTo !== 'carla@gmail.com') {
            window.sydleApp.navigate('jobs', {}, true);
            return;
        }

        jobTitleInput.value = currentJob.title || '';
        jobPageTitle.textContent = currentJob.title || 'Oferta de trabalho';
        jobLocationSelect.value = currentJob.location || 'Fortaleza, CE';
        contractTypeSelect.value = currentJob.contractType || 'Tempo indeterminado';
        workScheduleSelect.value = currentJob.workSchedule || 'Tempo integral';
        annualSalarySelect.value = currentJob.annualSalary || 'Beijinhos e chameguinhos';
        saveToast.hidden = true;
        resetCandidates();
        showWizardStep('details');
    }

    function showWizardStep(step) {
        const showDetails = step === 'details';
        jobDetailsView.classList.toggle('candidates-mode', !showDetails);
        detailsPanel.hidden = !showDetails;
        detailsPanel.setAttribute('aria-hidden', String(!showDetails));
        candidatesPanel.hidden = showDetails;
        candidatesPanel.setAttribute('aria-hidden', String(showDetails));
        detailsStepButton.classList.toggle('wizard-step-active', showDetails);
        candidatesStepButton.classList.toggle('wizard-step-active', !showDetails);

        if (showDetails) {
            detailsStepButton.setAttribute('aria-current', 'step');
            candidatesStepButton.removeAttribute('aria-current');
        } else {
            candidatesStepButton.setAttribute('aria-current', 'step');
            detailsStepButton.removeAttribute('aria-current');
        }
    }

    jobTitleInput.addEventListener('input', () => {
        jobPageTitle.textContent = jobTitleInput.value.trim() || 'Oferta de trabalho';
        updateCurrentJob(false);
    });
    [jobLocationSelect, contractTypeSelect, workScheduleSelect, annualSalarySelect].forEach(field => {
        field.addEventListener('change', () => updateCurrentJob(false));
    });
    saveJobButton.addEventListener('click', () => updateCurrentJob(true));
    detailsStepButton.addEventListener('click', () => showWizardStep('details'));
    candidatesStepButton.addEventListener('click', () => showWizardStep('candidates'));
    activeCandidatesTab.addEventListener('click', () => selectCandidateFilter('active'));
    disqualifiedCandidatesTab.addEventListener('click', () => selectCandidateFilter('disqualified'));
    candidateSearch.addEventListener('input', filterCandidates);
    candidateItem.addEventListener('click', () => {
        candidateItem.setAttribute('aria-pressed', 'true');
        candidateWelcome.hidden = true;
        candidateNextPage.hidden = true;
        candidateDetails.hidden = false;
    });
    candidateContinueButton.addEventListener('click', () => {
        candidateDetails.hidden = true;
        candidateNextPage.hidden = false;
        candidateNextPageContent.hidden = true;
        proposalView.hidden = false;
        candidateNextPageBackButton.hidden = false;
        proposalSuccess.hidden = true;
        candidateNextPage.classList.remove('proposal-approved');
        proposalYesButton.focus();
    });
    candidateNextPageBackButton.addEventListener('click', () => {
        candidateNextPage.hidden = true;
        proposalView.hidden = true;
        proposalSuccess.hidden = true;
        proposalConfetti.replaceChildren();
        candidateNextPageContent.hidden = false;
        candidateNextPage.classList.remove('proposal-approved');
        candidateDetails.hidden = false;
        candidateContinueButton.focus();
    });
    proposalNoButton.addEventListener('click', () => {
        proposalNoButton.classList.remove('proposal-no-wiggle');
        void proposalNoButton.offsetWidth;
        proposalNoButton.classList.add('proposal-no-wiggle');
        window.clearTimeout(proposalNoToastTimeout);
        proposalNoToast.classList.remove('proposal-no-toast-visible');
        proposalNoToast.hidden = false;
        void proposalNoToast.offsetWidth;
        proposalNoToast.classList.add('proposal-no-toast-visible');
        proposalNoToastTimeout = window.setTimeout(() => {
            proposalNoToast.hidden = true;
            proposalNoToast.classList.remove('proposal-no-toast-visible');
        }, 1900);
    });
    proposalNoButton.addEventListener('animationend', () => {
        proposalNoButton.classList.remove('proposal-no-wiggle');
    });
    proposalYesButton.addEventListener('click', () => {
        window.clearTimeout(proposalNoToastTimeout);
        proposalNoToast.hidden = true;
        proposalNoToast.classList.remove('proposal-no-toast-visible');
        proposalView.hidden = true;
        candidateNextPageBackButton.hidden = true;
        candidateNextPage.classList.add('proposal-approved');
        proposalSuccess.hidden = false;
        proposalSuccessHeading.focus();

        const confettiColors = ['#5a009f', '#7b2cbf', '#c084fc', '#f0abfc', '#fbbf24', '#34d399'];
        const confettiPieces = Array.from({ length: 64 }, () => {
            const piece = document.createElement('span');
            piece.className = 'proposal-confetti-piece';
            piece.style.setProperty('--confetti-x', `${Math.random() * 100}%`);
            piece.style.setProperty('--confetti-delay', `${Math.random() * 0.65}s`);
            piece.style.setProperty('--confetti-duration', `${2.2 + Math.random() * 1.4}s`);
            piece.style.setProperty('--confetti-color', confettiColors[Math.floor(Math.random() * confettiColors.length)]);
            proposalConfetti.append(piece);
            return piece;
        });

        window.setTimeout(() => {
            confettiPieces.forEach(piece => piece.remove());
        }, 4000);
    });
    setCandidateAvatarColors();

    window.sydleJobDetails = { load };
})();
