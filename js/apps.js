(function () {
    const tickets = [
        { id: '#SD-1048', title: 'Acesso ao sistema CRM', description: 'Solicitação de permissão para o módulo comercial.', type: 'Solicitação', requester: 'Lucas Mendes', date: '29/10/2026 09:14', mine: true },
        { id: '#SD-1047', title: 'Notebook não inicia', description: 'Equipamento apresenta tela preta ao ligar.', type: 'Incidente', requester: 'Ana Souza', date: '29/10/2026 08:42', mine: false },
        { id: '#SD-1046', title: 'VPN instável', description: 'Desconexões recorrentes durante a conexão remota.', type: 'Incidente', requester: 'Pedro Alves', date: '28/10/2026 17:20', mine: true },
        { id: '#SD-1045', title: 'Novo usuário no ERP', description: 'Cadastro de colaborador recém-admitido.', type: 'Solicitação', requester: 'Marina Costa', date: '28/10/2026 15:03', mine: false },
        { id: '#SD-1044', title: 'Falha na integração de folha', description: 'Dados não sincronizam entre os sistemas.', type: 'Problema', requester: 'Carla Vieira', date: '28/10/2026 11:35', mine: true },
        { id: '#SD-1043', title: 'Monitor com imagem tremida', description: 'Flickering constante no segundo monitor.', type: 'Incidente', requester: 'Pedro Alves', date: '27/10/2026 16:48', mine: true }
    ];

    const services = {
        'Conectividade e Suporte': {
            icon: 'fa-wifi', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
            items: ['Problemas com Wi-Fi', 'Solicitar VPN', 'Erro de internet', 'Suporte ao celular']
        },
        'Equipamento': {
            icon: 'fa-laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
            items: ['Computador novo', 'Manutenção de notebook', 'Monitor ou periférico', 'Troca de equipamento']
        },
        'Governança': {
            icon: 'fa-shield-halved', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
            items: ['Solicitar relatório', 'Gestão de acessos', 'Política corporativa', 'Auditoria de dados']
        },
        'Infraestrutura de TI': {
            icon: 'fa-server', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
            items: ['Falha em servidor', 'Solicitar capacidade', 'Rede corporativa', 'Backup e recuperação']
        },
        'RH': {
            icon: 'fa-users', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
            items: ['Acesso para novo colaborador', 'Alteração de cargo', 'Folha de pagamento', 'Desligamento de usuário']
        },
        'Sistemas': {
            icon: 'fa-window-restore', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            items: ['Erro em aplicativo', 'Solicitar novo perfil', 'Dúvida de funcionalidade', 'Falha de integração']
        }
    };

    let activeService = null;
    let initialized = false;

    const serviceDeskUsers = {
        'carla@gmail.com': { name: 'Carla Vieira', initials: 'CV' },
        'pedro@gmail.com': { name: 'Pedro Alves', initials: 'PA' }
    };

    function getCurrentUser() {
        const email = window.sydleAuth && window.sydleAuth.getUserEmail ? window.sydleAuth.getUserEmail() : null;
        return serviceDeskUsers[email] || { name: 'Usuário', initials: 'US' };
    }

    function updateCurrentUser() {
        const currentUser = getCurrentUser();
        document.getElementById('serviceDeskUserName').textContent = currentUser.name;
        document.getElementById('serviceDeskUserInitials').textContent = currentUser.initials;
        document.getElementById('myTicketsTableBody').innerHTML = renderTickets('', '', true);
    }

    function escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = value;
        return element.innerHTML;
    }

    function renderTickets(search = '', type = '', mineOnly = false) {
        const currentUser = getCurrentUser();
        const source = mineOnly ? tickets.filter(ticket => ticket.requester === currentUser.name) : tickets;
        const normalized = search.trim().toLowerCase();
        const filtered = source.filter(ticket => {
            const matchesSearch = !normalized || `${ticket.id} ${ticket.title} ${ticket.description} ${ticket.requester}`.toLowerCase().includes(normalized);
            return matchesSearch && (!type || ticket.type === type);
        });
        const rows = filtered.map(ticket => `<tr><td><strong>${ticket.id}</strong></td><td>${escapeHtml(ticket.title)}</td><td>${escapeHtml(ticket.description)}</td><td><span class="service-ticket-type type-${ticket.type.toLowerCase()}">${ticket.type}</span></td><td>${escapeHtml(ticket.requester)}</td><td>${ticket.date}</td></tr>`).join('');
        return rows || '<tr><td colspan="6" class="service-empty-row">Nenhum chamado encontrado.</td></tr>';
    }

    function showPage(page) {
        document.querySelectorAll('[data-service-panel]').forEach(panel => {
            const active = panel.dataset.servicePanel === page;
            panel.hidden = !active;
            panel.classList.toggle('service-page-active', active);
        });
        document.querySelectorAll('[data-service-page]').forEach(button => button.classList.toggle('service-desk-nav-active', button.dataset.servicePage === page));
        const titles = { dashboard: 'Painel', tickets: 'Chamados', services: 'Serviços', 'my-tickets': 'Meus chamados' };
        document.getElementById('serviceDeskPageTitle').textContent = titles[page];
    }

    function renderServiceCatalog() {
        const grid = document.getElementById('serviceCatalog');
        grid.innerHTML = Object.entries(services).map(([name, service], index) => `
            <button class="service-category-card" type="button" data-service-category="${name}" style="--card-delay:${index * 45}ms">
                <img src="${service.image}" alt="" loading="lazy"><span class="service-category-overlay"></span>
                <span class="service-category-content"><i class="fa-solid ${service.icon}" aria-hidden="true"></i><strong>${name}</strong><small>Ver opções <i class="fa-solid fa-arrow-right"></i></small></span>
            </button>`).join('');
    }

    function openSubmenu(name) {
        activeService = name;
        const service = services[name];
        document.getElementById('serviceCatalog').classList.add('service-catalog-leaving');
        setTimeout(() => {
            document.getElementById('serviceCatalog').hidden = true;
            document.getElementById('serviceCatalog').classList.remove('service-catalog-leaving');
            document.getElementById('serviceSubmenuTitle').textContent = name;
            document.getElementById('serviceSubmenuIcon').innerHTML = `<i class="fa-solid ${service.icon}"></i>`;
            document.getElementById('serviceSubmenuGrid').innerHTML = service.items.map((item, index) => `<button type="button" data-service-option="${escapeHtml(item)}" style="--item-delay:${index * 55}ms"><span><i class="fa-solid fa-headset"></i></span><strong>${escapeHtml(item)}</strong><i class="fa-solid fa-chevron-right"></i></button>`).join('');
            document.getElementById('serviceSubmenu').hidden = false;
            document.getElementById('serviceSubmenu').classList.remove('service-enter');
            void document.getElementById('serviceSubmenu').offsetWidth;
            document.getElementById('serviceSubmenu').classList.add('service-enter');
        }, 220);
    }

    function openRequest(option) {
        document.getElementById('serviceRequestCategory').textContent = `${activeService} · ${option}`;
        document.getElementById('serviceRequestTitle').textContent = option;
        document.querySelector('#ticketRequestForm input[name="title"]').value = option;
        document.getElementById('serviceSubmenu').hidden = true;
        document.getElementById('serviceRequestForm').hidden = false;
        document.getElementById('serviceRequestForm').classList.add('service-enter');
    }

    function backToCatalog() {
        document.getElementById('serviceSubmenu').hidden = true;
        document.getElementById('serviceRequestForm').hidden = true;
        document.getElementById('serviceCatalog').hidden = false;
        document.getElementById('serviceCatalog').classList.add('service-enter');
    }

    function initialize() {
        if (initialized) return;
        initialized = true;
        const sidebar = document.getElementById('serviceDeskSidebar');
        const menuButton = document.getElementById('serviceDeskMenuButton');
        const closeSidebar = () => {
            sidebar.classList.remove('service-desk-sidebar-open');
            menuButton.setAttribute('aria-expanded', 'false');
        };
        menuButton.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('service-desk-sidebar-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
        window.addEventListener('resize', () => { if (window.innerWidth > 760) closeSidebar(); });
        document.querySelectorAll('[data-service-page]').forEach(button => button.addEventListener('click', closeSidebar));
        const currentUser = getCurrentUser();
        document.getElementById('serviceDeskUserName').textContent = currentUser.name;
        document.getElementById('serviceDeskUserInitials').textContent = currentUser.initials;
        const date = document.getElementById('serviceDashboardDate');
        date.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
        document.getElementById('ticketsTableBody').innerHTML = renderTickets();
        document.getElementById('myTicketsTableBody').innerHTML = renderTickets('', '', true);
        renderServiceCatalog();
        document.querySelectorAll('[data-service-page]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.servicePage)));
        document.getElementById('ticketSearch').addEventListener('input', event => document.getElementById('ticketsTableBody').innerHTML = renderTickets(event.target.value, document.getElementById('ticketTypeFilter').value));
        document.getElementById('ticketTypeFilter').addEventListener('change', event => document.getElementById('ticketsTableBody').innerHTML = renderTickets(document.getElementById('ticketSearch').value, event.target.value));
        document.getElementById('myTicketSearch').addEventListener('input', event => {
            const normalized = event.target.value.trim().toLowerCase();
            document.getElementById('myTicketsTableBody').innerHTML = renderTickets(normalized, '', true);
        });
        document.getElementById('serviceCatalog').addEventListener('click', event => {
            const card = event.target.closest('[data-service-category]');
            if (card) openSubmenu(card.dataset.serviceCategory);
        });
        document.getElementById('serviceSubmenuGrid').addEventListener('click', event => {
            const option = event.target.closest('[data-service-option]');
            if (option) openRequest(option.dataset.serviceOption);
        });
        document.getElementById('serviceBackButton').addEventListener('click', backToCatalog);
        document.getElementById('serviceRequestBack').addEventListener('click', () => {
            document.getElementById('serviceRequestForm').hidden = true;
            document.getElementById('serviceSubmenu').hidden = false;
        });
        document.getElementById('ticketRequestForm').addEventListener('submit', event => {
            event.preventDefault();
            const toast = document.getElementById('serviceDeskToast');
            toast.hidden = false;
            requestAnimationFrame(() => toast.classList.add('service-desk-toast-visible'));
            event.currentTarget.reset();
            setTimeout(() => {
                toast.classList.remove('service-desk-toast-visible');
                setTimeout(() => { toast.hidden = true; }, 250);
            }, 3200);
        });
    }

    const crmStages = [
        'Lead in', 'Contato iniciado', 'Aguardando definição', 'Proposta enviada', 'Negociações iniciadas'
    ];
    const crmCards = [
        { id: 'op-1', title: 'Renovação Sitelink', owner: 'Carla Vieira', initials: 'CV', stage: 0 },
        { id: 'op-2', title: 'Expansão Atlas Tech', owner: 'Pedro Alves', initials: 'PA', stage: 0 },
        { id: 'op-3', title: 'Implantação Nortec', owner: 'Ana Souza', initials: 'AS', stage: 1 },
        { id: 'op-4', title: 'Projeto Orion Cloud', owner: 'Lucas Mendes', initials: 'LM', stage: 1 },
        { id: 'op-5', title: 'Automação Vértice', owner: 'Carla Vieira', initials: 'CV', stage: 2 },
        { id: 'op-6', title: 'Contrato Luna Saúde', owner: 'Pedro Alves', initials: 'PA', stage: 3 },
        { id: 'op-7', title: 'Migração Horizonte', owner: 'Ana Souza', initials: 'AS', stage: 3 },
        { id: 'op-8', title: 'Parceria Solaris', owner: 'Lucas Mendes', initials: 'LM', stage: 4 }
    ];
    let crmInitialized = false;

    function renderCrmKanban() {
        const kanban = document.getElementById('crmKanban');
        kanban.innerHTML = crmStages.map((stage, stageIndex) => {
            const cards = crmCards.filter(card => card.stage === stageIndex);
            const cardsHtml = cards.map((card, index) => `
                <article class="crm-deal-card" draggable="true" data-crm-card="${card.id}" style="--deal-delay:${index * 55}ms">
                    <strong>${escapeHtml(card.title)}</strong><div class="crm-deal-footer"><span class="crm-avatar crm-avatar-${(index + stageIndex) % 5}" title="${escapeHtml(card.owner)}">${card.initials}</span><small>${escapeHtml(card.owner)}</small></div>
                </article>`).join('');
            return `<section class="crm-lane" data-crm-stage="${stageIndex}"><header><div><strong>${stage}</strong><span>${cards.length}</span></div><button type="button" aria-label="Mais opções"><i class="fa-solid fa-ellipsis"></i></button></header><div class="crm-lane-cards">${cardsHtml || '<p class="crm-empty-lane">Arraste um negócio para cá</p>'}</div></section>`;
        }).join('');
    }

    function initializeCrm() {
        if (crmInitialized) return;
        crmInitialized = true;
        renderCrmKanban();
        const activities = crmCards.map((card, index) => ({
            title: card.title,
            name: ['Mariana Rocha', 'Rafael Lima', 'Juliana Martins', 'Bruno Costa'][index % 4],
            email: ['mariana@empresa.com', 'rafael@empresa.com', 'juliana@empresa.com', 'bruno@empresa.com'][index % 4],
            phone: ['(85) 98821-4010', '(85) 99712-8254', '(85) 98144-7302', '(85) 99910-5528'][index % 4],
            done: index === 1 || index === 5
        }));
        document.getElementById('crmActivitiesBody').innerHTML = activities.map((activity, index) => `<tr><td><label class="crm-checkbox"><input type="checkbox" ${activity.done ? 'checked' : ''}><span></span></label></td><td><strong>${escapeHtml(activity.title)}</strong></td><td>${activity.name}</td><td>${activity.email}</td><td>${activity.phone}</td></tr>`).join('');
        const crmSidebar = document.getElementById('crmSidebar');
        const crmMenuButton = document.getElementById('crmMenuButton');
        const closeCrmSidebar = () => {
            crmSidebar.classList.remove('crm-sidebar-open');
            crmMenuButton.setAttribute('aria-expanded', 'false');
        };
        crmMenuButton.addEventListener('click', () => {
            const isOpen = crmSidebar.classList.toggle('crm-sidebar-open');
            crmMenuButton.setAttribute('aria-expanded', String(isOpen));
        });
        window.addEventListener('resize', () => { if (window.innerWidth > 760) closeCrmSidebar(); });
        document.querySelectorAll('[data-crm-page]').forEach(button => button.addEventListener('click', () => {
            closeCrmSidebar();
            const page = button.dataset.crmPage;
            document.querySelectorAll('[data-crm-panel]').forEach(panel => {
                const active = panel.dataset.crmPanel === page;
                panel.hidden = !active;
                panel.classList.toggle('crm-page-active', active);
            });
            document.querySelectorAll('[data-crm-page]').forEach(nav => nav.classList.toggle('crm-nav-active', nav === button));
            document.getElementById('crmPageTitle').textContent = page === 'sales' ? 'Vendas' : page === 'activities' ? 'Atividades' : 'Gerenciamento de vendas';
        }));
        let draggedId = null;
        document.getElementById('crmKanban').addEventListener('dragstart', event => {
            const card = event.target.closest('[data-crm-card]');
            if (!card) return;
            draggedId = card.dataset.crmCard;
            card.classList.add('crm-card-dragging');
            event.dataTransfer.effectAllowed = 'move';
        });
        document.getElementById('crmKanban').addEventListener('dragend', event => {
            event.target.closest('[data-crm-card]')?.classList.remove('crm-card-dragging');
            document.querySelectorAll('.crm-lane-dragover').forEach(lane => lane.classList.remove('crm-lane-dragover'));
        });
        document.getElementById('crmKanban').addEventListener('dragover', event => {
            const lane = event.target.closest('.crm-lane');
            if (!lane) return;
            event.preventDefault();
            lane.classList.add('crm-lane-dragover');
        });
        document.getElementById('crmKanban').addEventListener('dragleave', event => event.target.closest('.crm-lane')?.classList.remove('crm-lane-dragover'));
        document.getElementById('crmKanban').addEventListener('drop', event => {
            const lane = event.target.closest('.crm-lane');
            if (!lane) return;
            event.preventDefault();
            const card = crmCards.find(item => item.id === draggedId);
            if (card) card.stage = Number(lane.dataset.crmStage);
            document.querySelectorAll('.crm-lane-dragover').forEach(item => item.classList.remove('crm-lane-dragover'));
            renderCrmKanban();
        });
        renderCrmFinance();
    }

    function renderCrmFinance() {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const revenue = [180, 220, 205, 260, 245, 290, 280, 325, 310, 360, 340, 395];
        const profit = [42, 58, 51, 69, 64, 78, 73, 91, 84, 108, 95, 121];
        const max = Math.max(...revenue);
        document.getElementById('crmChart').innerHTML = months.map((month, index) => `<div class="crm-chart-column"><div class="crm-bars"><span class="crm-bar-revenue" style="height:${revenue[index] / max * 100}%"></span><span class="crm-bar-profit" style="height:${profit[index] / max * 100}%"></span></div><small>${month}</small></div>`).join('');
        document.getElementById('crmFinanceBody').innerHTML = months.map((month, index) => `<tr><td><strong>${month}</strong></td><td>R$ ${revenue[index]},0 mil</td><td>R$ ${revenue[index] - profit[index]},0 mil</td><td>R$ ${profit[index]},0 mil</td><td>R$ ${profit[index] + 15},0 mil</td></tr>`).join('');
    }

    window.sydleApps = {
        render(selectedApp) {
            const serviceDeskShell = document.getElementById('serviceDeskShell');
            const crmShell = document.getElementById('crmShell');
            const legacyConstruction = document.getElementById('legacyAppConstruction');
            const appNames = { erp: 'Sydle ERP', crm: 'Sydle CRM', 'service-desk': 'Sydle Service Desk' };
            const isServiceDesk = selectedApp === 'service-desk';
            const isCrm = selectedApp === 'crm';

            serviceDeskShell.hidden = !isServiceDesk;
            crmShell.hidden = !isCrm;
            legacyConstruction.hidden = isServiceDesk || isCrm;

            if (isServiceDesk) {
                initialize(); updateCurrentUser(); showPage('dashboard'); return;
            }
            if (isCrm) {
                initializeCrm(); return;
            }
            const appName = document.getElementById('appName');
            if (appName) appName.textContent = appNames[selectedApp] || 'aplicativo';
        }
    };
})();
