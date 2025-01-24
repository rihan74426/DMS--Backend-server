const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config(); // Load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Cloudinary Storage Engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-pictures", // Cloudinary folder name
    allowed_formats: ["jpeg", "jpg", "png"], // Allowed file types
    public_id: (req, file) => "profile-" + Date.now(), // Unique file name
  },
});

// File Upload Middleware
const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1MB limit
}).single("profileImage"); // 'profileImage' should match your frontend input name

module.exports = upload;
