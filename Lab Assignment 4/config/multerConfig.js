// multerConfig.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");  // Ensure this points to the correct path

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ecommerce-store",
        allowed_formats: ["jpg", "jpeg", "png", "gif"],
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,  // Max file size 5MB
    },
});

module.exports = upload;
