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

const adminEmailTemplate = async (orderDetails) => {
  const userName = await User.findById(orderDetails.userId);
  const store = await Store.findOne({ userId: orderDetails.userId });
  const product = await Product.findById(orderDetails.productId);

  if (!userName || !store || !product) {
    throw new Error(
      "Invalid order details: User, store, or product not found."
    );
  }

  return `
      <h1>New Order Placed!</h1>
      <p>An order has been placed with the following details:</p>
      <ul>
        <li>Order Invoice: ${orderDetails.invoice}</li>
        <li>Orderer: ${userName.username}</li>
        <li>Store Name: ${store.storeName}</li>
        <ul>
          <li>Product Name:${product.name}</li>
          <li>Order Quantity: ${orderDetails.quantity}</li>
          <li>Product PackSize ${product.packSize}</li>
          <li>Product Group: ${product.group}</li>
          <li>Product MRP: ${product.price}</li>
        </ul>
        <hr>
        <li>Total Amount: ${orderDetails.price}</li>
      </ul>
      <p>Check the admin dashboard for more details.</p>
    `;
};

const ordererEmailTemplate = async (orderDetails) => {
  const userName = await User.findById(orderDetails.userId).populate("store");
  const store = await Store.findOne({ userId: orderDetails.userId });
  const product = await Product.findById(orderDetails.productId);
  return `
      <h1>Thank You for Your Order, ${userName.username}!</h1>
      <p>We've received your order with the following details:</p>
      <ul>
        <li>Order ID: ${orderDetails.invoice}</li>
        <li>Store Name: ${store.storeName}</li>
        <li>Products:</li>
        <ul>
          <li>Product Name:${product.name}</li>
          <li>Order Quantity: ${orderDetails.quantity}</li>
          <li>Product PackSize ${product.packSize}</li>
          <li>Product Group: ${product.group}</li>
          <li>Product MRP: ${product.price}</li>
        </ul>
        <hr>
        <li>Total Amount: ${orderDetails.price}</li>
      </ul>
      <p>We will soon contact you and talk further about payment details and the order shipment.</p>
    `;
};

module.exports = { sendEmail, adminEmailTemplate, ordererEmailTemplate };
