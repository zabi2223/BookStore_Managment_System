document.addEventListener("DOMContentLoaded", () => {
    const newPass = document.getElementById("newPassword");
    const confirmPass = document.getElementById("confirmPassword");
    const message = document.getElementById("passwordMessage");

    if (newPass && confirmPass && message) {
        confirmPass.addEventListener("input", () => {
            if (newPass.value.length < 8) {
                message.textContent = "Password must be at least 8 characters.";
                message.style.color = "red";
            } else if (newPass.value !== confirmPass.value) {
                message.textContent = "Passwords do not match.";
                message.style.color = "red";
            } else {
                message.textContent = "Passwords match ✅";
                message.style.color = "green";
            }
        });
    }

    // Profile Image Change Preview
    const newPic = document.getElementById("newPic");
    const profileImg = document.getElementById("profileImg");
    if (newPic && profileImg) {
        newPic.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                profileImg.src = URL.createObjectURL(file);
            }
        });
    }
});
