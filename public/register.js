document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://192.210.197.42:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, fname, lname, gender, address, email }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('message').textContent = data.message;
            // Optionally, redirect to login page after successful registration
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            document.getElementById('message').textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'An error occurred. Please try again.';
    }
});