const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const passwordHash = require('password-hash');
const session = require('express-session'); // Session handling

const serviceAccount = require('./key.json'); // Path to your Firebase service account key

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-key', // Use a strong secret key in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Set the view engine for potential future use (e.g., EJS templates)
app.set('view engine', 'ejs');

// Routes

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle signup logic
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await db.collection('users').where('email', '==', email).get();

        if (!existingUser.empty) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // Hash the user's password before saving
        const hashedPassword = passwordHash.generate(password);
        await db.collection('users').add({
            username,
            email,
            password: hashedPassword
        });

        // Redirect to the login page upon successful signup
        res.status(200).json({ success: true, message: 'Signup successful, please log in!' });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong...' });
    }
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login logic
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username exists
        const userSnapshot = await db.collection('users').where('username', '==', username).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ success: false, message: 'Invalid username or password.' });
        }

        const user = userSnapshot.docs[0].data();

        // Verify the password
        if (passwordHash.verify(password, user.password)) {
            // Store user information in session
            req.session.user = {
                username: user.username,
                email: user.email
            };

            // Redirect to the dashboard
            return res.status(200).json({ success: true, message: 'Login successful!', redirectUrl: '/dashboard' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid username or password.' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong...' });
    }
});

// Serve the dashboard page (protected route)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if the user is not logged in
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Fetch user-specific orders
app.get('/api/orders', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    // Mock user orders (replace with actual DB data)
    const orders = [
        { id: 1, details: 'Pizza, Salad', status: 'Delivered' },
        { id: 2, details: 'Burger, Fries', status: 'In Progress' }
    ];

    res.json(orders);
});

// Fetch user-specific favorites
app.get('/api/favorites', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    // Mock favorite dishes (replace with actual DB data)
    const favorites = [
        { name: 'Cheeseburger', description: 'A delicious cheeseburger with fries.' },
        { name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting.' }
    ];

    res.json(favorites);
});

// Handle logout logic
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Start server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
