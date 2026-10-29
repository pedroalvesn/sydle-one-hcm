// js/script.js - Arquivo Completo da Lista de Vagas

const defaultJobs = [
    {
        id: '1',
        title: 'Namorado da Carla',
        location: 'Fortaleza, CE',
        timestamp: new Date(2026, 8, 19, 15, 34).getTime(),
        timestampExact: '19/09/2026 às 15:34',
        candidates: 1,
        status: 'Publicado',
        department: 'design',
        contractType: 'Tempo indeterminado',
        workSchedule: 'Tempo integral',
        annualSalary: 'Beijinhos e chameguinhos',
        restrictedTo: 'carla@gmail.com'
    },
    {
        id: '2',
        title: 'Desenvolvedor Frontend Senior',
        location: 'São Paulo, SP',
        timestamp: Date.now() - (1 * 24 * 3600 * 1000),
        timestampExact: new Date().toLocaleString('pt-BR'),
        candidates: 14,
        status: 'Publicado',
        department: 'ti'
    },
    {
        id: '3',
        title: 'Product Designer (UI/UX)',
        location: 'Trabalho remoto',
        timestamp: Date.now() - (3 * 24 * 3600 * 1000),
        timestampExact: new Date().toLocaleString('pt-BR'),
        candidates: 8,
        status: 'Publicado',
        department: 'design'
    },
    {
        id: '4',
        title: 'Analista de QA / Testes',
        location: 'Fortaleza, CE',
        timestamp: Date.now() - (5 * 24 * 3600 * 1000),
        timestampExact: new Date().toLocaleString('pt-BR'),
        candidates: 5,
        status: 'Rascunho',
        department: 'ti'
    },
    {
        id: '5',
        title: 'Executivo de Vendas (B2B)',
        location: 'Rio de Janeiro, RJ',
        timestamp: Date.now() - (12 * 24 * 3600 * 1000),
        timestampExact: new Date().toLocaleString('pt-BR'),
        candidates: 3,
        status: 'Publicado',
        department: 'vendas'
    },
    {
        id: '6',
        title: 'Engenheiro de Software Fullstack',
        location: 'Curitiba, PR',
        timestamp: Date.now() - (30 * 24 * 3600 * 1000),
        timestampExact: new Date().toLocaleString('pt-BR'),
        candidates: 21,
        status: 'Publicado',
        department: 'ti'
    }
];

let currentSortColumn = null;
let isSortAsc = true;

function getCurrentUserEmail() {
    if (window.sydleAuth && typeof window.sydleAuth.getUserEmail === 'function') {
        const email = window.sydleAuth.getUserEmail();
        if (email) return email.toLowerCase().trim();
    }
    const sessionEmail = sessionStorage.getItem('sydle-user-email');
    return sessionEmail ? sessionEmail.toLowerCase().trim() : '';
}

function getJobs() {
    const stored = localStorage.getItem('sydle_jobs');
    let jobs = stored ? JSON.parse(stored) : [];

    if (!stored || jobs.length === 0) {
        jobs = defaultJobs;
        localStorage.setItem('sydle_jobs', JSON.stringify(jobs));
        return jobs;
    }

    // Garante sincronização das permissões e das vagas fakes no localStorage
    defaultJobs.forEach(defJob => {
        const existingIndex = jobs.findIndex(j => j.id === defJob.id);
        if (existingIndex === -1) {
            jobs.push(defJob);
        } else {
            if (defJob.restrictedTo) {
                jobs[existingIndex].restrictedTo = defJob.restrictedTo;
            }
            ['contractType', 'workSchedule', 'annualSalary'].forEach(field => {
                if (!jobs[existingIndex][field] && defJob[field]) {
                    jobs[existingIndex][field] = defJob[field];
                }
            });
        }
    });

    localStorage.setItem('sydle_jobs', JSON.stringify(jobs));
    return jobs;
}

function formatRelativeTime(timestamp) {
    if (!timestamp) return 'há pouco';
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (diffHours < 1) return 'há poucos minutos';
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `há ${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`;
    return 'há mais de um ano';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function handleSort(column) {
    if (currentSortColumn === column) {
        isSortAsc = !isSortAsc;
    } else {
        currentSortColumn = column;
        isSortAsc = true;
    }

    ['title', 'timestamp', 'candidates', 'status'].forEach(col => {
        const icon = document.getElementById(`icon-${col}`);
        if (icon) {
            if (col === column) {
                icon.className = isSortAsc ? 'fa-solid fa-arrow-up text-primary' : 'fa-solid fa-arrow-down text-primary';
            } else {
                icon.className = 'fa-solid fa-sort text-gray-400';
            }
        }
    });

    renderTable();
}

function renderTable() {
    let jobs = getJobs();
    const currentUserEmail = getCurrentUserEmail();
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('jobFilter');

    if (!tableBody) return;

    // Regra de Permissão: A vaga "Namorado da Carla" só aparece para carla@gmail.com
    jobs = jobs.filter(job => {
        if (job.restrictedTo) {
            return job.restrictedTo.toLowerCase() === currentUserEmail;
        }
        return true;
    });

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
        jobs = jobs.filter(j => 
            j.title.toLowerCase().includes(searchTerm) || 
            j.location.toLowerCase().includes(searchTerm)
        );
    }

    if (filterSelect && filterSelect.value) {
        const filterVal = filterSelect.value.toLowerCase();
        jobs = jobs.filter(j => j.department === filterVal || j.status.toLowerCase() === filterVal);
    }

    if (currentSortColumn) {
        jobs.sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return isSortAsc ? -1 : 1;
            if (valA > valB) return isSortAsc ? 1 : -1;
            return 0;
        });
    }

    if (jobs.length === 0) {
        tableBody.innerHTML = '';
        const mobileCards = document.getElementById('jobsMobileCards');
        if (mobileCards) mobileCards.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const mobileCards = document.getElementById('jobsMobileCards');
    if (mobileCards) {
        mobileCards.innerHTML = jobs.map(job => {
            const mobileAction = job.id === '1'
                ? `<a href="#job-details?id=${encodeURIComponent(job.id)}" class="jobs-mobile-action" title="Editar vaga" aria-label="Editar ${escapeHtml(job.title)}"><i class="fa-solid fa-arrow-right"></i></a>`
                : `<button type="button" class="jobs-mobile-action" disabled aria-label="Ação indisponível"><i class="fa-solid fa-arrow-right"></i></button>`;
            const statusClass = job.status === 'Publicado' ? 'published' : 'draft';

            return `<article class="jobs-mobile-card">
                <div class="jobs-mobile-card-title">
                    <div><strong>${escapeHtml(job.title)}</strong><span>${escapeHtml(job.location)}</span></div>
                    ${mobileAction}
                </div>
                <dl>
                    <div><dt>Criado em</dt><dd>${formatRelativeTime(job.timestamp)}</dd></div>
                    <div><dt>Candidatos</dt><dd>${job.candidates}</dd></div>
                    <div><dt>Status</dt><dd><span class="jobs-mobile-status ${statusClass}">${escapeHtml(job.status)}</span></dd></div>
                </dl>
            </article>`;
        }).join('');
    }

    tableBody.innerHTML = jobs.map(job => {
        const chipStyles = {
            'Publicado': 'bg-green-50 text-green-700 border-green-200',
            'Rascunho': 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };

        const dotStyles = {
            'Publicado': 'bg-green-500',
            'Rascunho': 'bg-yellow-500'
        };

        const chipClass = chipStyles[job.status] || 'bg-gray-50 text-gray-700 border-gray-200';
        const dotClass = dotStyles[job.status] || 'bg-gray-400';

        // REGRA DE REDIRECIONAMENTO: Apenas a vaga com ID '1' (Namorado da Carla) redireciona para a tela de edição
        const actionLink = job.id === '1'
            ? `<a href="#job-details?id=${encodeURIComponent(job.id)}" class="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-primary transition-colors hover:bg-[#f0e6fa]" title="Editar vaga" aria-label="Editar ${escapeHtml(job.title)}">
                    <i class="fa-solid fa-arrow-right"></i>
               </a>`
            : `<button type="button" disabled class="inline-flex cursor-not-allowed items-center justify-center rounded-lg p-2 text-gray-300" title="Indisponível">
                    <i class="fa-solid fa-arrow-right"></i>
               </button>`;

        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition-colors h-14">
                <td data-label="Oferta" class="px-6 py-4 font-bold text-gray-900">
                    <div>${escapeHtml(job.title)}</div>
                    <div class="text-xs font-normal text-gray-400 mt-0.5">${escapeHtml(job.location)}</div>
                </td>
                <td data-label="Criado em" class="px-6 py-4 text-gray-600" title="${job.timestampExact || ''}">
                    ${formatRelativeTime(job.timestamp)}
                </td>
                <td data-label="Candidatos" class="px-6 py-4 text-gray-600 font-medium">
                    ${job.candidates}
                </td>
                <td data-label="Status" class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${chipClass}">
                        <span class="w-2 h-2 rounded-full ${dotClass}"></span>
                        ${escapeHtml(job.status)}
                    </span>
                </td>
                <td data-label="Ações" class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${actionLink}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }

    const filterSelect = document.getElementById('jobFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', renderTable);
    }
});

window.sydleJobs = { getJobs, render: renderTable };