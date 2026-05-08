// Firebase integration
let db, auth;

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to load
    const checkFirebase = setInterval(() => {
        if (window.db && window.auth) {
            db = window.db;
            auth = window.auth;
            clearInterval(checkFirebase);
            initializeFirebaseFeatures();
        }
    }, 100);

    // Initialize non-Firebase features immediately
    initializeBasicFeatures();
});

function initializeBasicFeatures() {
    // Tab switching
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and contents
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        const products = document.querySelectorAll('.product');
        
        products.forEach(product => {
            const title = product.querySelector('h3').textContent.toLowerCase();
            if (title.includes(query) || query === '') {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter functionality
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const priceDisplay = document.getElementById('price-display');

    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const maxPrice = parseFloat(priceFilter.value);
        const products = document.querySelectorAll('.product');
        
        products.forEach(product => {
            const category = product.getAttribute('data-category');
            const price = parseFloat(product.getAttribute('data-price'));
            
            const categoryMatch = selectedCategory === '' || category === selectedCategory;
            const priceMatch = price <= maxPrice;
            
            if (categoryMatch && priceMatch) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('input', function() {
        priceDisplay.textContent = `$0 - $${this.value}`;
        applyFilters();
    });

    // Dark mode toggle
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    setTheme(currentTheme);

    themeToggle.addEventListener('click', function() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Newsletter signup
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        alert(`Thank you for subscribing with ${email}!`);
        this.reset();
    });

    // Contact form
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });

    // Handle CTA button click to go to shop
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const shopTab = document.querySelector('[data-tab="shop"]');
            if (shopTab) {
                shopTab.click();
            }
        });
    }

    // Modal close functionality
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function initializeFirebaseFeatures() {
    // Shopping Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    function updateWishlistCount() {
        const wishlistCount = document.getElementById('wishlist-count');
        wishlistCount.textContent = wishlist.length;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
    }

    function addToCart(productId) {
        const product = document.querySelector(`[data-id="${productId}"]`);
        const title = product.querySelector('h3').textContent;
        const price = parseFloat(product.querySelector('p').textContent.replace('$', ''));
        const image = product.querySelector('img').src;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, title, price, image, quantity: 1 });
        }
        saveCart();
        alert('Item added to cart!');
    }

    function addToWishlist(productId) {
        const product = document.querySelector(`[data-id="${productId}"]`);
        const title = product.querySelector('h3').textContent;
        const price = parseFloat(product.querySelector('p').textContent.replace('$', ''));
        const image = product.querySelector('img').src;

        if (!wishlist.find(item => item.id === productId)) {
            wishlist.push({ id: productId, title, price, image });
            saveWishlist();
            alert('Item added to wishlist!');
        } else {
            alert('Item already in wishlist!');
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        showCart();
    }

    function removeFromWishlist(productId) {
        wishlist = wishlist.filter(item => item.id !== productId);
        saveWishlist();
        showWishlist();
    }

    function showCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            total += item.price * item.quantity;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div>
                        <h4>${item.title}</h4>
                        <p>$${item.price} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            `;
        });
        
        cartTotal.textContent = total.toFixed(2);
        document.getElementById('cart-modal').style.display = 'block';
    }

    function showWishlist() {
        const wishlistItems = document.getElementById('wishlist-items');
        wishlistItems.innerHTML = '';
        
        wishlist.forEach(item => {
            wishlistItems.innerHTML += `
                <div class="wishlist-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div>
                        <h4>${item.title}</h4>
                        <p>$${item.price}</p>
                    </div>
                    <button onclick="addToCart('${item.id}')">Add to Cart</button>
                    <button onclick="removeFromWishlist('${item.id}')">Remove</button>
                </div>
            `;
        });
        
        document.getElementById('wishlist-modal').style.display = 'block';
    }

    function showProductDetails(productId) {
        const product = document.querySelector(`[data-id="${productId}"]`);
        const title = product.querySelector('h3').textContent;
        const price = product.querySelector('p').textContent;
        const image = product.querySelector('img').src;
        
        const productDetails = document.getElementById('product-details');
        productDetails.innerHTML = `
            <img src="${image}" alt="${title}">
            <h2>${title}</h2>
            <p class="price">${price}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <div class="stars">★★★★★</div>
            <p>Customer Reviews: "Amazing product!" - John D.</p>
            <button onclick="addToCart('${productId}')">Add to Cart</button>
            <button onclick="addToWishlist('${productId}')">Add to Wishlist</button>
        `;
        
        document.getElementById('product-modal').style.display = 'block';
    }

    function attachProductListeners() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('.product').getAttribute('data-id');
                addToCart(productId);
            });
        });

        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('.product').getAttribute('data-id');
                addToWishlist(productId);
            });
        });

        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.closest('.product').getAttribute('data-id');
                showProductDetails(productId);
            });
        });
    }

    // Attach initial listeners
    attachProductListeners();

    // Event listeners for cart and wishlist
    document.getElementById('cart-icon').addEventListener('click', showCart);
    document.getElementById('wishlist-icon').addEventListener('click', showWishlist);

    // Checkout functionality (placeholder)
    document.getElementById('checkout-btn').addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
        } else {
            alert('Checkout functionality would be implemented here. Total: $' + document.getElementById('cart-total').textContent);
        }
    });

    // Initialize counts
    updateCartCount();
    updateWishlistCount();

    // Make functions global for onclick handlers
    window.removeFromCart = removeFromCart;
    window.removeFromWishlist = removeFromWishlist;
    window.addToCart = addToCart;

    // Firebase Authentication
    const userBtn = document.getElementById('user-btn');
    const userModal = document.getElementById('user-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');

    function showAuthForm(formType) {
        if (formType === 'login') {
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            loginBtn.classList.add('active');
            signupBtn.classList.remove('active');
        } else {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            loginBtn.classList.remove('active');
            signupBtn.classList.add('active');
        }
    }

    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
            userInfo.style.display = 'block';
            document.getElementById('user-name').textContent = user.email;
        } else {
            loginBtn.style.display = 'inline-block';
            signupBtn.style.display = 'inline-block';
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            userInfo.style.display = 'none';
            showAuthForm('login');
        }
    });

    loginBtn.addEventListener('click', function() {
        showAuthForm('login');
    });

    signupBtn.addEventListener('click', function() {
        showAuthForm('signup');
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            await window.signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
            alert('Logged in successfully!');
            userModal.style.display = 'none';
            loginForm.reset();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            await window.createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value);
            alert('Account created successfully!');
            userModal.style.display = 'none';
            signupForm.reset();
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    });

    logoutBtn.addEventListener('click', async function() {
        try {
            await window.signOut(auth);
            alert('Logged out successfully!');
            userModal.style.display = 'none';
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    });

    userBtn.addEventListener('click', function() {
        userModal.style.display = 'block';
    });

    // Load products from Firestore (uncomment when Firestore is set up)
    /*
    async function loadProducts() {
        try {
            const querySnapshot = await window.getDocs(window.collection(db, "products"));
            const productsGrid = document.getElementById('products-grid');
            productsGrid.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                productsGrid.innerHTML += `
                    <div class="product" data-id="${doc.id}" data-category="${product.category}" data-price="${product.price}">
                        <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>$${product.price}</p>
                        <div class="product-actions">
                            <button class="add-to-cart">Add to Cart</button>
                            <button class="add-to-wishlist">❤️</button>
                            <button class="view-details">View Details</button>
                        </div>
                    </div>
                `;
            });
            
            attachProductListeners();
        } catch (error) {
            console.error("Error loading products:", error);
        }
    }
    
    loadProducts();
    */
}