const jwt = require("jsonwebtoken");
const { User, Store, Order } = require("../models/User");
const Product = require("../models/Product");
const multer = require("multer");
const {
  sendEmail,
  adminEmailTemplate,
  ordererEmailTemplate,
} = require("./emailControl");
const Transaction = require("../models/Transaction");
const dotenv = require("dotenv");
const SSLCommerzPayment = require('sslcommerz-lts')


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      // Handle profile image update from Cloudinary
      if (req.file) {
        user.profileImage = req.file.path; // Cloudinary provides the URL in req.file.path
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage, // Cloudinary image URL stored
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const user = await User.create({ username, email, password });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "User registration failed", error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
};

// Update Users by ID
exports.updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete User by ID
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// store controllers below
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.getStore = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is obtained from authenticated session or token
    const user = await User.findById(userId).populate("store");
    let store = await Store.findOne({ userId: userId });
    if (!store) {
      store = await Store.create({ userId: userId });
    }
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: "Error fetching store", error });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeData = req.body; // Store data to update

    // Find the store based on the userId
    const store = await Store.findOne({ userId: userId });
    if (!store) {
      return res.status(404).json({ message: "Store not found for this user" });
    }
    // Update store fields
    const updatedStore = await Store.findByIdAndUpdate(
      store._id, // Use the store's _id
      storeData,
      { new: true }
    );

    res.status(200).json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: "Error updating store", error });
  }
};
exports.deleteStoreProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const store = await Store.findOne({ userId: userId });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    store.products = store.products.filter(el => el.toString() !== req.params.id);
    await store.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

//Order Controllers below

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderData = req.body; // Product, quantity, price, etc.

    const newOrder = new Order(orderData);
    await newOrder.save();

    // Add the order reference to the user
    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });
    const admins = await User.find({ role: "admin" }).select("email"); // Only fetch the emails of admins
    const adminEmails = admins.map((admin) => admin.email);
    const user = await User.findById(userId);

    try {
      // Await email template generation
      const adminEmailContent = await adminEmailTemplate(orderData);
      const ordererEmailContent = await ordererEmailTemplate(orderData);

      // Send emails
      sendEmail(
        adminEmails, // Admin emails
        "New Order Placed",
        adminEmailContent // Awaited content
      );
      sendEmail(
        user.email, // Orderer's email
        "Order Confirmation",
        ordererEmailContent // Awaited content
      );

      console.log("Email sent successfully!");
    } catch (err) {
      console.log("Error sending email:", err);
    }
    try {
      const transactionData = {
      client: userId,
      products: orderData.products.map((el,index,arr)=>{
        return {productId:el.productId,quantity:el.quantity}
      }),
      total: orderData.price,
      order: orderData.invoice,
      status: "pending"
    }
    const newTransaction = new Transaction(transactionData);

    // Save transaction to the database
    await newTransaction.save();
    const product = await Product.findById(orderData.products[0].productId);
    const is_live = false
    const data = {
      total_amount: orderData.price,
      currency: 'BDT',
      tran_id: newTransaction._id.toString(), // use unique tran_id for each api call
      success_url: 'http://localhost:5173/success',
      fail_url: 'http://localhost:5173/fail',
      cancel_url: 'http://localhost:5173/cancel',
      ipn_url: 'http://localhost:5173/ipn',
      shipping_method: 'Courier',
      product_name: product.name,

      product_category: 'Regular',
      product_profile: 'general',
      cus_name: user.username,
      cus_email: user.email,
      cus_add1: user.address,
      cus_city: 'Chattogram',
      cus_country: 'Bangladesh',
      cus_phone: user.phone,
      ship_name: user.username,
      ship_add1: orderData.address,
      ship_city: 'Chattogram',
      ship_country: 'Bangladesh',
    };
  const sslcz = new SSLCommerzPayment(process.env.MY_STORE, process.env.STORE_PASS, is_live)
  sslcz.init(data).then(apiResponse => {
    // Check if the response has a valid GatewayPageURL
    if (apiResponse.GatewayPageURL) {
      res.redirect(apiResponse.GatewayPageURL); // Redirect user to the payment gateway
      console.log('Redirecting to:', apiResponse.GatewayPageURL);
    } else {
      console.log('Failed to get payment gateway URL');
    }
  }).catch(error => {
    console.error('SSLCommerz initialization error:', error);
    res.status(500).send('Payment initialization failed');
  });

    } catch (error) {
      console.log("error payment to  sslcommerz", error);

    }
    
    res.status(201).json(newOrder);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Error creating order", error });
    }
  }
};
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.find({ userId: userId }).populate("products");
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderData = req.body;

    // Find all products associated with the order
    const productIds = orderData.products.map((el) => el.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const store = await Store.findOne({ userId: orderData.userId });

    // Update the order with new data
    const updatedOrder = await Order.findByIdAndUpdate(orderId, orderData, {
      new: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If order is marked as completed, add products to the store
    if (orderData.status === "completed") {
      products.forEach((product) => {
         store.products.push(product._id);
      });
    }

    // Save the store after adding products
    await store.save();

    // Respond with the updated order
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Remove the order reference from the user
    await User.findByIdAndUpdate(deletedOrder.userId, {
      $pull: { orders: orderId },
    });

    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};
