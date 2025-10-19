// Admin page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (in real app, this would be server-side)
        if (username === 'admin' && password === 'password123') {
            loginMessage.textContent = 'Login berhasil! Mengarahkan ke dashboard...';
            loginMessage.className = 'alert alert-success';
            loginMessage.classList.remove('hidden');
            
            // Simulate redirect to admin dashboard
            setTimeout(() => {
                showNotification('Login berhasil! (Dashboard akan ditampilkan di sini)', 'success');
                // In real app: window.location.href = 'admin-dashboard.html';
            }, 2000);
        } else {
            loginMessage.textContent = 'Username atau password salah!';
            loginMessage.className = 'alert alert-error';
            loginMessage.classList.remove('hidden');
        }
    });
});