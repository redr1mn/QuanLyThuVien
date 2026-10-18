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
    // Chỉ điền username, không tự gửi form hay tự điền mật khẩu để người dùng chủ động thử luồng đăng nhập.
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
    // Sau POST thất bại, đưa focus tới lỗi server để người dùng bàn phím không phải tìm lại thông báo.
    errors?.focus();
})();
