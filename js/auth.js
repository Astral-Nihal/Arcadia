// auth.js - Handles login and registration form submissions.

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMessageDiv = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);

            try {
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = 'dashboard.php';
                } else {
                    errorMessageDiv.textContent = result.message || 'An unknown error occurred.';
                }
            } catch (error) {
                errorMessageDiv.textContent = 'Could not connect to the server.';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);

            try {
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Redirect to login page after successful registration
                    alert('Registration successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    errorMessageDiv.textContent = result.message || 'An unknown error occurred.';
                }
            } catch (error) {
                errorMessageDiv.textContent = 'Could not connect to the server.';
            }
        });
    }
});
