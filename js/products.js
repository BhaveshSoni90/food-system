// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, query, where, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
onAuthStateChanged(auth, user => {
  if (user) {
    // User is signed in, show products and logout link
    loadProducts();
    document.getElementById('logout-link').style.display = 'inline';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('register-link').style.display = 'none';
  } else {
    // User is signed out, redirect to login page
    window.location.href = 'login.html';
  }
});

// Load products from Firestore
function loadProducts() {
  const productsSection = document.getElementById('products-section');
  productsSection.innerHTML = '<p>Loading products...</p>';

  getDocs(collection(firestore, 'products')).then(snapshot => {
    if (snapshot.empty) {
      productsSection.innerHTML = '<p>No products available.</p>';
      return;
    }

    productsSection.innerHTML = '<h2>Products</h2><ul id="products-list"></ul>';
    const productsList = document.getElementById('products-list');

    snapshot.forEach(doc => {
      const product = doc.data();
      productsList.innerHTML += `
        <li class="product-item">
          ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}">` : ''}
          <div>
            <h3>${product.name}</h3>
            <p>${product.description || 'No description available'}</p>
            <p>Price: $${product.price.toFixed(2)}</p>
          </div>
          <button onclick="addToCart('${doc.id}')">Add to Cart</button>
        </li>
      `;
    });
  }).catch(error => {
    console.error('Error fetching products:', error.message);
    productsSection.innerHTML = '<p>Error loading products.</p>';
  });
}

// Add to cart
window.addToCart = function(productId) {
  const userId = auth.currentUser.uid;

  // Check if product already in cart
  const cartQuery = query(collection(firestore, 'carts'), where('userId', '==', userId), where('productId', '==', productId));
  getDocs(cartQuery).then(snapshot => {
    if (!snapshot.empty) {
      // Product already in cart, just update quantity
      snapshot.forEach(doc => {
        const cartItem = doc.data();
        updateDoc(doc.ref, { quantity: cartItem.quantity + 1 });
      });
    } else {
      // Product not in cart, add a new entry
      addDoc(collection(firestore, 'carts'), {
        userId,
        productId,
        quantity: 1,
        timestamp: new Date()
      }).then(() => {
        alert('Product added to cart!');
      }).catch(error => {
        console.error('Error adding to cart:', error.message);
      });
    }
  }).catch(error => {
    console.error('Error checking cart:', error.message);
  });
};

// Handle logout
document.getElementById('logout-link').addEventListener('click', () => {
  signOut(auth).then(() => {
    alert('Logged out successfully!');
    window.location.href = 'login.html'; // Redirect to login page
  }).catch(error => {
    console.error('Error logging out:', error.message);
  });
});
