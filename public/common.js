document.addEventListener('DOMContentLoaded', function() {
    // Used by common pages

    // Logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', function() {
        fetch('http://192.210.197.42:3000/logout', {
          method: 'POST',
          credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          window.location.href = 'index.html'; // Redirect to login page
        })
        .catch(error => console.error('Error:', error));
      });
    }
  });