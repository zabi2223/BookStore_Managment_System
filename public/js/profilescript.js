document.addEventListener("DOMContentLoaded", () => {
    const newPicInput = document.getElementById('newPic');
    const profileImg = document.getElementById('profileImg');

    // Only run if both elements exist
    if (newPicInput && profileImg) {
        newPicInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});


const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const passwordMessage = document.getElementById('passwordMessage');

// Function to check password validity live
function validatePasswords() {
    const newPass = newPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();

    // Default style
    passwordMessage.style.color = "red";

    if (newPass.length === 0 && confirmPass.length === 0) {
        passwordMessage.textContent = "";
        return;
    }

    // Check length
    if (newPass.length > 0 && newPass.length < 8) {
        passwordMessage.textContent = "Password must be at least 8 characters long.";
        return;
    }

    // Check match
    if (confirmPass.length > 0 && newPass !== confirmPass) {
        passwordMessage.textContent = "Passwords do not match.";
        return;
    }

    // If everything is good
    if (newPass.length >= 8 && newPass === confirmPass) {
        passwordMessage.style.color = "green";
        passwordMessage.textContent = "Passwords match ✅";
        return;
    }

    // Default empty
    passwordMessage.textContent = "";
}

// Run on every keystroke
newPassword.addEventListener('input', validatePasswords);
confirmPassword.addEventListener('input', validatePasswords);

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
