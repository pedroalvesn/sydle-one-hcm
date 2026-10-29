(function () {
    const views = {
        login: document.getElementById('loginView'),
        dashboard: document.getElementById('dashboardView'),
        jobs: document.getElementById('jobsView'),
        'job-details': document.getElementById('jobDetailsView'),
        apps: document.getElementById('appsView')
    };
    const appNames = {
        erp: 'Sydle ERP',
        crm: 'Sydle CRM',
        'service-desk': 'Sydle Service Desk'
    };

    function parseRoute() {
        const hash = window.location.hash.slice(1);
        const [route = '', query = ''] = hash.split('?');
        return {
            route,
            params: new URLSearchParams(query)
        };
    }

    function navigate(route, params = {}, replace = false) {
        const query = new URLSearchParams(params).toString();
        const hash = `#${route}${query ? `?${query}` : ''}`;

        if (replace) {
            window.history.replaceState(null, '', hash);
            renderRoute();
        } else if (window.location.hash === hash) {
            renderRoute();
        } else {
            window.location.hash = hash;
        }
    }

    function renderRoute() {
        const { route: requestedRoute, params } = parseRoute();
        let route = requestedRoute;
        const isAuthenticated = window.sydleAuth.isAuthenticated();

        if (!route) {
            route = isAuthenticated ? 'dashboard' : 'login';
            navigate(route, {}, true);
            return;
        }

        if (!views[route]) {
            route = isAuthenticated ? 'dashboard' : 'login';
            navigate(route, {}, true);
            return;
        }

        if (route !== 'login' && !isAuthenticated) {
            navigate('login', {}, true);
            return;
        }

        if (route === 'job-details' && window.sydleAuth.getUserEmail() !== 'carla@gmail.com') {
            navigate('jobs', {}, true);
            return;
        }

        Object.entries(views).forEach(([viewName, view]) => {
            const isHidden = viewName !== route;
            view.hidden = isHidden;
            view.classList.toggle('hidden', isHidden);
        });

        document.body.className = route === 'dashboard'
            ? 'bg-gray-50 text-gray-800 font-sans min-h-screen'
            : 'bg-gray-50 text-gray-800 font-sans min-h-screen';

        if (route === 'dashboard') {
            window.refreshDashboard();
        } else if (route === 'jobs') {
            window.sydleJobs.render();
        } else if (route === 'job-details') {
            window.sydleJobDetails.load();
        } else if (route === 'apps') {
            const selectedApp = params.get('app');
            const appName = appNames[selectedApp];
            if (window.sydleApps && window.sydleApps.render) {
                window.sydleApps.render(selectedApp);
            }
            const legacyAppName = document.getElementById('appName');
            if (legacyAppName) legacyAppName.textContent = appName || 'aplicativo';
        }
    }

    window.sydleApp = { navigate };
    window.addEventListener('hashchange', renderRoute);
    document.addEventListener('DOMContentLoaded', renderRoute);
})();
