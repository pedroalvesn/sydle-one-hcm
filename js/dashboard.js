const dropdownIds = ['sydleDropdown', 'appsDropdown'];
const workSchedule = {
    start: '07:00', lunchStart: '12:00', lunchEnd: '13:30', workEnd: '17:30'
};

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
    const [workStartHour, workStartMinute] = workSchedule.start.split(':').map(Number);
    workStart.setHours(workStartHour, workStartMinute, 0, 0);

    const lunchStart = new Date(now);
    const [lunchStartHour, lunchStartMinute] = workSchedule.lunchStart.split(':').map(Number);
    lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0);

    const lunchEnd = new Date(now);
    const [lunchEndHour, lunchEndMinute] = workSchedule.lunchEnd.split(':').map(Number);
    lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0);

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
    document.getElementById('clockWorkedHours').textContent = String(workedHours).padStart(2, '0');
    document.getElementById('clockWorkedMinutes').textContent = String(remainingMinutes).padStart(2, '0');
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
const timesheetState = document.getElementById('timesheetState');
const calendarState = document.getElementById('calendarState');
const clockState = document.getElementById('clockState');

function scheduleMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

const clockPunches = [
    { label: 'Entrada', time: workSchedule.start, icon: 'fa-arrow-right-to-bracket', color: 'green' },
    { label: 'Saída para intervalo', time: workSchedule.lunchStart, icon: 'fa-mug-hot', color: 'orange' },
    { label: 'Retorno do intervalo', time: workSchedule.lunchEnd, icon: 'fa-arrow-right-from-bracket', color: 'blue' },
    { label: 'Saída', time: workSchedule.workEnd, icon: 'fa-door-open', color: 'purple' }
];

function currentMinutes(now = new Date()) {
    return now.getHours() * 60 + now.getMinutes();
}

function renderClockPunches(now = new Date()) {
    const list = document.getElementById('clockPunchList');
    if (!list) return;
    const availablePunches = clockPunches.filter(punch => currentMinutes(now) >= scheduleMinutes(punch.time));
    const nextPunch = clockPunches.find(punch => currentMinutes(now) < scheduleMinutes(punch.time));
    const button = document.getElementById('clockPunchButton');

    list.innerHTML = availablePunches.length ? availablePunches.map(punch => `<div class="clock-punch-item"><span class="clock-punch-icon clock-punch-${punch.color}"><i class="fa-solid ${punch.icon}" aria-hidden="true"></i></span><div><strong>${punch.label}</strong><span>${punch.time}</span></div><i class="fa-solid fa-check clock-punch-check" aria-hidden="true"></i></div>`).join('') : '<p class="clock-punch-empty">Nenhum ponto compatível com o horário atual.</p>';
    document.getElementById('clockEntryTime').textContent = availablePunches.find(punch => punch.label === 'Entrada')?.time || '--:--';
    document.getElementById('clockLastPunch').textContent = availablePunches.at(-1)?.time || '--:--';

    if (button) {
        button.disabled = Boolean(nextPunch);
        button.classList.toggle('clock-punch-button-disabled', Boolean(nextPunch));
        button.querySelector('span').textContent = nextPunch ? `Próximo ponto às ${nextPunch.time}` : 'Registrar ponto';
    }
}

function updateLiveClock() {
    const now = new Date();
    const digitalTime = document.getElementById('clockDigitalTime');
    const clockDate = document.getElementById('clockCurrentDate');
    if (digitalTime) digitalTime.textContent = now.toLocaleTimeString('pt-BR', { hour12: false });
    if (clockDate) clockDate.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    renderClockPunches(now);
}

updateLiveClock();
setInterval(updateLiveClock, 1000);

document.getElementById('clockPunchButton')?.addEventListener('click', () => {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const available = clockPunches.filter(punch => currentMinutes(now) >= scheduleMinutes(punch.time));
    document.getElementById('clockLastPunch').textContent = available.at(-1)?.time || time;
    document.getElementById('clockPunchStatus').textContent = `Próximo ponto possível às ${available.at(-1)?.time || time}`;
});

let calendarVisibleDate = new Date();
calendarVisibleDate.setDate(1);
calendarVisibleDate.setHours(12, 0, 0, 0);

function calendarDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dateOffsetKey(offset) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return calendarDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

const calendarEvents = new Map([
    [dateOffsetKey(0), [{ title: 'Reunião de equipe', time: '09:30', type: 'purple' }, { title: 'Revisão de indicadores', time: '14:00', type: 'blue' }]],
    [dateOffsetKey(2), [{ title: 'Entrevista com candidato', time: '10:00', type: 'orange' }]],
    [dateOffsetKey(4), [{ title: 'Dia de folga', time: 'Dia inteiro', type: 'green' }]],
    [dateOffsetKey(7), [{ title: 'Alinhamento mensal', time: '15:30', type: 'purple' }]],
    [dateOffsetKey(10), [{ title: 'Aniversário da empresa', time: '16:00', type: 'pink' }]]
]);

function renderCalendar() {
    const year = calendarVisibleDate.getFullYear();
    const month = calendarVisibleDate.getMonth();
    const monthName = calendarVisibleDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    document.getElementById('calendarMonthTitle').textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const cells = [];
    const todayKey = calendarDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    for (let index = 0; index < 42; index += 1) {
        let day;
        let cellMonth = month;
        let cellYear = year;
        let outside = false;

        if (index < firstWeekday) {
            day = daysInPreviousMonth - firstWeekday + index + 1;
            cellMonth = month - 1;
            outside = true;
        } else if (index >= firstWeekday + daysInMonth) {
            day = index - firstWeekday - daysInMonth + 1;
            cellMonth = month + 1;
            outside = true;
        } else {
            day = index - firstWeekday + 1;
        }

        if (cellMonth < 0) { cellMonth = 11; cellYear -= 1; }
        if (cellMonth > 11) { cellMonth = 0; cellYear += 1; }
        const key = calendarDateKey(cellYear, cellMonth, day);
        const events = calendarEvents.get(key) || [];
        const eventMarkup = events.slice(0, 3).map(event => `<span class="calendar-event calendar-event-${event.type}" title="${event.title}">${event.time !== 'Dia inteiro' ? `${event.time} · ` : ''}${event.title}</span>`).join('');
        const extra = events.length > 3 ? `<span class="calendar-more-events">+${events.length - 3} mais</span>` : '';
        cells.push(`<button type="button" class="calendar-day${outside ? ' calendar-day-outside' : ''}${key === todayKey ? ' calendar-day-today' : ''}" data-calendar-date="${key}" role="gridcell"><span class="calendar-day-number">${day}</span><span class="calendar-day-events">${eventMarkup}${extra}</span></button>`);
    }
    document.getElementById('calendarGrid').innerHTML = cells.join('');
    renderCalendarAgenda();
}

function renderCalendarAgenda() {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const upcoming = Array.from(calendarEvents.entries())
        .filter(([key]) => new Date(`${key}T12:00:00`) >= today)
        .sort(([a], [b]) => a.localeCompare(b));

    const agenda = upcoming.flatMap(([key, events]) => events.map(event => ({ key, ...event })));
    document.getElementById('calendarAgendaList').innerHTML = agenda.length ? agenda.slice(0, 6).map(event => {
        const date = new Date(`${event.key}T12:00:00`);
        return `<article class="calendar-agenda-item calendar-agenda-${event.type}"><time datetime="${event.key}"><strong>${date.getDate()}</strong><span>${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></time><div><strong>${event.title}</strong><span><i class="fa-solid fa-clock" aria-hidden="true"></i>${event.time}</span></div></article>`;
    }).join('') : '<p class="calendar-agenda-empty">Nenhum compromisso próximo.</p>';
}

function shiftCalendarMonth(amount) {
    calendarVisibleDate.setMonth(calendarVisibleDate.getMonth() + amount);
    renderCalendar();
}

document.getElementById('calendarPrevButton')?.addEventListener('click', () => shiftCalendarMonth(-1));
document.getElementById('calendarNextButton')?.addEventListener('click', () => shiftCalendarMonth(1));
document.getElementById('calendarTodayButton')?.addEventListener('click', () => { calendarVisibleDate = new Date(); calendarVisibleDate.setDate(1); renderCalendar(); });
document.getElementById('calendarGrid')?.addEventListener('click', event => {
    const day = event.target.closest('[data-calendar-date]');
    if (!day) return;
    document.querySelectorAll('[data-calendar-date]').forEach(cell => cell.classList.remove('calendar-day-selected'));
    day.classList.add('calendar-day-selected');
});
renderCalendar();

function toLocalDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatShortDate(value) {
    return parseLocalDate(value).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function buildTimesheetRecords() {
    const records = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (let offset = 0; offset < 30; offset += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        const day = date.getDay();
        if (day === 0 || day === 6) continue;

        records.push({
            date: toLocalDateInput(date),
            entry: offset === 0 ? '08:02' : '08:00',
            lunchStart: '12:00',
            lunchEnd: '13:30',
            exit: offset === 0 ? '17:42' : '17:30',
            total: offset === 0 ? '08h 40min' : '08h 00min'
        });
    }
    return records;
}

const timesheetRecords = buildTimesheetRecords();

function renderTimesheet(records) {
    document.getElementById('timesheetTableBody').innerHTML = records.length ? records.map(record => {
        const weekday = parseLocalDate(record.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
        return `<tr>
            <td><strong>${weekday}</strong></td>
            <td>${record.entry}</td>
            <td>${record.lunchStart}</td>
            <td>${record.lunchEnd}</td>
            <td>${record.exit}</td>
            <td><span class="timesheet-last-punch"><i class="fa-solid fa-clock"></i>${record.exit}</span></td>
            <td><strong>${record.total}</strong></td>
        </tr>`;
    }).join('') : '<tr><td colspan="7" class="timesheet-empty">Nenhum registro encontrado para o período informado.</td></tr>';
    document.getElementById('timesheetRecordCount').textContent = `${records.length} ${records.length === 1 ? 'registro' : 'registros'}`;
}

function initializeTimesheet() {
    const userEmail = window.sydleAuth.getUserEmail();
    const profile = getProfile(userEmail);
    document.getElementById('timesheetEmployeeName').value = profile.name;
    document.getElementById('timesheetEmployeeEmail').value = profile.email;
    document.getElementById('timesheetEmployeeDepartment').value = profile.department;

    const endInput = document.getElementById('timesheetEndDate');
    const startInput = document.getElementById('timesheetStartDate');
    endInput.value = toLocalDateInput(new Date());
    const monthStart = new Date();
    monthStart.setDate(1);
    startInput.value = toLocalDateInput(monthStart);

    renderTimesheet(timesheetRecords);
    document.getElementById('timesheetResultsPeriod').textContent = 'Todos os registros disponíveis';
}

const timesheetFilterForm = document.getElementById('timesheetFilterForm');
timesheetFilterForm.addEventListener('submit', event => {
    event.preventDefault();
    const start = document.getElementById('timesheetStartDate').value;
    const end = document.getElementById('timesheetEndDate').value;
    if (!start || !end) return;

    if (start > end) {
        document.getElementById('timesheetResultsPeriod').textContent = 'A data inicial não pode ser posterior à data final.';
        renderTimesheet([]);
        return;
    }

    const filtered = timesheetRecords.filter(record => record.date >= start && record.date <= end);
    document.getElementById('timesheetResultsPeriod').textContent = `${formatShortDate(start)} a ${formatShortDate(end)}`;
    renderTimesheet(filtered);
});
initializeTimesheet();
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
    const isTimesheet = pageName === 'Folha de ponto';
    const isCalendar = pageName === 'Calendário';
    const isClock = pageName === 'Relógio de ponto';
    dashboardGrid.classList.toggle('hidden', !isDashboard);
    profileState.classList.toggle('hidden', !isProfile);
    timesheetState.classList.toggle('hidden', !isTimesheet);
    calendarState.classList.toggle('hidden', !isCalendar);
    clockState.classList.toggle('hidden', !isClock);
    constructionState.classList.toggle('hidden', isDashboard || isProfile || isTimesheet || isCalendar || isClock);
    constructionState.classList.toggle('flex', !isDashboard && !isProfile && !isTimesheet && !isCalendar && !isClock);
    if (isTimesheet) initializeTimesheet();
    if (isCalendar) renderCalendar();

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
