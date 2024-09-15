const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUsers,
  deleteUser,
  updateUserProfile,
  createStore,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/authController");
const protect = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUserProfile);
router.put("/profile", protect, upload, updateUserProfile);

// store and order routes
router.put("/profile/store", protect, createStore);
router.post("/profile/order", protect, createOrder);
router.put("/profile/order", protect, updateOrder);
router.delete("/profile/order", protect, deleteOrder);

// Update user by ID
router.put("/profile/:id", updateUsers);

// Delete user by ID
router.delete("/profile/:id", deleteUser);

module.exports = router;
