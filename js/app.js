// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, setDoc, doc, getDoc, getDocs, query, where, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCorKDXJdM-Y0c9-vEyUoollZuJ89IhB4U",
    authDomain: "food-ordering-system-3b207.firebaseapp.com",
    projectId: "food-ordering-system-3b207",
    storageBucket: "food-ordering-system-3b207.appspot.com",
    messagingSenderId: "41397958881",
    appId: "1:41397958881:web:5745776b8632cb13639fa0",
    measurementId: "G-F11SP48397"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Utility function for email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Handle registration
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const userType = document.getElementById('user-type').value;
        const errorDiv = document.getElementById('register-error');

        if (!isValidEmail(email)) {
            errorDiv.textContent = 'Invalid email format.';
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Store user type in Firestore
            await setDoc(doc(firestore, 'users', uid), { type: userType });
            alert('Registration successful!');
            window.location.href = userType === 'admin' ? 'admin-update-products.html' : 'products.html'; // Redirect based on user type
        } catch (error) {
            errorDiv.textContent = 'Registration error: ' + error.message;
        }
    });
}

// Handle login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        if (!isValidEmail(email)) {
            errorDiv.textContent = 'Invalid email format.';
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Retrieve user type from Firestore
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    const userType = userDoc.data().type;
                    // Redirect based on user type
                    window.location.href = userType === 'admin' ? 'index.html' : 'index.html';
                } else {
                    throw new Error('User not found.');
                }
            }
        } catch (error) {
            errorDiv.textContent = 'Login error: ' + error.message;
        }
    });
}

// Handle logout
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', () => {
        signOut(auth).then(() => {
            alert('Logged out successfully!');
            updateNavbarForLoggedOutState();
            window.location.href = 'login.html'; // Redirect to login page
        }).catch(error => {
            console.error('Error logging out:', error.message);
        });
    });
}

// Update navbar based on authentication state
function updateNavbarForLoggedInState(userType) {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const viewProductsLink = document.getElementById('view-products');
    const uploadProductLink = document.getElementById('upload-product');
    const viewOrdersLink = document.getElementById('view-orders');
    const addToCartLink = document.getElementById('add-to-cart');
    const myOrderLink = document.getElementById('my-order');
    const placeOrderLink = document.getElementById('place-order');
    const myProfileLink = document.getElementById('my-profile');
    
    if (userType === 'admin') {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'inline';
        viewProductsLink.style.display = 'none';
        uploadProductLink.style.display = 'inline';
        viewOrdersLink.style.display = 'inline';
        addToCartLink.style.display = 'none';
        myOrderLink.style.display = 'none';
        placeOrderLink.style.display = 'none';
        myProfileLink.style.display = 'none';
    } else {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'inline';
        viewProductsLink.style.display = 'inline';
        uploadProductLink.style.display = 'none';
        viewOrdersLink.style.display = 'none';
        addToCartLink.style.display = 'inline';
        myOrderLink.style.display = 'inline';
        placeOrderLink.style.display = 'inline';
        myProfileLink.style.display = 'inline';
    }
}

function updateNavbarForLoggedOutState() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const viewProductsLink = document.getElementById('view-products');
    const uploadProductLink = document.getElementById('upload-product');
    const viewOrdersLink = document.getElementById('view-orders');
    const addToCartLink = document.getElementById('add-to-cart');
    const myOrderLink = document.getElementById('my-order');
    const placeOrderLink = document.getElementById('place-order');
    const myProfileLink = document.getElementById('my-profile');

    loginLink.style.display = 'inline';
    registerLink.style.display = 'inline';
    logoutLink.style.display = 'none';
    viewProductsLink.style.display = 'none';
    uploadProductLink.style.display = 'none';
    viewOrdersLink.style.display = 'none';
    addToCartLink.style.display = 'none';
    myOrderLink.style.display = 'none';
    myProfileLink.style.display = 'none';
}
// Authentication state change
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userType = userDocSnap.data().type;
            updateNavbarForLoggedInState(userType);
        }
    } else {
        updateNavbarForLoggedOutState();
    }
});