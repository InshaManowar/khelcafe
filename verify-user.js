document.addEventListener('DOMContentLoaded', function() {
    const storedName = localStorage.getItem('fetchedName');

    // Check if the user is not logged in
    if (!storedName) {
        // Redirect to the login page
        window.location.href = 'index.html'; // Replace with your login page URL
    }

    // Update the navbar with the user's name
    const usernameSpan = document.getElementById('username');
    if (storedName) {
        usernameSpan.textContent = `Welcome, ${storedName}`;
    }
});

