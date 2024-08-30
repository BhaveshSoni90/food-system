// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// Check authentication state


// Load orders from Firestore
function loadOrders() {
    const ordersSection = document.getElementById('orders-section');
    ordersSection.innerHTML = '<p>Loading orders...</p>';

    getDocs(collection(firestore, 'orders')).then(snapshot => {
        if (snapshot.empty) {
            ordersSection.innerHTML = '<p>No orders available.</p>';
            return;
        }

        ordersSection.innerHTML = '<h2>Orders</h2><ul id="orders-list"></ul>';
        const ordersList = document.getElementById('orders-list');

        snapshot.forEach(doc => {
            const order = doc.data();
            ordersList.innerHTML += `
                <li class="order-item">
                    <p>Order ID: ${doc.id}</p>
                    <p>User ID: ${order.userId}</p>
                    <p>Product ID: ${order.productId}</p>
                    <p>Date: ${new Date(order.timestamp.seconds * 1000).toLocaleString()}</p>
                </li>
            `;
        });
    }).catch(error => {
        console.error('Error fetching orders:', error.message);
        ordersSection.innerHTML = '<p>Error loading orders.</p>';
    });
}

// Handle logout
document.getElementById('logout-link').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert('Logged out successfully!');
        window.location.href = 'login.html'; // Redirect to login page
    }).catch(error => {
        console.error('Error logging out:', error.message);
    });
});
