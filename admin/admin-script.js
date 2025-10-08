// Admin Login System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin login page loaded');
    
    // Check if user is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        console.log('Already logged in, redirecting...');
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('Username:', username, 'Password:', password);
            
            // Simple authentication
            if (username === 'admin' && password === 'password123') {
                console.log('Login successful');
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                console.log('Login failed');
                alert('Invalid credentials! Try: admin / password123');
            }
        });
    } else {
        console.error('Login form not found!');
    }
});
