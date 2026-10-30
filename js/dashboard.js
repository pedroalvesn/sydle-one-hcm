const dropdownIds = ['sydleDropdown', 'appsDropdown'];

function setDropdownOpen(dropdownId, isOpen) {
    const dropdown = document.getElementById(dropdownId);
    const icon = document.getElementById(dropdownId === 'sydleDropdown' ? 'icon-sydle' : 'icon-apps');
    const button = document.querySelector(`[aria-controls="${dropdownId}"]`);

    dropdown.classList.toggle('open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}

function closeDropdowns() {
    dropdownIds.forEach(dropdownId => setDropdownOpen(dropdownId, false));
}

// Toggle dropdown animations smoothly.
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');

    closeDropdowns();
    if (!isOpen) {
        setDropdownOpen(dropdownId, true);
    }
}

document.addEventListener('pointerdown', event => {
    const clickedInsideDropdown = dropdownIds.some(dropdownId =>
        document.getElementById(dropdownId).parentElement.contains(event.target)
    );

    if (!clickedInsideDropdown) {
        closeDropdowns();
    }
});

document.addEventListener('focusin', event => {
    const focusedInsideDropdown = dropdownIds.some(dropdownId =>
        document.getElementById(dropdownId).parentElement.contains(event.target)
    );

    if (!focusedInsideDropdown) {
        closeDropdowns();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeDropdowns();
    }
});

window.addEventListener('blur', closeDropdowns);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        closeDropdowns();
    }
});

function calculateWorkedMilliseconds(now) {
    const workStart = new Date(now);
    workStart.setHours(7, 0, 0, 0);

    const lunchStart = new Date(now);
    lunchStart.setHours(12, 0, 0, 0);

    const lunchEnd = new Date(now);
    lunchEnd.setHours(13, 30, 0, 0);

    const morningWork = Math.max(0, Math.min(now.getTime(), lunchStart.getTime()) - workStart.getTime());
    const afternoonWork = Math.max(0, now.getTime() - lunchEnd.getTime());

    return morningWork + afternoonWork;
}

function updateDashboardClock() {
    const now = new Date();
    const currentDate = new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long'
    }).format(now);
    const workedMinutes = Math.floor(calculateWorkedMilliseconds(now) / 60000);
    const workedHours = Math.floor(workedMinutes / 60);
    const remainingMinutes = workedMinutes % 60;

    document.getElementById('currentDate').textContent = `Hoje, ${currentDate}`;
    document.getElementById('workedHours').textContent = String(workedHours).padStart(2, '0');
    document.getElementById('workedMinutes').textContent = String(remainingMinutes).padStart(2, '0');
}

function getDisplayName(email) {
    const localPart = email.split('@')[0];
    const name = localPart
        .split(/[._+-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toLocaleUpperCase('pt-BR') + part.slice(1))
        .join(' ');

    return name;
}

const profileDefaults = {
    'pedro@gmail.com': {
        name: 'Pedro Alves',
        email: 'pedro@gmail.com',
        phone: '(85) 98888-1024',
        birthdate: '1992-04-18',
        document: '123.456.789-00',
        role: 'Analista de Recursos Humanos',
        department: 'Recursos Humanos'
    },
    'carla@gmail.com': {
        name: 'Carla Vieira',
        email: 'carla@gmail.com',
        phone: '(85) 97777-2036',
        birthdate: '1995-09-07',
        document: '987.654.321-00',
        role: 'Especialista de Pessoas',
        department: 'Recursos Humanos'
    }
};

function getInitials(name) {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map(part => part.charAt(0).toLocaleUpperCase('pt-BR')).join('');
}

function getProfile(userEmail) {
    const defaults = profileDefaults[userEmail] || profileDefaults['pedro@gmail.com'];
    try {
        const stored = JSON.parse(localStorage.getItem(`sydle-profile:${userEmail}`));
        return stored ? { ...defaults, ...stored } : { ...defaults };
    } catch (error) {
        return { ...defaults };
    }
}

function updateProfilePreview(event) {
    if (event.target.id === 'profileName') {
        document.getElementById('profileDisplayName').textContent = event.target.value;
        document.getElementById('profileAvatar').textContent = getInitials(event.target.value || 'Usuário');
    }
    if (event.target.id === 'profileRole') {
        document.getElementById('profileDisplayRole').textContent = event.target.value;
    }
}

function renderProfile() {
    const userEmail = window.sydleAuth.getUserEmail();
    if (!userEmail) return;

    const profile = getProfile(userEmail);
    const fields = {
        profileName: profile.name,
        profileEmail: profile.email,
        profilePhone: profile.phone,
        profileBirthdate: profile.birthdate,
        profileDocument: profile.document,
        profileRole: profile.role,
        profileDepartment: profile.department
    };

    Object.entries(fields).forEach(([id, value]) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });

    document.getElementById('profileAvatar').textContent = getInitials(profile.name);
    document.getElementById('profileDisplayName').textContent = profile.name;
    document.getElementById('profileDisplayRole').textContent = profile.role;
    document.querySelector('.profile-cover').style.background = userEmail === 'carla@gmail.com'
        ? 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 55%, #6d28d9 100%)'
        : 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 55%, #5a009f 100%)';
    document.getElementById('profileSaveStatus').textContent = '';

    profileForm.querySelectorAll('input').forEach(input => {
        input.removeEventListener('input', updateProfilePreview);
        input.addEventListener('input', updateProfilePreview);
    });
}

function updateDashboardUser() {
    const userEmail = window.sydleAuth.getUserEmail();
    if (!userEmail) {
        return;
    }

    const profile = getProfile(userEmail);
    document.getElementById('loggedInUserName').textContent = profile.name;
    document.getElementById('welcomeMessage').textContent = `Olá, ${profile.name}! 👋`;
}

const profileForm = document.getElementById('profileForm');
profileForm?.addEventListener('submit', event => {
    event.preventDefault();
    const userEmail = window.sydleAuth.getUserEmail();
    if (!userEmail) return;

    const profile = Object.fromEntries(new FormData(profileForm).entries());
    localStorage.setItem(`sydle-profile:${userEmail}`, JSON.stringify(profile));
    renderProfile();
    updateDashboardUser();
    document.getElementById('welcomeMessage').textContent = 'Meu perfil';
    document.getElementById('profileSaveStatus').textContent = 'Alterações salvas.';
});

function refreshDashboard() {
    updateDashboardUser();
    updateDashboardClock();
}

refreshDashboard();
setInterval(updateDashboardClock, 1000);

const dashboardGrid = document.getElementById('dashboardGrid');
const constructionState = document.getElementById('constructionState');
const profileState = document.getElementById('profileState');
const dashboardPageLinks = document.querySelectorAll('[data-dashboard-page]');
const logoutLink = document.getElementById('logoutLink');

function showDashboardPage(pageName) {
    closeDropdowns();
    const selectedLink = Array.from(dashboardPageLinks).find(link => link.dataset.dashboardPage === pageName);

    if (!selectedLink) {
        return;
    }

    dashboardPageLinks.forEach(pageLink => {
        pageLink.classList.remove('sidebar-link-active');
        pageLink.removeAttribute('aria-current');
    });

    selectedLink.classList.add('sidebar-link-active');
    selectedLink.setAttribute('aria-current', 'page');

    const isDashboard = pageName === 'Painel';
    const isProfile = pageName === 'Eu';
    dashboardGrid.classList.toggle('hidden', !isDashboard);
    profileState.classList.toggle('hidden', !isProfile);
    constructionState.classList.toggle('hidden', isDashboard || isProfile);
    constructionState.classList.toggle('flex', !isDashboard && !isProfile);

    document.getElementById('welcomeMessage').textContent = isProfile ? 'Meu perfil' : isDashboard ? `Olá, ${getProfile(window.sydleAuth.getUserEmail()).name}! 👋` : pageName;
    document.querySelector('.dashboard-current-date').classList.toggle('hidden', isProfile);
    if (isProfile) {
        renderProfile();
        const dashboardMain = document.querySelector('#dashboardView main');
        if (dashboardMain) dashboardMain.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

logoutLink.addEventListener('click', event => {
    event.preventDefault();
    window.sydleAuth.logout();
    window.sydleApp.navigate('login');
});

dashboardPageLinks.forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const pageName = link.dataset.dashboardPage === 'Perfil' ? 'Eu' : link.dataset.dashboardPage;
        showDashboardPage(pageName);
    });
});

document.querySelectorAll('[data-dashboard-page-target]').forEach(button => {
    button.addEventListener('click', () => {
        showDashboardPage(button.dataset.dashboardPageTarget);
    });
});

window.refreshDashboard = refreshDashboard;
window.showDashboardHome = () => showDashboardPage('Painel');
window.showDashboardHome();

const dashboardSidebar = document.getElementById('dashboardSidebar');
const dashboardMenuButton = document.getElementById('dashboardMenuButton');
const dashboardSidebarBackdrop = document.getElementById('dashboardSidebarBackdrop');

function setDashboardSidebarOpen(isOpen) {
    dashboardSidebar?.classList.toggle('dashboard-sidebar-open', isOpen);
    dashboardSidebarBackdrop?.classList.toggle('dashboard-sidebar-backdrop-open', isOpen);
    dashboardMenuButton?.setAttribute('aria-expanded', String(isOpen));
}

dashboardMenuButton?.addEventListener('click', () => {
    setDashboardSidebarOpen(!dashboardSidebar.classList.contains('dashboard-sidebar-open'));
});
dashboardSidebarBackdrop?.addEventListener('click', () => setDashboardSidebarOpen(false));
dashboardPageLinks.forEach(link => link.addEventListener('click', () => setDashboardSidebarOpen(false)));
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) setDashboardSidebarOpen(false);
});
