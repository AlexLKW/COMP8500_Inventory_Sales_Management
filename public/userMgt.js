document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('userList');
    const addUserButton = document.getElementById('addUserButton');
    const addUserModal = document.getElementById('addUserModal');
    const addUserForm = document.getElementById('addUserForm');
    const addUserClose = document.querySelector('.close');
    const cancelButton = document.querySelector('#addUserForm button[type="button"]');

    function loadUsers() {
        console.log('Loading users...');
        fetch('http://192.210.197.42:3000/users')
            .then(response => response.json())
            .then(users => {
                console.log('Users received:', users);
                const tbody = userList.querySelector('tbody');
                tbody.innerHTML = '';
                users.forEach(user => {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.fname}</td>
                        <td>${user.lname}</td>
                        <td>${user.email}</td>
                        <td>
                            <button onclick="resetPassword(${user.uid})">Reset Password</button>
                            <button onclick="removeUser(${user.uid})">Remove</button>
                        </td>
                    `;
                });
                console.log('User table updated');
            })
            .catch(error => console.error('Error loading users:', error));
    }

    if (addUserButton) {
        addUserButton.addEventListener('click', () => {
            console.log('Add User button clicked');
            if (addUserModal) {
                addUserModal.style.display = 'block';
                addUserForm.reset();
            } else {
                console.error('Add User Modal not found');
            }
        });
    } else {
        console.error('Add User Button not found');
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    } else {
        console.error('Cancel button not found');
    }

    if (addUserClose) {
        addUserClose.addEventListener('click', () => {
            console.log('Close button clicked');
            addUserModal.style.display = 'none';
        });
    } else {
        console.error('Close span not found');
    }

    if (addUserClose || cancelButton) {
        addUserClose.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });        
        cancelButton.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submission attempted');
            
            try {
                const formData = new FormData(addUserForm);
                const userData = Object.fromEntries(formData.entries());
                console.log('User data:', userData);
        
                const response = await fetch('http://192.210.197.42:3000/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                });
        
                if (response.ok) {
                    const result = await response.json();
                    console.log('Server response:', result);
                    addUserModal.style.display =  'none';
                    addUserForm.reset();
                    loadUsers();
                    alert(result.message);
                } else {
                    const errorData = await response.json();
                    console.error('Server error:', errorData);
                    alert('Failed to add user: ' + errorData.error);
                }
            } catch (error) {
                console.error('Error adding user:', error);
                alert('Error adding user: ' + error.message);
            }
        });
    } else {
        console.error('Add User Form not found');
    }

    window.resetPassword = async (uid) => {
        const newPassword = prompt('Enter new password:');
        if (newPassword) {
            try {
                const response = await fetch('http://192.210.197.42:3000/users/resetPassword', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid, newPassword }),
                });
                const result = await response.json();
                alert(result.message);
                loadUsers();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to reset password');
            }
        }
    };

    window.removeUser = async (uid) => {
        if (confirm('Are you sure you want to remove this user?')) {
            try {
                const response = await fetch(`http://192.210.197.42:3000/users/${uid}`, { method: 'DELETE' });
                const result = await response.json();
                alert(result.message);
                loadUsers();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to remove user');
            }
        }
    };

    loadUsers();
});