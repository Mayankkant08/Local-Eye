// Authentication functions
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authButtons = document.getElementById('authButtons');
    
    if (user) {
        // User is logged in
        authButtons.innerHTML = `
            <div class="user-menu">
                <span class="user-greeting">Hi, ${user.name}</span>
                <div class="user-dropdown">
                    <a href="/Profile/profile.html">My Profile</a>
                    <a href="/My Bookings/bookings.html">My Bookings</a>
                    <a href="#" onclick="logout()">Logout</a>
                </div>
            </div>
        `;
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <a href="/Singnin/sign.html" class="nav-cta">Sign In</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    checkAuth();
    // Reload the page to update the content
    window.location.reload();
}

// Add auth styles
const style = document.createElement('style');
style.textContent = `
    .user-menu {
        position: relative;
        display: inline-block;
    }

    .user-greeting {
        color: var(--gold);
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 4px;
        transition: background-color 0.3s;
    }

    .user-greeting:hover {
        background-color: rgba(255, 215, 0, 0.1);
    }

    .user-dropdown {
        display: none;
        position: absolute;
        right: 0;
        background-color: white;
        min-width: 160px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        border-radius: 8px;
        z-index: 1;
    }

    .user-menu:hover .user-dropdown {
        display: block;
    }

    .user-dropdown a {
        color: var(--black);
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        transition: background-color 0.3s;
    }

    .user-dropdown a:hover {
        background-color: #f8f9fa;
        color: var(--gold);
    }

    .nav-cta {
        background-color: var(--gold);
        color: var(--dark-bg);
        padding: 8px 16px;
        border-radius: 4px;
        transition: all 0.3s;
    }

    .nav-cta:hover {
        background-color: #ffd700;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Add these functions after the existing code
function createUserMenu(user) {
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-greeting">
            Hi, ${user.name}
        </div>
        <div class="user-dropdown">
            <a href="/profile.html">My Profile</a>
            <a href="/Find Guide/find.html">Find Guides</a>
            <a href="#" id="logoutBtn">Logout</a>
        </div>
    `;

    // Add logout functionality
    userMenu.querySelector('#logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    return userMenu;
}

// Add booking functionality
function createBooking(guideId, guideName, date, location, duration) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login to book a guide');
        window.location.href = '/Singnin/sign.html';
        return;
    }

    const booking = {
        id: Date.now(),
        guideId,
        guideName,
        date,
        location,
        duration,
        status: 'upcoming',
        userId: user.id
    };

    // Get existing bookings or initialize empty array
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    return booking;
}

function getBookings() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return [];

    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    return bookings.filter(booking => booking.userId === user.id);
}

function updateBookingStatus(bookingId, newStatus) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = newStatus;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return true;
    }
    
    return false;
}

// Update the updateAuthButtons function to include profile link
function updateAuthButtons() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;

    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        authButtons.innerHTML = '';
        const userMenu = createUserMenu(user);
        authButtons.appendChild(userMenu);
    } else {
        authButtons.innerHTML = `
            <a href="/Singnin/sign.html" class="nav-cta">Login</a>
            <a href="/Singnin/sign.html" class="nav-cta">Sign Up</a>
        `;
    }
} 