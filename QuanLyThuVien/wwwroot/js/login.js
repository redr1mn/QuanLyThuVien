(() => {
    const password = document.getElementById('Password');
    const toggle = document.getElementById('toggle-password');
    toggle?.addEventListener('click', () => {
        const visible = password.type === 'password';
        password.type = visible ? 'text' : 'password';
        toggle.textContent = visible ? 'Ẩn' : 'Hiện';
        toggle.setAttribute('aria-pressed', String(visible));
    });

    const username = document.getElementById('Username');
    const demoButtons = document.querySelectorAll('[data-demo-username]');
    demoButtons.forEach(button => {
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
            username.value = button.dataset.demoUsername;
            username.dispatchEvent(new Event('input', { bubbles: true }));
            demoButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
            password.focus();
        });
    });

    const errors = document.querySelector('.library-auth-errors.validation-summary-errors');
    errors?.focus();
})();
