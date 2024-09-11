// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.post("/transactions", createTransaction);
router.get("/transactions", getTransaction);
router.put("/transactions/:id", updateTransaction);
router.delete("/transactions/:id", deleteTransaction);

// Add routes for fetching, updating, and deleting transactions

module.exports = router;
