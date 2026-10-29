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

function updateDashboardUser() {
    const userEmail = window.sydleAuth.getUserEmail();
    if (!userEmail) {
        return;
    }

    const displayName = getDisplayName(userEmail);
    document.getElementById('loggedInUserName').textContent = displayName;
    document.getElementById('welcomeMessage').textContent = `Olá, ${displayName}! 👋`;
}

function refreshDashboard() {
    updateDashboardUser();
    updateDashboardClock();
}

refreshDashboard();
setInterval(updateDashboardClock, 1000);

const dashboardGrid = document.getElementById('dashboardGrid');
const constructionState = document.getElementById('constructionState');
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
    dashboardGrid.classList.toggle('hidden', !isDashboard);
    constructionState.classList.toggle('hidden', isDashboard);
    constructionState.classList.toggle('flex', !isDashboard);
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
