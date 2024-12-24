const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        description: { type: String, required: true },
        img: { type: String, required: true }, // Image URL from Cloudinary
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
