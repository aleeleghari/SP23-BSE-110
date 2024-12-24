const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Assuming Product model exists
const Category = require('../models/Category');
const upload = require("../config/multerConfig");
const cloudinary = require("../config/cloudinaryConfig"); // Ensure this points to your Cloudinary configuration

// Admin routes that require admin privileges
// Main admin page (shows products)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name') // Populating the category field with the 'name' field of the Category model
            .exec();

        res.render('admin/products', { layout: 'layouts/AdminLayout', products, pageTitle: 'Products' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } 
});

// Categories page (shows categories and handles create, edit, delete)
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories
        res.render('admin/categories', { layout: 'layouts/AdminLayout', categories, pageTitle: 'Manage Categories' }); // Pass categories to the view
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Create a new category
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).send('Category already exists');
        }

        // Create and save the new category
        const newCategory = new Category({ name });
        await newCategory.save();

        // Redirect back to the categories page
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating category');
    }
});

// Edit an existing category
router.post('/edit-category/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await Category.findByIdAndUpdate(req.params.id, { name });

        res.redirect('/admin/categories'); // Redirect to the categories page after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating category');
    }
});

// Delete a category
router.get('/delete-category/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect('/admin/categories'); // Redirect after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting category');
    }
});

// Orders page
router.get('/orders', async (req, res) => {
    res.render('admin/orders', { layout: 'layouts/AdminLayout' }); // Assuming the orders view exists
});

// Route to display the Create Product form
router.get('/create-product', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch categories for the dropdown
        res.render('admin/createProduct', {
            layout: 'layouts/AdminLayout',
            pageTitle: 'Create Product',
            categories, // Pass categories to the view
            product: {} // Empty object for creating a new product
        });
    } catch (error) {
        res.status(500).send(`Error loading Create Product page: ${error.message}`);
    }
});

// Ensure this POST route is in your `admin.js` or appropriate routes file
router.post('/create-product', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, stock } = req.body;

        // Handle image upload via Cloudinary (assuming file is uploaded)
        let imgUrl = '';  // Initialize an empty string in case no file is uploaded
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imgUrl = result.secure_url; // Cloudinary image URL
        }

        // Create a new product
        const newProduct = new Product({
            name,
            price,
            category,
            description,
            img: imgUrl,
            stock
        });

        // Save the product to the database
        await newProduct.save();

        // Redirect to admin dashboard or success page
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send(`Error creating product: ${error.message}`);
    }
});

// Route to display the Edit Product form (for updating an existing product)
router.get('/edit-product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const categories = await Category.find(); // Fetch categories for the dropdown

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('admin/createProduct', {
            layout: './layouts/AdminLayout',
            pageTitle: 'Edit Product',
            categories,  // Pass categories to the view
            product,     // Pass the product to pre-fill the form
        });
    } catch (error) {
        res.status(500).send(`Error loading Edit Product page: ${error.message}`);
    }
});

// Route to handle Edit Product form submission (with image upload)
router.post('/edit-product/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, stock } = req.body;
        const image = req.file ? req.file.path : req.body.existingImage; // Retain existing image if no new upload

        // Update the product in the database
        await Product.findByIdAndUpdate(req.params.id, {
            name,
            price,
            category,
            stock,
            description,
            img: image,
        });

        // Redirect back to the admin dashboard
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send(`Error updating product: ${error.message}`);
    }
});

// Route to handle product deletion
router.get('/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin'); // Redirect to the admin dashboard after deletion
    } catch (error) {
        res.status(500).send(`Error deleting product: ${error.message}`);
    }
});

module.exports = router;