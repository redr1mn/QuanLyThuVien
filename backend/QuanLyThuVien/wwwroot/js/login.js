(() => {
    document.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
        const targetId = toggle.getAttribute('data-password-toggle');
        const password = targetId ? document.getElementById(targetId) : null;
        toggle.addEventListener('click', () => {
            if (!password) return;
            const visible = password.type === 'password';
            password.type = visible ? 'text' : 'password';
            toggle.textContent = visible ? 'Ẩn' : 'Hiện';
            toggle.setAttribute('aria-pressed', String(visible));
        });
    });

    const errors = document.querySelector('.library-auth-errors.validation-summary-errors');
    // Sau POST thất bại, đưa focus tới lỗi server để người dùng bàn phím không phải tìm lại thông báo.
    errors?.focus();
})();
