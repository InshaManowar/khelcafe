    // Update the navbar with the user's name from local storage
    const usernameSpan = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');

    const storedName = localStorage.getItem('fetchedName');
    if (storedName) {
        usernameSpan.textContent = `Welcome, ${storedName}`;
    }

    // Attach an event listener to the Logout button
    logoutBtn.addEventListener('click', function() {
        // Remove the stored user's name from local storage
        localStorage.removeItem('fetchedName');

        // Redirect to the login page after logging out
        window.location.href = 'index.html'; // Replace with your login page URL
    });
