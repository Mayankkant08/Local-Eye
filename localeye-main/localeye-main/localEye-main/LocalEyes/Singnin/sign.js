// Function to show messages
function showMessage(elementId, message, isError = false) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = `message ${isError ? 'error' : 'success'}`;
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Tab switching functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab.dataset.tab}-content`).classList.add('active');
    });
});

// User type switching functionality
document.querySelectorAll('.user-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const isSignUp = document.querySelector('.tab.active').dataset.tab === 'signup';
        
        // Update buttons
        document.querySelectorAll('.user-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update forms
        if (isSignUp) {
            document.getElementById('traveler-signup-form').style.display = type === 'traveler' ? 'block' : 'none';
            document.getElementById('guide-signup-form').style.display = type === 'guide' ? 'block' : 'none';
        } else {
            document.getElementById('traveler-login-form').style.display = type === 'traveler' ? 'block' : 'none';
            document.getElementById('guide-login-form').style.display = type === 'guide' ? 'block' : 'none';
        }
    });
});

// Handle Traveler Sign Up
document.getElementById('travelerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('travelerEmail').value;
    const name = document.getElementById('travelerName').value;
    const password = document.getElementById('travelerPassword').value;

    try {
        const response = await fetch('http://localhost:5000/api/tourists/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: name,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('travelerMessage', 'Registration successful! You can now log in.');
            this.reset();
        } else {
            showMessage('travelerMessage', data.error || 'Registration failed', true);
        }
    } catch (error) {
        showMessage('travelerMessage', 'An error occurred. Please try again.', true);
    }
});

// Handle Guide Sign Up
document.getElementById('guideForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('guideEmail').value;
    const name = document.getElementById('guideName').value;
    const password = document.getElementById('guidePassword').value;

    try {
        const response = await fetch('http://localhost:5000/api/guides/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: name,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('guideMessage', 'Registration successful! You can now log in.');
            this.reset();
        } else {
            showMessage('guideMessage', data.error || 'Registration failed', true);
        }
    } catch (error) {
        showMessage('guideMessage', 'An error occurred. Please try again.', true);
    }
});

// Handle Traveler Login
document.getElementById('travelerLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('travelerLoginEmail').value;
    const password = document.getElementById('travelerLoginPassword').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                user_type: 'tourist'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('travelerLoginMessage', 'Login successful!');
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            showMessage('travelerLoginMessage', data.error || 'Login failed', true);
        }
    } catch (error) {
        showMessage('travelerLoginMessage', 'An error occurred. Please try again.', true);
    }
});

// Handle Guide Login
document.getElementById('guideLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('guideLoginEmail').value;
    const password = document.getElementById('guideLoginPassword').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                user_type: 'guide'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('guideLoginMessage', 'Login successful!');
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            showMessage('guideLoginMessage', data.error || 'Login failed', true);
        }
    } catch (error) {
        showMessage('guideLoginMessage', 'An error occurred. Please try again.', true);
    }
}); 