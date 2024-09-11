// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");

exports.createTransaction = async (req, res) => {
  try {
    const { companyId, person, productId, quantity, price } = req.body;

    if (!companyId || !person || !productId || !quantity || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const total = quantity * price;

    // Create a new transaction
    const newTransaction = new Transaction({
      companyId,
      person,
      productId,
      quantity,
      price,
      total,
    });

    // Save transaction to the database
    await newTransaction.save();

    // Update the product's available and supplied count
    const product = await Product.findById(productId);
    if (product) {
      product.quantityInStore -= quantity;
      product.quantitySupplied += quantity;
      await product.save();
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error });
  }
};

// Add similar methods for fetching, updating, and deleting transactions
exports.getTransaction = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!transaction) {
      return res.status(404).json({ message: "transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating transaction", error: error.message });
  }
};

// Delete a product by ID
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting Transaction", error: error.message });
  }
};
