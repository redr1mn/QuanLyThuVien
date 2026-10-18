(() => {
    const password = document.getElementById('Password');
    const toggle = document.getElementById('toggle-password');
    toggle?.addEventListener('click', () => {
        const visible = password.type === 'password';
        password.type = visible ? 'text' : 'password';
        toggle.textContent = visible ? 'Ẩn' : 'Hiện';
        toggle.setAttribute('aria-pressed', String(visible));
    });

    const errors = document.querySelector('.library-auth-errors.validation-summary-errors');
    // Sau POST thất bại, đưa focus tới lỗi server để người dùng bàn phím không phải tìm lại thông báo.
    errors?.focus();
})();
