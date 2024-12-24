const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User'); // User model
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// Middleware to make `user` available in all routes
router.use((req, res, next) => {
    res.locals.user = req.user || null;  // Make the user object available in the view
    next();
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successRedirect: '/redirect' // Redirect to /redirect after successful login
}));
router.get('/redirect', (req, res) => {
    if (req.user && req.user.role === 'admin') {
        return res.redirect('/admin'); // Admin users go to the admin panel
    } else if (req.user && req.user.role === 'user') {
        return res.redirect('/'); // Regular users go to the home page
    } else {
        // If no role is set (edge case), you can choose to handle it as a failure
        return res.redirect('/login');
    }
});


// Home page (user-facing)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name');
        res.render('user/index', {
            layout: 'layouts/userLayout',
            products,
            pageTitle: 'Home'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('user/login', { layout: 'layouts/userLayout', pageTitle: 'Login' });
});



// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Register page
router.get('/register', (req, res) => {
    res.render('user/signup', { layout: 'layouts/userLayout', pageTitle: 'Sign Up' });
});

// Handle registration submission
router.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validation: Check if passwords match
    if (password !== confirmPassword) {
        return res.render('user/signup', {
            layout: 'layouts/userLayout',
            pageTitle: 'Sign Up',
            errorMessage: 'Passwords do not match.'
        });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/signup', {
                layout: 'layouts/userLayout',
                pageTitle: 'Sign Up',
                errorMessage: 'Email already registered.'
            });
        }

        // Create a new user
        const newUser = new User({
            name,
            email,
            password
        });

        // Save the new user to the database (password hashing is done in the schema)
        await newUser.save();

        // Redirect to the login page after successful registration
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Product listing page
router.get('/products', async (req, res) => {
    try {
        let query = {};
        let sort = {};
        let categoryFilter = req.query.category || '';
        let search = req.query.search || '';
        let sortOption = req.query.sort || 'name';

        // Search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };  // Case-insensitive search
        }

        // Category filter (optional, if your categories are stored in the DB)
        if (categoryFilter) {
            query.category = categoryFilter;
        }

        // Sort functionality
        if (sortOption === 'price_asc') {
            sort.price = 1;  // Ascending order
        } else if (sortOption === 'price_desc') {
            sort.price = -1;  // Descending order
        } else {
            sort.name = 1;  // Default sorting by name
        }

        const products = await Product.find(query).populate('category', 'name').sort(sort);
        const categories = await Category.find();
        res.render('user/products', {
            layout: 'layouts/userLayout',
            products,
            categories,
            pageTitle: 'Products',
            search,
            categoryFilter,
            sortOption
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Cart page
// Add to Cart route (POST)
router.post('/cart', (req, res) => {
    const { productId, quantity } = req.body;
    const cart = req.session.cart || [];  // Get existing cart or initialize it

    // Find if the product already exists in the cart
    const existingProductIndex = cart.findIndex(item => item.productId == productId);

    if (existingProductIndex > -1) {
        // If product exists, update the quantity
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Otherwise, add a new item to the cart
        cart.push({ productId, quantity });
    }

    // Save the cart back to the session
    req.session.cart = cart;

    res.redirect('/cart');  // Redirect to the cart page
});

router.get('/cart', async (req, res) => {
    const cart = req.session.cart || [];  // Retrieve cart from session
    let total = 0;

    // Fetch product details from the database
    const products = await Product.find({ '_id': { $in: cart.map(item => item.productId) } });

    // Add product details and calculate the total
    const cartItems = cart.map(item => {
        const product = products.find(p => p._id.toString() === item.productId);
        if (product) {
            const totalPrice = product.price * item.quantity;
            total += totalPrice;
            return {
                ...item,
                name: product.name,
                price: product.price,
                totalPrice
            };
        }
    }).filter(item => item !== undefined);  // Filter out undefined items

    res.render('user/cart', {
        layout: 'layouts/userLayout',
        pageTitle: 'Cart',
        cartItems,
        total
    });
});

// Update quantity in cart
router.post('/cart/update', (req, res) => {
    const { productId, quantity } = req.body;
    const cart = req.session.cart || [];

    const productIndex = cart.findIndex(item => item.productId == productId);
    if (productIndex > -1) {
        cart[productIndex].quantity = quantity;  // Update quantity
    }

    req.session.cart = cart;
    res.redirect('/cart');  // Redirect back to the cart page
});

// Remove from cart
router.post('/cart/remove', (req, res) => {
    const { productId } = req.body;
    let cart = req.session.cart || []; // Retrieve the cart from session

    // Filter out the product with the given productId
    cart = cart.filter(item => item.productId !== productId);

    // Save the updated cart back to the session
    req.session.cart = cart;

    // Redirect back to the cart page
    res.redirect('/cart');
});



// Checkout page
router.get('/checkout', (req, res) => {
    const cart = req.session.cart || []; // Retrieve the cart from the session
    console.log("Cart Data:", cart); // Log the cart data for debugging
    res.render('user/checkout', {
        layout: 'layouts/userLayout',
        pageTitle: 'Checkout',
        cart // Pass the cart data to the view
    });
})

// Handle Checkout
router.post('/checkout', async (req, res) => {
    const { address, city, zip } = req.body;

    // Ensure user is logged in
    if (!req.user || !req.user._id) {
        return res.status(401).send('User not logged in.');
    }

    try {
        const cart = req.session.cart || [];
        if (!cart.length) {
            return res.status(400).send('Cart is empty.');
        }

        // Ensure each cart item has valid fields
        const isValidCart = cart.every(item => {
            return item.productId && item.price && item.quantity;
        });

        if (!isValidCart) {
            return res.status(400).send('Invalid cart items.');
        }

        const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        if (isNaN(totalAmount)) {
            return res.status(400).send('Invalid total amount.');
        }

        // Create the order
        const order = new Order({
            user: req.user._id,
            products: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount,
            location: { address, city, zip },
        });

        await order.save();

        // Clear the cart and redirect
        req.session.cart = [];
        req.session.save(err => {
            if (err) {
                console.error('Error clearing session:', err);
                return res.status(500).send('Failed to clear cart.');
            }
            res.redirect('/order-success'); // Redirect to order success page
        });
    } catch (error) {
        console.error('Error placing order:', error.message, error.stack);
        res.status(500).send('Failed to place order.');
    }
});



module.exports = router;
