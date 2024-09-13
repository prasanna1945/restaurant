
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);  // Notify the user
                window.location.href = '/login';  // Redirect to login page
            } else {
                alert(result.message || 'Signup failed, try again.');
            }

        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup. Please try again later.');
        }
    });
}

// Function to handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Send data to the backend for login
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            alert('Login successful!');
            window.location.href = '/dashboard';
        } else {
            alert(result.message || 'Login failed, check your credentials.');
        }
    });
}

// Function to handle fetching the cart items
function viewCart() {
    fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            const cartCount = cart.length || 0;
            document.getElementById('cart-count').textContent = cartCount;
            // Logic to display the cart items in the modal or popup
        })
        .catch(err => console.error('Error fetching cart:', err));
}

// Function to fetch user-specific data (orders and favorites) for the dashboard
if (window.location.pathname === '/dashboard') {
    document.addEventListener('DOMContentLoaded', async () => {
        // Fetch and display user orders
        const orderResponse = await fetch('/api/orders');
        const orders = await orderResponse.json();
        displayOrders(orders);

        // Fetch and display favorite dishes
        const favoritesResponse = await fetch('/api/favorites');
        const favorites = await favoritesResponse.json();
        displayFavorites(favorites);
    });

    function displayOrders(orders) {
        const orderList = document.getElementById('orderList');
        orderList.innerHTML = orders.map(order => `
            <div class="order">
                <h3>Order #${order.id}</h3>
                <p>${order.details}</p>
                <p>Status: ${order.status}</p>
            </div>
        `).join('');
    }

    function displayFavorites(favorites) {
        const favoritesList = document.getElementById('favoritesList');
        favoritesList.innerHTML = favorites.map(favorite => `
            <div class="favorite">
                <h3>${favorite.name}</h3>
                <p>${favorite.description}</p>
            </div>
        `).join('');
    }
}

    const apiKey = '80ed58191b6d494ebc8bec8997791dc4'; // Replace with your actual Spoonacular API key
    const cart = [];

    // Function to add items to the cart
    function addToCart(item, price) {
        cart.push({ item, price });
        document.getElementById('cart-count').innerText = cart.length;
        alert(item + " added to your cart!");
    }

    // Function to view the cart
    function viewCart() {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        let cartDetails = "Your Cart:\n";
        let total = 0;

        cart.forEach((entry, index) => {
            cartDetails += `${index + 1}. ${entry.item} - $${entry.price.toFixed(2)}\n`;
            total += entry.price;
        });

        cartDetails += `\nTotal: $${total.toFixed(2)}\n\nDo you want to place the order?`;
        
        if (confirm(cartDetails)) {
            placeOrder();
        }
    }

    // Function to place the order
    function placeOrder() {
        cart = [];
        document.getElementById('cart-count').innerText = "0";
        alert("Thank you for your order! Your total amount is billed.");
    }

    // Function to fetch recipes using Spoonacular API
    async function fetchRecipes(category, containerId) {
        const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&type=${category}&number=5`; // Fetch 5 recipes for each category
        const response = await fetch(url);
        const data = await response.json();
        const recipes = data.results;
        const container = document.getElementById(containerId);

        recipes.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');

            const recipeImage = document.createElement('img');
            recipeImage.src = recipe.image;
            recipeImage.alt = recipe.title;
            recipeImage.classList.add('menu-image');

            const recipeTitle = document.createElement('h3');
            recipeTitle.innerText = recipe.title;

            const price = (Math.random() * 10 + 5).toFixed(2); // Random price between $5.00 and $15.00
            const priceTag = document.createElement('p');
            priceTag.classList.add('price');
            priceTag.innerText = `$${price}`;

            const addToCartBtn = document.createElement('button');
            addToCartBtn.classList.add('add-to-cart');
            addToCartBtn.innerText = 'Add to Cart';
            addToCartBtn.onclick = () => addToCart(recipe.title, parseFloat(price));

            recipeDiv.appendChild(recipeImage);
            recipeDiv.appendChild(recipeTitle);
            recipeDiv.appendChild(priceTag);
            recipeDiv.appendChild(addToCartBtn);

            container.appendChild(recipeDiv);
        });
    }

    // Fetch recipes for different categories
    fetchRecipes('appetizer', 'starterList');
    fetchRecipes('main course', 'mainCourseList');
    fetchRecipes('dessert', 'dessertList');
    fetchRecipes('drink', 'drinkList');
