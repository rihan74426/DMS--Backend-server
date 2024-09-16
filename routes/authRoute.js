const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUsers,
  deleteUser,
  updateUserProfile,
  createOrder,
  updateOrder,
  deleteOrder,
  updateStore,
  getStore,
  getOrders,
} = require("../controllers/authController");
const protect = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUserProfile);
router.put("/profile", protect, upload, updateUserProfile);

// store and order routes
router.get("/store", protect, getStore);
router.put("/store", protect, updateStore);
router.post("/orders", createOrder); // Create new order
router.get("/orders", getOrders); // Get all orders
router.put("/orders/:id", updateOrder); // Update order
router.delete("/orders/:id", deleteOrder); // Delete order

// Update user by ID
router.put("/profile/:id", updateUsers);

// Delete user by ID
router.delete("/profile/:id", deleteUser);

module.exports = router;
