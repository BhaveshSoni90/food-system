import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, getDoc, updateDoc, doc, deleteDoc, addDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// Initialize Firestore and Auth
const firestore = getFirestore();
const auth = getAuth();

// Function to load cart items
async function loadCart(userId) {
    const cartSection = document.getElementById('cart-section');
    cartSection.innerHTML = '<p>Loading cart...</p>';

    if (!userId) {
        cartSection.innerHTML = '<p>Please log in to view your cart.</p>';
        return;
    }

    try {
        const cartQuery = query(collection(firestore, 'carts'), where('userId', '==', userId));
        const snapshot = await getDocs(cartQuery);

        if (snapshot.empty) {
            cartSection.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cartSection.innerHTML = '<h2>Your Cart</h2><ul id="cart-list"></ul>';
        const cartList = document.getElementById('cart-list');

        // Fetch product details
        const productPromises = snapshot.docs.map(async (cartDoc) => {
            const cartItem = cartDoc.data();
            const productDoc = await getDoc(doc(firestore, 'products', cartItem.productId));
            if (productDoc.exists()) {
                const product = productDoc.data();
                return {
                    id: cartDoc.id,
                    name: product.name,
                    description: product.description || 'No description available',
                    price: product.price,
                    quantity: cartItem.quantity || 1 // Default to 1 if quantity is undefined
                };
            }
        });

        const products = (await Promise.all(productPromises)).filter(Boolean);

        products.forEach(product => {
            cartList.innerHTML += `
                <li class="cart-item" data-id="${product.id}">
                    <div>
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>Price: $${product.price.toFixed(2)}</p>
                        <p>Quantity: <input type="number" value="${product.quantity}" min="1" onchange="updateQuantity('${product.id}', this.value)" /></p>
                    </div>
                    <button onclick="removeFromCart('${product.id}')">Remove</button>
                </li>
            `;
        });
    } catch (error) {
        console.error('Error loading cart:', error.message);
        cartSection.innerHTML = '<p>Error loading cart.</p>';
    }
}

// Update item quantity
window.updateQuantity = async function(cartId, quantity) {
    if (quantity < 1) {
        alert('Quantity must be at least 1.');
        return;
    }
    try {
        await updateDoc(doc(firestore, 'carts', cartId), { quantity: parseInt(quantity, 10) });
        loadCart(auth.currentUser?.uid); // Reload cart to reflect changes
    } catch (error) {
        console.error('Error updating quantity:', error.message);
    }
};

// Remove item from cart
window.removeFromCart = async function(cartId) {
    try {
        await deleteDoc(doc(firestore, 'carts', cartId));
        loadCart(auth.currentUser?.uid); // Reload cart to reflect changes
    } catch (error) {
        console.error('Error removing item from cart:', error.message);
    } 
};

// Place order
window.placeOrder = async function() {
    const userId = auth.currentUser?.uid; // Use optional chaining to handle cases where the user is not logged in
    if (!userId) {
        alert('You need to be logged in to place an order.');
        return;
    }

    const cartQuery = query(collection(firestore, 'carts'), where('userId', '==', userId));
    try {
        const snapshot = await getDocs(cartQuery);
        const orderItems = snapshot.docs.map(doc => doc.data());
        if (orderItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        await addDoc(collection(firestore, 'orders'), {
            userId,
            items: orderItems,
            timestamp: new Date()
        });

        // Clear cart after placing the order
        const cartDocs = snapshot.docs.map(doc => doc.id);
        for (const cartDocId of cartDocs) {
            await deleteDoc(doc(firestore, 'carts', cartDocId));
        }
        alert('Order placed successfully!');
        loadCart(userId); // Reload cart to reflect changes
    } catch (error) {
        console.error('Error placing order:', error.message);
    }
};

// Authentication state listener
onAuthStateChanged(auth, user => {
    if (user) {
        loadCart(user.uid); // Load cart for the logged-in user
    } else {
        document.getElementById('cart-section').innerHTML = '<p>Please log in to view your cart.</p>';
    }
});
