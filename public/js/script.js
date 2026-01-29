const notification = document.getElementById('notification');
if (notification) {
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

if (window.location.search.includes('message=')) {
    const newURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newURL);
}

document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent closing immediately
            profileDropdown.classList.toggle('show');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }
});

document.getElementById("resetFilter").addEventListener("click", function () {
    window.location.href = "/home";
});