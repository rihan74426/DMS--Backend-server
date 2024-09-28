const dotenv = require("dotenv");
dotenv.config();

// emailService.js
const nodemailer = require("nodemailer");
const { User, Store } = require("../models/User");
const Product = require("../models/Product");

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Or use a different service
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL,
    pass: process.env.APP_PASS,
  },
});

// Function to send an email
const sendEmail = (to, subject, htmlContent) => {
  return transporter.sendMail({
    from: {
      name: "Distribution Management Software",
      address: process.env.MAIL,
    }, // Sender email
    to, // Recipient email
    subject, // Subject line
    html: htmlContent, // HTML body of the email
  });
};

// Helper function to generate product details in the email
const generateProductDetails = async (products) => {
  let productDetailsHtml = "";

  for (const product of products) {
    const productData = await Product.findById(product.productId);
    if (productData) {
      productDetailsHtml += `
        <ul>
          <li>Product Name: ${productData.name}</li>
          <li>Order Quantity: ${product.quantity}</li>
          <li>Product Pack Size: ${productData.packSize}</li>
          <li>Product Group: ${productData.group}</li>
          <li>Product MRP: ${productData.price}</li>
        </ul>
        <hr>`;
    }
  }

  return productDetailsHtml;
};

// Admin email template for multiple products
const adminEmailTemplate = async (orderDetails) => {
  const user = await User.findById(orderDetails.userId);
  const store = await Store.findOne({ userId: orderDetails.userId });

  if (!user || !store) {
    throw new Error("Invalid order details: User or store not found.");
  }

  const productDetails = await generateProductDetails(orderDetails.products);

  return `
      <h1>New Order Placed!</h1>
      <p>An order has been placed with the following details:</p>
        <h2>Order Invoice: #${orderDetails.invoice}</h2>
        <h3>Orderer: ${user.username}</h3>
        <h3>Store Name: ${store.storeName}</h3>
        <h3>Store Address: ${store.storeAddress}</li>
      <h3>Products:</h3>
      ${productDetails}
      <p>Total Amount: ${orderDetails.price}</p>
      <p>Check the admin dashboard for more details.</p>
    `;
};

// Orderer email template for multiple products
const ordererEmailTemplate = async (orderDetails) => {
  const user = await User.findById(orderDetails.userId);
  const store = await Store.findOne({ userId: orderDetails.userId });

  if (!user || !store) {
    throw new Error("Invalid order details: User or store not found.");
  }

  const productDetails = await generateProductDetails(orderDetails.products);

  return `
      <h1>Thank You ${user.username} for Your Order!</h1>
      <p>We've received your order with the following details:</p>
      <ul>
        <li>Order Invoice: #${orderDetails.invoice}</li>
        <li>Store Name: ${store.storeName}</li>
        <li>Store Phone: ${store.storePhone}</li>
        <li>Store Address: ${store.storeAddress}</li>
      </ul>
      <h3>Products have ordered:</h3>
      ${productDetails}
      <h5>Total Amount: ${orderDetails.price}</h5>
      <p>We will contact you soon to discuss payment details and the order shipment.</p>
    `;
};

module.exports = { sendEmail, adminEmailTemplate, ordererEmailTemplate };
