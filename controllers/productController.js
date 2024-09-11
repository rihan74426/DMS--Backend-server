// controllers/ProductController.js
const Product = require("../models/Product");

async function generateSerialNumber() {
  const lastProduct = await Product.findOne().sort({ createdAt: -1 }); // Get the latest product
  let newSerialNumber = "#000001"; // Default for the first product

  if (lastProduct && lastProduct.hashtagSerial) {
    // Extract the numeric part from the last serial number and increment it
    const lastSerial = parseInt(lastProduct.hashtagSerial.replace("#", ""));
    const nextSerial = (lastSerial + 1).toString().padStart(6, "0");
    newSerialNumber = `#${nextSerial}`;
  }

  return newSerialNumber;
}

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const serialId = await generateSerialNumber();
    product.hashtagSerial = serialId;
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Product creation failed", error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get a single product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting product", error: error.message });
  }
};
