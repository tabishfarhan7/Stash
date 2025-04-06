document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    // Handle navbar visibility on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down & past the threshold
            navbar.classList.add('hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            // Here you would typically make an API call to your authentication server
            // For now, we'll simulate a successful login
            console.log('Login attempt:', { email, remember });

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to main page after successful login
            window.location.href = 'index.html#packing-interface';

        } catch (error) {
            console.error('Login error:', error);
            // Handle login error (you can add error messaging here)
        }
    });
}); 