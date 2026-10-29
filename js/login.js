const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');

loginForm.addEventListener('submit', event => {
    event.preventDefault();
    emailError.textContent = '';
    emailInput.removeAttribute('aria-invalid');

    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
        showEmailError('Informe seu email para continuar.');
        return;
    }

    emailInput.value = email;

    if (!emailInput.validity.valid) {
        showEmailError('Informe um endereço de email válido.');
        return;
    }

    if (!window.SYDLE_CREDENTIALS.includes(email)) {
        showEmailError('Email não cadastrado. Verifique o endereço e tente novamente.');
        return;
    }

    window.sydleAuth.login(email);
    emailInput.value = '';
    window.sydleApp.navigate('dashboard');
});

emailInput.addEventListener('input', () => {
    emailError.textContent = '';
    emailInput.removeAttribute('aria-invalid');
});

function showEmailError(message) {
    emailError.textContent = message;
    emailInput.setAttribute('aria-invalid', 'true');
    emailInput.focus();
}
