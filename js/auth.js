(function () {
    const sessionKey = 'sydle-authenticated';
    const userEmailKey = 'sydle-user-email';

    window.sydleAuth = {
        isAuthenticated() {
            const email = sessionStorage.getItem(userEmailKey);

            return sessionStorage.getItem(sessionKey) === 'true'
                && Boolean(email)
                && window.SYDLE_CREDENTIALS.includes(email);
        },
        getUserEmail() {
            return this.isAuthenticated() ? sessionStorage.getItem(userEmailKey) : null;
        },
        login(email) {
            const normalizedEmail = email.trim().toLowerCase();

            if (!window.SYDLE_CREDENTIALS.includes(normalizedEmail)) {
                throw new Error('Não é possível iniciar sessão com um email não cadastrado.');
            }

            sessionStorage.setItem(userEmailKey, normalizedEmail);
            sessionStorage.setItem(sessionKey, 'true');
        },
        logout() {
            sessionStorage.removeItem(sessionKey);
            sessionStorage.removeItem(userEmailKey);
        }
    };

    if (document.documentElement.hasAttribute('data-requires-auth') && !window.sydleAuth.isAuthenticated()) {
        window.sydleAuth.logout();
        document.documentElement.style.visibility = 'hidden';
        window.location.replace('index.html#login');
    }
})();
