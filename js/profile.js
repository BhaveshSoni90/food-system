import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Initialize Firebase
const auth = getAuth();
const firestore = getFirestore();

// Utility function to get the current user
function getCurrentUser() {
    return auth.currentUser;
}

// Load user profile data
async function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) {
        alert('User not authenticated.');
        window.location.href = 'login.html';
        return;
    }

    const emailSpan = document.getElementById('profile-email');
    emailSpan.textContent = user.email;

    // Fill the email field for updating
    document.getElementById('new-email').value = user.email;
}

// Handle profile update
const updateProfileForm = document.getElementById('update-profile-form');
if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newEmail = document.getElementById('new-email').value;
        const newPassword = document.getElementById('new-password').value;
        const errorDiv = document.getElementById('profile-error');

        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated.');
            }

            // Re-authenticate user for password update
            if (newPassword) {
                const credential = EmailAuthProvider.credential(user.email, prompt('Please enter your current password:'));
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                alert('Password updated successfully!');
            }

            // Update email if it's different
            if (newEmail && newEmail !== user.email) {
                await updateEmail(user, newEmail);
                alert('Email updated successfully!');
                document.getElementById('profile-email').textContent = newEmail;
            }

            // Reset form
            updateProfileForm.reset();
        } catch (error) {
            errorDiv.textContent = 'Update error: ' + error.message;
        }
    });
}

// Load user profile on page load
window.onload = loadUserProfile;
